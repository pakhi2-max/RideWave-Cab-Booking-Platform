
"use client";

import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

export default function Home() {
  const [form, setForm] = useState({
    rider_name: "",
    pickup: "",
    drop: "",
    distance_km: "",
  });

  const [rides, setRides] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const estimatedFare = form.distance_km
    ? 50 + 12 * Number(form.distance_km)
    : 0;

  async function loadData() {
    try {
      const [ridesResponse, analyticsResponse] = await Promise.all([
        fetch(`${API_URL}/rides`),
        fetch(`${API_URL}/analytics`),
      ]);

      if (ridesResponse.ok) {
        setRides(await ridesResponse.json());
      }

      if (analyticsResponse.ok) {
        setAnalytics(await analyticsResponse.json());
      }
    } catch {
      setMessage(
        "Backend connect nahi hua. Check karein ki Python server running hai."
      );
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  async function bookRide(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_URL}/rides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rider_name: form.rider_name.trim(),
          pickup: form.pickup.trim(),
          drop: form.drop.trim(),
          distance_km: Number(form.distance_km),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Booking failed.");
      }

      setMessage(
        `Ride booked successfully! Booking ID: ${data.id ?? data.ride_id ?? "Created"}`
      );

      setForm({
        rider_name: "",
        pickup: "",
        drop: "",
        distance_km: "",
      });

      await loadData();
    } catch (error) {
      setMessage(
        error.message ||
          "Booking nahi ho payi. Backend aur API connection check karein."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="flex items-center justify-between border-b bg-white px-6 py-5 md:px-12">
        <div className="text-2xl font-extrabold text-indigo-700">
          Ride<span className="text-slate-900">Wave</span>
        </div>
        <a
          href="#book"
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
        >
          Book a Ride
        </a>
      </nav>

      <section className="bg-gradient-to-r from-indigo-950 to-indigo-700 px-6 py-16 text-white md:px-12 md:py-24">
        <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-4 font-semibold uppercase tracking-widest text-indigo-200">
              Your journey starts here
            </p>
            <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
              Your ride.
              <br />
              Your time.
              <br />
              Your journey.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-indigo-100">
              Book your next ride in a few simple steps. Get an estimated fare
              and manage your bookings from one place.
            </p>
            <a
              href="#book"
              className="mt-8 inline-block rounded-xl bg-white px-6 py-3 font-bold text-indigo-800 hover:bg-indigo-50"
            >
              Get Started →
            </a>
          </div>

          <div className="rounded-3xl border border-white/20 bg-white/10 p-8 text-center backdrop-blur">
            <div className="text-8xl">🚕</div>
            <h2 className="mt-5 text-2xl font-bold">Smart Cab Booking</h2>
            <p className="mt-3 text-indigo-100">
              Simple booking, transparent estimated fares, and ride analytics.
            </p>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-xl font-bold">24/7</div>
                <div className="mt-1 text-xs">Booking</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-xl font-bold">Easy</div>
                <div className="mt-1 text-xs">Process</div>
              </div>
              <div className="rounded-xl bg-white/10 p-3">
                <div className="text-xl font-bold">Smart</div>
                <div className="mt-1 text-xs">Analytics</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        id="book"
        className="mx-auto grid max-w-6xl gap-8 px-6 py-14 md:grid-cols-5 md:px-12"
      >
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 md:col-span-3 md:p-8">
          <p className="font-semibold text-indigo-600">RESERVE YOUR RIDE</p>
          <h2 className="mt-2 text-3xl font-bold">Book a cab</h2>
          <p className="mt-2 text-slate-500">
            Enter your trip details to calculate the estimated fare.
          </p>

          <form onSubmit={bookRide} className="mt-7 space-y-5">
            <div>
              <label className="mb-2 block font-semibold">Rider name</label>
              <input
                name="rider_name"
                value={form.rider_name}
                onChange={handleChange}
                required
                maxLength={100}
                placeholder="Enter your full name"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Pickup location</label>
              <input
                name="pickup"
                value={form.pickup}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Where should we pick you up?"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">Drop location</label>
              <input
                name="drop"
                value={form.drop}
                onChange={handleChange}
                required
                maxLength={200}
                placeholder="Where are you going?"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label className="mb-2 block font-semibold">
                Distance (km)
              </label>
              <input
                name="distance_km"
                type="number"
                min="0.1"
                max="10000"
                step="0.1"
                value={form.distance_km}
                onChange={handleChange}
                required
                placeholder="Enter trip distance"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="rounded-2xl bg-indigo-50 p-5">
              <p className="text-sm font-medium text-slate-600">
                Estimated fare
              </p>
              <p className="mt-1 text-3xl font-extrabold text-indigo-700">
                ₹{estimatedFare.toFixed(2)}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Demo calculation: ₹50 base fare + ₹12 per km.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-indigo-600 px-5 py-4 font-bold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Booking..." : "Confirm Booking →"}
            </button>

            {message && (
              <p
                role="status"
                className="break-words rounded-xl bg-slate-100 p-4 text-sm"
              >
                {message}
              </p>
            )}
          </form>
        </div>

        <div className="space-y-5 md:col-span-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-bold">Ride Analytics</h3>
            <p className="mt-1 text-sm text-slate-500">
              Data from your backend
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-indigo-50 p-4">
                <p className="text-sm text-slate-600">Total rides</p>
                <p className="mt-2 text-2xl font-extrabold text-indigo-700">
                  {analytics?.total_rides ?? "—"}
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-sm text-slate-600">Average fare</p>
                <p className="mt-2 text-2xl font-extrabold text-emerald-700">
                  {analytics?.average_fare != null
                    ? `₹${Number(analytics.average_fare).toFixed(2)}`
                    : "—"}
                </p>
              </div>
            </div>

            <button
              onClick={loadData}
              className="mt-5 w-full rounded-xl border border-slate-300 px-4 py-3 font-semibold hover:bg-slate-50"
            >
              Refresh data ↻
            </button>
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h3 className="text-xl font-bold">Why RideWave?</h3>
            <div className="mt-5 space-y-4">
              <div className="flex gap-3">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="font-semibold">Easy trip details</p>
                  <p className="text-sm text-slate-500">
                    Enter pickup and destination.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">💳</span>
                <div>
                  <p className="font-semibold">Fare estimate</p>
                  <p className="text-sm text-slate-500">
                    See a demo fare before booking.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-2xl">📊</span>
                <div>
                  <p className="font-semibold">Ride insights</p>
                  <p className="text-sm text-slate-500">
                    View ride statistics from the API.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16 md:px-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-semibold text-indigo-600">YOUR BOOKINGS</p>
            <h2 className="mt-1 text-3xl font-bold">Recent rides</h2>
          </div>
          <button
            onClick={loadData}
            className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold hover:bg-slate-100"
          >
            Refresh rides
          </button>
        </div>

        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-100 text-slate-600">
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
                  <td colSpan="6" className="p-8 text-center text-slate-500">
                    No rides to display yet. Book your first ride above.
                  </td>
                </tr>
              ) : (
                rides.map((ride) => (
                  <tr key={ride.id} className="border-t border-slate-100">
                    <td className="p-4 font-semibold">{ride.id}</td>
                    <td className="p-4">{ride.rider_name}</td>
                    <td className="p-4">
                      {ride.pickup} → {ride.drop}
                    </td>
                    <td className="p-4">{ride.distance_km} km</td>
                    <td className="p-4 font-semibold">
                      ₹{Number(ride.estimated_fare).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-indigo-50 px-3 py-1 text-indigo-700">
                        {ride.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="bg-slate-950 px-6 py-8 text-center text-sm text-slate-300">
        RideWave · Cab Booking Platform · Academic project
      </footer>
    </main>
  );
}
