import "./App.css";
import { useEffect, useRef } from "react";
import { ethers } from "ethers";
import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
  useAccount,
  useBalance,
  useContract,
  useSigner,
  useSendTransaction,
  usePrepareSendTransaction,
  useSignMessage,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import CryptoJS from "crypto-js";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDYxRjA0OWJjYTJFOWQyOGEyNTNmOTM0MDhDYzk3Q0YyMzIxOTFmM0IiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Njc0ODUzNTQ4NTksIm5hbWUiOiJGaXJzdCBUb2tlbiJ9.eArlzoXBOs_rac_Zk8OHdv7kT1oa3RxEJ4zaoLg5WtY";

function UploadExample() {
  const cidRef = useRef(null);

  function getBase64(file) {
    return new Promise((resolve) => {
      var reader = new FileReader();
      reader.onload = function () {
        return resolve(reader.result);
      };
      reader.onerror = function (error) {
        console.log("Error: ", error);
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleChange(event) {
    const data = event.target.files[0];
    let formData = new FormData(); //formdata object

    getBase64(data).then(async (base64Data) => {
      const encryptedData = CryptoJS.AES.encrypt(base64Data, "password");
      const file = new File([encryptedData.toString()], "file.txt");

      formData.append("file", file);
      const response = await fetch("https://api.web3.storage/upload", {
        method: "POST",
        headers: {
          "X-NAME": data.name,
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const responseJson = await response?.json();
      const cid = responseJson?.cid;
      console.log("Content added with CID:", cid);
      cidRef.current = cid;
    });
  }

  async function retreiveData() {
    fetch(`https://${cidRef.current}.ipfs.w3s.link/`)
      .then(async (response) => {
        const responseText = await response.text();
        const decrypted = CryptoJS.AES.decrypt(responseText, "password");
        return decrypted.toString(CryptoJS.enc.Utf8);
      })
      .then((blob) => {
        const link = document.createElement("a");
        link.href = blob;
        link.download = "a.mp4";
        link.click();
      })
      .catch(console.error);
  }

  return (
    <div>
      <form>
        <h4>File Upload</h4>
        <input type="file" onChange={handleChange} />
        <button type="submit">Upload</button>
      </form>
      <br />
      <button type="submit" onClick={retreiveData}>
        Retreive Data
      </button>
    </div>
  );
}

function InteractionExample() {
  const client = new ethers.providers.Web3Provider(window.ethereum);
  console.log(client);

  useEffect(() => {}, []);
  return <p>InteractionExample</p>;
}

function RainbowKitConnectExample() {
  const { ConnectButton } = require("@rainbow-me/rainbowkit");
  return <ConnectButton />;
}

function SendTransaction() {
  const { config } = usePrepareSendTransaction({
    request: {
      to: "0xE1ec35AE9ceb98d3b6DB6A4e0aa856BEA969B4DF",
      value: "0x2386F26FC10000",
    },
  });
  const { data, isLoading, isSuccess, sendTransaction } =
    useSendTransaction(config);

  return (
    <div>
      <button disabled={!sendTransaction} onClick={() => sendTransaction?.()}>
        Send Transaction
      </button>
      {isLoading && <div>Check Wallet</div>}
      {isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
    </div>
  );
}

function ContractInteractionExample() {
  const { data: signer } = useSigner();

  const contractAddress = "0x7E6c18f0A821a461d35A58e83F215a9Fe123c9b1";
  const ABI = [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "number",
          type: "uint256",
        },
      ],
      name: "setNumber",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "retrieveNumber",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  const contract = useContract({
    address: contractAddress,
    abi: ABI,
    signerOrProvider: signer,
  });

  async function fetchNumber() {
    const value = await contract.setNumber(55);
    console.log("done: ", value);
  }
  return (
    <p>
      <button onClick={fetchNumber}>Set Number</button>
    </p>
  );
}

function Balance() {
  const { address } = useAccount();
  const { data, isError, isLoading } = useBalance({
    addressOrName: address,
  });

  if (isLoading) return <div>Fetching balance…</div>;
  if (isError) return <div>Error fetching balance</div>;
  return (
    <div>
      Balance: {data?.formatted} {data?.symbol}
    </div>
  );
}

async function sign(singFunc) {
  const signature = await singFunc({ message: "Sign Message" });
  console.log({ signature });
}

function App() {
  const { chains, provider } = useRef(
    configureChains(
      [
        chain.mainnet,
        chain.polygon,
        chain.optimism,
        chain.arbitrum,
        chain.polygon,
        chain.polygonMumbai,
        chain.goerli,
      ],
      [
        // alchemyProvider({ apiKey: 'CHu5o-Y1e5EoW_49i3DY_uw4WZnEpp4B' }),
        publicProvider(),
      ]
    )
  ).current;

  const { signMessage } = useSignMessage();

  const { connectors } = useRef(
    getDefaultWallets({
      appName: "My RainbowKit App",
      chains,
    })
  ).current;

  const wagmiClient = useRef(
    createClient({
      autoConnect: true,
      connectors,
      provider,
    })
  ).current;

  const { address } = useAccount();

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <div className="App">
          <RainbowKitConnectExample />
          <p>{address}</p>
          <Balance />
          {/* <ContractInteractionExample /> */}
          <button
            onClick={() => {
              sign(signMessage);
            }}
          >
            Sign
          </button>
          <SendTransaction />
          <UploadExample />
        </div>
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
