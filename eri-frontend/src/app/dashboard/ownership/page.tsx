"use client";

import React from "react";
import OwnershipFeatures from "@/components/ownership/ownership-features";

export default function OwnershipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
      <main className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Ownership Verification
          </h1>
          <p className="text-lg text-gray-600">
            Verify and manage ownership of your digital assets and contracts.
          </p>
        </div>
        <OwnershipFeatures />
      </main>
    </div>
  );
}
