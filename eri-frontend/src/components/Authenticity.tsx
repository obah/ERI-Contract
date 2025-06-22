"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { signTypedData } from "../lib/resources/typedData";
import { parseError } from "../lib/resources/error";
import { QRCodeCanvas } from "qrcode.react";
import { AUTHENTICITY_ABI } from "../lib/resources/authenticity_abi";
import { Certificate, CertificateWithHash } from "../types";

// Use environment variable or fallback to deployed contract address
const AUTHENTICITY =
  process.env.NEXT_PUBLIC_AUTHENTICITY ||
  "0x98BC72046616b528D4Bc5bbcC7d99f82237A8B55";

function Authenticity() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
      <header className="p-4 bg-blue-600 text-white shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">Authenticity Operations</h1>
          <button
            onClick={connectWallet}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main className="container mx-auto p-6 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Manufacturer Operations
            </h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "register" ? "" : "register")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "register"
                    ? "Hide"
                    : "Register Manufacturer"}
                </button>
                {formVisible === "register" && (
                  <form
                    onSubmit={registerManufacturer}
                    className="space-y-4 mt-4"
                  >
                    <input
                      type="text"
                      placeholder="Manufacturer Name"
                      value={manufacturerName}
                      onChange={(e) => setManufacturerName(e.target.value)}
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Submit
                    </button>
                  </form>
                )}
              </div>
              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "byName" ? "" : "byName")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "byName"
                    ? "Hide"
                    : "Get Manufacturer by Name"}
                </button>
                {formVisible === "byName" && (
                  <form
                    onSubmit={getManufacturerByName}
                    className="space-y-4 mt-4"
                  >
                    <input
                      type="text"
                      placeholder="Manufacturer Name"
                      value={queryName}
                      onChange={(e) => setQueryName(e.target.value)}
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Submit
                    </button>
                    {manufacturerAddress && (
                      <p className="mt-2 text-gray-700">
                        {manufacturerAddress}
                      </p>
                    )}
                  </form>
                )}
              </div>
              <div>
                <button
                  onClick={() =>
                    setFormVisible(
                      formVisible === "byAddress" ? "" : "byAddress"
                    )
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "byAddress"
                    ? "Hide"
                    : "Get Manufacturer by Address"}
                </button>
                {formVisible === "byAddress" && (
                  <form onSubmit={getManufacturer} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Manufacturer Address"
                      value={queryAddress}
                      onChange={(e) => setQueryAddress(e.target.value)}
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Submit
                    </button>
                    {manufacturerDetails && (
                      <p className="mt-2 text-gray-700">
                        {manufacturerDetails}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Certificate Operations
            </h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "verify" ? "" : "verify")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "verify" ? "Hide" : "Verify Signature"}
                </button>
                {formVisible === "verify" && (
                  <form onSubmit={verifySignature} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Certificate Name"
                      value={certificate.name}
                      onChange={(e) =>
                        setCertificate({ ...certificate, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Unique ID"
                      value={certificate.uniqueId}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          uniqueId: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Serial"
                      value={certificate.serial}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          serial: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Metadata (comma-separated)"
                      value={certificate.metadata}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          metadata: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Submit
                    </button>
                    {signatureResult && (
                      <p className="mt-2 text-gray-700 cursor-pointer">
                        {signatureResult}
                      </p>
                    )}

                    {qrCodeData && (
                      <div className="mt-4 flex flex-col items-center">
                        <h3 className="text-lg font-semibold text-blue-800">
                          Certificate QR Code
                        </h3>
                        <QRCodeCanvas value={qrCodeData} size={300} />
                        <p className="mt-2 text-sm text-gray-600">
                          Scan to verify your product authenticity
                        </p>
                      </div>
                    )}
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "claim" ? "" : "claim")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "claim" ? "Hide" : "Claim Ownership"}
                </button>
                {formVisible === "claim" && (
                  <form
                    onSubmit={userClaimOwnership}
                    className="space-y-4 mt-4"
                  >
                    <input
                      type="text"
                      placeholder="Certificate Name"
                      value={certificate.name}
                      onChange={(e) =>
                        setCertificate({ ...certificate, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Unique ID"
                      value={certificate.uniqueId}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          uniqueId: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Serial"
                      value={certificate.serial}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          serial: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Date (Unix timestamp)"
                      value={certificate.date}
                      onChange={(e) =>
                        setCertificate({ ...certificate, date: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Owner Address"
                      value={certificate.owner}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          owner: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Metadata (comma-separated)"
                      value={certificate.metadata}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          metadata: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Signature"
                      value={veriSignature}
                      onChange={(e) => setVeriSignature(e.target.value)}
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Submit
                    </button>
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(
                      formVisible === "verifyAuth" ? "" : "verifyAuth"
                    )
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "verifyAuth"
                    ? "Hide"
                    : "Verify Authenticity"}
                </button>
                {formVisible === "verifyAuth" && (
                  <form
                    onSubmit={verifyProductAuthenticity}
                    className="space-y-4 mt-4"
                  >
                    <input
                      type="text"
                      placeholder="Certificate Name"
                      value={certificate.name}
                      onChange={(e) =>
                        setCertificate({ ...certificate, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Unique ID"
                      value={certificate.uniqueId}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          uniqueId: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Serial"
                      value={certificate.serial}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          serial: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="number"
                      placeholder="Date (Unix timestamp)"
                      value={certificate.date}
                      onChange={(e) =>
                        setCertificate({ ...certificate, date: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Owner Address"
                      value={certificate.owner}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          owner: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Metadata (comma-separated)"
                      value={certificate.metadata}
                      onChange={(e) =>
                        setCertificate({
                          ...certificate,
                          metadata: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Signature"
                      value={veriSignature}
                      onChange={(e) => setVeriSignature(e.target.value)}
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Submit
                    </button>
                    {veriResult && (
                      <ul className="mt-2 text-gray-700">
                        {
                          <li>
                            <p> Name: {veriResult.name}</p>
                            <p> ID: {veriResult.uniqueId}</p>
                            <p> Serial: {veriResult.serial}</p>
                            <p> Date: {veriResult.date}</p>
                            <p> Owner: {veriResult.owner}</p>
                            <p> Metadata: {veriResult.metadata}</p>
                            <p> Manufacturer: {veriResult.manufacturer}</p>
                          </li>
                        }
                      </ul>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
}

export default Authenticity;
