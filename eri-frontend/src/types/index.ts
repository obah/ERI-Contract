// ERI Frontend Type Definitions

// Contract ABIs
interface AuthenticityABI {
  [key: string]: any;
}

interface OwnershipABI {
  [key: string]: any;
}

// Certificate Types
interface Certificate {
  name: string;
  uniqueId: string;
  serial: string;
  date: string | number;
  owner: string;
  metadata: string;
  metadataHash?: string;
}

interface CertificateWithHash extends Omit<Certificate, "metadata"> {
  metadataHash: string;
  metadata: string[];
}

// Contract Types
interface ContractConfig {
  address: string;
  abi: any[];
}

// Provider and Signer Types
interface Web3Provider {
  getSigner(): Promise<Signer>;
  getNetwork(): Promise<Network>;
}

interface Signer {
  getAddress(): Promise<string>;
  signTypedData(domain: any, types: any, value: any): Promise<string>;
}

interface Network {
  chainId: bigint;
}

// Contract Instance Types - Using any for flexibility with ethers.js contracts
interface AuthenticityContract extends Record<string, any> {
  manufacturerRegisters(name: string): Promise<any>;
  getManufacturerByName(name: string): Promise<string>;
  getManufacturer(
    address: string
  ): Promise<{ manufacturerAddress: string; name: string }>;
  verifySignature(
    cert: CertificateWithHash,
    signature: string
  ): Promise<boolean>;
  verifyAuthenticity(
    cert: CertificateWithHash,
    signature: string
  ): Promise<[boolean, string]>;
}

interface OwnershipContract extends Record<string, any> {
  userRegisters(username: string): Promise<any>;
  getUser(
    address: string
  ): Promise<{ userAddress: string; username: string; registeredAt: bigint }>;
  createItem(
    owner: string,
    cert: CertificateWithHash,
    manufacturerName: string
  ): Promise<any>;
  getAllItems(owner: string): Promise<any[]>;
  getItem(itemHash: string): Promise<any>;
  generateChangeOfOwnershipCode(
    itemHash: string,
    newOwner: string
  ): Promise<any>;
  newOwnerClaimOwnership(itemHash: string, code: string): Promise<any>;
  revokeChangeOwnershipCode(itemHash: string): Promise<any>;
  getTempOwner(itemHash: string): Promise<string>;
  verifyOwnership(itemHash: string, owner: string): Promise<boolean>;
  isOwner(itemHash: string, owner: string): Promise<boolean>;
  setAuthenticity(address: string): Promise<any>;
}

// Form State Types
interface FormVisibleState {
  register?: boolean;
  byName?: boolean;
  byAddress?: boolean;
  verify?: boolean;
  claim?: boolean;
  verifyAuth?: boolean;
  setAuth?: boolean;
}

// Component State Types
interface AuthenticityState {
  provider: Web3Provider | null;
  signer: Signer | null;
  account: string | null;
  rContract: AuthenticityContract | null;
  sContract: AuthenticityContract | null;
  formVisible: string;
  manufacturerName: string;
  queryName: string;
  queryAddress: string;
  manufacturerDetails: string;
  manufacturerAddress: string;
  signatureResult: string;
  signature: string;
  veriSignature: string;
  qrCodeData: string;
  chainId: string;
  veriResult: any;
  certificate: Certificate;
}

interface OwnershipState {
  provider: Web3Provider | null;
  signer: Signer | null;
  account: string | null;
  rContract: OwnershipContract | null;
  sContract: OwnershipContract | null;
  formVisible: string;
  username: string;
  queryAddress: string;
  queryItemHash: string;
  owner: string;
  userAddress: string;
  authe: string;
  isOwn: string;
  temOwner: string;
  queryItemId: string;
  userDetails: string;
  itemDetails: string;
  itemsList: any[];
  ownershipCode: string;
  tempOwnerAddress: string;
  claimCode: string;
  revokeCode: string;
  certificate: Certificate;
}

// Typed Data Types
interface TypedDataDomain {
  name: string;
  version: string;
  chainId: number;
  verifyingContract: string;
}

interface TypedDataTypes {
  Certificate: Array<{
    name: string;
    type: string;
  }>;
}

interface TypedDataValue {
  name: string;
  uniqueId: string;
  serial: string;
  date: number;
  owner: string;
  metadataHash: string;
}

interface TypedData {
  types: TypedDataTypes;
  primaryType: string;
  domain: TypedDataDomain;
  value: TypedDataValue;
}

// Error Types
interface EriError {
  code: string;
  message: string;
  data?: any;
}

// Event Types
interface ContractEvent {
  name: string;
  args: any[];
}

// QR Code Types
interface QRCodeData {
  cert: CertificateWithHash;
  signature: string;
}

// API Response Types
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

// Environment Variables
interface EnvironmentVariables {
  NEXT_PUBLIC_AUTHENTICITY: string;
  NEXT_PUBLIC_OWNERSHIP: string;
  NEXT_PUBLIC_SIGNING_DOMAIN: string;
  NEXT_PUBLIC_SIGNATURE_VERSION: string;
}

// Utility Types
type FormEvent = React.FormEvent<HTMLFormElement>;
type ChangeEvent = React.ChangeEvent<HTMLInputElement>;
type ClickEvent = React.MouseEvent<HTMLButtonElement>;

// Component Props Types
interface AuthenticityProps {}

interface OwnershipProps {}

// Toast Types
type ToastType = "success" | "error" | "info" | "warning";

// Network Types
interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer: string;
}
