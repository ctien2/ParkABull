export default function AuthCodeError() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Authentication Error</h1>
      <p className="text-lg text-gray-500 mb-4">
        Sorry, we couldn&apos;t authenticate you. Please try again.
      </p>
      <a href="/" className="text-blue-600 hover:underline">
        Go back home
      </a>
    </main>
  )
}

