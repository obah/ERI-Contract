"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  Package,
  UserPlus,
  Search,
  Settings,
  Plus,
  List,
  FileText,
  Key,
  UserCheck,
  Shield,
} from "lucide-react";

interface OwnershipSidebarProps {
  onOperationSelect: (operation: string) => void;
  selectedOperation: string;
}

export default function OwnershipSidebar({
  onOperationSelect,
  selectedOperation,
}: OwnershipSidebarProps) {
  const userOperations = [
    {
      id: "register",
      label: "Register User",
      icon: UserPlus,
      description: "Register a new user",
    },
    {
      id: "getUser",
      label: "Get User",
      icon: Search,
      description: "Find user by address",
    },
    {
      id: "setAuth",
      label: "Set Authenticity",
      icon: Settings,
      description: "Set authenticity contract",
    },
  ];

  const itemOperations = [
    {
      id: "create",
      label: "Create Item",
      icon: Plus,
      description: "Create a new item",
    },
    {
      id: "getAll",
      label: "Get All Items",
      icon: List,
      description: "List all user items",
    },
    {
      id: "getItem",
      label: "Get Item",
      icon: FileText,
      description: "Get item details",
    },
  ];

  const ownershipTransferOperations = [
    {
      id: "generateCode",
      label: "Generate Ownership Code",
      icon: Key,
      description: "Generate transfer code",
    },
    {
      id: "claimOwnership",
      label: "Claim Ownership",
      icon: UserCheck,
      description: "Claim item ownership",
    },
    {
      id: "revokeCode",
      label: "Revoke Code",
      icon: Shield,
      description: "Revoke transfer code",
    },
    {
      id: "getTempOwner",
      label: "Get Temporary Owner",
      icon: Search,
      description: "Get temp owner",
    },
    {
      id: "verifyOwnership",
      label: "Verify Ownership",
      icon: Shield,
      description: "Verify item ownership",
    },
    {
      id: "isOwner",
      label: "Is Owner",
      icon: UserCheck,
      description: "Check if user is owner",
    },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-border/40">
        <div className="flex items-center gap-2 px-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Package className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Ownership</span>
            <span className="truncate text-xs">Management System</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>User Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userOperations.map((operation) => {
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

        <SidebarGroup>
          <SidebarGroupLabel>Item Operations</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {itemOperations.map((operation) => {
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

        <SidebarGroup>
          <SidebarGroupLabel>Ownership Transfer</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {ownershipTransferOperations.map((operation) => {
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
      </SidebarContent>
    </Sidebar>
  );
}
