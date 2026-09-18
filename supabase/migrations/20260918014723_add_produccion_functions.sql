-- Paso 1: crea la cabecera de producción + líneas de insumo, validando y
-- descontando stock de cada materia prima en una sola transacción.
create or replace function public.aplicar_nueva_produccion(
  p_panaderia_id uuid,
  p_turno_id uuid,
  p_panadero_id uuid,
  p_fecha date,
  p_insumos jsonb -- [{producto_id, insumo_id, cantidad, unidad_medida}]
) returns public.producciones
language plpgsql
security definer
set search_path = public
as $$
declare
  v_produccion public.producciones;
  v_turno_valido boolean;
  v_rec record;
  v_stock numeric;
  v_item jsonb;
begin
  if p_insumos is null or jsonb_array_length(p_insumos) = 0 then
    raise exception 'Agregá al menos un insumo.';
  end if;

  select exists (
    select 1 from turnos_produccion
    where id = p_turno_id and panaderia_id = p_panaderia_id and activo = true
  ) into v_turno_valido;
  if not v_turno_valido then
    raise exception 'El turno seleccionado no es válido o no está activo.';
  end if;

  for v_item in select * from jsonb_array_elements(p_insumos)
  loop
    if coalesce(v_item->>'producto_id', '') = '' then
      raise exception 'Cada línea de insumo debe indicar para qué producto es.';
    end if;
    if coalesce(v_item->>'insumo_id', '') = '' then
      raise exception 'Cada línea debe indicar el insumo usado.';
    end if;
    if coalesce((v_item->>'cantidad')::numeric, 0) <= 0 then
      raise exception 'La cantidad de cada insumo debe ser mayor a cero.';
    end if;
  end loop;

  for v_rec in
    select (i->>'insumo_id')::uuid as insumo_id, sum((i->>'cantidad')::numeric) as total
    from jsonb_array_elements(p_insumos) i
    group by 1
  loop
    select stock into v_stock from products where id = v_rec.insumo_id and panaderia_id = p_panaderia_id for update;
    if v_stock is null then
      raise exception 'Insumo no encontrado';
    end if;
    if v_rec.total > v_stock then
      raise exception 'Stock insuficiente de insumo (disponible: %, solicitado: %)', v_stock, v_rec.total;
    end if;
  end loop;

  insert into producciones (panaderia_id, turno_id, panadero_id, fecha, estado)
  values (p_panaderia_id, p_turno_id, p_panadero_id, p_fecha, 'insumos_cargados')
  returning * into v_produccion;

  insert into produccion_insumos (produccion_id, insumo_id, producto_id, cantidad, unidad_medida)
  select v_produccion.id, (i->>'insumo_id')::uuid, (i->>'producto_id')::uuid,
         (i->>'cantidad')::numeric, i->>'unidad_medida'
  from jsonb_array_elements(p_insumos) i;

  update products p
  set stock = stock - sub.total
  from (
    select (i->>'insumo_id')::uuid as insumo_id, sum((i->>'cantidad')::numeric) as total
    from jsonb_array_elements(p_insumos) i
    group by 1
  ) sub
  where p.id = sub.insumo_id;

  return v_produccion;
end;
$$;

revoke all on function public.aplicar_nueva_produccion from anon, authenticated, public;
grant execute on function public.aplicar_nueva_produccion to service_role;

-- Paso 2: carga el resultado de cocción, marca la producción como cocinada
-- (una sola vez) y suma stock de cada producto terminado.
create or replace function public.aplicar_resultado_produccion(
  p_produccion_id uuid,
  p_resultados jsonb -- [{producto_id, cantidad_obtenida, unidad_medida}]
) returns public.producciones
language plpgsql
security definer
set search_path = public
as $$
declare
  v_estado text;
  v_produccion public.producciones;
  v_item jsonb;
begin
  if p_resultados is null or jsonb_array_length(p_resultados) = 0 then
    raise exception 'Agregá al menos un resultado.';
  end if;

  for v_item in select * from jsonb_array_elements(p_resultados)
  loop
    if coalesce((v_item->>'cantidad_obtenida')::numeric, 0) <= 0 then
      raise exception 'La cantidad obtenida debe ser mayor a cero.';
    end if;
  end loop;

  select estado into v_estado from producciones where id = p_produccion_id for update;
  if v_estado is null then
    raise exception 'Producción no encontrada';
  end if;
  if v_estado = 'cocinado' then
    raise exception 'Esta producción ya tiene un resultado cargado.';
  end if;

  insert into produccion_resultados (produccion_id, producto_id, cantidad_obtenida, unidad_medida)
  select p_produccion_id, (r->>'producto_id')::uuid, (r->>'cantidad_obtenida')::numeric, r->>'unidad_medida'
  from jsonb_array_elements(p_resultados) r;

  update products p
  set stock = stock + sub.total
  from (
    select (r->>'producto_id')::uuid as producto_id, sum((r->>'cantidad_obtenida')::numeric) as total
    from jsonb_array_elements(p_resultados) r
    group by 1
  ) sub
  where p.id = sub.producto_id;

  update producciones
  set estado = 'cocinado', fecha_coccion = now()
  where id = p_produccion_id
  returning * into v_produccion;

  return v_produccion;
end;
$$;

revoke all on function public.aplicar_resultado_produccion from anon, authenticated, public;
grant execute on function public.aplicar_resultado_produccion to service_role;
