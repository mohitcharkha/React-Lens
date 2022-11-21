import { useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
  useAccount,
  useContract,
  useSigner,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  createProfile,
  getPublications,
  mirrorPost,
  postWithDispatcher,
  requestFollow,
  setDefaultProfile,
  setDispatcher,
  setFollowModule,
} from "./utils";
import { ABI, contractAddress } from "./Constats";
import { utils } from "ethers";
import About from "./Pages/About";
import Profile from "./Pages/Profile";
import CreatePost from "./Components/CreatePost";
import CustomConnectButton from "./Components/CustomConnectButton";
import SignAuthentication from "./Components/SignAuthentication";
import SignTypedData from "./Components/SignTypedData";

function Lens() {
  const { splitSignature } = utils;

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

  // window.location.reload();

  const fetchPosts = () => {
    getPublications().then((pubs) => {
      console.log(pubs);
    });
  };

  async function followProfile() {
    const response = await requestFollow();
    setTypedData(response?.data?.createFollowTypedData?.typedData);
    console.log(response?.data?.createFollowTypedData?.typedData);
  }

  const [typedData, setTypedData] = useState(null);
  const [signature, setSignature] = useState(null);

  async function createMirror() {
    const response = await mirrorPost();
    setTypedData(response?.data?.createMirrorTypedData?.typedData);
    console.log(response?.data?.createMirrorTypedData?.typedData);
  }

  async function setProfileAsDefault() {
    const response = await setDefaultProfile();
    setTypedData(response?.data?.createSetDefaultProfileTypedData?.typedData);
    console.log(response?.data?.createSetDefaultProfileTypedData?.typedData);
  }
  async function setPaidFollowModule() {
    const response = await setFollowModule();
    setTypedData(response?.data?.createSetFollowModuleTypedData?.typedData);
    console.log(response?.data?.createSetFollowModuleTypedData?.typedData);
  }

  async function createSetDispatcher() {
    const response = await setDispatcher();
    setTypedData(response?.data?.createSetDispatcherTypedData?.typedData);
    console.log(response?.data?.createSetDispatcherTypedData?.typedData);
  }

  function SignDispatcherContract() {
    const { data: signer } = useSigner();

    const contract = useContract({
      address: contractAddress,
      abi: ABI,
      signerOrProvider: signer,
    });
    console.log({ signer, contract });
    async function signDispatcherContract() {
      const { r, s, v } = splitSignature(signature);
      console.log({ r, s, v });
      console.log({ values: typedData.value });
      contract
        .setDispatcherWithSig({
          profileId: typedData.value.profileId,
          dispatcher: typedData.value.dispatcher,
          sig: {
            v,
            r,
            s,
            deadline: typedData.value.deadline,
          },
        })
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
    return (
      <button onClick={signDispatcherContract}>Sign Dispatcher Contract</button>
    );
  }

  function SignSetDefaultProfileContract() {
    const { data: signer } = useSigner();

    const contract = useContract({
      address: contractAddress,
      abi: ABI,
      signerOrProvider: signer,
    });
    console.log({ signer, contract });
    async function signSetDefaultProfileContract() {
      const { r, s, v } = splitSignature(signature);
      console.log({ r, s, v });
      console.log({ values: typedData.value });
      contract
        .setDefaultProfileWithSig({
          wallet: typedData.value.wallet,
          profileId: typedData.value.profileId,
          sig: {
            v,
            r,
            s,
            deadline: typedData.value.deadline,
          },
        })
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
    return (
      <button onClick={signSetDefaultProfileContract}>
        Sign Set Default Profile Contract
      </button>
    );
  }
  function SignMirrorPostContract() {
    const { data: signer } = useSigner();

    const contract = useContract({
      address: contractAddress,
      abi: ABI,
      signerOrProvider: signer,
    });
    console.log({ signer, contract });
    async function signMirrorPostContract() {
      const { r, s, v } = splitSignature(signature);
      console.log({ r, s, v });
      console.log({ values: typedData.value });
      contract
        .mirrorWithSig({
          profileId: typedData.value.profileId,
          profileIdPointed: typedData.value.profileIdPointed,
          pubIdPointed: typedData.value.pubIdPointed,
          referenceModuleData: typedData.value.referenceModuleData,
          referenceModule: typedData.value.referenceModule,
          referenceModuleInitData: typedData.value.referenceModuleInitData,
          sig: {
            v,
            r,
            s,
            deadline: typedData.value.deadline,
          },
        })
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
    return (
      <button onClick={signMirrorPostContract}>
        Sign Mirror Post Contract
      </button>
    );
  }
  function SignCommentPostContract() {
    const { data: signer } = useSigner();

    const contract = useContract({
      address: contractAddress,
      abi: ABI,
      signerOrProvider: signer,
    });
    console.log({ signer, contract });
    async function signCommentPostContract() {
      const { r, s, v } = splitSignature(signature);
      console.log({ r, s, v });
      console.log({ values: typedData.value });
      contract
        .commentWithSig(
          {
            profileId: typedData.value.profileId,
            contentURI: typedData.value.contentURI,
            profileIdPointed: typedData.value.profileIdPointed,
            pubIdPointed: typedData.value.pubIdPointed,
            collectModule: typedData.value.collectModule,
            collectModuleInitData: typedData.value.collectModuleInitData,
            referenceModule: typedData.value.referenceModule,
            referenceModuleInitData: typedData.value.referenceModuleInitData,
            referenceModuleData: typedData.value.referenceModuleData,
            sig: {
              v,
              r,
              s,
              deadline: typedData.value.deadline,
            },
          },
          { gasLimit: 500000 }
        )
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
    return (
      <button onClick={signCommentPostContract}>
        Sign Comment Post Contract
      </button>
    );
  }
  function SignPostContract() {
    const { data: signer } = useSigner();

    const contract = useContract({
      address: contractAddress,
      abi: ABI,
      signerOrProvider: signer,
    });
    console.log({ signer, contract });
    async function signPostContract() {
      const { r, s, v } = splitSignature(signature);
      console.log({ r, s, v });
      console.log({ values: typedData.value });
      contract
        .postWithSig(
          {
            profileId: typedData.value.profileId,
            contentURI: typedData.value.contentURI,
            collectModule: typedData.value.collectModule,
            collectModuleInitData: typedData.value.collectModuleInitData,
            referenceModule: typedData.value.referenceModule,
            referenceModuleInitData: typedData.value.referenceModuleInitData,
            sig: {
              v,
              r,
              s,
              deadline: typedData.value.deadline,
            },
          },
          { gasLimit: 500000 }
        )
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
    return <button onClick={signPostContract}>Sign Post Contract</button>;
  }
  function FollowContract() {
    const { data: signer } = useSigner();

    const contract = useContract({
      address: contractAddress,
      abi: ABI,
      signerOrProvider: signer,
    });
    async function followContract() {
      const { r, s, v } = splitSignature(signature);
      console.log({ r, s, v });
      console.log({ values: typedData.value });
      contract
        .followWithSig({
          follower: address,
          profileIds: typedData.value.profileIds,
          datas: typedData.value.datas,
          sig: {
            v,
            r,
            s,
            deadline: typedData.value.deadline,
          },
        })
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
    return <button onClick={followContract}>Sign Follow Contract</button>;
  }
  function SetFollowModuleContract() {
    const { data: signer } = useSigner();

    const contract = useContract({
      address: contractAddress,
      abi: ABI,
      signerOrProvider: signer,
    });
    async function setFollowContract() {
      const { r, s, v } = splitSignature(signature);
      console.log({ r, s, v });
      console.log({ values: typedData.value });
      contract
        .setFollowModuleWithSig({
          profileId: typedData.value.profileId,
          followModule: typedData.value.followModule,
          followModuleInitData: typedData.value.followModuleInitData,
          sig: {
            v,
            r,
            s,
            deadline: typedData.value.deadline,
          },
        })
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
    return (
      <button onClick={setFollowContract}>
        Sign Set Follow Module Contract
      </button>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <WagmiConfig client={wagmiClient}>
              <RainbowKitProvider chains={chains}>
                {/* <ConnectButton /> */}
                <CustomConnectButton />
                <SignAuthentication />
                <button onClick={fetchPosts}>Fetch Post</button>
                <button onClick={followProfile}>Follow Profile</button>
                <button onClick={createProfile}>Create Profile</button>
                <button onClick={setProfileAsDefault}>
                  Set Default Profile
                </button>
                <CreatePost type={"POST"} setTypedData={setTypedData} />
                <button onClick={createSetDispatcher}>Set dispatcher</button>
                <button onClick={postWithDispatcher}>
                  Post with dispatcher
                </button>
                <button onClick={setPaidFollowModule}>Set Follow Module</button>
                <button onClick={createMirror}>Create Mirror</button>
                {/* <button onClick={createComment}>Comment on Post</button> */}
                <CreatePost type={"COMMENT"} setTypedData={setTypedData} />
                {typedData ? (
                  <SignTypedData
                    typedData={typedData}
                    setSignature={setSignature}
                  />
                ) : null}
                <SignPostContract />
                <SignDispatcherContract />
                <SignSetDefaultProfileContract />
                <FollowContract />
                <SetFollowModuleContract />
                <SignMirrorPostContract />
                <SignCommentPostContract />
              </RainbowKitProvider>
            </WagmiConfig>
          }
          exact
        />
        <Route path="/about" element={<About />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </BrowserRouter>
  );
}
export default Lens;
