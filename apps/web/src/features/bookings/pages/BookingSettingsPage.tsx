import { PageHeader } from '@/shared/components'
import { BlocksCard } from '../components/BlocksCard'
import { ProductsCard } from '../components/ProductsCard'
import { ScheduleCard } from '../components/ScheduleCard'

export function BookingSettingsPage() {
  return (
    <>
      <PageHeader
        title="Reservas"
        description="Configura qué se puede reservar y cuándo. Tus clientes solo verán los huecos libres."
      />
      <div className="max-w-3xl space-y-6">
        <ProductsCard />
        <ScheduleCard />
        <BlocksCard />
      </div>
    </>
  )
}
