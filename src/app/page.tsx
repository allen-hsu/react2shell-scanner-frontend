"use client";

import { useState } from "react";

type ScanMode = "rce" | "safe" | "vercel-bypass";

interface ScanResult {
  host: string;
  vulnerable: boolean | null;
  status_code: number | null;
  error: string | null;
  final_url: string | null;
  tested_url: string | null;
  timestamp: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [host, setHost] = useState("");
  const [mode, setMode] = useState<ScanMode>("rce");
  const [paths, setPaths] = useState("/");
  const [wafBypass, setWafBypass] = useState(false);
  const [windows, setWindows] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const pathList = paths
        .split(",")
        .map((p) => p.trim())
        .filter((p) => p);

      const response = await fetch(`${API_BASE}/api/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          host,
          mode,
          paths: pathList.length > 0 ? pathList : ["/"],
          waf_bypass: wafBypass,
          windows,
          timeout: wafBypass ? 20 : 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Scan failed");
      }

      const data: ScanResult = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <header className="border-b border-zinc-800 px-6 py-4">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold text-red-500">React2Shell Scanner</h1>
          <p className="text-sm text-zinc-400">
            CVE-2025-55182 & CVE-2025-66478 Detection Tool
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Scan Form */}
        <form onSubmit={handleScan} className="space-y-6">
          {/* Host Input */}
          <div>
            <label htmlFor="host" className="block text-sm font-medium text-zinc-300">
              Target URL
            </label>
            <input
              type="text"
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="https://example.com"
              required
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Scan Mode */}
          <div>
            <label className="block text-sm font-medium text-zinc-300">Scan Mode</label>
            <div className="mt-2 flex gap-4">
              {[
                { value: "rce", label: "RCE PoC", desc: "Execute harmless calculation" },
                { value: "safe", label: "Safe Check", desc: "Side-channel detection" },
                { value: "vercel-bypass", label: "Vercel Bypass", desc: "Vercel WAF bypass" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer flex-col rounded-lg border p-4 transition-colors ${
                    mode === option.value
                      ? "border-red-500 bg-red-500/10"
                      : "border-zinc-700 hover:border-zinc-600"
                  }`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={option.value}
                    checked={mode === option.value}
                    onChange={(e) => setMode(e.target.value as ScanMode)}
                    className="sr-only"
                  />
                  <span className="font-medium">{option.label}</span>
                  <span className="text-xs text-zinc-400">{option.desc}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Paths Input */}
          <div>
            <label htmlFor="paths" className="block text-sm font-medium text-zinc-300">
              Paths to Test
            </label>
            <input
              type="text"
              id="paths"
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              placeholder="/, /_next, /api"
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <p className="mt-1 text-xs text-zinc-500">Comma-separated list of paths</p>
          </div>

          {/* Options */}
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={wafBypass}
                onChange={(e) => setWafBypass(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-300">WAF Bypass (128KB junk)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={windows}
                onChange={(e) => setWindows(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-300">Windows Target (PowerShell)</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !host}
            className="w-full rounded-lg bg-red-600 px-6 py-3 font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Scanning...
              </span>
            ) : (
              "Start Scan"
            )}
          </button>
        </form>

        {/* Error Display */}
        {error && (
          <div className="mt-6 rounded-lg border border-red-800 bg-red-900/20 p-4">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">Scan Result</h2>
            <div
              className={`rounded-lg border p-6 ${
                result.vulnerable === true
                  ? "border-red-600 bg-red-900/20"
                  : result.vulnerable === false
                    ? "border-green-600 bg-green-900/20"
                    : "border-yellow-600 bg-yellow-900/20"
              }`}
            >
              {/* Status Badge */}
              <div className="mb-4 flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${
                    result.vulnerable === true
                      ? "bg-red-600 text-white"
                      : result.vulnerable === false
                        ? "bg-green-600 text-white"
                        : "bg-yellow-600 text-white"
                  }`}
                >
                  {result.vulnerable === true
                    ? "VULNERABLE"
                    : result.vulnerable === false
                      ? "NOT VULNERABLE"
                      : "ERROR"}
                </span>
                {result.status_code && (
                  <span className="text-sm text-zinc-400">
                    HTTP {result.status_code}
                  </span>
                )}
              </div>

              {/* Details */}
              <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-zinc-500">Host</dt>
                  <dd className="font-mono text-zinc-200">{result.host}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">Tested URL</dt>
                  <dd className="font-mono text-zinc-200">{result.tested_url}</dd>
                </div>
                {result.final_url && result.final_url !== result.tested_url && (
                  <div>
                    <dt className="text-zinc-500">Final URL (after redirect)</dt>
                    <dd className="font-mono text-zinc-200">{result.final_url}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-zinc-500">Timestamp</dt>
                  <dd className="text-zinc-200">
                    {new Date(result.timestamp).toLocaleString()}
                  </dd>
                </div>
                {result.error && (
                  <div className="md:col-span-2">
                    <dt className="text-zinc-500">Error</dt>
                    <dd className="text-yellow-400">{result.error}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* CVE Info */}
        <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-lg font-semibold text-zinc-200">About the Vulnerabilities</h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <p>
              <strong className="text-zinc-300">CVE-2025-55182 & CVE-2025-66478</strong> are
              critical Remote Code Execution (RCE) vulnerabilities in Next.js applications
              using React Server Components (RSC).
            </p>
            <p>
              The scanner sends a crafted multipart POST request that exploits the
              serialization mechanism. Vulnerable servers execute a harmless mathematical
              operation (<code className="rounded bg-zinc-800 px-1">41*271=11111</code>) and
              return the result in the response header.
            </p>
            <p className="text-yellow-500">
              This tool is for authorized security testing only. Always obtain proper
              authorization before scanning any systems.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-4 text-center text-sm text-zinc-500">
        <p>Based on research from Assetnote Security Research Team</p>
        <p className="mt-1">
          Scanner:{" "}
          <a
            href="https://github.com/assetnote/react2shell-scanner"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-white underline"
          >
            github.com/assetnote/react2shell-scanner
          </a>
        </p>
      </footer>
    </div>
  );
}
