'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, AlertCircle, CheckCircle, Loader2, Users, Calendar, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

interface ParsedAttendance {
  brotherRaw: string;     // "Apellido Nombre" combinado
  lastName: string;
  firstName: string;
  dates: string[];        // fechas donde asistió (ISO yyyy-mm-dd)
}

interface PreviewRow {
  brotherRaw: string;
  brotherId: number | null;
  brotherName: string;
  attendanceDates: string[];
  matched: boolean;
}

interface ImportAttendancesDialogProps {
  onImportComplete: () => void;
}

// Parsear fecha "d/m/yyyy" o "d/m/yy" → "yyyy-mm-dd"
function parseDate(raw: string): string | null {
  const clean = raw.trim();
  const parts = clean.split('/');
  if (parts.length !== 3) return null;
  const [d, m, yRaw] = parts;
  const day = parseInt(d, 10);
  const month = parseInt(m, 10);
  let year = parseInt(yRaw, 10);
  if (year < 100) year += 2000;
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// Determinar si una celda indica asistencia
function isPresent(cell: string): boolean {
  const v = cell.trim().toUpperCase();
  return v === 'X' || v === 'EXA' || v === 'EXALTACION' || v === 'EXALTACIÓN';
}

// Parsear el CSV del formato "Marcador de Asistencias"
function parseAttendanceCSV(csvText: string): { attendances: ParsedAttendance[]; dates: string[] } {
  const lines = csvText
    .split('\n')
    .map(l => l.replace(/\r$/, ''));

  // Fila 3 (índice 2) contiene las fechas a partir de la columna 3 (índice 2)
  const headerLine = lines[2] ?? '';
  const headerCols = headerLine.split(',');

  // Extraer fechas válidas (columnas 2 en adelante)
  const dateColumns: { colIndex: number; isoDate: string }[] = [];
  for (let i = 2; i < headerCols.length; i++) {
    const iso = parseDate(headerCols[i]);
    if (iso) dateColumns.push({ colIndex: i, isoDate: iso });
  }

  const attendances: ParsedAttendance[] = [];

  // Filas 4 en adelante (índice 3+) son hermanos
  for (let r = 3; r < lines.length; r++) {
    const line = lines[r];
    if (!line.trim()) continue;
    const cols = line.split(',');

    // Col 0 = apellido(s), Col 1 = nombre(s)
    const lastName = (cols[0] ?? '').trim();
    const firstName = (cols[1] ?? '').trim();
    if (!lastName || !firstName) continue;

    // Ignorar filas de leyenda al final (sin celdas de asistencia relevantes)
    const brotherRaw = `${firstName} ${lastName}`.trim();

    const presentDates: string[] = [];
    for (const { colIndex, isoDate } of dateColumns) {
      const cell = cols[colIndex] ?? '';
      if (isPresent(cell)) presentDates.push(isoDate);
    }

    // Solo incluir hermanos con al menos una asistencia
    if (presentDates.length > 0) {
      attendances.push({ brotherRaw, lastName, firstName, dates: presentDates });
    }
  }

  const dates = dateColumns.map(d => d.isoDate);
  return { attendances, dates };
}

export function ImportAttendancesDialog({ onImportComplete }: ImportAttendancesDialogProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<PreviewRow[]>([]);
  const [allDates, setAllDates] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState<'idle' | 'preview' | 'done'>('idle');
  const { toast } = useToast();

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const { attendances, dates } = parseAttendanceCSV(text);

    if (attendances.length === 0) {
      toast({
        title: 'Sin asistencias detectadas',
        description: 'No se encontraron filas con X o Exa en el archivo.',
        variant: 'destructive',
      });
      return;
    }

    // Cargar hermanos de la BD para hacer match
    const { data: brothers } = await supabase
      .from('brothers')
      .select('id, name, last_name');

    const normalize = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

    const previewRows: PreviewRow[] = attendances.map(att => {
      // Intentar match por nombre completo, o por apellido+nombre por separado
      const attFull = normalize(`${att.firstName} ${att.lastName}`);
      const attReverse = normalize(`${att.lastName} ${att.firstName}`);

      const matched = brothers?.find(b => {
        const dbFull = normalize(`${b.name} ${b.last_name ?? ''}`);
        const dbFullInv = normalize(`${b.last_name ?? ''} ${b.name}`);
        return (
          dbFull === attFull ||
          dbFull === attReverse ||
          dbFullInv === attFull ||
          dbFullInv === attReverse ||
          // match parcial por apellido
          normalize(b.last_name ?? '') === normalize(att.lastName) ||
          normalize(b.name) === normalize(att.firstName)
        );
      });

      return {
        brotherRaw: att.brotherRaw,
        brotherId: matched?.id ?? null,
        brotherName: matched ? `${matched.name} ${matched.last_name ?? ''}` : '—',
        attendanceDates: att.dates,
        matched: !!matched,
      };
    });

    setPreview(previewRows);
    setAllDates(dates);
    setStep('preview');
  }, [toast]);

  const matchedCount = preview.filter(r => r.matched).length;
  const totalAttendances = preview.filter(r => r.matched).reduce((acc, r) => acc + r.attendanceDates.length, 0);

  const handleImport = async () => {
    setImporting(true);
    setProgress(0);

    try {
      // 1. Obtener todas las tenidas existentes para hacer match por fecha
      const { data: meetings } = await supabase.from('meetings').select('id, date');
      const meetingByDate = new Map<string, number>(
        meetings?.map(m => [m.date, m.id] as [string, number]) ?? []
      );

      // 2. Recopilar fechas sin tenida existente
      const missingDates = Array.from(new Set(
        preview
          .filter(r => r.matched)
          .flatMap(r => r.attendanceDates)
      )).filter(d => !meetingByDate.has(d));

      // 3. Crear tenidas faltantes (con datos mínimos)
      if (missingDates.length > 0) {
        const newMeetings = missingDates.map(date => ({
          date,
          theme: `Tenida ${date}`,
          type: 'Ordinaria',
          grade: 'Maestro',
          location: 269,
          // location omitido: no hay info del templo en el CSV y la columna es bigint (FK a temples)
        }));

        const { data: created, error: meetErr } = await supabase
          .from('meetings')
          .insert(newMeetings)
          .select('id, date');

        if (meetErr) throw new Error(`Error creando tenidas: ${meetErr.message}`);
        created?.forEach(m => meetingByDate.set(m.date, m.id));
      }

      // 4. Obtener asistencias ya existentes para evitar duplicados
      const { data: existing } = await supabase
        .from('attendances')
        .select('brother_id, meeting_id');

      const existingSet = new Set(
        existing?.map(a => `${a.brother_id}-${a.meeting_id}`) ?? []
      );

      // 5. Construir registros a insertar
      const now = new Date().toISOString();
      const toInsert: { brother_id: number; meeting_id: number; created_at: string }[] = [];

      for (const row of preview) {
        if (!row.matched || !row.brotherId) continue;
        for (const date of row.attendanceDates) {
          const meetingId = meetingByDate.get(date);
          if (!meetingId) continue;
          const key = `${row.brotherId}-${meetingId}`;
          if (!existingSet.has(key)) {
            toInsert.push({ brother_id: row.brotherId, meeting_id: meetingId, created_at: now });
          }
        }
      }

      // 6. Insertar en lotes de 100
      // Si el lote contiene duplicados (error 23505), inserta uno a uno para saltar solo los conflictivos
      const BATCH = 100;
      for (let i = 0; i < toInsert.length; i += BATCH) {
        const batch = toInsert.slice(i, i + BATCH);
        const { error } = await supabase.from('attendances').insert(batch);

        if (error) {
          if (error.code === '23505') {
            // Hay duplicados en el lote — insertar uno a uno para omitir solo los conflictivos
            for (const record of batch) {
              const { error: singleErr } = await supabase.from('attendances').insert(record);
              if (singleErr && singleErr.code !== '23505') {
                throw new Error(`Error insertando asistencia: ${singleErr.message}`);
              }
            }
          } else {
            throw new Error(`Error insertando asistencias: ${error.message}`);
          }
        }

        setProgress(Math.round(((i + batch.length) / toInsert.length) * 100));
      }

      toast({
        title: '¡Importación exitosa!',
        description: `Se insertaron ${toInsert.length} registros de asistencia para ${matchedCount} hermanos.`,
      });

      setStep('done');
      onImportComplete();
    } catch (err: any) {
      toast({ title: 'Error en la importación', description: err.message, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setPreview([]);
    setAllDates([]);
    setStep('idle');
    setProgress(0);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100">
          <Upload className="h-4 w-4 mr-2" />
          Carga Masiva CSV
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-indigo-600" />
            Carga Masiva de Asistencias
          </DialogTitle>
          <DialogDescription>
            Importa el archivo CSV del Marcador de Asistencias. El sistema detectará automáticamente
            hermanos y fechas de tenidas.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Instrucciones */}
          <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium">Formato esperado:</p>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-blue-700">
                <li>Fila 3: cabecera con fechas (formato d/m/yyyy) desde la columna 3 en adelante</li>
                <li>Filas 4+: Apellido | Nombre | celdas de asistencia (<strong>X</strong> o <strong>Exa</strong> = presente)</li>
                <li>Se crean automáticamente las tenidas sin registro previo</li>
                <li>Se omiten duplicados ya existentes en la base de datos</li>
              </ul>
            </div>
          </div>

          {/* Uploader */}
          {step === 'idle' && (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors">
              <Upload className="h-10 w-10 text-gray-400 mb-3" />
              <span className="text-sm font-medium text-gray-700">Haz clic para seleccionar el archivo CSV</span>
              <span className="text-xs text-gray-400 mt-1">Solo archivos .csv</span>
              <Input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}

          {/* Preview */}
          {step === 'preview' && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-gray-800">{preview.length}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                    <Users className="h-3 w-3" /> Hermanos detectados
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-700">{matchedCount}</div>
                  <div className="text-xs text-gray-500 mt-1">Con match en BD</div>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg text-center">
                  <div className="text-2xl font-bold text-indigo-700">{totalAttendances}</div>
                  <div className="text-xs text-gray-500 mt-1 flex items-center justify-center gap-1">
                    <Calendar className="h-3 w-3" /> Asistencias a importar
                  </div>
                </div>
              </div>

              {/* Sin match warning */}
              {preview.some(r => !r.matched) && (
                <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">{preview.filter(r => !r.matched).length} hermano(s) sin match</span>
                    {' — '}sus asistencias no serán importadas. Verifica que estén registrados en la BD.
                  </div>
                </div>
              )}

              {/* Tabla preview */}
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Hermano (CSV)</TableHead>
                      <TableHead>Match en BD</TableHead>
                      <TableHead className="text-center">Asistencias</TableHead>
                      <TableHead className="text-center">Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx} className={!row.matched ? 'bg-red-50' : ''}>
                        <TableCell className="font-mono text-sm">{row.brotherRaw}</TableCell>
                        <TableCell className="text-sm">{row.brotherName}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{row.attendanceDates.length}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {row.matched ? (
                            <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-red-500 mx-auto" />
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Progreso */}
              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Insertando registros...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {/* Acciones */}
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={handleClose} disabled={importing}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={importing || matchedCount === 0}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {importing ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Importando...</>
                  ) : (
                    <><Upload className="h-4 w-4 mr-2" />Importar {totalAttendances} asistencias</>
                  )}
                </Button>
              </div>
            </>
          )}

          {/* Done */}
          {step === 'done' && (
            <div className="flex flex-col items-center py-8 gap-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-lg font-semibold text-gray-800">¡Importación completada!</p>
              <p className="text-sm text-gray-500">Los datos de asistencia han sido guardados correctamente.</p>
              <Button onClick={handleClose}>Cerrar</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
