"use client";

import { useState } from "react";
import axios from "axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API}/api/auth/forgot-password`, {
        email,
      });
      alert("Check your email for reset link.");
    } catch (err) {
      alert("Error sending reset email.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Forgot Password
        </h1>
        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-700 placeholder-gray-400 focus:border-blue-500 focus:ring focus:ring-blue-200"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Send Reset Link
          </button>
        </form>
      </div>
    </div>
  );
}
