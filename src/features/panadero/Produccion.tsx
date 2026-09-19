import { Link } from 'react-router-dom'
import { useProduccionesPendientes } from './hooks'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Skeleton } from '../../components/Skeleton'

interface ProduccionPendiente {
  id: string
  fecha: string
  turnos_produccion: { nombre: string }
  produccion_insumos: { products: { nombre: string } }[]
}

export function Produccion() {
  const { data: pendientes, isLoading } = useProduccionesPendientes()

  return (
    <div className="space-y-4">
      <Link to="/panadero/produccion/nueva">
        <Button>+ Nueva producción</Button>
      </Link>

      <Card>
        <p className="mb-3 font-semibold text-brand-900">Pendientes de resultado</p>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full rounded-lg" />
            <Skeleton className="h-14 w-full rounded-lg" />
          </div>
        ) : (
          <div className="space-y-3">
            {(pendientes as unknown as ProduccionPendiente[] | undefined)?.map((produccion) => {
              const productos = [
                ...new Set(produccion.produccion_insumos.map((i) => i.products.nombre)),
              ]
              return (
                <div key={produccion.id} className="rounded-lg ring-1 ring-brand-100 p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-brand-900">
                        {produccion.turnos_produccion.nombre} · {produccion.fecha}
                      </p>
                      <p className="text-xs text-brand-500">{productos.join(', ')}</p>
                    </div>
                  </div>
                  <Link to={`/panadero/produccion/${produccion.id}/resultado`}>
                    <Button variant="secondary" className="mt-3">
                      Cargar resultado
                    </Button>
                  </Link>
                </div>
              )
            })}
            {pendientes?.length === 0 && (
              <p className="text-sm text-brand-500">No hay producciones esperando resultado de cocción.</p>
            )}
          </div>
        )}
      </Card>
    </div>
  )
}
