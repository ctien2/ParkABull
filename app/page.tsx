import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center min-h-screen p-8 gap-6">
      <h1 className="text-2xl font-semibold">Parking Lot</h1>
      <div className="w-full max-w-full max-h-[calc(100vh-8rem)] flex items-center justify-center">
        <Image
          src="/img/placeholder_lot.jpeg"
          alt="Parking lot"
          width={1200}
          height={800}
          className="max-w-full max-h-full w-auto h-auto rounded object-contain"
        />
      </div>
    </main>
  );
}
