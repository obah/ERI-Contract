"use client";

import React, { useState } from "react";
import { ethers } from "ethers";
import { toast } from "react-toastify";
import { QRCodeCanvas } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Shield,
  Building2,
  Search,
  UserCheck,
  FileText,
  QrCode,
} from "lucide-react";
import { Certificate, CertificateWithHash } from "../../types";
import { signTypedData } from "../../lib/resources/typedData";
import { parseError } from "../../lib/resources/error";
import { AUTHENTICITY_ABI } from "../../lib/resources/authenticity_abi";

// Use environment variable or fallback to deployed contract address
const AUTHENTICITY =
  process.env.NEXT_PUBLIC_AUTHENTICITY ||
  "0x98BC72046616b528D4Bc5bbcC7d99f82237A8B55";

interface AuthenticityOperationsProps {
  selectedOperation: string;
  userType: "manufacturer" | "regular";
  account: string | null;
  provider: any;
  signer: any;
  rContract: any;
  sContract: any;
  chainId: string;
}

export default function AuthenticityOperations({
  selectedOperation,
  userType,
  account,
  provider,
  signer,
  rContract,
  sContract,
  chainId,
}: AuthenticityOperationsProps) {
  const [manufacturerName, setManufacturerName] = useState<string>("");
  const [queryName, setQueryName] = useState<string>("");
  const [queryAddress, setQueryAddress] = useState<string>("");
  const [manufacturerDetails, setManufacturerDetails] = useState<string>("");
  const [manufacturerAddress, setManufacturerAddress] = useState<string>("");
  const [signatureResult, setSignatureResult] = useState<string>("");
  const [signature, setSignature] = useState<string>("");
  const [veriSignature, setVeriSignature] = useState<string>("");
  const [qrCodeData, setQrCodeData] = useState<string>("");
  const [veriResult, setVeriResult] = useState<any>({});
  const [certificate, setCertificate] = useState<Certificate>({
    name: "iPhone 12",
    uniqueId: "IMEI123",
    serial: "123456",
    date: "",
    owner: "0xF2E7E2f51D7C9eEa9B0313C2eCa12f8e43bd1855",
    metadata: "BLACK, 128GB",
  });

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

  const renderManufacturerOperations = () => {
    switch (selectedOperation) {
      case "register":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Register Manufacturer
              </CardTitle>
              <CardDescription>
                Register as a manufacturer in the authenticity system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={registerManufacturer} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Manufacturer Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter manufacturer name"
                    value={manufacturerName}
                    onChange={(e) => setManufacturerName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Register Manufacturer
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "byName":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Get Manufacturer by Name
              </CardTitle>
              <CardDescription>
                Find a manufacturer by their registered name
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={getManufacturerByName} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Manufacturer Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter manufacturer name"
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Search
                </Button>
                {manufacturerAddress && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {manufacturerAddress}
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        );

      case "byAddress":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Get Manufacturer by Address
              </CardTitle>
              <CardDescription>
                Find a manufacturer by their wallet address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={getManufacturer} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Manufacturer Address
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter wallet address"
                    value={queryAddress}
                    onChange={(e) => setQueryAddress(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Search
                </Button>
                {manufacturerDetails && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">
                      {manufacturerDetails}
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Manufacturer Operations</CardTitle>
              <CardDescription>
                Select an operation from the sidebar to get started
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  const renderCertificateOperations = () => {
    switch (selectedOperation) {
      case "verify":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Verify Signature
              </CardTitle>
              <CardDescription>
                Verify the signature of a certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={verifySignature} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Certificate Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter certificate name"
                    value={certificate.name}
                    onChange={(e) =>
                      setCertificate({ ...certificate, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unique ID</label>
                  <Input
                    type="text"
                    placeholder="Enter unique ID"
                    value={certificate.uniqueId}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        uniqueId: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Serial</label>
                  <Input
                    type="text"
                    placeholder="Enter serial number"
                    value={certificate.serial}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        serial: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Metadata</label>
                  <Input
                    type="text"
                    placeholder="Enter metadata (comma-separated)"
                    value={certificate.metadata}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        metadata: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Verify Signature
                </Button>
                {signatureResult && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800">{signatureResult}</p>
                  </div>
                )}
                {qrCodeData && (
                  <div className="mt-4 flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">
                      Certificate QR Code
                    </h3>
                    <QRCodeCanvas value={qrCodeData} size={200} />
                    <p className="mt-2 text-sm text-gray-600">
                      Scan to verify your product authenticity
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        );

      case "claim":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Claim Ownership
              </CardTitle>
              <CardDescription>
                Claim ownership of an item using a signature
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={userClaimOwnership} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Certificate Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter certificate name"
                    value={certificate.name}
                    onChange={(e) =>
                      setCertificate({ ...certificate, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unique ID</label>
                  <Input
                    type="text"
                    placeholder="Enter unique ID"
                    value={certificate.uniqueId}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        uniqueId: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Serial</label>
                  <Input
                    type="text"
                    placeholder="Enter serial number"
                    value={certificate.serial}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        serial: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Date (Unix timestamp)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter Unix timestamp"
                    value={certificate.date}
                    onChange={(e) =>
                      setCertificate({ ...certificate, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Owner Address</label>
                  <Input
                    type="text"
                    placeholder="Enter owner address"
                    value={certificate.owner}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        owner: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Metadata</label>
                  <Input
                    type="text"
                    placeholder="Enter metadata (comma-separated)"
                    value={certificate.metadata}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        metadata: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Signature</label>
                  <Input
                    type="text"
                    placeholder="Enter signature"
                    value={veriSignature}
                    onChange={(e) => setVeriSignature(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Claim Ownership
                </Button>
              </form>
            </CardContent>
          </Card>
        );

      case "verifyAuth":
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Verify Authenticity
              </CardTitle>
              <CardDescription>
                Verify the authenticity of a product
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={verifyProductAuthenticity} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">
                    Certificate Name
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter certificate name"
                    value={certificate.name}
                    onChange={(e) =>
                      setCertificate({ ...certificate, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unique ID</label>
                  <Input
                    type="text"
                    placeholder="Enter unique ID"
                    value={certificate.uniqueId}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        uniqueId: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Serial</label>
                  <Input
                    type="text"
                    placeholder="Enter serial number"
                    value={certificate.serial}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        serial: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Date (Unix timestamp)
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter Unix timestamp"
                    value={certificate.date}
                    onChange={(e) =>
                      setCertificate({ ...certificate, date: e.target.value })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Owner Address</label>
                  <Input
                    type="text"
                    placeholder="Enter owner address"
                    value={certificate.owner}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        owner: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Metadata</label>
                  <Input
                    type="text"
                    placeholder="Enter metadata (comma-separated)"
                    value={certificate.metadata}
                    onChange={(e) =>
                      setCertificate({
                        ...certificate,
                        metadata: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Signature</label>
                  <Input
                    type="text"
                    placeholder="Enter signature"
                    value={veriSignature}
                    onChange={(e) => setVeriSignature(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Verify Authenticity
                </Button>
                {veriResult && Object.keys(veriResult).length > 0 && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <h4 className="font-semibold mb-2">Verification Result:</h4>
                    <ul className="text-sm text-green-800 space-y-1">
                      <li>
                        <strong>Name:</strong> {veriResult.name}
                      </li>
                      <li>
                        <strong>ID:</strong> {veriResult.uniqueId}
                      </li>
                      <li>
                        <strong>Serial:</strong> {veriResult.serial}
                      </li>
                      <li>
                        <strong>Date:</strong> {veriResult.date}
                      </li>
                      <li>
                        <strong>Owner:</strong> {veriResult.owner}
                      </li>
                      <li>
                        <strong>Metadata:</strong> {veriResult.metadata}
                      </li>
                      <li>
                        <strong>Manufacturer:</strong> {veriResult.manufacturer}
                      </li>
                    </ul>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        );

      default:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Certificate Operations</CardTitle>
              <CardDescription>
                Select an operation from the sidebar to get started
              </CardDescription>
            </CardHeader>
          </Card>
        );
    }
  };

  return (
    <div className="p-6">
      {userType === "manufacturer"
        ? renderManufacturerOperations()
        : renderCertificateOperations()}
    </div>
  );
}
