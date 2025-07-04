import { Certificate, TypedData } from "../../types";

export function signTypedData(
  certificate: Certificate,
  chainId: string | number
): TypedData {
  // Use environment variables or fallback values
  const SIGNING_DOMAIN = process.env.NEXT_PUBLIC_SIGNING_DOMAIN || "ERI";
  const SIGNATURE_VERSION = process.env.NEXT_PUBLIC_SIGNATURE_VERSION || "1";
  const AUTHENTICITY_ADDRESS =
    process.env.NEXT_PUBLIC_AUTHENTICITY ||
    "0x98BC72046616b528D4Bc5bbcC7d99f82237A8B55";

  return {
    types: {
      Certificate: [
        { name: "name", type: "string" },
        { name: "uniqueId", type: "string" },
        { name: "serial", type: "string" },
        { name: "date", type: "uint256" },
        { name: "owner", type: "address" },
        { name: "metadataHash", type: "bytes32" },
      ],
    },
    primaryType: "Certificate",
    domain: {
      name: SIGNING_DOMAIN,
      version: SIGNATURE_VERSION,
      chainId: Number(chainId),
      verifyingContract: AUTHENTICITY_ADDRESS,
    },
    value: {
      name: certificate.name,
      uniqueId: certificate.uniqueId,
      serial: certificate.serial,
      date:
        typeof certificate.date === "string"
          ? parseInt(certificate.date)
          : certificate.date,
      owner: certificate.owner,
      metadataHash:
        certificate.metadataHash ||
        "0x0000000000000000000000000000000000000000000000000000000000000000",
    },
  };
}
