'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Users, Calendar, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GlobalSearchProps {
    onSelectBrother?: (brotherId: number) => void;
    onSelectTenida?: (tenidaId: number) => void;
}

export function GlobalSearch({ onSelectBrother, onSelectTenida }: GlobalSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any>({ brothers: [], tenidas: [] });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!query || query.length < 2) {
            setResults({ brothers: [], tenidas: [] });
            setIsOpen(false);
            return;
        }

        const searchData = async () => {
            // Buscar hermanos
            const { data: brothersData } = await supabase
                .from('t357_brothers')
                .select('*')
                .or(`name.ilike.%${query}%,cedula.ilike.%${query}%`)
                .limit(5);

            // Buscar tenidas
            const { data: tenidasData } = await supabase
                .from('t357_meetings')
                .select('*')
                .ilike('theme', `%${query}%`)
                .limit(5);

            setResults({
                brothers: brothersData || [],
                tenidas: tenidasData || []
            });
            setIsOpen(true);
        };

        const debounce = setTimeout(searchData, 300);
        return () => clearTimeout(debounce);
    }, [query]);

    const getInitials = (name: string) =>
        name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const getGradeBadgeColor = (grade: string) => {
        switch (grade) {
            case 'Maestro': return 'bg-purple-100 text-purple-800';
            case 'Compañero': return 'bg-yellow-100 text-yellow-800';
            case 'Aprendiz': return 'bg-orange-100 text-orange-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults({ brothers: [], tenidas: [] });
        setIsOpen(false);
    };

    const hasResults = results.brothers.length > 0 || results.tenidas.length > 0;

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                    placeholder="Buscar hermanos o tenidas..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10 pr-10"
                />
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {isOpen && hasResults && (
                <Card className="absolute z-50 w-full mt-2 max-h-96 overflow-y-auto shadow-lg">
                    {results.brothers.length > 0 && (
                        <div className="p-2">
                            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                                <Users className="h-3 w-3" />
                                Hermanos
                            </div>
                            {results.brothers.map((brother: any) => (
                                <div
                                    key={brother.id}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                        onSelectBrother?.(brother.id);
                                        clearSearch();
                                    }}
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-semibold">
                                            {getInitials(brother.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {brother.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Cédula: {brother.cedula}
                                        </div>
                                    </div>
                                    <Badge className={getGradeBadgeColor(brother.grade)}>
                                        {brother.grade}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    )}

                    {results.tenidas.length > 0 && (
                        <div className="p-2 border-t">
                            <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                                <Calendar className="h-3 w-3" />
                                Tenidas
                            </div>
                            {results.tenidas.map((tenida: any) => (
                                <div
                                    key={tenida.id}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 cursor-pointer"
                                    onClick={() => {
                                        onSelectTenida?.(tenida.id);
                                        clearSearch();
                                    }}
                                >
                                    <Calendar className="h-4 w-4 text-blue-500" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {tenida.theme}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {new Date(tenida.date).toLocaleDateString('es-ES')} - {tenida.type}
                                        </div>
                                    </div>
                                    <Badge variant="outline">{tenida.grade}</Badge>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            )}
        </div>
    );
}
