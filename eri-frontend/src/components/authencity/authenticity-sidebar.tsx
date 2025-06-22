"use client";

import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Building2,
  FileText,
  Search,
  Shield,
  QrCode,
  UserCheck,
  Settings,
  ChevronRight,
} from "lucide-react";

type UserType = "manufacturer" | "regular";

interface AuthenticitySidebarProps {
  onOperationSelect: (operation: string) => void;
  selectedOperation: string;
  account: string | null;
  onConnectWallet: () => void;
}

export default function AuthenticitySidebar({
  onOperationSelect,
  selectedOperation,
  account,
  onConnectWallet,
}: AuthenticitySidebarProps) {
  const [userType, setUserType] = useState<UserType>("regular");

  const manufacturerOperations = [
    {
      id: "register",
      label: "Register Manufacturer",
      icon: Building2,
      description: "Register as a manufacturer",
    },
    {
      id: "byName",
      label: "Get Manufacturer by Name",
      icon: Search,
      description: "Find manufacturer by name",
    },
    {
      id: "byAddress",
      label: "Get Manufacturer by Address",
      icon: Search,
      description: "Find manufacturer by address",
    },
  ];

  const certificateOperations = [
    {
      id: "verify",
      label: "Verify Signature",
      icon: Shield,
      description: "Verify certificate signature",
    },
    {
      id: "claim",
      label: "Claim Ownership",
      icon: UserCheck,
      description: "Claim item ownership",
    },
    {
      id: "verifyAuth",
      label: "Verify Authenticity",
      icon: FileText,
      description: "Verify product authenticity",
    },
  ];

  const currentOperations =
    userType === "manufacturer"
      ? manufacturerOperations
      : certificateOperations;

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/40">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Shield className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Authenticity</span>
            <span className="truncate text-xs">Verification System</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarInset>
          <SidebarGroup>
            <SidebarGroupLabel>User Type</SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-2 py-2">
                <Select
                  value={userType}
                  onValueChange={(value: UserType) => setUserType(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select user type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular User</SelectItem>
                    <SelectItem value="manufacturer">Manufacturer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel>
              {userType === "manufacturer"
                ? "Manufacturer Operations"
                : "Certificate Operations"}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {currentOperations.map((operation) => {
                  const Icon = operation.icon;
                  return (
                    <SidebarMenuItem key={operation.id}>
                      <SidebarMenuButton
                        onClick={() => onOperationSelect(operation.id)}
                        data-active={selectedOperation === operation.id}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{operation.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarInset>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex flex-col gap-2 p-2">
          {account ? (
            <div className="text-xs text-muted-foreground px-2">
              Connected: {account.slice(0, 6)}...{account.slice(-4)}
            </div>
          ) : (
            <Button onClick={onConnectWallet} className="w-full">
              Connect Wallet
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
