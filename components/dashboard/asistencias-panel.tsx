'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserCheck, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { mockBrothers, Brother } from '@/lib/data';

export function AsistenciasPanel() {
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  
  const filteredBrothers = selectedGrade === 'all' 
    ? mockBrothers 
    : mockBrothers.filter(brother => brother.grade === selectedGrade);

  const totalAttendanceRate = Math.round(
    filteredBrothers.reduce((acc, brother) => acc + (brother.totalAttendances / brother.totalSessions * 100), 0) / filteredBrothers.length
  );

  const gradeAttendanceRate = Math.round(
    filteredBrothers.reduce((acc, brother) => acc + (brother.gradeAttendances / brother.gradeSessions * 100), 0) / filteredBrothers.length
  );

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Asistencias</h1>
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
            <div className="text-2xl font-bold">{filteredBrothers.length}</div>
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
            <p className="text-xs text-muted-foreground">Promedio todas las tenidas</p>
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
          <CardTitle>Registro de Asistencias</CardTitle>
          <CardDescription>
            Detalle de asistencias por hermano
            {selectedGrade !== 'all' && ` - Grado ${selectedGrade}`}
          </CardDescription>
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
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrothers.map((brother) => {
                  const totalRate = Math.round((brother.totalAttendances / brother.totalSessions) * 100);
                  const gradeRate = Math.round((brother.gradeAttendances / brother.gradeSessions) * 100);
                  
                  return (
                    <TableRow key={brother.id}>
                      <TableCell className="font-medium">{brother.name}</TableCell>
                      <TableCell>
                        <Badge className={getGradeBadgeColor(brother.grade)}>
                          {brother.grade}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">{brother.position}</TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{brother.totalAttendances}/{brother.totalSessions}</span>
                            <span className={getAttendanceColor(totalRate)}>{totalRate}%</span>
                          </div>
                          <Progress value={totalRate} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{brother.gradeAttendances}/{brother.gradeSessions}</span>
                            <span className={getAttendanceColor(gradeRate)}>{gradeRate}%</span>
                          </div>
                          <Progress value={gradeRate} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {getAttendanceIcon(Math.max(totalRate, gradeRate))}
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