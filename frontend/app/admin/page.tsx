
"use client";

import { useEffect, useState } from "react";

type Ride = {
  id: number;
  rider: string;
  pickup: string;
  drop: string;
  distance_km: number;
  estimated_fare: number;
  status: string;
};

type Analytics = {
  total_rides: number;
  average_fare: number;
  total_estimated_fare: number;
  total_distance_km: number;
  rides_by_status: Record<string, number>;
};

export default function AdminPage() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [stats, setStats] = useState<Analytics | null>(null);
  const [error, setError] = useState("");

  async function loadData() {
    try {
      setError("");
      const [r, a] = await Promise.all([
        fetch("http://127.0.0.1:8000/rides"),
        fetch("http://127.0.0.1:8000/analytics"),
      ]);

      if (!r.ok || !a.ok) throw new Error("Backend data load nahi hua.");

      setRides(await r.json());
      setStats(await a.json());
    } catch {
      setError("Backend check karein aur Refresh dabayein.");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <main className="min-h-screen bg-slate-100 p-6 md:p-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-extrabold text-indigo-700">
          RideWave Admin Dashboard
        </h1>
        <p className="mt-2 text-slate-600">Bookings and ride analytics</p>

        <button
          onClick={loadData}
          className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white"
        >
          Refresh Data
        </button>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Rides", stats?.total_rides ?? "—"],
            ["Total Estimated Fare", stats ? `₹${stats.total_estimated_fare}` : "—"],
            ["Average Fare", stats ? `₹${stats.average_fare}` : "—"],
            ["Total Distance", stats ? `${stats.total_distance_km} km` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-white p-6 shadow-sm">
              <p className="text-slate-500">{label}</p>
              <p className="mt-3 text-2xl font-bold text-indigo-700">{value}</p>
            </div>
          ))}
        </section>

        <section className="mt-8 overflow-x-auto rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-xl font-bold text-slate-900">Recent Bookings</h2>
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Rider</th>
                <th className="p-3">Route</th>
                <th className="p-3">Fare</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((ride) => (
                <tr key={ride.id} className="border-b">
                  <td className="p-3">{ride.id}</td>
                  <td className="p-3">{ride.rider}</td>
                  <td className="p-3">{ride.pickup} → {ride.drop}</td>
                  <td className="p-3">₹{ride.estimated_fare.toFixed(2)}</td>
                  <td className="p-3 capitalize">{ride.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
