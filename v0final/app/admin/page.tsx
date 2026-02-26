import { getCoachProfile } from '@/app/actions/profile'
import { AdminDashboardClient } from '@/components/admin-dashboard-client'

export default async function AdminPage() {
  const profile = await getCoachProfile()

  return <AdminDashboardClient profile={profile} />
}
