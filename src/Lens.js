import { useRef, useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
  useContract,
  useSigner,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  collectPost,
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
import CreateComment from "./Components/CreateComment";
import PostContractSigner from "./ContractSigners/PostContractSigner";
import FollowContractSigner from "./ContractSigners/FollowContractSigner";
import MirrorPostContractSigner from "./ContractSigners/MirrorPostContractSigner";
import CollectPostContractSigner from "./ContractSigners/CollectPostContractSigner";
import CommentPostContractSigner from "./ContractSigners/CommentPostContractSigner";
import SetDispatcherContractSigner from "./ContractSigners/SetDispatcherContractSigner";

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

  async function createCollect() {
    const response = await collectPost();
    setTypedData(response?.data?.createCollectTypedData?.typedData);
    console.log(response?.data?.createCollectTypedData?.typedData);
  }

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
                <CreatePost setTypedData={setTypedData} />
                <button onClick={createSetDispatcher}>Set dispatcher</button>
                <button onClick={postWithDispatcher}>
                  Post with dispatcher
                </button>
                <button onClick={setPaidFollowModule}>Set Follow Module</button>
                <button onClick={createMirror}>Create Mirror</button>
                <button onClick={createCollect}>Create Collect</button>
                {/* <button onClick={createComment}>Comment on Post</button> */}
                <CreateComment setTypedData={setTypedData} />
                {typedData ? (
                  <SignTypedData
                    typedData={typedData}
                    setSignature={setSignature}
                  />
                ) : null}
                <PostContractSigner
                  signature={signature}
                  typedData={typedData}
                />
                <SetDispatcherContractSigner
                  signature={signature}
                  typedData={typedData}
                />
                <SignSetDefaultProfileContract />
                <FollowContractSigner
                  signature={signature}
                  typedData={typedData}
                />
                <SetFollowModuleContract />
                <MirrorPostContractSigner
                  signature={signature}
                  typedData={typedData}
                />
                <CollectPostContractSigner
                  signature={signature}
                  typedData={typedData}
                />
                <CommentPostContractSigner
                  signature={signature}
                  typedData={typedData}
                />
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
