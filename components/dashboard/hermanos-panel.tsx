'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Users, Crown, Award, Star } from 'lucide-react';
import { mockBrothers } from '@/lib/data';

export function HermanosPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  
  const filteredBrothers = mockBrothers.filter(brother => {
    const matchesSearch = brother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brother.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrade = selectedGrade === 'all' || brother.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  const gradeStats = mockBrothers.reduce((acc, brother) => {
    acc[brother.grade] = (acc[brother.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const getGradeBadgeColor = (grade: string) => {
    switch (grade) {
      case 'Maestro': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Compañero': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Aprendiz': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'Maestro': return <Crown className="h-4 w-4" />;
      case 'Compañero': return <Award className="h-4 w-4" />;
      case 'Aprendiz': return <Star className="h-4 w-4" />;
      default: return null;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(word => word !== 'H∴')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getPositionImportance = (position: string) => {
    const importantPositions = [
      'Venerable Maestro',
      'Primer Vigilante', 
      'Segundo Vigilante',
      'Orador',
      'Secretario',
      'Tesorero'
    ];
    return importantPositions.includes(position);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Queridos Hermanos</h1>
        <p className="text-gray-600 mt-2">Directorio de miembros de la Logia</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hermanos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBrothers.length}</div>
            <p className="text-xs text-muted-foreground">Miembros activos</p>
          </CardContent>
        </Card>

        {Object.entries(gradeStats).map(([grade, count]) => (
          <Card key={grade} className="border-l-4 border-l-gray-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{grade}s</CardTitle>
              {getGradeIcon(grade)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((count / mockBrothers.length) * 100)}% del total
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Directorio de Hermanos</CardTitle>
          <CardDescription>Lista completa de miembros con sus grados y cargos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar hermano o cargo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedGrade} onValueChange={setSelectedGrade}>
              <SelectTrigger className="w-48">
                <Filter className="mr-2 h-4 w-4" />
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

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hermano</TableHead>
                  <TableHead>Grado</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead className="text-center">Asistencia</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrothers.map((brother) => {
                  const attendanceRate = Math.round((brother.totalAttendances / brother.totalSessions) * 100);
                  const isImportantPosition = getPositionImportance(brother.position);
                  
                  return (
                    <TableRow key={brother.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {getInitials(brother.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium text-gray-900">{brother.name}</div>
                            <div className="text-sm text-gray-500">
                              {brother.totalAttendances} asistencias
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getGradeBadgeColor(brother.grade)} flex items-center gap-1 w-fit`}>
                          {getGradeIcon(brother.grade)}
                          {brother.grade}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`${isImportantPosition ? 'font-semibold text-blue-600' : 'text-gray-700'}`}>
                            {brother.position}
                          </span>
                          {isImportantPosition && (
                            <Badge variant="outline" className="text-xs">
                              Oficial
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center space-y-1">
                          <span className={`font-semibold ${
                            attendanceRate >= 80 ? 'text-green-600' : 
                            attendanceRate >= 60 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {attendanceRate}%
                          </span>
                          <span className="text-xs text-gray-500">
                            {brother.totalAttendances}/{brother.totalSessions}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={attendanceRate >= 80 ? 'default' : attendanceRate >= 60 ? 'secondary' : 'destructive'}
                          className="text-xs"
                        >
                          {attendanceRate >= 80 ? 'Excelente' : attendanceRate >= 60 ? 'Regular' : 'Bajo'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredBrothers.length === 0 && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No se encontraron hermanos</h3>
              <p className="mt-1 text-sm text-gray-500">
                Intenta ajustar los filtros de búsqueda.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}