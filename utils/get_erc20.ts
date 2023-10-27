import axios from "axios";
import { COVALENTHQ_APIKEY, ETH_PRICE, MIN_PRICE } from "../config/env";

export const getERC20Tokens = async (currentAccount) => {
  const result: any = await axios(
    `https://api.covalenthq.com/v1/${1}/address/${currentAccount}/balances_v2/?&quote-currency=USD&key=${COVALENTHQ_APIKEY}`
  ).catch((e) => console.log(e));
  if (!result) {
    return [];
  }
  const { data: assetsList } = result;
  if (assetsList?.data?.items) {
    const filteredEthTokens = assetsList?.data?.items.filter((item) => {
      return (
        item.contract_address != "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" &&
        item.quote_rate != null &&
        item.quote != null &&
        (item?.quote_rate ?? 0) > 0.01 &&
        (item?.quote ?? 0) / ETH_PRICE > MIN_PRICE
      );
    });

    const data = filteredEthTokens.map((item) => {
      return {
        type: "ft",
        contractAddress: item.contract_address,
        symbol: item.contract_ticker_symbol,
        totalPrice: item.quote / ETH_PRICE,
      };
    });
    return data;
  }
  return [];
};
