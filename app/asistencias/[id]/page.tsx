"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, MapPin, Users, Award, Crown, Star, ArrowLeft, Search, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AsistenciasPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [tenida, setTenida] = useState<any>(null);
  const [hermanos, setHermanos] = useState<any[]>([]);
  const [asistentes, setAsistentes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Cargar información de la tenida
  useEffect(() => {
    if (!id) return;
    const fetchTenida = async () => {
      const { data } = await supabase
        .from('t357_meetings')
        .select('*')
        .eq('id', id)
        .single();
      setTenida(data);
    };
    fetchTenida();
  }, [id]);

  // Cargar hermanos
  useEffect(() => {
    const fetchHermanos = async () => {
      const { data } = await supabase.from('t357_brothers').select('*');
      setHermanos(data || []);
    };
    fetchHermanos();
  }, []);

  // Cargar asistentes de la tenida
  useEffect(() => {
    if (!id) return;
    fetchAsistentes();
  }, [id]);

  const fetchAsistentes = async () => {
    const { data } = await supabase
      .from('t357_attendances')
      .select('*, brother:t357_brothers(*)')
      .eq('meeting_id', id);
    setAsistentes(data || []);
  };

  // Sugerencias por nombre o cédula
  useEffect(() => {
    if (!busqueda) {
      setSugerencias([]);
      return;
    }
    const filtro = hermanos.filter(h =>
      h.name.toLowerCase().includes(busqueda.toLowerCase()) ||
      (h.cedula && String(h.cedula).includes(busqueda))
    );
    setSugerencias(filtro);
  }, [busqueda, hermanos]);

  // Agregar asistencia
  const agregarAsistente = async (hermano: any) => {
    // Verificar si ya está registrado
    const yaRegistrado = asistentes.some(a => a.brother_id === hermano.id);
    if (yaRegistrado) {
      toast({
        title: "Ya registrado",
        description: `${hermano.name} ya está en la lista de asistentes`,
        variant: "destructive"
      });
      return;
    }

    await supabase.from('t357_attendances').insert([{
      meeting_id: id,
      brother_id: hermano.id
    }]);

    setBusqueda('');
    setSugerencias([]);
    fetchAsistentes();

    toast({
      title: "Asistencia registrada",
      description: `${hermano.name} ha sido agregado a la lista`,
    });
  };

  // Eliminar asistencia
  const eliminarAsistente = async (attendanceId: number, brotherName: string) => {
    const { error } = await supabase
      .from('t357_attendances')
      .delete()
      .eq('id', attendanceId);

    if (!error) {
      fetchAsistentes();
      toast({
        title: "Asistencia eliminada",
        description: `${brotherName} ha sido removido de la lista`,
      });
    } else {
      toast({
        title: "Error",
        description: "No se pudo eliminar la asistencia",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace('/login');
      } else {
        setLoading(false);
      }
    };
    checkAuth();
  }, [router]);

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

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Ordinaria': return 'bg-blue-100 text-blue-800';
      case 'Extraordinaria': return 'bg-red-100 text-red-800';
      case 'Conjunta': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) =>
    name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button
          variant="outline"
          className="mb-6"
          onClick={() => router.push('/')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al Dashboard
        </Button>

        {/* Información de la Tenida */}
        {tenida && (
          <Card className="mb-6 border-l-4 border-l-blue-600">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardTitle className="text-2xl">Control de Asistencias</CardTitle>
              <CardDescription className="text-base mt-2">
                Registra la asistencia de los hermanos a esta tenida
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Tema</h3>
                  <p className="text-gray-900">{tenida.theme}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    Fecha
                  </h3>
                  <p className="text-gray-900">
                    {new Date(tenida.date + 'T00:00:00').toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Tipo y Grado</h3>
                  <div className="flex gap-2">
                    <Badge className={getTypeBadgeColor(tenida.type)}>
                      {tenida.type}
                    </Badge>
                    <Badge className={getGradeBadgeColor(tenida.grade)}>
                      {getGradeIcon(tenida.grade)}
                      {tenida.grade}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Asistentes Registrados
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">{asistentes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Búsqueda de Hermanos */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Agregar Asistente</CardTitle>
            <CardDescription>
              Busca por nombre o cédula para registrar la asistencia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar hermano por nombre o cédula..."
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                className="pl-10"
              />
              {sugerencias.length > 0 && (
                <div className="absolute z-10 w-full mt-2 border rounded-lg bg-white shadow-lg max-h-64 overflow-y-auto">
                  {sugerencias.map(h => (
                    <div
                      key={h.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 transition-colors"
                      onClick={() => agregarAsistente(h)}
                    >
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                            {getInitials(h.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{h.name}</div>
                          <div className="text-sm text-gray-500">Cédula: {h.cedula}</div>
                        </div>
                        <Badge className={getGradeBadgeColor(h.grade)}>
                          {getGradeIcon(h.grade)}
                          {h.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Lista de Asistentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Asistentes Registrados ({asistentes.length})
            </CardTitle>
            <CardDescription>
              Lista de hermanos que asistieron a esta tenida
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {asistentes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Aún no hay asistentes registrados</p>
                <p className="text-sm mt-2">Usa el buscador para agregar hermanos</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Hermano</TableHead>
                    <TableHead>Cédula</TableHead>
                    <TableHead>Grado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {asistentes.map(a => (
                    <TableRow key={a.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                              {getInitials(a.brother?.name || 'NN')}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-gray-900">
                            {a.brother?.name || 'Sin nombre'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {a.brother?.cedula || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge className={getGradeBadgeColor(a.brother?.grade || '')}>
                          {getGradeIcon(a.brother?.grade || '')}
                          {a.brother?.grade || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => eliminarAsistente(a.id, a.brother?.name || 'Hermano')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}