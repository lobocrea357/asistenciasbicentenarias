'use client';

import { useEffect, useRef, useState } from 'react';

import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, Filter, Users, Crown, Award, Star, FileDown } from 'lucide-react';
import { exportBrothersToPDF, exportBrothersToExcel } from '@/lib/export-utils';
import { ImportBrothersDialog } from './import-brothers-dialog';
import { generateNiEntreDichoNiPenado } from '@/lib/pdf-generator';
import { Brother } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';

export interface UserStatus {
    id:          number;
    created_at:  Date;
    name:        string;
    description: null;
}

export function HermanosPanel() {
  const [brothers, setBrothers] = useState<any[]>([]);
  const [positions, setPositions] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editGrade, setEditGrade] = useState('');
  const [editPosition, setEditPosition] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userStatuses, setUserStatuses] = useState<UserStatus[]>([]);
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [selectedBrotherForStatus, setSelectedBrotherForStatus] = useState<any | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('Activo');
  const hasFetchedRef = useRef(false);
  const { toast } = useToast();

  // Cargar hermanos y posiciones
  const fetchData = async () => {
    const { data: brothersData } = await supabase
      .from('brothers')
      .select('*, positions(name)')
      .order('name', { ascending: true });

    const { data: positionsData } = await supabase
      .from('positions')
      .select('*')
      .order('name', { ascending: true });
    
    const { data: usersStatus } = await supabase
      .from('users_status')
      .select('*')
      .order('name', { ascending: true });
      
    setBrothers(brothersData || []);
    setPositions(positionsData || []);
    setUserStatuses(usersStatus || []);
  };

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchData();
  }, []);

  // Filtros
  const filteredBrothers = brothers.filter(brother => {
    const matchesSearch = brother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (brother.positions?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
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
      .from('brothers')
      .update({ grade: editGrade, position_id: editPosition })
      .eq('id', brotherId);

    // Refresca datos
    const { data: brothersData } = await supabase
      .from('brothers')
      .select('*, positions(name)')
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

  const handleDownloadNiEntreDichoNiPenado = async (brother: Brother) => {
    // Implementación futura

    const vm = brothers.find(b => b.position_id === 1);
    const secretario = brothers.find(b => b.position_id === 5);
    const oradorFiscal = brothers.find(b => b.position_id === 6);

    await generateNiEntreDichoNiPenado(brother, vm, secretario, oradorFiscal);
    toast({
      title: "Ni entre dicho ni penado generado",
      description: "El PDF ha sido descargado exitosamente",
    });
  };

  const openStatusModal = (brother: any) => {
    setSelectedBrotherForStatus(brother);
    setSelectedStatus(brother.status || 'Activo');
    setStatusModalOpen(true);
  };

  const handleChangeStatus = async () => {
    if (!selectedBrotherForStatus) return;

    const selectedStatusRecord = userStatuses.find((status) => status.name === selectedStatus);
    if (!selectedStatusRecord) {
      toast({
        title: 'Estatus inválido',
        description: 'No se encontró el estatus seleccionado en users_status.',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedBrotherForStatus.user_id) {
      toast({
        title: 'No se puede actualizar',
        description: 'El hermano no tiene user_id para vincular perfil.',
        variant: 'destructive'
      });
      return;
    }

    setStatusLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ state_id: selectedStatusRecord.id })
      .eq('id', selectedBrotherForStatus.user_id);

    if (error) {
      toast({
        title: 'Error al cambiar estatus',
        description: error.message,
        variant: 'destructive'
      });
      setStatusLoading(false);
      return;
    }

    setBrothers((prev) => prev.map((b) => (
      b.id === selectedBrotherForStatus.id
        ? { ...b, status: selectedStatus, state_id: selectedStatusRecord.id }
        : b
    )));

    toast({
      title: 'Estatus actualizado',
      description: `${selectedBrotherForStatus.name} ahora está como ${selectedStatus}`,
    });

    setStatusLoading(false);
    setStatusModalOpen(false);
    setSelectedBrotherForStatus(null);
  };

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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Queridos Hermanos</h1>
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Directorio de Hermanos</CardTitle>
              <CardDescription>Lista completa de miembros con sus grados y cargos</CardDescription>
            </div>
            <div className="flex gap-2">
              <ImportBrothersDialog onImportComplete={fetchData} />
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportBrothersToPDF(filteredBrothers.map(b => ({
                  ...b,
                  position_name: b.positions?.name
                })))}
              >
                <FileDown className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportBrothersToExcel(filteredBrothers.map(b => ({
                  ...b,
                  position_name: b.positions?.name
                })))}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Excel
              </Button>
            </div>
          </div>
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
                          <div className="font-medium text-gray-900 dark:text-gray-100">{brother.name}</div>
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
                        brother.positions?.name || '-'
                      )}
                    </TableCell>
                    <TableCell>
                      {editingId === brother.id ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(brother.id)}>Guardar</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>Cancelar</Button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(brother)}>Editar</Button>
                          <Button size="sm" variant="outline" className='bg-emerald-800 text-white' onClick={() => handleDownloadNiEntreDichoNiPenado(brother)}>No entre dicho ni penado</Button>
                          <Button size="sm" variant="outline" className='bg-blue-600 text-white' onClick={() => openStatusModal(brother)}>Cambiar Estatus</Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={statusModalOpen} onOpenChange={setStatusModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cambiar estatus</DialogTitle>
            <DialogDescription>
              {selectedBrotherForStatus
                ? `Selecciona el nuevo estatus para ${selectedBrotherForStatus.name}.`
                : 'Selecciona el nuevo estatus del hermano.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona estatus" />
              </SelectTrigger>
              <SelectContent>
                {userStatuses.map((status) => (
                  <SelectItem key={status.id} value={status.name}>
                    {status.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusModalOpen(false)} disabled={statusLoading}>
              Cancelar
            </Button>
            <Button onClick={handleChangeStatus} disabled={statusLoading}>
              {statusLoading ? 'Guardando...' : 'Guardar estatus'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}