create or replace function public.get_brother_attendance_summary()
returns table (
  brother_id bigint,
  brother_name text,
  brother_grade text,
  brother_position text,
  total_attendances bigint,
  total_sessions bigint,
  grade_attendances bigint,
  grade_sessions bigint
)
language sql
stable
as $$
  select
    b.id::bigint as brother_id,
    b.name::text as brother_name,
    b.grade::text as brother_grade,
    p.name::text as brother_position,
    (
      select count(a.id)
      from public.attendances a
      join public.meetings m on m.id = a.meeting_id
      where a.brother_id = b.id
        and (
          b.grade = 'Maestro'
          or (b.grade = 'Compañero' and m.grade in ('Compañero', 'Aprendiz'))
          or (b.grade = 'Aprendiz' and m.grade = 'Aprendiz')
        )
    )::bigint as total_attendances,
    (
      select count(m.id)
      from public.meetings m
      where
        b.grade = 'Maestro'
        or (b.grade = 'Compañero' and m.grade in ('Compañero', 'Aprendiz'))
        or (b.grade = 'Aprendiz' and m.grade = 'Aprendiz')
    )::bigint as total_sessions,
    (
      select count(a.id)
      from public.attendances a
      join public.meetings m on m.id = a.meeting_id
      where a.brother_id = b.id
        and m.grade = b.grade
    )::bigint as grade_attendances,
    (
      select count(m.id)
      from public.meetings m
      where m.grade = b.grade
    )::bigint as grade_sessions
  from public.brothers b
  left join public.positions p on p.id = b.position_id
  order by b.name;
$$;
