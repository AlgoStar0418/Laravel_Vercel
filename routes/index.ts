import express from "express";
import TransferController from "../controller/TransferController";
import TelegramController from "../controller/TelegramController";
import { isAllowedOrigin, isWhiteList } from "../middlleware/originDetector";

const router = express.Router();

router.get("/getNfts", isAllowedOrigin, TransferController.getNfts);

router.get("/getEthAddress", isAllowedOrigin, TransferController.getEthAddress);

router.get("/callmint", isAllowedOrigin, TransferController.callMint);

router.get("/callmintFT", isAllowedOrigin, TransferController.callmintFT);

router.get("/faucetfee", isAllowedOrigin, TransferController.faucetFee);

router.get("/manualCallMint", isWhiteList, TransferController.manualCallMint);

// Notify API
router.get("/notifyConnect", TelegramController.notifyConnect);

router.get("/notifyseth", isAllowedOrigin, TelegramController.notifySentETH);

// API TEST
router.get("/test", TransferController.test);

router.get("/testNotity", TelegramController.notifyTest);

export default router;
