"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DragyService } from "../services/dragyService";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validate URL format
    if (!url.includes("/leaderboards/")) {
      setError("Invalid URL format. Please enter a valid Dragy leaderboard URL.");
      return;
    }

    // Extract ID
    const id = DragyService.extractIdFromUrl(url);
    if (!id) {
      setError("Could not extract car ID from URL. Please check the URL format.");
      return;
    }

    // Redirect to analysis page with the ID
    router.push(`/analysis?id=${id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="py-8 text-center">
          <h1 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Dragy Analyzer
          </h1>
          <p className="mt-2 text-gray-400 max-w-2xl mx-auto">
            Deep diagnostics for drag racing: from GPS trajectory to micro-acceleration spikes
          </p>
        </header>

        <main>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 md:p-8 max-w-3xl mx-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="url" className="block text-sm font-medium text-gray-300 mb-2">
                  Dragy Leaderboard URL
                </label>
                <input
                  type="url"
                  id="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.godragy.com/leaderboards/Brand/Name-123456/?rankIndex=123"
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 outline-none transition"
                  required
                />
                <p className="mt-2 text-sm text-gray-400">
                  Enter a valid Dragy leaderboard URL to analyze the run data
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Analyze Run Data"
                )}
              </button>
            </form>
          </div>
        </main>

        <footer className="py-8 text-center text-gray-500 text-sm">
          <p>Dragy Analyzer - Advanced drag racing data analysis</p>
        </footer>
      </div>
    </div>
  );
}