'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Upload, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

interface ImportBrothersDialogProps {
    onImportComplete: () => void;
}

export function ImportBrothersDialog({ onImportComplete }: ImportBrothersDialogProps) {
    const [open, setOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [importing, setImporting] = useState(false);
    const { toast } = useToast();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            // Mapear columnas esperadas
            const mapped = jsonData.map((row: any) => ({
                name: row.nombre || row.name || row.Nombre || '',
                cedula: row.cedula || row.Cedula || row.id || '',
                grade: row.grado || row.grade || row.Grado || 'Aprendiz',
                position_name: row.cargo || row.position || row.Cargo || null
            }));

            setPreviewData(mapped);
        };

        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (previewData.length === 0) return;

        setImporting(true);

        try {
            // Obtener posiciones para mapear nombres a IDs
            const { data: positions } = await supabase
                .from('t357_positions')
                .select('id, name');

            const positionMap = new Map(positions?.map(p => [p.name.toLowerCase(), p.id]) || []);

            // Preparar datos para insertar
            const brothersToInsert = previewData.map(b => ({
                name: b.name,
                cedula: b.cedula,
                grade: b.grade,
                position_id: b.position_name ? positionMap.get(b.position_name.toLowerCase()) : null
            }));

            // Insertar en base de datos
            const { error } = await supabase
                .from('t357_brothers')
                .insert(brothersToInsert);

            if (error) {
                toast({
                    title: "Error al importar",
                    description: error.message,
                    variant: "destructive"
                });
            } else {
                toast({
                    title: "Importación exitosa",
                    description: `Se importaron ${brothersToInsert.length} hermanos`,
                });
                setOpen(false);
                setPreviewData([]);
                onImportComplete();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setImporting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar CSV/Excel
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Importar Hermanos desde CSV/Excel</DialogTitle>
                    <DialogDescription>
                        Sube un archivo CSV o Excel con las columnas: nombre, cedula, grado, cargo (opcional)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Input
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="cursor-pointer"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                            Formatos aceptados: CSV, XLSX, XLS
                        </p>
                    </div>

                    {previewData.length > 0 && (
                        <>
                            <div className="flex items-center gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="font-medium">
                                    {previewData.length} hermanos listos para importar
                                </span>
                            </div>

                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead>Cédula</TableHead>
                                            <TableHead>Grado</TableHead>
                                            <TableHead>Cargo</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {previewData.slice(0, 10).map((row, idx) => (
                                            <TableRow key={idx}>
                                                <TableCell>{row.name || '-'}</TableCell>
                                                <TableCell>{row.cedula || '-'}</TableCell>
                                                <TableCell>{row.grade || '-'}</TableCell>
                                                <TableCell>{row.position_name || '-'}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                {previewData.length > 10 && (
                                    <div className="p-2 text-center text-sm text-gray-500 border-t">
                                        ... y {previewData.length - 10} más
                                    </div>
                                )}
                            </div>

                            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                                <div className="text-sm text-yellow-800">
                                    <p className="font-medium">Importante:</p>
                                    <p>Esta acción insertará los hermanos en la base de datos. Verifica que los datos sean correctos.</p>
                                </div>
                            </div>

                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={() => setOpen(false)}>
                                    Cancelar
                                </Button>
                                <Button onClick={handleImport} disabled={importing}>
                                    {importing ? 'Importando...' : 'Importar Hermanos'}
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
