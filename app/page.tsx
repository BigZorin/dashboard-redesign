import { getCoachProfile } from '@/app/actions/profile'
import { CoachingDashboardClient } from '@/components/coaching-dashboard-client'

const mockProfile = {
  naam: 'Coach Demo',
  initialen: 'CD',
  rol: 'Online Coach',
  avatarUrl: '',
  isAdmin: false,
  userId: 'demo-coach-001',
}

export default async function CoachingDashboard() {
  let profile
  try {
    profile = await getCoachProfile()
    // If no name returned (no Supabase), use mock
    if (!profile.naam) profile = mockProfile
  } catch {
    profile = mockProfile
  }

  return <CoachingDashboardClient profile={profile} />
}
