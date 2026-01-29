'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { History, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PositionHistoryDialogProps {
    positionId: number;
    positionName: string;
}

export function PositionHistoryDialog({ positionId, positionName }: PositionHistoryDialogProps) {
    const [open, setOpen] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchHistory();
        }
    }, [open, positionId]);

    const fetchHistory = async () => {
        setLoading(true);

        // Intentar obtener historial de la tabla (si existe)
        const { data, error } = await supabase
            .from('t357_position_history')
            .select('*, brother:t357_brothers(name)')
            .eq('position_id', positionId)
            .order('start_date', { ascending: false });

        if (!error && data) {
            setHistory(data);
        } else {
            // Si la tabla no existe, mostrar solo el hermano actual
            const { data: currentBrother } = await supabase
                .from('t357_brothers')
                .select('name')
                .eq('position_id', positionId)
                .single();

            if (currentBrother) {
                setHistory([{
                    brother: { name: currentBrother.name },
                    start_date: new Date().toISOString().split('T')[0],
                    end_date: null,
                    is_current: true
                }]);
            }
        }

        setLoading(false);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                    <History className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Historial del Cargo: {positionName}</DialogTitle>
                    <DialogDescription>
                        Hermanos que han ocupado este cargo
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Cargando...</div>
                    ) : history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No hay historial registrado para este cargo
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {history.map((record, idx) => (
                                <div
                                    key={idx}
                                    className={`p-4 rounded-lg border ${record.is_current || !record.end_date
                                            ? 'bg-blue-50 border-blue-200'
                                            : 'bg-gray-50 border-gray-200'
                                        }`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                    {record.brother?.name || 'Desconocido'}
                                                </span>
                                                {(record.is_current || !record.end_date) && (
                                                    <Badge className="bg-blue-600">Actual</Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                                <Calendar className="h-3 w-3" />
                                                <span>
                                                    {formatDate(record.start_date)}
                                                    {record.end_date && ` - ${formatDate(record.end_date)}`}
                                                    {!record.end_date && !record.is_current && ' - Presente'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="pt-4 border-t text-sm text-gray-500">
                        <p>
                            <strong>Nota:</strong> Para registrar historial completo, crea la tabla{' '}
                            <code className="bg-gray-100 px-1 rounded">t357_position_history</code> en Supabase.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
