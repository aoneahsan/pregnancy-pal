import { createFileRoute } from '@tanstack/react-router'
import { DonationPage } from '@/components/donation/DonationPage'

export const Route = createFileRoute('/donate')({
  component: DonationRoute,
})

function DonationRoute() {
  return <DonationPage />
}