'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Shield, Crown, Star, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { PositionHistoryDialog } from './position-history-dialog';

export function CuadroLogialPanel() {
    const [positions, setPositions] = useState<any[]>([]);
    const [brothers, setBrothers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editBrotherId, setEditBrotherId] = useState<number | null>(null);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        // Obtener todas las posiciones
        const { data: positionsData } = await supabase
            .from('t357_positions')
            .select('*')
            .order('name', { ascending: true });

        // Obtener todos los hermanos
        const { data: brothersData } = await supabase
            .from('t357_brothers')
            .select('*')
            .order('name', { ascending: true });

        setPositions(positionsData || []);
        setBrothers(brothersData || []);
        setLoading(false);
    };

    const startEdit = (position: any) => {
        setEditingId(position.id);
        // Buscar el hermano que tiene este cargo
        const brother = brothers.find(b => b.position_id === position.id);
        setEditBrotherId(brother?.id || null);
    };

    const saveEdit = async (positionId: number) => {
        // Primero, quitar el cargo del hermano anterior que lo tenía
        await supabase
            .from('t357_brothers')
            .update({ position_id: null })
            .eq('position_id', positionId);

        // Luego, asignar el cargo al nuevo hermano (si se seleccionó uno)
        if (editBrotherId) {
            await supabase
                .from('t357_brothers')
                .update({ position_id: positionId })
                .eq('id', editBrotherId);
        }

        toast({
            title: "Cargo actualizado",
            description: "El cargo ha sido asignado exitosamente",
        });

        setEditingId(null);
        setEditBrotherId(null);
        fetchData();
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditBrotherId(null);
    };

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

    const getInitials = (name: string) =>
        name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Cuadro Logial</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                    Cargos de la Logia y sus ocupantes
                </p>
            </div>

            <Card>
                <CardHeader className="border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                    <div className="flex items-center space-x-3">
                        <Shield className="h-8 w-8 text-blue-600" />
                        <div>
                            <CardTitle className="text-xl">
                                Resp∴ Log∴ Caballeros Del Sol de Carabobo N°269
                            </CardTitle>
                            <CardDescription>
                                Instalada el 23 de abril de 2022 (E∴V∴)
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Cargo</TableHead>
                                <TableHead>Hermano</TableHead>
                                <TableHead>Grado</TableHead>
                                <TableHead></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                        Cargando cuadro logial...
                                    </TableCell>
                                </TableRow>
                            ) : positions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                                        No hay cargos registrados
                                    </TableCell>
                                </TableRow>
                            ) : (
                                positions.map((position) => {
                                    const brother = brothers.find(b => b.position_id === position.id);
                                    const isEditing = editingId === position.id;
                                    const selectedBrother = isEditing
                                        ? brothers.find(b => b.id === editBrotherId)
                                        : brother;

                                    return (
                                        <TableRow key={position.id} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-gray-900 dark:text-gray-100">
                                                {position.name}
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <Select
                                                        value={editBrotherId?.toString() || 'none'}
                                                        onValueChange={(v) => setEditBrotherId(v === 'none' ? null : Number(v))}
                                                    >
                                                        <SelectTrigger className="w-64">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="none">Sin asignar</SelectItem>
                                                            {brothers.map(b => (
                                                                <SelectItem key={b.id} value={b.id.toString()}>
                                                                    {b.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                ) : brother ? (
                                                    <div className="flex items-center space-x-3">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                                                                {getInitials(brother.name)}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <span className="text-gray-900 dark:text-gray-100">{brother.name}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">Sin asignar</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {selectedBrother ? (
                                                    <Badge className={getGradeBadgeColor(selectedBrother.grade)}>
                                                        {getGradeIcon(selectedBrother.grade)}
                                                        {selectedBrother.grade}
                                                    </Badge>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <>
                                                        <Button size="sm" onClick={() => saveEdit(position.id)}>
                                                            Guardar
                                                        </Button>
                                                        <Button size="sm" variant="outline" onClick={cancelEdit} className="ml-2">
                                                            Cancelar
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <Button size="sm" variant="outline" onClick={() => startEdit(position)}>
                                                            Editar
                                                        </Button>
                                                        <PositionHistoryDialog
                                                            positionId={position.id}
                                                            positionName={position.name}
                                                        />
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
