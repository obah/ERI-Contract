"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import OwnershipSidebar from "./ownership-sidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { addressZero, parseError } from "../../lib/resources/error";
import { getEvents } from "../../lib/resources/getEvents";
import { OWNERSHIP_ABI } from "../../lib/resources/ownership_abi";
import {
  Certificate,
  CertificateWithHash,
  OwnershipContract,
  FormEvent,
  ChangeEvent,
  ClickEvent,
} from "../../types";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";

// Use environment variable or fallback to deployed contract address
const OWNERSHIP =
  process.env.NEXT_PUBLIC_OWNERSHIP ||
  "0x49e8207450dd0204Bb6a89A9edf7CE151cE58BBc";

export default function OwnershipFeatures() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [rContract, setRContract] = useState<OwnershipContract | null>(null);
  const [sContract, setSContract] = useState<OwnershipContract | null>(null);
  const [chainId, setChainId] = useState<string>("");
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [queryAddress, setQueryAddress] = useState<string>("");
  const [queryItemHash, setQueryItemHash] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [userAddress, setUserAddress] = useState<string>("");
  const [authe, setAuthe] = useState<string>("");
  const [isOwn, setIsOwn] = useState<string>("");
  const [temOwner, setTemOwner] = useState<string>("");
  const [queryItemId, setQueryItemId] = useState<string>("");
  const [userDetails, setUserDetails] = useState<string>("");
  const [itemDetails, setItemDetails] = useState<string>("");
  const [ownershipCode, setOwnershipCode] = useState<string>("");
  const [tempOwnerAddress, setTempOwnerAddress] = useState<string>("");
  const [claimCode, setClaimCode] = useState<string>("");
  const [revokeCode, setRevokeCode] = useState<string>("");

  const [certificate, setCertificate] = useState<Certificate>({
    name: "iPhone 12",
    uniqueId: "IMEI123",
    serial: "123456",
    date: "2813184000", // Jan 1, 2059
    owner: "",
    metadata: "BLACK,128GB",
  });

  useEffect(() => {
    if (!OWNERSHIP || OWNERSHIP === "undefined" || OWNERSHIP === "null") {
      toast.error(
        "Ownership contract address not configured. Please set NEXT_PUBLIC_OWNERSHIP environment variable."
      );
      return;
    }
    if (typeof window.ethereum !== "undefined") {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      setRContract(
        new ethers.Contract(
          OWNERSHIP,
          OWNERSHIP_ABI,
          web3Provider
        ) as unknown as OwnershipContract
      );
    } else {
      setProvider(ethers.getDefaultProvider as any);
      toast.error("Please install MetaMask!");
    }
  }, []);

  // Fetch items for the connected account
  useEffect(() => {
    const fetchItems = async () => {
      if (!account || !rContract) return;
      setLoading(true);
      try {
        // Replace with actual contract call to fetch items for the user
        // Example: const items = await rContract.getAllItems(account);
        // For now, use a mock list
        const items = [
          {
            name: "iPhone 12",
            uniqueId: "IMEI123",
            serial: "123456",
            date: "2813184000",
            owner: account,
            metadata: "BLACK,128GB",
          },
        ];
        setItemsList(items);
      } catch (error: any) {
        toast.error("Failed to fetch items");
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, [account, rContract]);

  const connectWallet = async () => {
    if (!provider) {
      toast.error("MetaMask not detected");
      return;
    }
    try {
      if (!account) {
        await window.ethereum!.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        setChainId(network.chainId.toString());
        const address = await signer.getAddress();
        setSigner(signer);
        setAccount(address);
        setSContract(
          new ethers.Contract(
            OWNERSHIP,
            OWNERSHIP_ABI,
            signer
          ) as unknown as OwnershipContract
        );
        toast.success(
          `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
        );
        return;
      }
      setSigner(null);
      setAccount(null);
      const network = await provider.getNetwork();
      setChainId(network.chainId.toString());
      setRContract(
        new ethers.Contract(
          OWNERSHIP,
          OWNERSHIP_ABI,
          provider
        ) as unknown as OwnershipContract
      );
      toast.success("Wallet disconnected");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  // Handler for sidebar operation selection
  const handleOperationSelect = (operation: string) => {
    setSelectedOperation(operation);
  };

  // Handler to go back to the list view
  const handleBackToList = () => {
    setSelectedOperation("");
  };

  const registerUser = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !sContract) return;
    try {
      if (!username || username.length < 3) {
        throw new Error("Username must be at least 3 characters");
      }
      const tx = await sContract.userRegisters(username);
      await tx.wait();

      toast.success(`User ${username} registered`);

      setUsername("");
      setFormVisible("");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getUser = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !rContract) return;
    try {
      if (!ethers.isAddress(queryAddress)) {
        throw new Error("Valid address required");
      }

      const user = await rContract.getUser(queryAddress);

      setUserDetails(
        `Address: ${user.userAddress}, 
              Username: ${user.username}, 
              Registered At: ${new Date(
                Number(user.registeredAt) * 1000
              ).toLocaleString()}`
      );

      toast.success(`Found user: ${user.username}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const createItem = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !sContract) return;
    try {
      if (
        !certificate.name ||
        !certificate.uniqueId ||
        !certificate.serial ||
        !certificate.date ||
        !certificate.owner ||
        !certificate.metadata
      ) {
        throw new Error("All certificate fields required");
      }
      if (!ethers.isAddress(certificate.owner)) {
        throw new Error("Valid owner address required");
      }
      if (isNaN(Number(certificate.date)) || Number(certificate.date) <= 0) {
        throw new Error("Invalid date: must be a valid Unix timestamp");
      }
      const metadata = certificate.metadata
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const cert: CertificateWithHash = {
        name: certificate.name,
        uniqueId: certificate.uniqueId,
        serial: certificate.serial,
        date: parseInt(certificate.date.toString()),
        owner: certificate.owner,
        metadataHash: ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(["string[]"], [metadata])
        ),
        metadata,
      };

      console.log("Cert Owner: ", cert.owner);
      const manufacturerName = "APPLE Corp"; // Replace with dynamic input if needed
      console.log("Account: ", account);
      const tx = await sContract.createItem(account, cert, manufacturerName);
      await tx.wait();

      toast.success(`Item ${cert.uniqueId} created`);
      setCertificate({
        name: "",
        uniqueId: "",
        serial: "",
        date: "",
        owner: account,
        metadata: "",
      });
      setFormVisible("");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getAllItems = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !sContract) return;
    try {
      const items = await sContract.getAllItems(account);
      setItemsList(items);
      toast.success(`Found ${items.length} items`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getItem = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !rContract) return;
    try {
      if (!queryItemHash) throw new Error("Item hash required");
      const item = await rContract.getItem(queryItemHash);
      setItemDetails(JSON.stringify(item, null, 2));
      toast.success("Item details retrieved");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const generateChangeOfOwnershipCode = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !sContract) return;
    try {
      if (!queryItemHash || !tempOwnerAddress) {
        throw new Error("Item hash and new owner address required");
      }
      if (!ethers.isAddress(tempOwnerAddress)) {
        throw new Error("Valid new owner address required");
      }
      const tx = await sContract.generateChangeOfOwnershipCode(
        queryItemHash,
        tempOwnerAddress
      );
      const receipt = await tx.wait();
      const code = getEvents(sContract, receipt, "OwnershipCodeGenerated");
      setOwnershipCode(code);
      toast.success(`Ownership code generated: ${code}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const newOwnerClaimOwnership = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !sContract) return;
    try {
      if (!queryItemHash || !claimCode) {
        throw new Error("Item hash and claim code required");
      }
      const tx = await sContract.newOwnerClaimOwnership(
        queryItemHash,
        claimCode
      );
      await tx.wait();
      toast.success("Ownership claimed successfully");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const revokeChangeOwnershipCode = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !sContract) return;
    try {
      if (!queryItemHash) throw new Error("Item hash required");
      const tx = await sContract.revokeChangeOwnershipCode(queryItemHash);
      await tx.wait();
      toast.success("Ownership code revoked");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getTempOwner = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !rContract) return;
    try {
      if (!queryItemHash) throw new Error("Item hash required");
      const tempOwner = await rContract.getTempOwner(queryItemHash);
      setTemOwner(tempOwner);
      toast.success(`Temporary owner: ${tempOwner}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const verifyOwnership = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !rContract) return;
    try {
      if (!queryItemHash || !owner) {
        throw new Error("Item hash and owner address required");
      }
      if (!ethers.isAddress(owner)) {
        throw new Error("Valid owner address required");
      }
      const isOwner = await rContract.verifyOwnership(queryItemHash, owner);
      setOwner(isOwner ? "Yes" : "No");
      toast.success(`Ownership verification: ${isOwner ? "Yes" : "No"}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const isOwner = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !rContract) return;
    try {
      if (!queryItemHash || !userAddress) {
        throw new Error("Item hash and user address required");
      }
      if (!ethers.isAddress(userAddress)) {
        throw new Error("Valid user address required");
      }
      const isOwnerResult = await rContract.isOwner(queryItemHash, userAddress);
      setIsOwn(isOwnerResult ? "Yes" : "No");
      toast.success(`Is owner: ${isOwnerResult ? "Yes" : "No"}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const setAuthenticity = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!account || !sContract) return;
    try {
      if (!ethers.isAddress(authe)) {
        throw new Error("Invalid Authenticity Address");
      }
      const tx = await sContract.setAuthenticity(authe);
      const receipt = await tx.wait();
      const authenticityAddress = getEvents(
        sContract,
        receipt,
        "AuthenticitySet"
      );
      setAuthe(authenticityAddress);
      toast.success(`Authenticity Address: ${authenticityAddress}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-teal-50">
        <Sidebar>
          <OwnershipSidebar
            onOperationSelect={handleOperationSelect}
            selectedOperation={selectedOperation}
            account={account}
            onConnectWallet={connectWallet}
          />
        </Sidebar>
        <SidebarInset>
          <main className="flex-1 p-8 overflow-auto">
            {selectedOperation ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleBackToList}
                  className="mb-4"
                >
                  ← Back to List
                </Button>
                {/* TODO: Render the operation form/component for the selected operation here */}
                <div className="text-center text-muted-foreground">
                  Operation form for <b>{selectedOperation}</b> goes here.
                </div>
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Items</h2>
                {loading ? (
                  <div>Loading items...</div>
                ) : itemsList.length === 0 ? (
                  <div>No items found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {itemsList.map((item, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle>{item.name}</CardTitle>
                          <CardDescription>
                            Serial: {item.serial}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-2">
                            Unique ID: {item.uniqueId}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Owner: {item.owner}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Date: {item.date}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Metadata: {item.metadata}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </SidebarInset>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
        />
      </div>
    </SidebarProvider>
  );
}
