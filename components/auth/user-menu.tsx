import { createClient } from '@/lib/supabase/server'
import { SignInButton } from './sign-in-button'
import { SignOutButton } from './sign-out-button'

export async function UserMenu() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return <SignInButton />
  }

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata?.full_name || 'User avatar'}
            className="w-8 h-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium">
          {user.user_metadata?.full_name || user.email}
        </span>
      </div>
      <SignOutButton />
    </div>
  )
}

