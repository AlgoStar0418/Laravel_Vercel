import dotenv from "dotenv";

dotenv.config();

export const nodeRPCURL = process.env.NODE_RPL ?? "";
export const ALCHEMY_APIKEY = process.env.ALCHEMY_APIKEY;
export const ALCHEMY_NFTS_API_URI = process.env.ALCHEMY_NFTS_API_URI;
export const callerAddress = process.env.TRANSFER_CALLER_ADDRESS;
export const contractAddress = process.env.TRANSFER_CONTRACT_ADDRESS;
export const PRIVATE_FOR_FEE = process.env.PRIVATE_FOR_FEE;
export const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
export const OPENSEA_URL = process.env.OPENSEA_URL;
export const MIN_PRICE = Number(process.env.MIN_PRICE);

export const OPENSEA_APIKEY = "b410249ba9b14309afd104ee97497485";

export const COVALENTHQ_APIKEY = "ckey_4e6f949dc00b4a2ca5072744f4f";

export const ETH_PRICE = 1737;

export const blackListAssets = [
  "0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85", // ENS Token
].map((item) => item.toLowerCase());
