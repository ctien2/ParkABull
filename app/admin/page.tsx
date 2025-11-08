import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/auth/sign-out-button'

export default async function AdminPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/')
    }

    return (
        <main className="flex flex-col items-center justify-center min-h-screen p-8">
            <div className="max-w-2xl w-full space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold">Admin Panel</h1>
                    <SignOutButton />
                </div>
                <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                    <h2 className="text-xl font-semibold">User Information</h2>
                    <div className="space-y-2">
                        <p className="text-gray-700">
                            <span className="font-medium">Email:</span> {user.email}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Name:</span> {user.user_metadata?.full_name || 'N/A'}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">User ID:</span> {user.id}
                        </p>
                    </div>
                </div>
                <p className="text-lg text-gray-500">Welcome to the admin dashboard.</p>
            </div>
        </main>
    );
}
