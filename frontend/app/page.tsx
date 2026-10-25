
"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
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
  popular_routes: {
    pickup: string;
    drop: string;
    ride_count: number;
  }[];
};

const API_URL = "http://127.0.0.1:8000";

export default function Home() {
  const [name, setName] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [distance, setDistance] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [rides, setRides] = useState<Ride[]>([]);
  const [search, setSearch] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [dataError, setDataError] = useState("");

  const fare = distance ? 50 + Number(distance) * 12 : 0;
  
const statusChartData = analytics
  ? Object.entries(analytics.rides_by_status).map(([status, count]) => ({
      status,
      rides: count,
    }))
  : [];

const routeChartData = analytics?.popular_routes ?? [];


  async function loadData() {
    try {
      setDataError("");

      const [ridesResponse, analyticsResponse] = await Promise.all([
        fetch(`${API_URL}/rides`),
        fetch(`${API_URL}/analytics`),
      ]);

      if (!ridesResponse.ok || !analyticsResponse.ok) {
        throw new Error("Could not load dashboard data.");
      }

      const ridesData = await ridesResponse.json();
      const analyticsData = await analyticsResponse.json();

      setRides(ridesData);
      setAnalytics(analyticsData);
    } catch {
      setDataError(
        "Dashboard data load nahi hua. Check karein ki Python backend running hai."
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);
const filteredRides = rides.filter((ride) => {
  const query = search.toLowerCase();

  const matchesSearch =
    ride.rider.toLowerCase().includes(query) ||
    ride.pickup.toLowerCase().includes(query) ||
    ride.drop.toLowerCase().includes(query);

  const matchesStatus =
    statusFilter === "all" || ride.status === statusFilter;

  return matchesSearch && matchesStatus;
});
  async function bookRide(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/rides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rider_name: name.trim(),
          pickup: pickup.trim(),
          drop: drop.trim(),
          distance_km: Number(distance),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Booking nahi ho payi."
        );
      }

      setMessage(
        "Ride successfully booked! Booking ID: " +
          (data.id ?? data.ride_id ?? "Created")
      );

      setName("");
      setPickup("");
      setDrop("");
      setDistance("");

      await loadData();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Backend se connection nahi ho paya."
      );
    } finally {
      setLoading(false);
    }
  }
  

async function updateRideStatus(
  rideId: number,
  newStatus: string
) {
  try {
    const response = await fetch(
      `http://127.0.0.1:8000/rides/${rideId}/status?new_status=${encodeURIComponent(newStatus)}`,
      { method: "PATCH" }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "Status update failed.");
    }

    setMessage(`Ride #${rideId} status updated to ${newStatus}.`);
    await loadData();
  } catch (error) {
    setMessage(
      error instanceof Error ? error.message : "Status update failed."
    );
  }
}

