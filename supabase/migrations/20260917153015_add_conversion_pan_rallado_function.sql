create or replace function public.aplicar_conversion_pan_rallado(
  p_panaderia_id uuid,
  p_responsable_id uuid,
  p_bolsas_viejas_usadas numeric,
  p_pan_suelto_usado_kg numeric,
  p_pan_rallado_obtenido_kg numeric,
  p_observaciones text,
  p_producto_viejo_id uuid,
  p_producto_suelto_id uuid,
  p_producto_rallado_id uuid
) returns public.stock_conversions
language plpgsql
security definer
set search_path = public
as $$
declare
  v_stock_viejo numeric;
  v_stock_suelto numeric;
  v_row public.stock_conversions;
begin
  select stock into v_stock_viejo from products where id = p_producto_viejo_id for update;
  select stock into v_stock_suelto from products where id = p_producto_suelto_id for update;

  if v_stock_viejo is null or v_stock_suelto is null then
    raise exception 'Producto de insumo no encontrado';
  end if;

  if v_stock_viejo < p_bolsas_viejas_usadas then
    raise exception 'Stock insuficiente de pan viejo (disponible: %, solicitado: %)', v_stock_viejo, p_bolsas_viejas_usadas;
  end if;
  if v_stock_suelto < p_pan_suelto_usado_kg then
    raise exception 'Stock insuficiente de pan suelto (disponible: %, solicitado: %)', v_stock_suelto, p_pan_suelto_usado_kg;
  end if;

  update products set stock = stock - p_bolsas_viejas_usadas where id = p_producto_viejo_id;
  update products set stock = stock - p_pan_suelto_usado_kg where id = p_producto_suelto_id;
  update products set stock = stock + p_pan_rallado_obtenido_kg where id = p_producto_rallado_id;

  insert into stock_conversions (
    panaderia_id, responsable_id, bolsas_viejas_usadas, pan_suelto_usado_kg, pan_rallado_obtenido_kg, observaciones
  )
  values (
    p_panaderia_id, p_responsable_id, p_bolsas_viejas_usadas, p_pan_suelto_usado_kg, p_pan_rallado_obtenido_kg, p_observaciones
  )
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.aplicar_conversion_pan_rallado from public;
grant execute on function public.aplicar_conversion_pan_rallado to service_role;
