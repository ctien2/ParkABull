'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'

export function SignInButton() {
  const handleSignIn = async () => {
    const supabase = createClient()

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  return (
    <Button
      onClick={handleSignIn}
      className="bg-blue-500 hover:bg-blue-600 text-white"
    >
      Sign In with Google
    </Button>
  )
}

