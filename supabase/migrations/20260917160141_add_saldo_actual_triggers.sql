-- Keeps clients.saldo_actual in sync: cuenta_corriente sales increase debt,
-- payments decrease it. Nothing in the original schema maintained this column.
create or replace function public.actualizar_saldo_por_venta()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cliente_id uuid;
begin
  if NEW.tipo_movimiento = 'venta' and NEW.forma_pago = 'cuenta_corriente' then
    select cliente_id into v_cliente_id from deliveries where id = NEW.delivery_id;
    update clients set saldo_actual = saldo_actual + (NEW.cantidad * coalesce(NEW.precio_unitario, 0))
    where id = v_cliente_id;
  end if;
  return NEW;
end;
$$;

drop trigger if exists trg_actualizar_saldo_venta on delivery_items;
create trigger trg_actualizar_saldo_venta
after insert on delivery_items
for each row execute function public.actualizar_saldo_por_venta();

create or replace function public.actualizar_saldo_por_pago()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update clients set saldo_actual = saldo_actual - NEW.monto where id = NEW.cliente_id;
  return NEW;
end;
$$;

drop trigger if exists trg_actualizar_saldo_pago on payments;
create trigger trg_actualizar_saldo_pago
after insert on payments
for each row execute function public.actualizar_saldo_por_pago();
