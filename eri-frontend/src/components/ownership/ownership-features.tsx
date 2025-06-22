"use client";

import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [itemsList, setItemsList] = useState<any[]>([]);
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
    // Check if OWNERSHIP address is valid
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

  const connectWallet = async (): Promise<void> => {
    if (!provider) {
      toast.error("MetaMask not detected");
      return;
    }

    try {
      if (!account) {
        await window.ethereum!.request({ method: "eth_requestAccounts" });
        const signer = await provider.getSigner();
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
      } else {
        //to disconnect wallet
        setSigner(null);
        setAccount(null);
        setRContract(
          new ethers.Contract(
            OWNERSHIP,
            OWNERSHIP_ABI,
            provider
          ) as unknown as OwnershipContract
        ); // to call view function
        toast.success("Wallet disconnected");
      }
    } catch (error: any) {
      toast.error(`Error: ${error.message}`);
    }
  };

  const checkConnection = (): boolean => {
    if (!account) {
      toast.error("Connect wallet!");
      return false;
    }
    return true;
  };

  const registerUser = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!checkConnection() || !sContract) return;
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
    if (!checkConnection() || !rContract) return;
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
    if (!checkConnection() || !sContract) return;
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
      const tx = await sContract.createItem(account!, cert, manufacturerName);
      await tx.wait();

      toast.success(`Item ${cert.uniqueId} created`);
      setCertificate({
        name: "",
        uniqueId: "",
        serial: "",
        date: "",
        owner: account!,
        metadata: "",
      });
      setFormVisible("");
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getAllItems = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!checkConnection() || !sContract) return;
    try {
      const items = await sContract.getAllItems(account!);
      setItemsList(items);
      toast.success(`Found ${items.length} items`);
    } catch (error: any) {
      toast.error(`Error: ${parseError(error)}`);
    }
  };

  const getItem = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    if (!checkConnection() || !rContract) return;
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
    if (!checkConnection() || !sContract) return;
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
    if (!checkConnection() || !sContract) return;
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
    if (!checkConnection() || !sContract) return;
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
    if (!checkConnection() || !rContract) return;
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
    if (!checkConnection() || !rContract) return;
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
    if (!checkConnection() || !rContract) return;
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
    if (!checkConnection() || !sContract) return;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50">
      <div className="container mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-800 mb-4">
            ERI - Ownership Management
          </h1>
          <p className="text-lg text-gray-600">
            Blockchain-based ownership verification and transfer system
          </p>
        </div>

        <div className="flex justify-center mb-6">
          <button
            onClick={connectWallet}
            className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
          >
            {account
              ? `${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect Wallet"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              User Operations
            </h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "register" ? "" : "register")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "register" ? "Hide" : "Register User"}
                </button>
                {formVisible === "register" && (
                  <form onSubmit={registerUser} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Username"
                      value={username}
                      onChange={(e: ChangeEvent) => setUsername(e.target.value)}
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Register
                    </button>
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "getUser" ? "" : "getUser")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "getUser" ? "Hide" : "Get User"}
                </button>
                {formVisible === "getUser" && (
                  <form onSubmit={getUser} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="User Address"
                      value={queryAddress}
                      onChange={(e: ChangeEvent) =>
                        setQueryAddress(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Search
                    </button>
                    {userDetails && (
                      <p className="mt-2 text-gray-700">{userDetails}</p>
                    )}
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "setAuth" ? "" : "setAuth")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "setAuth"
                    ? "Hide"
                    : "Owner Set Authenticity"}
                </button>
                {formVisible === "setAuth" && (
                  <form onSubmit={setAuthenticity} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Authenticity Contract Address"
                      value={authe}
                      onChange={(e: ChangeEvent) => setAuthe(e.target.value)}
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Set
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-blue-800">
              Item Operations
            </h2>
            <div className="space-y-4">
              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "create" ? "" : "create")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "create" ? "Hide" : "Create Item"}
                </button>
                {formVisible === "create" && (
                  <form onSubmit={createItem} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Certificate Name"
                      value={certificate.name}
                      onChange={(e: ChangeEvent) =>
                        setCertificate({ ...certificate, name: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Unique ID"
                      value={certificate.uniqueId}
                      onChange={(e: ChangeEvent) =>
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
                      onChange={(e: ChangeEvent) =>
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
                      placeholder="Date (Unix timestamp)"
                      value={certificate.date}
                      onChange={(e: ChangeEvent) =>
                        setCertificate({ ...certificate, date: e.target.value })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Owner Address"
                      value={certificate.owner}
                      onChange={(e: ChangeEvent) =>
                        setCertificate({
                          ...certificate,
                          owner: e.target.value,
                        })
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Metadata (comma-separated)"
                      value={certificate.metadata}
                      onChange={(e: ChangeEvent) =>
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
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Create
                    </button>
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "getAll" ? "" : "getAll")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "getAll" ? "Hide" : "Get All Items"}
                </button>
                {formVisible === "getAll" && (
                  <form onSubmit={getAllItems} className="space-y-4 mt-4">
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Get Items
                    </button>
                    {itemsList.length > 0 && (
                      <div className="mt-4">
                        <h4 className="font-semibold mb-2">Items:</h4>
                        <ul className="space-y-2">
                          {itemsList.map((item, index) => (
                            <li key={index} className="text-sm text-gray-700">
                              {JSON.stringify(item)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "getItem" ? "" : "getItem")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "getItem" ? "Hide" : "Get Item"}
                </button>
                {formVisible === "getItem" && (
                  <form onSubmit={getItem} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Item Hash"
                      value={queryItemHash}
                      onChange={(e: ChangeEvent) =>
                        setQueryItemHash(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Get Item
                    </button>
                    {itemDetails && (
                      <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                        {itemDetails}
                      </pre>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4 text-blue-800">
            Ownership Transfer Operations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <button
                  onClick={() =>
                    setFormVisible(
                      formVisible === "generateCode" ? "" : "generateCode"
                    )
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "generateCode"
                    ? "Hide"
                    : "Generate Ownership Code"}
                </button>
                {formVisible === "generateCode" && (
                  <form
                    onSubmit={generateChangeOfOwnershipCode}
                    className="space-y-4 mt-4"
                  >
                    <input
                      type="text"
                      placeholder="Item Hash"
                      value={queryItemHash}
                      onChange={(e: ChangeEvent) =>
                        setQueryItemHash(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="New Owner Address"
                      value={tempOwnerAddress}
                      onChange={(e: ChangeEvent) =>
                        setTempOwnerAddress(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Generate Code
                    </button>
                    {ownershipCode && (
                      <p className="mt-2 text-gray-700">
                        Code: {ownershipCode}
                      </p>
                    )}
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(
                      formVisible === "claimOwnership" ? "" : "claimOwnership"
                    )
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "claimOwnership"
                    ? "Hide"
                    : "Claim Ownership"}
                </button>
                {formVisible === "claimOwnership" && (
                  <form
                    onSubmit={newOwnerClaimOwnership}
                    className="space-y-4 mt-4"
                  >
                    <input
                      type="text"
                      placeholder="Item Hash"
                      value={queryItemHash}
                      onChange={(e: ChangeEvent) =>
                        setQueryItemHash(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Claim Code"
                      value={claimCode}
                      onChange={(e: ChangeEvent) =>
                        setClaimCode(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Claim
                    </button>
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(
                      formVisible === "revokeCode" ? "" : "revokeCode"
                    )
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "revokeCode" ? "Hide" : "Revoke Code"}
                </button>
                {formVisible === "revokeCode" && (
                  <form
                    onSubmit={revokeChangeOwnershipCode}
                    className="space-y-4 mt-4"
                  >
                    <input
                      type="text"
                      placeholder="Item Hash"
                      value={queryItemHash}
                      onChange={(e: ChangeEvent) =>
                        setQueryItemHash(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Revoke
                    </button>
                  </form>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <button
                  onClick={() =>
                    setFormVisible(
                      formVisible === "getTempOwner" ? "" : "getTempOwner"
                    )
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "getTempOwner"
                    ? "Hide"
                    : "Get Temporary Owner"}
                </button>
                {formVisible === "getTempOwner" && (
                  <form onSubmit={getTempOwner} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Item Hash"
                      value={queryItemHash}
                      onChange={(e: ChangeEvent) =>
                        setQueryItemHash(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Get Temp Owner
                    </button>
                    {temOwner && (
                      <p className="mt-2 text-gray-700">
                        Temporary Owner: {temOwner}
                      </p>
                    )}
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(
                      formVisible === "verifyOwnership" ? "" : "verifyOwnership"
                    )
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "verifyOwnership"
                    ? "Hide"
                    : "Verify Ownership"}
                </button>
                {formVisible === "verifyOwnership" && (
                  <form onSubmit={verifyOwnership} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Item Hash"
                      value={queryItemHash}
                      onChange={(e: ChangeEvent) =>
                        setQueryItemHash(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="Owner Address"
                      value={owner}
                      onChange={(e: ChangeEvent) => setOwner(e.target.value)}
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Verify
                    </button>
                    {owner && owner !== "" && (
                      <p className="mt-2 text-gray-700">Is Owner: {owner}</p>
                    )}
                  </form>
                )}
              </div>

              <div>
                <button
                  onClick={() =>
                    setFormVisible(formVisible === "isOwner" ? "" : "isOwner")
                  }
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                >
                  {formVisible === "isOwner" ? "Hide" : "Is Owner"}
                </button>
                {formVisible === "isOwner" && (
                  <form onSubmit={isOwner} className="space-y-4 mt-4">
                    <input
                      type="text"
                      placeholder="Item Hash"
                      value={queryItemHash}
                      onChange={(e: ChangeEvent) =>
                        setQueryItemHash(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      placeholder="User Address"
                      value={userAddress}
                      onChange={(e: ChangeEvent) =>
                        setUserAddress(e.target.value)
                      }
                      className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                      Check
                    </button>
                    {isOwn && isOwn !== "" && (
                      <p className="mt-2 text-gray-700">Is Owner: {isOwn}</p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
}
