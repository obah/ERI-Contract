"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { signTypedData } from "../../lib/resources/typedData";
import { parseError } from "../../lib/resources/error";
import { QRCodeCanvas } from "qrcode.react";
import { AUTHENTICITY_ABI } from "../../lib/resources/authenticity_abi";
import AuthenticitySidebar from "./authenticity-sidebar";
import AuthenticityOperations from "./authenticity-operations";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider,
  Sidebar,
  SidebarInset,
} from "@/components/ui/sidebar";
import { toast } from "sonner";

// Use environment variable or fallback to deployed contract address
const AUTHENTICITY =
  process.env.NEXT_PUBLIC_AUTHENTICITY ||
  "0x98BC72046616b528D4Bc5bbcC7d99f82237A8B55";

function AuthenticityFeatures() {
  const [provider, setProvider] = useState<any>(null);
  const [signer, setSigner] = useState<any>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [rContract, setRContract] = useState<any>(null);
  const [sContract, setSContract] = useState<any>(null);
  const [formVisible, setFormVisible] = useState<string>("");
  const [manufacturerName, setManufacturerName] = useState<string>("");
  const [queryName, setQueryName] = useState<string>("");
  const [queryAddress, setQueryAddress] = useState<string>("");
  const [manufacturerDetails, setManufacturerDetails] = useState<string>("");
  const [manufacturerAddress, setManufacturerAddress] = useState<string>("");
  const [signatureResult, setSignatureResult] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [veriSignature, setVeriSignature] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [chainId, setChainId] = useState<string>("");
  const [veriResult, setVeriResult] = useState<any>({});
  const [certificate, setCertificate] = useState<Certificate>({
    name: "iPhone 12",
    uniqueId: "IMEI123",
    serial: "123456",
    date: "",
    owner: "0xF2E7E2f51D7C9eEa9B0313C2eCa12f8e43bd1855",
    metadata: "BLACK, 128GB",
  });
  const [selectedOperation, setSelectedOperation] = useState<string>("");
  const [userType, setUserType] = useState<"manufacturer" | "regular">(
    "regular"
  );
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (
      !AUTHENTICITY ||
      AUTHENTICITY === "undefined" ||
      AUTHENTICITY === "null"
    ) {
      toast.error(
        "Authenticity contract address not configured. Please set NEXT_PUBLIC_AUTHENTICITY environment variable."
      );
      return;
    }
    if (typeof window.ethereum !== "undefined") {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);
      setRContract(
        new ethers.Contract(AUTHENTICITY, AUTHENTICITY_ABI, web3Provider)
      );
    } else {
      setProvider(ethers.getDefaultProvider as any);
      toast.error("Please install MetaMask!");
    }
  }, []);

  // Fetch certificates for the connected account
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!account || !rContract) return;
      setLoading(true);
      try {
        // Replace with actual contract call to fetch certificates for the user
        // Example: const items = await rContract.getCertificates(account);
        // For now, use a mock list
        const items = [
          {
            name: "iPhone 12",
            uniqueId: "IMEI123",
            serial: "123456",
            date: "1712345678",
            owner: account,
            metadata: "BLACK, 128GB",
          },
        ];
        setCertificates(items);
      } catch (error: any) {
        toast.error("Failed to fetch certificates");
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, [account, rContract]);

  const connectWallet = async () => {
    if (!provider) {
      toast.error("MetaMask not detected");
      return;
    }
    try {
      if (!account) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
        const network = await provider.getNetwork();
        setChainId(network.chainId.toString());
        const address = await signer.getAddress();
        setSigner(signer);
        setAccount(address);
        setSContract(
          new ethers.Contract(AUTHENTICITY, AUTHENTICITY_ABI, signer)
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
        new ethers.Contract(AUTHENTICITY, AUTHENTICITY_ABI, provider)
      );
      toast.success("Wallet disconnected");
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const checkConnection = () => {
    if (!account) {
      toast.error("Connect wallet!");
      return false;
    }
    return true;
  };

  const registerManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConnection() || !sContract) return;
    try {
      if (!manufacturerName) throw new Error("Manufacturer name required");
      const tx = await sContract.manufacturerRegisters(manufacturerName);
      await tx.wait();
      toast.success(`Manufacturer ${manufacturerName} registered`);
      setManufacturerName("");
      setFormVisible("");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getManufacturerByName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConnection() || !rContract) return;
    try {
      if (!queryName) throw new Error("Manufacturer name required");
      const address = await rContract.getManufacturerByName(queryName);
      setManufacturerAddress(`Address: ${address}`);
      toast.success(`Found manufacturer at ${address}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getManufacturer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConnection() || !rContract) return;
    try {
      if (!queryAddress) throw new Error("Valid address required");
      const result = await rContract.getManufacturer(queryAddress);
      setManufacturerDetails(
        `Address: ${result.manufacturerAddress}, Name: ${result.name}`
      );
      toast.success(`Found manufacturer: ${result.name}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const verifySignature = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConnection() || !sContract || !signer) return;
    try {
      if (
        !certificate.name ||
        !certificate.uniqueId ||
        !certificate.serial ||
        !certificate.metadata
      ) {
        throw new Error("All certificate fields required");
      }
      const metadata = createMetadata(certificate.metadata);
      certificate.date = Math.floor(Date.now() / 1000).toString();
      const cert: CertificateWithHash = {
        name: certificate.name,
        uniqueId: certificate.uniqueId,
        serial: certificate.serial,
        date: parseInt(certificate.date),
        owner: account!,
        metadataHash: ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(["string[]"], [metadata])
        ),
        metadata: metadata,
      };
      const { domain, types, value } = signTypedData(cert, chainId);
      const inSign = await signer.signTypedData(domain, types, value);
      const recoveredAddress = ethers.verifyTypedData(
        domain,
        types,
        value,
        inSign
      );
      if (recoveredAddress.toLowerCase() !== cert.owner.toLowerCase()) {
        throw new Error(
          "Frontend verification failed: Signer does not match owner"
        );
      }
      toast.info("Frontend signature verification passed");
      const isValid = await rContract.verifySignature(cert, inSign);
      setSignatureResult(`Signature valid: ${isValid}`);
      setSignature(inSign);
      const qrData = JSON.stringify({ cert, signature: inSign });
      setQrCodeData(qrData);
      toast.success(`Signature verification: ${isValid}`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const userClaimOwnership = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConnection() || !sContract) return;
    try {
      const metadata = createMetadata(certificate.metadata);
      const cert: CertificateWithHash = {
        name: certificate.name,
        uniqueId: certificate.uniqueId,
        serial: certificate.serial,
        date: parseInt(certificate.date),
        owner: certificate.owner,
        metadataHash: ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(["string[]"], [metadata])
        ),
        metadata: metadata,
      };
      const tx = await sContract.userClaimOwnership(cert, veriSignature);
      await tx.wait();
      toast.success(`Item ${cert.uniqueId} claimed successfully`);
      setCertificate({
        name: "",
        uniqueId: "",
        serial: "",
        date: "",
        owner: "",
        metadata: "",
      });
      setFormVisible("");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const verifyProductAuthenticity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkConnection() || !rContract) return;
    try {
      const metadata = createMetadata(certificate.metadata);
      const cert: CertificateWithHash = {
        name: certificate.name,
        uniqueId: certificate.uniqueId,
        serial: certificate.serial,
        date: parseInt(certificate.date),
        owner: certificate.owner,
        metadataHash: ethers.keccak256(
          ethers.AbiCoder.defaultAbiCoder().encode(["string[]"], [metadata])
        ),
        metadata: metadata,
      };
      const result = await rContract.verifyAuthenticity(cert, veriSignature);
      const authResult = {
        isValid: result[0],
        manuName: result[1],
      };
      if (!authResult.isValid) {
        throw new Error("Verification failed");
      }
      setVeriResult({
        name: certificate.name,
        uniqueId: certificate.uniqueId,
        serial: certificate.serial,
        date: certificate.date,
        owner: certificate.owner,
        metadata: certificate.metadata,
        manufacturer: authResult.manuName,
      });
      toast.success(
        `${certificate.name} with ID ${certificate.uniqueId} is authentic`
      );
      setFormVisible("");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  function createMetadata(value: string): string[] {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  // Handler for sidebar operation selection
  const handleOperationSelect = (operation: string) => {
    setSelectedOperation(operation);
  };

  // Handler for user type change (from sidebar)
  const handleUserTypeChange = (type: "manufacturer" | "regular") => {
    setUserType(type);
    setSelectedOperation(""); // Reset operation on user type change
  };

  // Handler to go back to the list view
  const handleBackToList = () => {
    setSelectedOperation("");
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gradient-to-br from-blue-100 to-teal-100">
        <Sidebar>
          <AuthenticitySidebar
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
                <AuthenticityOperations
                  selectedOperation={selectedOperation}
                  userType={userType}
                  account={account}
                  provider={provider}
                  signer={signer}
                  rContract={rContract}
                  sContract={sContract}
                  chainId={chainId}
                />
              </>
            ) : (
              <div>
                <h2 className="text-2xl font-bold mb-6">Your Certificates</h2>
                {loading ? (
                  <div>Loading certificates...</div>
                ) : certificates.length === 0 ? (
                  <div>No certificates found.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {certificates.map((cert, idx) => (
                      <Card key={idx}>
                        <CardHeader>
                          <CardTitle>{cert.name}</CardTitle>
                          <CardDescription>
                            Serial: {cert.serial}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground mb-2">
                            Unique ID: {cert.uniqueId}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Owner: {cert.owner}
                          </div>
                          <div className="text-sm text-muted-foreground mb-2">
                            Date: {cert.date}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Metadata: {cert.metadata}
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
      </div>
    </SidebarProvider>
  );
}

export default AuthenticityFeatures;
