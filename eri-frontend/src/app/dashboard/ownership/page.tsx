"use client";

import React from "react";
import OwnershipFeatures from "@/components/ownership/ownership-features";
import { SidebarProvider } from "@/components/ui/sidebar";
import OwnershipSidebar from "@/components/ownership/ownership-sidebar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// export default function OwnershipPage() {

//   return (
//     <SidebarProvider>
//     <div className="flex h-full bg-red-500">
//       <OwnershipSidebar
//         onOperationSelect={handleOperationSelect}
//         selectedOperation={selectedOperation}
//         account={account}
//         onConnectWallet={connectWallet}
//       />
//       <main className="flex-1 p-8 overflow-auto">
//         {selectedOperation ? (
//           <>
//             <Button
//               variant="outline"
//               onClick={handleBackToList}
//               className="mb-4"
//             >
//               ← Back to List
//             </Button>
//             {/* TODO: Render the operation form/component for the selected operation here */}
//             <div className="text-center text-muted-foreground">
//               Operation form for <b>{selectedOperation}</b> goes here.
//             </div>
//           </>
//         ) : (
//           <div className="w-full">
//             <h2 className="text-2xl font-bold mb-6">Your Items</h2>
//             {loading ? (
//               <div>Loading items...</div>
//             ) : itemsList.length === 0 ? (
//               <div>No items found.</div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//                 {itemsList.map((item, idx) => (
//                   <Card key={idx}>
//                     <CardHeader>
//                       <CardTitle>{item.name}</CardTitle>
//                       <CardDescription>Serial: {item.serial}</CardDescription>
//                     </CardHeader>
//                     <CardContent>
//                       <div className="text-sm text-muted-foreground mb-2">
//                         Unique ID: {item.uniqueId}
//                       </div>
//                       <div className="text-sm text-muted-foreground mb-2">
//                         Owner: {item.owner}
//                       </div>
//                       <div className="text-sm text-muted-foreground mb-2">
//                         Date: {item.date}
//                       </div>
//                       <div className="text-sm text-muted-foreground">
//                         Metadata: {item.metadata}
//                       </div>
//                     </CardContent>
//                   </Card>
//                 ))}
//               </div>
//             )}
//           </div>
//         )}
//       </main>
//       <ToastContainer
//         position="top-right"
//         autoClose={5000}
//         hideProgressBar={false}
//       />
//     </div>
//   </SidebarProvider>
//   );
// }
export default function OwnershipPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
      <main className="container mx-auto p-6">
        {/* <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Ownership Verification
          </h1>
          <p className="text-lg text-gray-600">
            Verify and manage ownership of your digital assets and contracts.
          </p>
        </div> */}
        <OwnershipFeatures />
      </main>
    </div>
  );
}
