'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Download, Plus, MapPin, Clock } from 'lucide-react';
import { mockTenidas, Tenida } from '@/lib/data';
import { generateConvocatoriaPDF } from '@/lib/pdf-generator';
import { useToast } from '@/hooks/use-toast';

export function TenidasPanel() {
  const [tenidas, setTenidas] = useState<Tenida[]>(mockTenidas);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTenida, setNewTenida] = useState({
    theme: '',
    date: '',
    location: '',
    type: '' as 'Conjunta' | 'Ordinaria' | 'Extraordinaria' | '',
    grade: '' as 'Aprendiz' | 'Compañero' | 'Maestro' | ''
  });
  const { toast } = useToast();

  const handleCreateTenida = () => {
    if (!newTenida.theme || !newTenida.date || !newTenida.location || !newTenida.type || !newTenida.grade) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const tenida: Tenida = {
      id: Date.now().toString(),
      theme: newTenida.theme,
      date: newTenida.date,
      location: newTenida.location,
      type: newTenida.type as 'Conjunta' | 'Ordinaria' | 'Extraordinaria',
      grade: newTenida.grade as 'Aprendiz' | 'Compañero' | 'Maestro',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setTenidas([...tenidas, tenida]);
    setNewTenida({
      theme: '',
      date: '',
      location: '',
      type: '',
      grade: ''
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Tenida creada",
      description: "La tenida ha sido programada exitosamente",
    });
  };

  const handleDownloadConvocatoria = (tenida: Tenida) => {
    generateConvocatoriaPDF(tenida);
    toast({
      title: "Convocatoria generada",
      description: "El PDF ha sido descargado exitosamente",
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Ordinaria': return 'bg-blue-100 text-blue-800';
      case 'Extraordinaria': return 'bg-red-100 text-red-800';
      case 'Conjunta': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Tenidas</h1>
          <p className="text-gray-600 mt-2">Gestión de tenidas y convocatorias</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" />
              Nueva Tenida
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Tenida</DialogTitle>
              <DialogDescription>
                Completa los datos para programar una nueva tenida
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Textarea
                  id="theme"
                  placeholder="Tema de la tenida..."
                  value={newTenida.theme}
                  onChange={(e) => setNewTenida({ ...newTenida, theme: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Fecha</Label>
                <Input
                  id="date"
                  type="date"
                  value={newTenida.date}
                  onChange={(e) => setNewTenida({ ...newTenida, date: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Lugar</Label>
                <Input
                  id="location"
                  placeholder="Ubicación de la tenida"
                  value={newTenida.location}
                  onChange={(e) => setNewTenida({ ...newTenida, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Tenida</Label>
                <Select value={newTenida.type} onValueChange={(value) => setNewTenida({ ...newTenida, type: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Ordinaria">Ordinaria</SelectItem>
                    <SelectItem value="Extraordinaria">Extraordinaria</SelectItem>
                    <SelectItem value="Conjunta">Conjunta</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="grade">Grado</Label>
                <Select value={newTenida.grade} onValueChange={(value) => setNewTenida({ ...newTenida, grade: value as any })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el grado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aprendiz">Aprendiz</SelectItem>
                    <SelectItem value="Compañero">Compañero</SelectItem>
                    <SelectItem value="Maestro">Maestro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateTenida}>
                Crear Tenida
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {tenidas.map((tenida) => (
          <Card key={tenida.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-2">{tenida.theme}</CardTitle>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge className={getTypeColor(tenida.type)}>
                      {tenida.type}
                    </Badge>
                    <Badge className={getGradeColor(tenida.grade)}>
                      {tenida.grade}
                    </Badge>
                  </div>
                </div>
                <Button
                  onClick={() => handleDownloadConvocatoria(tenida)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar Convocatoria
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-gray-600">
                    {new Date(tenida.date).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4 text-green-500" />
                  <span className="text-gray-600">{tenida.location}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-purple-500" />
                  <span className="text-gray-600">
                    Creada: {new Date(tenida.createdAt).toLocaleDateString('es-ES')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}