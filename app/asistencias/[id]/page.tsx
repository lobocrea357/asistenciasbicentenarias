"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AsistenciasPage() {
  const params = useParams();
  const id = params.id;
  const router = useRouter();
  const [hermanos, setHermanos] = useState<any[]>([]);
  const [asistentes, setAsistentes] = useState<any[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [sugerencias, setSugerencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    const fetchAsistentes = async () => {
      const { data } = await supabase
        .from('t357_attendances')
        .select('*, brother:t357_brothers(*)')
        .eq('meeting_id', id);
      setAsistentes(data || []);
    };
    fetchAsistentes();
  }, [id]);

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
    await supabase.from('t357_attendances').insert([{
      meeting_id: id,
      brother_id: hermano.id
    }]);
    setBusqueda('');
    setSugerencias([]);
    // Recargar lista
    const { data } = await supabase
      .from('t357_attendances')
      .select('*, brother:t357_brothers(*)')
      .eq('meeting_id', id);
    setAsistentes(data || []);
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

  if (loading) return null;

  return (
    <div className="max-w-xl mx-auto py-8">
      <Button
        className="mb-4"
        onClick={() => router.push('/')}
      >
        Volver a Tenidas
      </Button>
      <h1 className="text-2xl font-bold mb-4">Asistencias a la Tenida #{id}</h1>
      <div className="mb-6">
        <Input
          placeholder="Buscar hermano por nombre o cédula"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
        />
        {sugerencias.length > 0 && (
          <div className="border rounded bg-white mt-2">
            {sugerencias.map(h => (
              <div
                key={h.id}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => agregarAsistente(h)}
              >
                {h.name} - Cédula: {h.cedula}
              </div>
            ))}
          </div>
        )}
      </div>
      <h2 className="text-lg font-semibold mb-2">Asistentes</h2>
      <ul className="divide-y">
        {asistentes.map(a => (
          <li key={a.id} className="py-2">
            {a.brother?.name || 'Sin nombre'} - Cédula: {a.brother?.cedula}
          </li>
        ))}
      </ul>
    </div>
  );
}