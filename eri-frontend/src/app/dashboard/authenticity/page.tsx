"use client";

import React from "react";
import AuthenticityFeatures from "@/components/authencity/authenticity-features";

export default function AuthenticityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Authenticity Verification
          </h1>
          <p className="text-lg text-gray-600">
            Verify the authenticity of your documents and contracts using
            blockchain technology.
          </p>
        </div>
        <AuthenticityFeatures />
      </main>
    </div>
  );
}
