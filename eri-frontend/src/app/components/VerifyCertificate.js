// src/app/components/VerifyCertificate.js
"use client"; // Required for client-side interactivity in Next.js App Router

import React, {useState, useEffect} from 'react';
import {BigNumber, ethers} from 'ethers';
import axios from 'axios';

import {toast, ToastContainer} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {signTypedData} from "../resources/typedData.js";

// const AUTHENTICITY = '0x1160cCbfb67Ecf3b95B5547A635E88E36E2E23aD';
const AUTHENTICITY = process.env.NEXT_PUBLIC_AUTHENTICITY;

import {AUTHENTICITY_ABI} from '../resources/abi';

export default function VerifyCertificate() {

    const [provider, setProvider] = useState(null);
    const [signer, setSigner] = useState(null);
    const [account, setAccount] = useState(null);
    const [rContract, setRContract] = useState(null);
    const [sContract, setSContract] = useState(null);
    const [formVisible, setFormVisible] = useState("");
    const [manufacturerName, setManufacturerName] = useState("");
    const [queryName, setQueryName] = useState("");
    const [queryAddress, setQueryAddress] = useState("");
    const [manufacturerDetails, setManufacturerDetails] = useState("");
    const [manufacturerAddress, setManufacturerAddress] = useState("");
    const [signatureResult, setSignatureResult] = useState("");
    const [certificate, setCertificate] = useState({
        name: "iPhone 12",
        uniqueId: "IMEI123",
        serial: "123456",
        date: "123456789",
        metadata: "BLACK, 128GB",
    });

    useEffect(() => {

        if (typeof window.ethereum !== "undefined") {
            const web3Provider = new ethers.BrowserProvider(window.ethereum)
            setProvider(web3Provider);
            setRContract(new ethers.Contract(AUTHENTICITY, AUTHENTICITY_ABI, web3Provider));
        } else {
            setProvider(ethers.getDefaultProvider);
            toast.error("Please install MetaMask!");
        }
    }, []);


    const connectWallet = async () => {
        if (!provider) {
            return toast.error("MetaMask not detected");
        }

        try {

            if (!account) {
                await window.ethereum.request({method: "eth_requestAccounts"});
                const signer = await provider.getSigner();
                const address = await signer.getAddress();
                setSigner(signer);
                setAccount(address);
                setSContract(new ethers.Contract(AUTHENTICITY, AUTHENTICITY_ABI, signer));
                toast.success(`Connected: ${address.slice(0, 6)}...${address.slice(-4)}`);

                return;
            }

            //to disconnect wallet
            setSigner(null);
            setAccount(null);
            setRContract(new ethers.Contract(AUTHENTICITY, AUTHENTICITY_ABI, provider)); // to call view function
            toast.success("Wallet disconnected");

        } catch (error) {
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

    const registerManufacturer = async (e) => {
        e.preventDefault();
        if (!checkConnection() || !sContract) return;
        try {
            if (!manufacturerName) throw new Error("Manufacturer name required");
            const tx = await sContract.manufacturerRegisters(manufacturerName);
            await tx.wait();
            toast.success(`Manufacturer ${manufacturerName} registered`);
            setManufacturerName("");
            setFormVisible("");
        } catch (error) {
            toast.error(`Error: ${parseError(error)}`);
        }
    };

    const getManufacturerByName = async (e) => {
        e.preventDefault();
        if (!checkConnection() || !rContract) return;
        try {
            if (!queryName) throw new Error("Manufacturer name required");
            const address = await rContract.getManufacturerByName(queryName);
            setManufacturerAddress(`Address: ${address}`);
            toast.success(`Found manufacturer at ${address}`);
        } catch (error) {
            toast.error(`Error: ${parseError(error)}`);
        }
    };


    const getManufacturer = async (e) => {
        e.preventDefault();
        if (!checkConnection() || !rContract) return;
        try {
            if (!queryAddress)
                throw new Error("Valid address required");
            const result = await rContract.getManufacturer(queryAddress);
            setManufacturerDetails(`Address: ${result.manufacturerAddress}, Name: ${result.name}`);
            toast.success(`Found manufacturer: ${result.name}`);
        } catch (error) {
            toast.error(`Error: ${parseError(error)}`);
        }
    };

    const verifySignature = async (e) => {
        e.preventDefault();
        if (!checkConnection() || !sContract || !signer) return;
        try {
            if (
                !certificate.name ||
                !certificate.uniqueId ||
                !certificate.serial ||
                !certificate.date ||
                !certificate.metadata
            ) {
                throw new Error("All certificate fields required");
            }

            console.log("AUTHENTICITY: ", AUTHENTICITY);

            const metadata = certificate.metadata
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean);


            const metadataHash = ethers.keccak256(
                ethers.AbiCoder.defaultAbiCoder().encode(["string[]"], [metadata])
            );

            //the certificate that goes into the backend has unique_id
            const cert = {
                name: certificate.name,
                uniqueId: certificate.uniqueId,
                serial: certificate.serial,
                date: parseInt(certificate.date),
                owner: account, //this owner should be made dynamic and not static like this
                metadataHash: metadataHash,
                metadata: metadata
            };

            console.log("Cert", cert);

            const network = await provider.getNetwork();
            console.log("Provider", network.chainId);


            //todo: you could make the frontend build the certificate for you
            const {domain, types, value} = signTypedData(cert, network.chainId);

            console.log("Typed Data: ", JSON.stringify({domain, types, value}, null, 2));


            //todo: you could get the backend build the certificate for you
            //backend takes unique_id instead of uniqueId
            // const certificateData = {
            //     name: formData.name,
            //     unique_id: formData.uniqueId,
            //     serial: formData.serial,
            //     date: parseInt(formData.date),
            //     owner: account, //this owner should be made dynamic and not static like this
            //     // metadataHash: metadataHash,
            //     metadata: formData.metadata
            // };
            // const response = await axios.post('http://localhost:8080/create_certificate', certificateData);
            //
            // console.log("Backend Response: ", JSON.stringify(response.data, null, 2));
            //
            // const {domain, types, value} = response.data;
            // const inSign = await signer.signTypedData(
            //     typedData.domain,
            //     typedData.types,
            //     typedData.message
            // );

            const inSign = await signer.signTypedData(
                domain,
                types,
                value
            );

            console.log("Account Address: ", account);
            console.log("Certificate Owner: ", cert.owner);

            // todo: Frontend verification before smart contract verification
            const recoveredAddress = ethers.verifyTypedData(
                domain,
                types,
                value,
                inSign
            );

            console.log("Signature Signer: ", recoveredAddress);


            if (recoveredAddress.toLowerCase() !== cert.owner.toLowerCase()) {
                throw new Error("Frontend verification failed: Signer does not match owner");
            }
            toast.info("Frontend signature verification passed");

            const isValid = await rContract.verifySignature(cert, inSign);

            setSignatureResult(`Signature valid: ${isValid}`);
            toast.success(`Signature verification: ${isValid}`);

            return {cert, inSign};
        } catch (error) {
            toast.error(`Error: ${parseError(error)}`);
        }
    };

    const userClaimOwnership = async (e) => {
        e.preventDefault();
        if (!checkConnection() || !sContract) return;
        try {
            const result = await verifySignature(e);
            if (!result) throw new Error("Signature verification failed");
            const {cert, signature} = result;
            const tx = await sContract.userClaimOwnership(cert, signature);
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
        } catch (error) {
            toast.error(`Error: ${parseError(error)}`);
        }
    };


    const parseError = (error) => {
        const message = error.data?.message || error.message || "Unknown error";
        if (message.includes("ADDRESS_ZERO")) return "Invalid address: zero address not allowed";
        if (message.includes("ALREADY_REGISTERED")) return "Manufacturer already registered";
        if (message.includes("INVALID_MANUFACTURER_NAME"))
            return "Invalid manufacturer name (min 2 characters)";
        if (message.includes("NAME_NOT_AVAILABLE")) return "Manufacturer name already taken";
        if (message.includes("DOES_NOT_EXIST")) return "Manufacturer does not exist";
        if (message.includes("INVALID_SIGNATURE")) return "Invalid signature";
        return message;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-100 to-teal-100">
            <header className="p-4 bg-blue-600 text-white shadow-md">
                <div className="container mx-auto flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Authenticity & Ownership</h1>
                    <button
                        onClick={connectWallet}
                        className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
                    </button>
                </div>
            </header>

            <main className="container mx-auto p-6 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-blue-800">Manufacturer Operations</h2>
                        <div className="space-y-4">
                            <div>
                                <button
                                    onClick={() => setFormVisible(formVisible === "register" ? "" : "register")}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                                >
                                    {formVisible === "register" ? "Hide" : "Register Manufacturer"}
                                </button>
                                {formVisible === "register" && (
                                    <form onSubmit={registerManufacturer} className="space-y-4 mt-4">
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
                                    onClick={() => setFormVisible(formVisible === "byName" ? "" : "byName")}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                                >
                                    {formVisible === "byName" ? "Hide" : "Get Manufacturer by Name"}
                                </button>
                                {formVisible === "byName" && (
                                    <form onSubmit={getManufacturerByName} className="space-y-4 mt-4">
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
                                            <p className="mt-2 text-gray-700">{manufacturerAddress}</p>
                                        )}
                                    </form>
                                )}
                            </div>
                            <div>
                                <button
                                    onClick={() => setFormVisible(formVisible === "byAddress" ? "" : "byAddress")}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer font-semibold py-2 px-4 rounded-lg transition duration-300"
                                >
                                    {formVisible === "byAddress" ? "Hide" : "Get Manufacturer by Address"}
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
                                            <p className="mt-2 text-gray-700">{manufacturerDetails}</p>
                                        )}
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-blue-800">Certificate Operations</h2>
                        <div className="space-y-4">
                            <div>
                                <button
                                    onClick={() => setFormVisible(formVisible === "verify" ? "" : "verify")}
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
                                            onChange={(e) => setCertificate({...certificate, name: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unique ID"
                                            value={certificate.uniqueId}
                                            onChange={(e) => setCertificate({...certificate, uniqueId: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Serial"
                                            value={certificate.serial}
                                            onChange={(e) => setCertificate({...certificate, serial: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Date (Unix timestamp)"
                                            value={certificate.date}
                                            onChange={(e) => setCertificate({...certificate, date: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Metadata (comma-separated)"
                                            value={certificate.metadata}
                                            onChange={(e) => setCertificate({...certificate, metadata: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="submit"
                                            className="w-full bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                                        >
                                            Submit
                                        </button>
                                        {signatureResult &&
                                            <p className="mt-2 text-gray-700 cursor-pointer">{signatureResult}</p>}
                                    </form>
                                )}
                            </div>
                            <div>
                                <button
                                    onClick={() => setFormVisible(formVisible === "claim" ? "" : "claim")}
                                    className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                                >
                                    {formVisible === "claim" ? "Hide" : "Claim Ownership"}
                                </button>
                                {formVisible === "claim" && (
                                    <form onSubmit={userClaimOwnership} className="space-y-4 mt-4">
                                        <input
                                            type="text"
                                            placeholder="Certificate Name"
                                            value={certificate.name}
                                            onChange={(e) => setCertificate({...certificate, name: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Unique ID"
                                            value={certificate.uniqueId}
                                            onChange={(e) => setCertificate({...certificate, uniqueId: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Serial"
                                            value={certificate.serial}
                                            onChange={(e) => setCertificate({...certificate, serial: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Date (Unix timestamp)"
                                            value={certificate.date}
                                            onChange={(e) => setCertificate({...certificate, date: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Owner Address"
                                            value={certificate.owner}
                                            onChange={(e) => setCertificate({...certificate, owner: e.target.value})}
                                            className="w-full p-2 border rounded-lg text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Metadata (comma-separated)"
                                            value={certificate.metadata}
                                            onChange={(e) => setCertificate({...certificate, metadata: e.target.value})}
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
                        </div>
                    </div>
                </div>
            </main>
            <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false}/>
        </div>
    );


}


//
//     const handleInputChange = (e) => {
//         const {name, value} = e.target;
//         if (name === 'metadata') {
//             setFormData({...formData, [name]: value.split(',').map(s => s.trim())});
//         } else {
//             setFormData({...formData, [name]: value});
//         }
//         setError('');
//     };
//
//
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setResult('');
//         setError('');
//         setIsSubmitting(true);
//
//         try {
//             // const provider = new ethers.BrowserProvider(window.ethereum);
//             const signer = await provider.getSigner();
//             const userAddress = await signer.getAddress();
//
//             //making sure the wallet making this call is the same wallet that connect at the begining
//             // if (userAddress.toLowerCase() !== manufacturerAddress.toLowerCase()) {
//             //     setError('Connected wallet does not match manufacturer address');
//             //     setIsSubmitting(false);
//             //     return;
//             // }
//
//             let date = Math.floor(Date.now() / 1000).toString();
//             console.log("Int Date: ", date);
//
//             console.log("Manufacturer Address: ", manufacturerAddress);
//
//             const certificateData = {
//                 name: formData.name,
//                 unique_id: formData.uniqueId,
//                 serial: formData.serial,
//                 date: parseInt(date),
//                 owner: userAddress, //this owner should be made dynamic and not static like this
//                 metadata: formData.metadata,
//             };
//
//             const response = await axios.post('http://localhost:8080/create_certificate', certificateData);
//
//             console.log("Response: ", response);
//
//             const {domain, types, value} = response.data;
//
//             console.log('EIP-712 domain:', domain);
//             console.log('EIP-712 value:', value);
//             console.log('EIP-712 types:', types);
//
//             const signature = await signer.signTypedData(domain, types, value);
//
//             // Debug: Recover signer
//             const digest = ethers.TypedDataEncoder.hash(domain, types, value);
//             const recoveredSigner = ethers.recoverAddress(digest, signature);
//             console.log('Recovered signer:', recoveredSigner, 'Expected:', manufacturerAddress);
//
//             console.log("Signer: ", signer);
//             console.log('Signature:', signature);
//
//             let ethDate = ethers.toBigInt(date);
//
//             console.log("Eth Date: ", ethDate);
//
//             const certificate = {
//                 name: value.name,
//                 uniqueId: value.uniqueId,
//                 serial: value.serial,
//                 date: ethDate,
//                 owner: value.owner, //this owner should be made dynamic and not static like this
//                 metadata: value.metadata,
//             };
//
//             console.log('Certificate:', certificate);
//
//             // const contract = new ethers.Contract(AUTHENTICITY, AUTHENTICITY_ABI, signer);
//
//             // console.log('Contract:', contract);
//
//             console.log('Calling verifySignature with:', {certificate, signature});
//
//             const result = await sContract.verifySignature(certificate, signature);
//
//             console.log('Verification result:', result);
//
//             setResult(`Signature is ${result ? 'valid' : 'invalid'} for certificate: ${formData.name}`);
//
//         } catch (err) {
//             console.error('Error:', err);
//             setError(err.message || 'Failed to verify signature');
//         } finally {
//             setIsSubmitting(false);
//         }
//     };
//
//     return (
//         <div className="flex flex-col items-center min-h-screen p-8 bg-gray-100 dark:bg-gray-900">
//             <header className="p-4 bg-blue-600 text-white shadow-md">
//                 <div className="container mx-auto flex justify-between items-center">
//                     <h1 className="text-2xl font-bold">Authenticity & Ownership</h1>
//                     <button
//                         onClick={connectWallet}
//                         className="bg-teal-500 hover:bg-teal-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
//                     >
//                         {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "Connect Wallet"}
//                     </button>
//                 </div>
//             </header>
//             <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">ERI</h2>
//             <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Product Name:
//                     </label>
//                     <input
//                         type="text"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleInputChange}
//                         className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Product ID:
//                     </label>
//                     <input
//                         type="text"
//                         name="uniqueId"
//                         value={formData.uniqueId}
//                         onChange={handleInputChange}
//                         className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Serial Number:
//                     </label>
//                     <input
//                         type="text"
//                         name="serial"
//                         value={formData.serial}
//                         onChange={handleInputChange}
//                         className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
//                         required
//                     />
//                 </div>
//                 <div>
//                     <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
//                         Product Metadata (comma-separated):
//                     </label>
//                     <textarea
//                         name="metadata"
//                         value={formData.metadata.join(',')}
//                         onChange={handleInputChange}
//                         className="w-full p-2 border rounded-md bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white min-h-[80px]"
//                     />
//                 </div>
//                 <button
//                     type="submit"
//                     // disabled={isSubmitting || !isConnected}
//                     className={`w-full p-3 rounded-md text-white font-medium ${
//                         isSubmitting || !isConnected
//                             ? 'bg-gray-400 cursor-not-allowed'
//                             : 'bg-blue-600 hover:bg-blue-700'
//                     }`}
//                 >
//                     {isSubmitting ? 'Processing...' : 'Sign and Verify'}
//                 </button>
//             </form>
//             {result && <p className="mt-4 text-green-600">{result}</p>}
//             {error && <p className="mt-4 text-red-600">{error}</p>}
//         </div>
//     );
// }