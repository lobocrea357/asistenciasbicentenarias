'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, UserCheck, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export function DashboardOverview() {
  const [brothers, setBrothers] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: brothersData } = await supabase.from('t357_brothers').select('*');
      const { data: meetingsData } = await supabase.from('t357_meetings').select('*');
      // Asume que tienes la función RPC para el resumen de asistencias
      const { data: attendanceData } = await supabase.rpc('get_brother_attendance_summary');
      setBrothers(brothersData || []);
      setMeetings(meetingsData || []);
      setAttendanceSummary(attendanceData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const totalBrothers = brothers.length;
  const totalTenidas = meetings.length;

  // Calcula asistencia promedio real
  const averageAttendance = attendanceSummary.length
    ? Math.round(
      attendanceSummary.reduce(
        (acc, brother) =>
          acc +
          (brother.total_sessions && brother.total_sessions > 0
            ? (brother.total_attendances / brother.total_sessions) * 100
            : 0),
        0
      ) / attendanceSummary.length
    )
    : 0;

  // Distribución por grado real
  const gradeDistribution = brothers.reduce((acc, brother) => {
    acc[brother.grade] = (acc[brother.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Próximas tenidas reales
  const upcomingTenidas = meetings
    .filter(tenida => new Date(tenida.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  if (loading) {
    return <div className="p-8 text-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Bienvenido al sistema de gestión de la Logia</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hermanos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBrothers}</div>
            <p className="text-xs text-muted-foreground">Miembros activos</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tenidas Programadas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTenidas}</div>
            <p className="text-xs text-muted-foreground">Este período</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Asistencia Promedio</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageAttendance}%</div>
            <p className="text-xs text-muted-foreground">Todas las tenidas</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Crecimiento</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12%</div>
            <p className="text-xs text-muted-foreground">Último trimestre</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Grados</CardTitle>
            <CardDescription>Composición actual de la Logia</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={Object.entries(gradeDistribution).map(([grade, count]) => ({
                grade: grade || 'Sin grado',
                hermanos: count as number
              }))}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hermanos" radius={[8, 8, 0, 0]}>
                  {Object.entries(gradeDistribution).map(([grade], index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        grade === 'Maestro' ? '#9333ea' :
                          grade === 'Compañero' ? '#eab308' :
                            '#f97316'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Upcoming Tenidas */}
        <Card>
          <CardHeader>
            <CardTitle>Próximas Tenidas</CardTitle>
            <CardDescription>Eventos programados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingTenidas.length > 0 ? (
                upcomingTenidas.map((tenida) => (
                  <div key={tenida.id} className="flex items-start space-x-3 p-3 rounded-lg bg-gray-50">
                    <Calendar className="h-4 w-4 text-blue-500 mt-1" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {tenida.theme}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(tenida.date).toLocaleDateString('es-ES')} - {tenida.type}
                      </p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {tenida.grade}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  No hay tenidas próximas programadas
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}