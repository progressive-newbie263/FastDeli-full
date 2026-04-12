import Link from 'next/link';

export default function DeliveryServicePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold">ShipDeli - Delivery Service</h1>
        <p className="mt-4 text-lg text-gray-600">
          Khu vuc dich vu giao hang tren web da duoc tach rieng va san sang cho giai doan tiep theo.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/food-service"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Mo Food Service
          </Link>
          <Link
            href="/"
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            Ve trang chu
          </Link>
        </div>
      </section>
    </main>
  );
}
