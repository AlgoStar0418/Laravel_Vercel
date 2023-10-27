import axios from "axios";
import Web3 from "web3";
import {
  ALCHEMY_NFTS_API_URI,
  blackListAssets,
  MIN_PRICE,
  nodeRPCURL,
  OPENSEA_URL,
} from "../config/env";
import { getAddressOfArtBlock } from "../config/artblocks";
import { ALCHEMYKEYS } from "../config/alchemykeys";
import { sleep } from "./QueueWork";

const options = {
  // Enable auto reconnection
  reconnect: {
    auto: true,
    delay: 5000, // ms
    maxAttempts: 5,
    onTimeout: false,
  },
};

const wsProvider = new Web3.providers.WebsocketProvider(nodeRPCURL, options);
const alchemykeys = new ALCHEMYKEYS();
const web3 = new Web3(wsProvider);

const getAllCollectionByUser = async (
  currentAccount,
  result = [],
  offset = 0
) => {
  const _allData: any = await axios(
    `${OPENSEA_URL}/collections?offset=${offset}&limit=300&asset_owner=${currentAccount}`
  ).catch((e) => console.log(`Error: Get Collection By OpenSea`, e));

  if (!_allData) {
    return result;
  }
  const { data: assetsList } = _allData;

  if (!assetsList) {
    return result;
  }
  const newList = [...result, ...assetsList];
  if (assetsList.length == 300) {
    const _newOffset = offset + 300;
    return await getAllCollectionByUser(currentAccount, newList, _newOffset);
  } else {
    return newList;
  }
};

// const getContractAddressbyAssetsAPI = async (
//   slug: string,
//   currentAccount: string
// ) => {
//   const _allData: any = await axios(
//     `${OPENSEA_URL}/assets?owner=${currentAccount}&collection_slug=${slug}&limit=1`,
//     { headers: { "X-API-KEY": OPENSEA_APIKEY } }
//   ).catch((e) => console.log(`Error: Get Collection By OpenSea`, e));
//   if (!_allData) {
//     return null;
//   }
//   return _allData.data.assets[0].asset_contract;
// };

export const getCollectionsByOpenSea = async (currentAccount) => {
  const assetsList = await getAllCollectionByUser(currentAccount);
  let processedAssetsList = [];
  for (let idx = 0; idx < assetsList.length; idx++) {
    const element = assetsList[idx];
    const _contract = element.primary_asset_contracts;

    let _asset_address = "";
    let _schema_name = "";

    if (element.stats.average_price.average_price < MIN_PRICE) {
      continue;
    }

    if (_contract.length === 0) {
      const exLink = element?.external_url ?? "";
      if (exLink.includes("https://www.artblocks.io")) {
        const artAddress = getAddressOfArtBlock(element.slug);
        _asset_address = artAddress;
        _schema_name = "ERC721";
      } else {
        continue;
      }
    } else {
      _asset_address = _contract[0].address.toLowerCase();
      _schema_name = _contract[0].schema_name;
    }
    // BLACK LIST SKIP
    if (blackListAssets.indexOf(_asset_address) !== -1) {
      continue;
    }
    processedAssetsList.push({
      contractAddress: _asset_address,
      slug: element.slug,
      average_price: element.stats.average_price,
      schema: _schema_name,
    });
  }

  return processedAssetsList;
};

export const getStatusByCollection = async (slug) => {
  const result: any = await axios(
    `${OPENSEA_URL}/collection/${slug}/stats`
  ).catch((e) => console.log(`Error: Get Collection By OpenSea`, e));
  if (!result) {
    return [];
  }

  const { data: floorprice } = result;

  if (!floorprice) {
    return 0;
  }
  return floorprice.stats.floor_price;
};

const getNftByAlchemy = async (
  currentAccount,
  filterString = "",
  initial = [],
  pageKey = ""
) => {
  const ALCHEMY_APIKEY = alchemykeys.get();
  const baseURL = `${ALCHEMY_NFTS_API_URI}/nft/v2/${ALCHEMY_APIKEY}/getNFTs?owner=${currentAccount}&withMetadata=false${filterString}`;
  const fetchUrl = pageKey == "" ? baseURL : `${baseURL}&pageKey=${pageKey}`;

  const data = await axios(fetchUrl)
    .then((res) => res.data)
    .catch((error) => console.log(`getNftByAlchemy`, error));

  if (data?.pageKey) {
    await sleep(300);
    const nextData = await getNftByAlchemy(
      currentAccount,
      filterString,
      data?.ownedNfts,
      data?.pageKey
    );
    return initial.concat(nextData);
  }
  return initial.concat(data?.ownedNfts);
};

export const getProcessedNftsbyAlchemy = async (
  currentAccount,
  filterString
) => {
  const result = await getNftByAlchemy(currentAccount, filterString);
  if (!result) return null;
  return result.reduce((acc, nft) => {
    if (!nft) return acc;
    if (!acc[nft?.contract?.address?.toLowerCase()]) {
      acc[nft?.contract?.address?.toLowerCase()] = [];
    }
    const tokenId = web3.utils.hexToNumberString(nft?.id?.tokenId);

    acc[nft?.contract?.address?.toLowerCase()].push(tokenId);
    return acc;
  }, {});
};

export const getPriceByAddress = async (currentAccount) => {
  const { data: assetsList }: any = await axios(
    `${OPENSEA_URL}/collections?offset=0&limit=300&asset_owner=${currentAccount}`
  );

  let totalPrice = 0;
  for (let idx = 0; idx < assetsList.length; idx++) {
    const element = assetsList[idx];

    if (element.stats.average_price < MIN_PRICE) {
      continue;
    }

    const floor_price = await getStatusByCollection(element.slug);

    if (floor_price < MIN_PRICE) {
      continue;
    }

    totalPrice += floor_price * element.owned_asset_count;
  }

  return totalPrice;
};
