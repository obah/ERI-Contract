"use client";

import React, { useState } from "react";
import AuthenticityFeatures from "@/components/authencity/authenticity-features";
import AuthenticitySidebar from "@/components/authencity/authenticity-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function AuthenticityPage() {
  const [selectedOperation, setSelectedOperation] = useState<string>("");

  return (
    <SidebarProvider>
      <div className="flex h-full w-full ">
        <AuthenticitySidebar
          onOperationSelect={setSelectedOperation}
          selectedOperation={selectedOperation}
        />

        <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 space-y-4 px-6 py-2">
          <div className="bg-white py-3 px-6 rounded-lg">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Authenticity Verification
            </h1>
            <p className="text-lg text-gray-600">
              Verify the authenticity of your documents and contracts using
              blockchain technology.
            </p>
          </div>

          <AuthenticityFeatures
            selectedOperation={selectedOperation}
            setSelectedOperation={setSelectedOperation}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
