import Image from "next/image";
import { UserMenu } from "@/components/auth/user-menu";

export default function Home() {
  return (
    <>
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <h1 className="text-2xl font-bold">Parking Lotter</h1>
          <UserMenu />
        </div>
      </header>
      <main className="flex flex-col items-center min-h-screen p-8">
        <p className="text-gray-600">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
      </main>
    </>
  );
}
