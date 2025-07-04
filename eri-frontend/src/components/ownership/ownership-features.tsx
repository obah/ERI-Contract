"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { parseError } from "../../lib/resources/error";
import { getEvents } from "../../lib/resources/getEvents";
import { OWNERSHIP_ABI } from "../../lib/resources/ownership_abi";

import { useAppKitAccount } from "@reown/appkit/react";
import { toast } from "sonner";

// Use environment variable or fallback to deployed contract address
const OWNERSHIP =
  process.env.NEXT_PUBLIC_OWNERSHIP ||
  "0x49e8207450dd0204Bb6a89A9edf7CE151cE58BBc";

interface OwnershipFeaturesProps {
  selectedOperation: string;
  setSelectedOperation: (operation: string) => void;
}

export default function OwnershipFeatures({
  selectedOperation,
  setSelectedOperation,
}: OwnershipFeaturesProps) {
  const [rContract, setRContract] = useState<OwnershipContract | null>(null);
  const [sContract, setSContract] = useState<OwnershipContract | null>(null);
  const [itemsList, setItemsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [queryAddress, setQueryAddress] = useState<string>("");
  const [queryItemHash, setQueryItemHash] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [authe, setAuthe] = useState<string>("");
  const [isOwn, setIsOwn] = useState<string>("");
  const [temOwner, setTemOwner] = useState<string>("");
  const [userDetails, setUserDetails] = useState<string>("");
  const [itemDetails, setItemDetails] = useState<string>("");
  const [ownershipCode, setOwnershipCode] = useState<string>("");
  const [tempOwnerAddress, setTempOwnerAddress] = useState<string>("");
  const [claimCode, setClaimCode] = useState<string>("");

  const { address } = useAppKitAccount();

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

    const provider = ethers.getDefaultProvider();
    setRContract(
      new ethers.Contract(
        OWNERSHIP,
        OWNERSHIP_ABI,
        provider
      ) as unknown as OwnershipContract
    );

    if (address) {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const browserProvider = new ethers.BrowserProvider(
          (window as any).ethereum
        );
        browserProvider.getSigner().then((signer) => {
          setSContract(
            new ethers.Contract(
              OWNERSHIP,
              OWNERSHIP_ABI,
              signer
            ) as unknown as OwnershipContract
          );
        });
      } else {
        setSContract(null);
      }
    } else {
      setSContract(null);
    }
  }, [address]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!address || !rContract) return;
      setLoading(true);
      try {
        const items = [
          {
            name: "iPhone 12",
            uniqueId: "IMEI123",
            serial: "123456",
            date: "2813184000",
            owner: address,
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
  }, [address, rContract]);

  const handleOperationSelect = (operation: string) => {
    setSelectedOperation(operation);
  };

  const handleBackToList = () => {
    setSelectedOperation("");
  };

  const registerUser = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!address || !sContract) return;
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
    if (!address || !rContract) return;
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
    if (!address || !sContract) return;
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
      console.log("Account: ", address);
      const tx = await sContract.createItem(address, cert, manufacturerName);
      await tx.wait();

      toast.success(`Item ${cert.uniqueId} created`);
      setCertificate({
        name: "",
        uniqueId: "",
        serial: "",
        date: "",
        owner: address,
        metadata: "",
      });
      setFormVisible("");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getAllItems = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!address || !sContract) return;
    try {
      const items = await sContract.getAllItems(address);
      setItemsList(items);
      toast.success(`Found ${items.length} items`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getItem = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!address || !rContract) return;
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
    if (!address || !sContract) return;
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
    if (!address || !sContract) return;
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
    if (!address || !sContract) return;
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
    if (!address || !rContract) return;
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
    if (!address || !rContract) return;
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
    if (!address || !rContract) return;
    try {
      if (!queryItemHash || !address) {
        throw new Error("Item hash and user address required");
      }
      if (!ethers.isAddress(address)) {
        throw new Error("Valid user address required");
      }
      const isOwnerResult = await rContract.isOwner(queryItemHash, address);
      setIsOwn(isOwnerResult ? "Yes" : "No");
      toast.success(`Is owner: ${isOwnerResult ? "Yes" : "No"}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const setAuthenticity = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!address || !sContract) return;
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
    <main className="flex-1 overflow-auto">
      {selectedOperation ? (
        <>
          <Button variant="outline" onClick={handleBackToList} className="mb-4">
            ← Back to List
          </Button>
          <div className="text-center text-muted-foreground">
            Operation form for <b>{selectedOperation}</b> goes here.
          </div>
        </>
      ) : (
        <div className="w-full">
          <h2 className="text-2xl font-bold mb-6">Your Items</h2>
          {loading ? (
            <p>Loading items...</p>
          ) : itemsList.length === 0 ? (
            <p>No items found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itemsList.map((item, idx) => (
                <Card key={idx}>
                  <CardHeader>
                    <CardTitle>{item.name}</CardTitle>
                    <CardDescription>Serial: {item.serial}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Unique ID: {item.uniqueId}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Owner: {item.owner}
                    </p>
                    <p className="text-sm text-muted-foreground mb-2">
                      Date: {item.date}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Metadata: {item.metadata}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
