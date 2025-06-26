'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Filter, Users, Crown, Award, Star } from 'lucide-react';

export function HermanosPanel() {
  const [brothers, setBrothers] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editGrade, setEditGrade] = useState('');
  const [editPosition, setEditPosition] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');

  // Cargar hermanos y posiciones
  useEffect(() => {
    const fetchData = async () => {
      const { data: brothersData } = await supabase
        .from('t357_brothers')
        .select('*, t357_positions(name)')
        .order('name', { ascending: true });

      const { data: positionsData } = await supabase
        .from('t357_positions')
        .select('*')
        .order('name', { ascending: true });

      setBrothers(brothersData || []);
      setPositions(positionsData || []);
    };
    fetchData();
  }, []);

  // Filtros
  const filteredBrothers = brothers.filter(brother => {
    const matchesSearch = brother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brother.t357_positions?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGrade = selectedGrade === 'all' || brother.grade === selectedGrade;
    return matchesSearch && matchesGrade;
  });

  // Editar hermano
  const startEdit = (brother: any) => {
    setEditingId(brother.id);
    setEditGrade(brother.grade);
    setEditPosition(brother.position_id);
  };

  const saveEdit = async (brotherId: number) => {
    await supabase
      .from('t357_brothers')
      .update({ grade: editGrade, position_id: editPosition })
      .eq('id', brotherId);

    // Refresca datos
    const { data: brothersData } = await supabase
      .from('t357_brothers')
      .select('*, t357_positions(name)')
      .order('name', { ascending: true });
    setBrothers(brothersData || []);
    setEditingId(null);
  };

  const cancelEdit = () => setEditingId(null);

  // Calcula el conteo de hermanos por grado
  const grades = ['Aprendiz', 'Compañero', 'Maestro'];
  const gradeCounts = grades.map(grade => ({
    grade,
    count: brothers.filter(b => b.grade === grade).length,
  }));

  // Utilidades visuales (puedes mantener las que ya tienes)
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
      case 'Compañero': return <Star className="h-4 w-4" />;
      case 'Aprendiz': return <Award className="h-4 w-4" />;
      default: return null;
    }
  };
  const getInitials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

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
            <div className="text-2xl font-bold">{brothers.length}</div>
            <p className="text-xs text-muted-foreground">Miembros activos</p>
          </CardContent>
        </Card>

        {gradeCounts.map(({ grade, count }) => (
          <Card key={grade} className="border-l-4 border-l-gray-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{grade}</CardTitle>
              {getGradeIcon(grade)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">
                {brothers.length > 0 ? Math.round((count / brothers.length) * 100) : 0}% del total
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
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBrothers.map((brother) => (
                  <TableRow key={brother.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {getInitials(brother.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{brother.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {editingId === brother.id ? (
                        <Select value={editGrade} onValueChange={setEditGrade}>
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Aprendiz">Aprendiz</SelectItem>
                            <SelectItem value="Compañero">Compañero</SelectItem>
                            <SelectItem value="Maestro">Maestro</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={getGradeBadgeColor(brother.grade)}>
                          {getGradeIcon(brother.grade)}
                          {brother.grade}
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === brother.id ? (
                        <Select value={editPosition?.toString() || ''} onValueChange={v => setEditPosition(Number(v))}>
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {positions.map(pos => (
                              <SelectItem key={pos.id} value={pos.id.toString()}>{pos.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        brother.t357_positions?.name || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === brother.id ? (
                        <>
                          <Button size="sm" onClick={() => saveEdit(brother.id)}>Guardar</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>Cancelar</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={() => startEdit(brother)}>Editar</Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}