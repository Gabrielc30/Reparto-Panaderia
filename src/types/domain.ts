import type { Tables } from './database'

export type Rol = 'admin' | 'panadero' | 'repartidor'
export type EstadoUsuario = 'activo' | 'inactivo'
export type CondicionPago = 'contado' | 'cuenta_corriente'
export type TipoProducto = 'venta_normal' | 'insumo_interno'
export type UnidadMedida = 'unidad' | 'kg'
export type EstadoDespacho = 'pendiente' | 'confirmado' | 'en_disputa' | 'resuelto'
export type TipoMovimiento = 'venta' | 'cambio'
export type FormaPago = 'efectivo' | 'transferencia' | 'cuenta_corriente'
export type FormaPagoCobro = 'efectivo' | 'transferencia'
export type EstadoCierreDia = 'abierto' | 'cerrado'

export type Panaderia = Tables<'panaderias'>
export type UserProfile = Tables<'users'>
export type Client = Tables<'clients'>
export type Product = Tables<'products'>
export type Dispatch = Tables<'dispatches'>
export type DispatchItem = Tables<'dispatch_items'>
export type LocalDispatch = Tables<'local_dispatches'>
export type Delivery = Tables<'deliveries'>
export type DeliveryItem = Tables<'delivery_items'>
export type DeliveryEdit = Tables<'delivery_edits'>
export type CierreDiaRepartidor = Tables<'cierre_dia_repartidor'>
export type CierreLocal = Tables<'cierres_local'>
export type StockConversion = Tables<'stock_conversions'>
export type Payment = Tables<'payments'>

export type DispatchWithItems = Dispatch & {
  dispatch_items: (DispatchItem & { products: Product })[]
}
