'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, UserCheck, TrendingUp } from 'lucide-react';
import { mockBrothers, mockTenidas } from '@/lib/data';

export function DashboardOverview() {
  const totalBrothers = mockBrothers.length;
  const totalTenidas = mockTenidas.length;
  const averageAttendance = Math.round(
    mockBrothers.reduce((acc, brother) => acc + (brother.totalAttendances / brother.totalSessions * 100), 0) / totalBrothers
  );
  
  const gradeDistribution = mockBrothers.reduce((acc, brother) => {
    acc[brother.grade] = (acc[brother.grade] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const upcomingTenidas = mockTenidas
    .filter(tenida => new Date(tenida.date) > new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Bienvenido al sistema de gestión de la Logia</p>
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
        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Grados</CardTitle>
            <CardDescription>Composición actual de la Logia</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={grade === 'Maestro' ? 'default' : grade === 'Compañero' ? 'secondary' : 'outline'}
                      className="w-20 justify-center"
                    >
                      {grade}
                    </Badge>
                    <span className="text-sm text-gray-600">{count} hermanos</span>
                  </div>
                  <div className="text-sm font-medium">
                    {Math.round((count / totalBrothers) * 100)}%
                  </div>
                </div>
              ))}
            </div>
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