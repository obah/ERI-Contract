
const AUTHENTICITY = process.env.NEXT_PUBLIC_AUTHENTICITY;

export function signTypedData(certificate, chainId) {

    return {
        types: {
            Certificate: [
                { name: "name", type: "string" },
                { name: "uniqueId", type: "string" },
                { name: "serial", type: "string" },
                { name: "date", type: "uint256" },
                { name: "owner", type: "address" },
                { name: "metadata", type: "bytes32" },
            ],
        },
        primaryType: "Certificate",
        domain: {
            name: "CertificateAuth",
            version: "1",
            chainId: Number(chainId),
            verifyingContract: AUTHENTICITY,
        },
        value: {
            name: certificate.name,
            uniqueId: certificate.uniqueId,
            serial: certificate.serial,
            date: certificate.date,
            owner: certificate.owner,
            metadata: certificate.metadataHash
        }
    }
}