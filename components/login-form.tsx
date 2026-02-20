"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        setError('Ongeldige inloggegevens. Probeer het opnieuw.')
        setLoading(false)
        return
      }

      const role = data.user?.user_metadata?.role || 'CLIENT'

      if (role === 'ADMIN') {
        router.push('/admin')
      } else if (role === 'COACH') {
        router.push('/')
      } else {
        setError('Alleen coaches en admins kunnen inloggen op het dashboard.')
        await supabase.auth.signOut()
        setLoading(false)
        return
      }

      router.refresh()
    } catch {
      setError('Er is iets misgegaan. Probeer het later opnieuw.')
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-4 border-[oklch(0.30_0.04_290)] bg-[oklch(0.22_0.05_290)] text-white">
      <CardHeader className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
            <span className="text-[oklch(0.22_0.05_290)] font-bold text-lg">E</span>
          </div>
          <span className="text-xl font-bold">Evotion</span>
        </div>
        <CardTitle className="text-xl text-white">Welkom terug</CardTitle>
        <CardDescription className="text-[oklch(0.7_0.02_290)]">
          Log in op je coaching dashboard
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[oklch(0.8_0.02_290)]">E-mailadres</Label>
            <Input
              id="email"
              type="email"
              placeholder="coach@evotion.nl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-[oklch(0.15_0.04_290)] border-[oklch(0.30_0.04_290)] text-white placeholder:text-[oklch(0.5_0.02_290)]"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-[oklch(0.8_0.02_290)]">Wachtwoord</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-[oklch(0.15_0.04_290)] border-[oklch(0.30_0.04_290)] text-white placeholder:text-[oklch(0.5_0.02_290)]"
            />
          </div>
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-md p-2">
              {error}
            </p>
          )}
          <Button
            type="submit"
            className="w-full bg-white text-[oklch(0.22_0.05_290)] hover:bg-white/90 font-semibold"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inloggen...
              </>
            ) : (
              'Inloggen'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
