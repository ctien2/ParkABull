import { createClient } from '@/lib/supabase/server'
import { SignInButton } from './sign-in-button'
import { SignOutButton } from './sign-out-button'
import Image from "next/image";


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
          <Image
            src={user.user_metadata.avatar_url}
            alt={user.user_metadata?.full_name || "User avatar"}
            width={32}
            height={32}
            unoptimized
            className="rounded-full"
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

