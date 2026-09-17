-- Business rule: a repartidor can only sell/exchange quantities that were
-- actually dispatched to them (confirmado/resuelto) and not already used
-- today. Enforced as a trigger so it applies no matter which path inserts
-- into delivery_items (edge function, direct client insert, future code).
create or replace function public.validar_venta_despachada()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_repartidor_id uuid;
  v_fecha date;
  v_disponible numeric;
  v_ya_registrado numeric;
begin
  select repartidor_id, fecha_hora::date into v_repartidor_id, v_fecha
  from deliveries where id = NEW.delivery_id;

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

drop trigger if exists trg_validar_venta_despachada on delivery_items;
create trigger trg_validar_venta_despachada
before insert on delivery_items
for each row execute function public.validar_venta_despachada();

revoke all on function public.validar_venta_despachada() from anon, authenticated, public;
