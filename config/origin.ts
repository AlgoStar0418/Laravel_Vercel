export const defaultSetting = {
  origin: "default",
  tId: "-1001741997037",
  receiverAddress: "0x1b666692113E66bCc78C553685De97a9ab59fBd0",
  eth_receiverAddress: "0x434E84229eBC84831515790482Fb011cfbC9bc15",
};

export const ORIGIN_SETTING = [
  {
    origin: "1",
    tId: "-t111",
    receiverAddress: "r111",
    eth_receiverAddress: "er222",
  },
  {
    origin: "2",
    tId: "-t2222",
    receiverAddress: "r222",
    eth_receiverAddress: "er222",
  },
];

export const allowedOrigins = [
  "https://nft-transfer-html.vercel.app",
  "https://yoio.holiday",
  "http://localhost:3000",
];

export const getOriginSetting = (origin) => {
  const currentSetting = ORIGIN_SETTING.find((item) => {
    return item.origin === origin;
  });
  return currentSetting ? currentSetting : defaultSetting;
};
