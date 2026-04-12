import Link from 'next/link';

export default function BikeServicePage() {
  return (
    <main className="min-h-screen bg-gray-50 text-gray-900">
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h1 className="text-4xl font-bold">BikeDeli - Coming Soon</h1>
        <p className="mt-4 text-lg text-gray-600">
          Da tao san route va folder cho bike-service. Tinh nang se duoc trien khai o giai doan sau.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-md bg-black px-4 py-2 text-white hover:bg-gray-800"
          >
            Ve trang chu
          </Link>
        </div>
      </section>
    </main>
  );
}
