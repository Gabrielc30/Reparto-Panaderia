-- The owner (admin) sometimes does deliveries themselves and doesn't go
-- through a formal despacho from a panadero, so they're exempt from the
-- "must match a confirmed dispatch" check. Only the repartidor role stays
-- limited to what was actually dispatched to them.
create or replace function public.validar_venta_despachada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_repartidor_id uuid;
  v_rol text;
  v_fecha date;
  v_disponible numeric;
  v_ya_registrado numeric;
begin
  select repartidor_id, fecha_hora::date into v_repartidor_id, v_fecha
  from deliveries where id = NEW.delivery_id;

  select rol into v_rol from users where id = v_repartidor_id;

  if v_rol = 'admin' then
    return NEW;
  end if;

  select coalesce(sum(di.cantidad_confirmada_repartidor), 0) into v_disponible
  from dispatch_items di
  join dispatches d on d.id = di.dispatch_id
  where d.repartidor_id = v_repartidor_id
    and d.fecha = v_fecha
    and d.estado in ('confirmado', 'resuelto')
    and di.producto_id = NEW.producto_id;

  select coalesce(sum(dei.cantidad), 0) into v_ya_registrado
  from delivery_items dei
  join deliveries de on de.id = dei.delivery_id
  where de.repartidor_id = v_repartidor_id
    and de.fecha_hora::date = v_fecha
    and dei.producto_id = NEW.producto_id
    and dei.id is distinct from NEW.id;

  if NEW.cantidad > (v_disponible - v_ya_registrado) then
    raise exception 'Producto sin despacho suficiente hoy (disponible: %, solicitado: %)',
      greatest(v_disponible - v_ya_registrado, 0), NEW.cantidad;
  end if;

  return NEW;
end;
$$;
