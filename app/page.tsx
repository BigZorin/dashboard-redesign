import { getCoachProfile } from '@/app/actions/profile'
import { CoachingDashboardClient } from '@/components/coaching-dashboard-client'

export default async function CoachingDashboard() {
  const profile = await getCoachProfile()

  return <CoachingDashboardClient profile={profile} />
}
