"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";

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
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();

  const [host, setHost] = useState("");
  const [mode, setMode] = useState<ScanMode>("rce");
  const [paths, setPaths] = useState("/");
  const [wafBypass, setWafBypass] = useState(false);
  const [windows, setWindows] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const currentLocale = pathname.split("/")[1] || "en";

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
    router.push(newPath);
  };

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
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-red-500">
              {t("header.title")}
            </h1>
            <p className="text-sm text-zinc-400">{t("header.subtitle")}</p>
          </div>
          {/* Language Switcher */}
          <div className="flex gap-2">
            <button
              onClick={() => switchLocale("en")}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                currentLocale === "en"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => switchLocale("zh")}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                currentLocale === "zh"
                  ? "bg-red-600 text-white"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              中文
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* Scan Form */}
        <form onSubmit={handleScan} className="space-y-6">
          {/* Host Input */}
          <div>
            <label
              htmlFor="host"
              className="block text-sm font-medium text-zinc-300"
            >
              {t("form.targetUrl")}
            </label>
            <input
              type="text"
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder={t("form.placeholder")}
              required
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Scan Mode */}
          <div>
            <label className="block text-sm font-medium text-zinc-300">
              {t("form.scanMode")}
            </label>
            <div className="mt-2 flex flex-wrap gap-4">
              {[
                {
                  value: "rce",
                  label: t("form.rce"),
                  desc: t("form.rceDesc"),
                },
                {
                  value: "safe",
                  label: t("form.safe"),
                  desc: t("form.safeDesc"),
                },
                {
                  value: "vercel-bypass",
                  label: t("form.vercelBypass"),
                  desc: t("form.vercelBypassDesc"),
                },
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
            <label
              htmlFor="paths"
              className="block text-sm font-medium text-zinc-300"
            >
              {t("form.pathsToTest")}
            </label>
            <input
              type="text"
              id="paths"
              value={paths}
              onChange={(e) => setPaths(e.target.value)}
              placeholder={t("form.pathsPlaceholder")}
              className="mt-1 block w-full rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
            <p className="mt-1 text-xs text-zinc-500">{t("form.pathsHint")}</p>
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
              <span className="text-sm text-zinc-300">{t("form.wafBypass")}</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={windows}
                onChange={(e) => setWindows(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-red-500 focus:ring-red-500"
              />
              <span className="text-sm text-zinc-300">
                {t("form.windowsTarget")}
              </span>
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
                {t("form.scanning")}
              </span>
            ) : (
              t("form.startScan")
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
            <h2 className="text-lg font-semibold">{t("result.title")}</h2>
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
                    ? t("result.vulnerable")
                    : result.vulnerable === false
                    ? t("result.notVulnerable")
                    : t("result.error")}
                </span>
              </div>

              {/* Details */}
              <dl className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <dt className="text-zinc-500">{t("result.host")}</dt>
                  <dd className="font-mono text-zinc-200">{result.host}</dd>
                </div>
                <div>
                  <dt className="text-zinc-500">{t("result.testedUrl")}</dt>
                  <dd className="font-mono text-zinc-200">
                    {result.tested_url}
                  </dd>
                </div>
                {result.final_url && result.final_url !== result.tested_url && (
                  <div>
                    <dt className="text-zinc-500">{t("result.finalUrl")}</dt>
                    <dd className="font-mono text-zinc-200">
                      {result.final_url}
                    </dd>
                  </div>
                )}
                <div>
                  <dt className="text-zinc-500">{t("result.timestamp")}</dt>
                  <dd className="text-zinc-200">
                    {new Date(result.timestamp).toLocaleString()}
                  </dd>
                </div>
                {result.error && (
                  <div className="md:col-span-2">
                    <dt className="text-zinc-500">{t("result.errorLabel")}</dt>
                    <dd className="text-yellow-400">{result.error}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* CVE Info */}
        <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
          <h3 className="text-lg font-semibold text-zinc-200">
            {t("about.title")}
          </h3>
          <div className="mt-4 space-y-3 text-sm text-zinc-400">
            <p>
              <strong className="text-zinc-300">
                CVE-2025-55182 & CVE-2025-66478
              </strong>{" "}
              {t("about.description1")}
            </p>
            <p>{t("about.description2")}</p>
            <p className="text-yellow-500">{t("about.warning")}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800 px-6 py-8 text-center text-sm text-zinc-500">
        <p>{t("footer.credit")}</p>

        {/* GitHub Links */}
        <div className="mt-4 flex flex-wrap justify-center gap-4">
          <a
            href="https://github.com/assetnote/react2shell-scanner"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {t("footer.scannerCli")}
          </a>
          <a
            href="https://github.com/allen-hsu/react2shell-scanner-frontend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {t("footer.frontend")}
          </a>
          <a
            href="https://github.com/allen-hsu/react2shell-scanner-backend"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-zinc-400 transition-colors hover:border-zinc-500 hover:text-white"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {t("footer.backend")}
          </a>
        </div>
      </footer>
    </div>
  );
}
