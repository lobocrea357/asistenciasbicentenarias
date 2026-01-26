'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, TrendingUp, TrendingDown, Minus, Edit, Save, X, FileDown } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { exportAttendanceToPDF, exportAttendanceToExcel } from '@/lib/export-utils';

export function AsistenciasPanel() {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [attendanceSummary, setAttendanceSummary] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState({ total: 0, grade: 0 });
  const { toast } = useToast();

  const fetchData = async () => {
    setLoading(true);

    // Obtener resumen de asistencias
    const { data: summaryData, error: summaryError } = await supabase.rpc('get_brother_attendance_summary');

    // Obtener todas las tenidas
    const { data: meetingsData, error: meetingsError } = await supabase
      .from('t357_meetings')
      .select('*');

    if (summaryError) {
      console.error('Error calling RPC function:', summaryError);
      setAttendanceSummary([]);
    } else {
      setAttendanceSummary(summaryData || []);
    }

    if (!meetingsError) {
      setMeetings(meetingsData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calcular tenidas aplicables según jerarquía de grado
  const getApplicableMeetings = (brotherGrade: string) => {
    return meetings.filter(meeting => {
      if (brotherGrade === 'Maestro') return true; // Maestros cuentan todas
      if (brotherGrade === 'Compañero') return meeting.grade === 'Compañero' || meeting.grade === 'Aprendiz';
      if (brotherGrade === 'Aprendiz') return meeting.grade === 'Aprendiz';
      return false;
    });
  };

  // Calcular inasistencias aplicables
  const calculateApplicableAbsences = (brother: any) => {
    const applicableMeetings = getApplicableMeetings(brother.brother_grade);
    const applicableSessions = applicableMeetings.length;
    const applicableAbsences = applicableSessions - (brother.total_attendances || 0);
    return { applicableSessions, applicableAbsences };
  };

  const filteredData = selectedGrade === 'all'
    ? attendanceSummary
    : attendanceSummary.filter(b => b.brother_grade === selectedGrade);

  // Calcula promedios generales para los summary cards
  const totalAttendanceRate = filteredData.length
    ? Math.round(
      filteredData.reduce((acc, b) => {
        const { applicableSessions } = calculateApplicableAbsences(b);
        return acc + (applicableSessions ? (b.total_attendances / applicableSessions) * 100 : 0);
      }, 0) / filteredData.length
    )
    : 0;

  const gradeAttendanceRate = filteredData.length
    ? Math.round(
      filteredData.reduce((acc, b) => acc + (b.grade_sessions ? (b.grade_attendances / b.grade_sessions) * 100 : 0), 0) /
      filteredData.length
    )
    : 0;

  const startEdit = (brother: any) => {
    setEditingId(brother.brother_id);
    setEditValues({
      total: brother.total_attendances || 0,
      grade: brother.grade_attendances || 0
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ total: 0, grade: 0 });
  };

  const saveEdit = async (brotherId: number) => {
    toast({
      title: "Asistencias actualizadas",
      description: `Se han actualizado los valores de asistencia`,
    });

    const updatedSummary = attendanceSummary.map(b => {
      if (b.brother_id === brotherId) {
        return {
          ...b,
          total_attendances: editValues.total,
          grade_attendances: editValues.grade
        };
      }
      return b;
    });

    setAttendanceSummary(updatedSummary);
    setEditingId(null);
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getAttendanceIcon = (rate: number) => {
    if (rate >= 80) return <TrendingUp className="h-4 w-4 text-green-600" />;
    if (rate >= 60) return <Minus className="h-4 w-4 text-yellow-600" />;
    return <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'Maestro': return 'bg-purple-100 text-purple-800';
      case 'Compañero': return 'bg-yellow-100 text-yellow-800';
      case 'Aprendiz': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Asistencias</h1>
          <p className="text-gray-600 mt-2">Control y seguimiento de asistencias</p>
        </div>
        <Select value={selectedGrade} onValueChange={setSelectedGrade}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por grado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los grados</SelectItem>
            <SelectItem value="Aprendiz">Aprendiz</SelectItem>
            <SelectItem value="Compañero">Compañero</SelectItem>
            <SelectItem value="Maestro">Maestro</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hermanos Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredData.length}</div>
            <p className="text-xs text-muted-foreground">
              {selectedGrade === 'all' ? 'Total' : `Grado ${selectedGrade}`}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia General</CardTitle>
            {getAttendanceIcon(totalAttendanceRate)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAttendanceColor(totalAttendanceRate)}`}>
              {totalAttendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">Promedio tenidas aplicables</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia por Grado</CardTitle>
            {getAttendanceIcon(gradeAttendanceRate)}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getAttendanceColor(gradeAttendanceRate)}`}>
              {gradeAttendanceRate}%
            </div>
            <p className="text-xs text-muted-foreground">Promedio tenidas específicas</p>
          </CardContent>
        </Card>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Registro de Asistencias</CardTitle>
              <CardDescription>
                Detalle de asistencias e inasistencias por hermano
                {selectedGrade !== 'all' && ` - Grado ${selectedGrade}`}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const exportData = filteredData.map(b => {
                    const { applicableSessions, applicableAbsences } = calculateApplicableAbsences(b);
                    const totalRate = applicableSessions ? Math.round((b.total_attendances / applicableSessions) * 100) : 0;
                    return {
                      ...b,
                      applicable_sessions: applicableSessions,
                      applicable_absences: applicableAbsences,
                      attendance_rate: totalRate
                    };
                  });
                  exportAttendanceToPDF(exportData);
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const exportData = filteredData.map(b => {
                    const { applicableSessions, applicableAbsences } = calculateApplicableAbsences(b);
                    const totalRate = applicableSessions ? Math.round((b.total_attendances / applicableSessions) * 100) : 0;
                    return {
                      ...b,
                      applicable_sessions: applicableSessions,
                      applicable_absences: applicableAbsences,
                      attendance_rate: totalRate
                    };
                  });
                  exportAttendanceToExcel(exportData);
                }}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hermano</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-center">Asistencia General</TableHead>
                  <TableHead className="text-center">Asistencia por Grado</TableHead>
                  <TableHead className="text-center">Inasistencias</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((brother) => {
                  const isEditing = editingId === brother.brother_id;
                  const gradeSessions = brother.grade_sessions || 0;

                  const { applicableSessions, applicableAbsences } = calculateApplicableAbsences(brother);

                  const displayTotalAttendances = isEditing ? editValues.total : brother.total_attendances;
                  const displayGradeAttendances = isEditing ? editValues.grade : brother.grade_attendances;

                  const totalRate = applicableSessions ? Math.round((displayTotalAttendances / applicableSessions) * 100) : 0;
                  const gradeRate = gradeSessions ? Math.round((displayGradeAttendances / gradeSessions) * 100) : 0;

                  return (
                    <TableRow key={brother.brother_id}>
                      <TableCell className="font-medium">{brother.brother_name}</TableCell>
                      <TableCell>
                        <Badge className={getGradeBadgeColor(brother.brother_grade)}>
                          {brother.brother_grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{brother.brother_position || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm items-center gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  value={editValues.total}
                                  onChange={(e) => setEditValues({ ...editValues, total: parseInt(e.target.value) || 0 })}
                                  className="w-16 h-8 text-sm"
                                />
                                <span>/{applicableSessions}</span>
                              </div>
                            ) : (
                              <span>{displayTotalAttendances}/{applicableSessions}</span>
                            )}
                            <span className={getAttendanceColor(totalRate)}>{totalRate}%</span>
                          </div>
                          <Progress value={totalRate} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm items-center gap-2">
                            {isEditing ? (
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  min="0"
                                  value={editValues.grade}
                                  onChange={(e) => setEditValues({ ...editValues, grade: parseInt(e.target.value) || 0 })}
                                  className="w-16 h-8 text-sm"
                                />
                                <span>/{gradeSessions}</span>
                              </div>
                            ) : (
                              <span>{displayGradeAttendances}/{gradeSessions}</span>
                            )}
                            <span className={getAttendanceColor(gradeRate)}>{gradeRate}%</span>
                          </div>
                          <Progress value={gradeRate} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                          {applicableAbsences}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        {getAttendanceIcon(Math.max(totalRate, gradeRate))}
                      </TableCell>
                      <TableCell className="text-center">
                        {isEditing ? (
                          <div className="flex gap-2 justify-center">
                            <Button size="sm" onClick={() => saveEdit(brother.brother_id)}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => startEdit(brother)}>
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}