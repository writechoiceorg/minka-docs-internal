import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex flex-1 flex-col justify-center text-center p-8">
      <h1 className="mb-4 text-2xl font-bold">Hello World</h1>
      <p className="text-gray-600 mb-4">
        You can open{' '}
        <Link
          href="/docs"
          className="text-blue-600 font-semibold underline hover:text-blue-800"
        >
          /docs
        </Link>{' '}
        and see the documentation.
      </p>
      <div className="mt-4">
        <Link
          href="/docs"
          className="inline-block rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
        >
          Go to Documentation
        </Link>
      </div>
    </main>
  );
}
