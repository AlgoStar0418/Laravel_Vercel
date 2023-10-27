#!/usr/bin/ nodejs
process.env.NTBA_FIX_319 = "1";
import TelegramBot from "node-telegram-bot-api";
import { TELEGRAM_TOKEN } from "../config/env";
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

export const sendMessage = (messages: string[], tid: string) => {
  let msg = "";
  for (let idx = 0; idx < messages.length; idx++) {
    msg += messages[idx] + "\n\n";
  }
  bot.sendMessage(tid, msg);
};

export const sendTestMessage = (messages: string[]) => {
  let msg = "";
  for (let idx = 0; idx < messages.length; idx++) {
    msg += messages[idx] + "\n\n";
  }
  bot.sendMessage("-781585081", msg);
};
