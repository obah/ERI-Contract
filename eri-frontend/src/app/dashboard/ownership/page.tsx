"use client";

import React, { useState } from "react";
import OwnershipFeatures from "@/components/ownership/ownership-features";
import { SidebarProvider } from "@/components/ui/sidebar";
import OwnershipSidebar from "@/components/ownership/ownership-sidebar";

export default function OwnershipPage() {
  const [selectedOperation, setSelectedOperation] = useState<string>("");

  const handleOperationSelect = (operation: string) => {
    setSelectedOperation(operation);
  };

  return (
    <SidebarProvider>
      <div className="flex h-full w-full ">
        <OwnershipSidebar
          onOperationSelect={handleOperationSelect}
          selectedOperation={selectedOperation}
        />

        <div className="flex-1 min-h-screen bg-gradient-to-br from-blue-100 to-teal-100 space-y-4 px-6 py-2">
          <div className="bg-white py-3 px-6 rounded-lg">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Ownership Verification
            </h1>
            <p className="text-lg text-gray-600">
              Verify and manage ownership of your digital assets and contracts.
            </p>
          </div>

          <OwnershipFeatures
            selectedOperation={selectedOperation}
            setSelectedOperation={setSelectedOperation}
          />
        </div>
      </div>
    </SidebarProvider>
  );
}
