import Link from "next/link";
import Image from "next/image";
import { UserMenu } from "@/components/auth/user-menu";
import MapboxMap from "@/components/map/mapbox-map";

export default function Home() {
  return (
    <>
      <header className="w-full border-b border-gray-200 bg-white">
        <div className="container mx-auto flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Image
                src="/img/logo.jpg"
                alt="Park-A-Bull Logo"
                width={40}
                height={40}
                className="rounded-md object-cover cursor-pointer"
              />
            </Link>

            <h1 className="text-2xl font-bold">Park-A-Bull</h1>
          </div>

          <UserMenu />
        </div>
      </header>

      <main className="flex flex-col items-center min-h-screen p-8 gap-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            University at Buffalo&nbsp;&ndash;&nbsp;North Campus
          </h2>

          <p className="text-gray-600">
            Explore parking availability across campus
          </p>
        </div>

        <MapboxMap />
      </main>
    </>
  );
}
