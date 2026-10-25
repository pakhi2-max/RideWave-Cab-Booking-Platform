
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Demo login only — not secure authentication.
    if (
      email.trim().toLowerCase() === "admin@ridewave.com" &&
      password === "Admin123!"
    ) {
      setMessage("Demo login successful!");
      router.push("/admin");
    } else {
      setMessage("Email ya password sahi nahi hai.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-5 py-10">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="text-5xl">🚕</div>
          <h1 className="mt-4 text-3xl font-extrabold text-indigo-700">
            RideWave
          </h1>
          <p className="mt-2 text-slate-500">
            Sign in to your dashboard
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="mb-2 block font-semibold">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="mb-2 block font-semibold">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white hover:bg-indigo-700"
          >
            Sign In →
          </button>

          {message && (
            <p role="status" className="rounded-xl bg-slate-100 p-3 text-center">
              {message}
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Academic project · Demo login
        </p>
      </div>
    </main>
  );
}
