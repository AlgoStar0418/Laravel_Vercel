import { getOriginSetting } from "../config/origin";
import { allowedOrigins } from "../config/origin";

export const isAllowedOrigin = (req: any, res: any, next: any) => {
  let origin = req.get("origin");

  if (origin == "undefined" || allowedOrigins.indexOf(origin) === -1) {
    return res.status(404).send("sorry we don't have this api");
  }

  return next();
};

export const isWhiteList = (req: any, res: any, next: any) => {
  const { apiKey }: any = req.query;

  if (apiKey == "nft-transfer-direct-call") {
    return next();
  }

  return res.status(404).send("sorry we don't have this api");
};

export const getOriginInfo = (req: any, res: any, next: any) => {
  let origin = req.get("origin");
  const setting = getOriginSetting(origin);
  req.setting = setting;
  return next();
};