function exportRidesToCSV() {
  const headers = [
    "Booking ID",
    "Rider",
    "Pickup",
    "Drop",
    "Distance (km)",
    "Fare",
    "Status",
  ];

  const rows = rides.map((ride) => [
    ride.id,
    ride.rider,
    ride.pickup,
    ride.drop,
    ride.distance_km,
    ride.estimated_fare,
    ride.status,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) =>
      row
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
const link = document.createElement("a");
link.href = url;
link.download = "ridewave_bookings.csv";
link.click();
URL.revokeObjectURL(url);
}

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <nav className="flex items-center justify-between bg-white px-6 py-5 shadow-sm md:px-12">
        <h1 className="text-2xl font-extrabold text-indigo-700">
          RideWave 🚕
        </h1>
        <a
          href="#booking"
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white"
        >
          Book a Ride
        </a>
      </nav>

      <section className="bg-gradient-to-r from-indigo-950 to-indigo-600 px-6 py-16 text-white md:px-12 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 font-semibold uppercase tracking-widest text-indigo-200">
              Welcome to RideWave
            </p>
            <h2 className="text-5xl font-extrabold leading-tight md:text-6xl">
              Your journey.
              <br />
              Our priority.
            </h2>
            <p className="mt-5 max-w-lg text-lg text-indigo-100">
              Book a cab, estimate your fare and manage your rides in one place.
            </p>
            <a
              href="#booking"
              className="mt-7 inline-block rounded-xl bg-white px-6 py-3 font-bold text-indigo-800"
            >
              Get Started →
            </a>
          </div>
          <div className="rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
            <div className="text-8xl">🚕</div>
            <h3 className="mt-5 text-3xl font-bold">Safe. Simple. Smart.</h3>
            <p className="mt-3 text-indigo-100">
              A smart cab booking experience for everyday journeys.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pt-10 md:px-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-indigo-600">LIVE OVERVIEW</p>
            <h2 className="mt-1 text-3xl font-bold">Ride Analytics</h2>
          </div>
          <button
            onClick={loadData}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold hover:bg-slate-50"
          >
            Refresh dashboard ↻
          </button>
        </div>

        {dataError && (
          <p role="alert" className="mb-5 rounded-xl bg-red-50 p-4 text-red-700">
            {dataError}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total rides</p>
            <p className="mt-3 text-3xl font-extrabold text-indigo-700">
              {analytics?.total_rides ?? "—"}
            </p>
            <p className="mt-2 text-sm text-slate-500">All saved bookings</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Average fare</p>
            <p className="mt-3 text-3xl font-extrabold text-emerald-700">
              {analytics
                ? `₹${Number(analytics.average_fare).toFixed(2)}`
                : "—"}
            </p>
            <p className="mt-2 text-sm text-slate-500">Per ride</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total fare</p>
            <p className="mt-3 text-3xl font-extrabold text-amber-700">
              {analytics
                ? `₹${Number(analytics.total_estimated_fare).toFixed(2)}`
                : "—"}
            </p>
            <p className="mt-2 text-sm text-slate-500">Estimated amount</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Total distance</p>
            <p className="mt-3 text-3xl font-extrabold text-violet-700">
              {analytics
                ? `${Number(analytics.total_distance_km).toFixed(1)} km`
                : "—"}
            </p>
            <p className="mt-2 text-sm text-slate-500">Across all rides</p>
          </div>
        </div>
      </section>

      <section
        id="booking"
        className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-5 md:px-12"
      >
        <div className="rounded-3xl bg-white p-6 shadow-md md:col-span-3 md:p-8">
          <h2 className="text-3xl font-bold">Book your cab</h2>
          <p className="mt-2 text-slate-500">
            Enter your trip details below.
          </p>

          <form onSubmit={bookRide} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block font-semibold">Your name</label>
              <input
                required
                maxLength={100}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Pickup location</label>
              <input
                required
                maxLength={200}
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Enter pickup location"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Drop location</label>
              <input
                required
                maxLength={200}
                value={drop}
                onChange={(e) => setDrop(e.target.value)}
                placeholder="Enter destination"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Distance (km)</label>
              <input
                required
                type="number"
                min="0.1"
                max="10000"
                step="0.1"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance in kilometres"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="rounded-2xl bg-indigo-50 p-5">
              <p className="text-sm text-slate-600">Estimated fare</p>
              <p className="mt-1 text-3xl font-extrabold text-indigo-700">
                ₹{fare.toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Demo rate: ₹50 base fare + ₹12 per kilometre.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-5 py-4 font-bold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {loading ? "Booking..." : "Confirm Booking →"}
            </button>

            {message && (
              <p role="status" className="break-words rounded-xl bg-slate-100 p-4">
                {message}
              </p>
            )}
          </form>
        </div>

        <div className="space-y-5 md:col-span-2">
          <div className="rounded-3xl bg-white p-6 shadow-md">
            <h3 className="text-xl font-bold">Why RideWave?</h3>
            <div className="mt-5 space-y-5">
              <p>📍 <strong>Easy booking</strong><br />Choose pickup and destination.</p>
              <p>💰 <strong>Fare estimate</strong><br />See the demo fare before booking.</p>
              <p>📊 <strong>Ride analytics</strong><br />View live statistics from your backend.</p>
            </div>
          </div>

          <div className="rounded-3xl bg-indigo-950 p-6 text-white shadow-md">
            <p className="text-sm text-indigo-200">YOUR NEXT JOURNEY</p>
            <h3 className="mt-3 text-2xl font-bold">Ready when you are.</h3>
            <p className="mt-3 text-indigo-100">
              Create a booking using the form.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-14 md:px-12">
        <div className="mb-6">
          <p className="font-semibold text-indigo-600">BOOKING HISTORY</p>
          <h2 className="mt-1 text-3xl font-bold">Recent Rides</h2>
          <p className="mt-2 text-slate-500">
            All rides retrieved from your backend database.
          </p>
        </div>
        
<button
  type="button"
  onClick={exportRidesToCSV}
  className="mb-5 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
>
  Export Bookings CSV ↓
</button>

<div className="mb-5 flex flex-col gap-3 sm:flex-row">
  <input
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search rider or route..."
    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
  />

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="rounded-xl border border-slate-300 bg-white px-4 py-3"
  >
    <option value="all">All statuses</option>
    <option value="requested">Requested</option>
    <option value="confirmed">Confirmed</option>
    <option value="completed">Completed</option>
    <option value="cancelled">Cancelled</option>
  </select>
</div>
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-200 text-slate-700">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Rider</th>
                <th className="p-4">Route</th>
                <th className="p-4">Distance</th>
                <th className="p-4">Fare</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {rides.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No rides found yet.
                  </td>
                </tr>
              ) : (
                filteredRides.map((ride) => (
                  <tr key={ride.id} className="border-t border-slate-100">
                    <td className="p-4 font-semibold">{ride.id}</td>
                    <td className="p-4">{ride.rider}</td>
                    <td className="p-4">
                      {ride.pickup} → {ride.drop}
                    </td>
                    <td className="p-4">{ride.distance_km} km</td>
                    <td className="p-4 font-semibold">
                      ₹{Number(ride.estimated_fare).toFixed(2)}
                    </td>
                  
                      
<td className="p-4">

<select
  value={ride.status}
  onChange={(e) =>
    updateRideStatus(ride.id, e.target.value)
  }
  className="rounded-lg border border-slate-300 bg-white px-3 py-2"
>
  <option value="requested">Requested</option>
  <option value="confirmed">Confirmed</option>
  <option value="completed">Completed</option>
  <option value="cancelled">Cancelled</option>
</select>

</td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-xl font-bold">Popular Routes</h3>
          {analytics?.popular_routes?.length ? (
            <div className="mt-4 space-y-3">
              {analytics.popular_routes.map((route, index) => (
                <div
                  key={`${route.pickup}-${route.drop}-${index}`}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4"
                >
                  <div>
                    <p className="font-semibold">
                      {route.pickup} → {route.drop}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {route.ride_count} ride(s)
                    </p>
                  </div>
                  <span className="text-xl">🚕</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-slate-500">No route statistics available yet.</p>
          )}
        </div>
      </section>

<section className="mx-auto max-w-6xl px-6 pb-12 md:px-12">
  <div className="mb-6">
    <p className="font-semibold text-indigo-600">VISUAL REPORTS</p>
    <h2 className="mt-1 text-3xl font-bold">Ride Charts</h2>
    <p className="mt-2 text-slate-500">
      Visual insights from your cab booking data.
    </p>
  </div>

  <div className="grid gap-6 lg:grid-cols-2">
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Rides by Status</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={statusChartData}
              dataKey="rides"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {statusChartData.map((entry, index) => (
                <Cell
                  key={entry.status}
                  fill={["#4f46e5", "#059669", "#d97706", "#dc2626"][index % 4]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>

    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-lg font-bold">Popular Routes</h3>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={routeChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="pickup" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Legend />
            <Bar
              dataKey="ride_count"
              name="Number of rides"
              fill="#4f46e5"
              radius={[5, 5, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
</section>

      <footer className="bg-slate-950 px-6 py-7 text-center text-sm text-slate-300">
        RideWave · Cab Booking Platform · Academic Project
      </footer>
    </main>
  );
}
