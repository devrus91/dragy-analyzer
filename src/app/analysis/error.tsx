'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="py-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dragy Analyzer
          </h1>
        </div>
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
          <div className="text-red-400 text-center">
            <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
            <p className="mb-4">{error.message}</p>
            <button
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg transition"
              onClick={() => reset()}
            >
              Try again
            </button>
            <a 
              href="/" 
              className="ml-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Go Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}