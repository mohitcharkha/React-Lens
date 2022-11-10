import { gql } from "@apollo/client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useRef, useState } from "react";

import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
  useAccount,
  useSignMessage,
  useSignTypedData,
  useContract,
  useSigner,
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  apolloClient,
  approveFollow,
  createPost,
  createProfile,
  getPendingFollowRequest,
  getPublications,
  postWithDispatcher,
  requestFollow,
  setDispatcher,
} from "./utils";
import { ABI, contractAddress } from "./Constats";
import { utils } from "ethers";

function Lens() {
  const challenge = useRef(null);
  const challengeSignature = useRef(null);
  const { splitSignature } = utils;

  const GET_CHALLENGE = `query($request: ChallengeRequest!) {
  challenge(request: $request) {
        text
    }
  }
`;
  const [posts, setPosts] = useState([]);
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

  const getChallenge = async () => {
    const resp = await apolloClient.query({
      query: gql(GET_CHALLENGE),
      variables: {
        request: {
          address,
        },
      },
    });
    challenge.current = resp.data.challenge.text;
    console.log(challenge.current);
  };
  function SignMsg() {
    const { signMessageAsync } = useSignMessage();

    async function signMsg() {
      await getChallenge();
      const signature = await signMessageAsync({ message: challenge.current });
      challengeSignature.current = signature;
    }
    return (
      <button type="submit" onClick={signMsg}>
        Sign
      </button>
    );
  }

  function Authenticate() {
    const AUTHENTICATION = `
  mutation($request: SignedAuthChallenge!) {
    authenticate(request: $request) {
      accessToken
      refreshToken
    }
 }
`;

    const authenticate = async () => {
      const res = await apolloClient.mutate({
        mutation: gql(AUTHENTICATION),
        variables: {
          request: {
            address,
            signature: challengeSignature.current,
          },
        },
      });
      const accessToken = res.data.authenticate.accessToken;
      window.sessionStorage.setItem("accessToken", accessToken);
    };

    return (
      <button type="submit" onClick={authenticate}>
        Authenticate
      </button>
    );
  }
  const fetchPosts = () => {
    getPublications().then((pubs) => {
      console.log(pubs);
      setPosts(pubs);
    });
  };

  const followProfile = () => {
    requestFollow().then((pubs) => {
      console.log(pubs);
    });
  };

  const [typedData, setTypedData] = useState(null);
  const [signature, setSignature] = useState(null);

  async function createNewPost() {
    const response = await createPost();
    setTypedData(response?.data?.createPostTypedData?.typedData);
    console.log(response?.data?.createPostTypedData?.typedData);
  }

  async function createSetDispatcher() {
    const response = await setDispatcher();
    setTypedData(response?.data?.createSetDispatcherTypedData?.typedData);
    console.log(response?.data?.createSetDispatcherTypedData?.typedData);
  }
  function SignTypedData() {
    delete typedData.domain.__typename;
    delete typedData.types.__typename;
    delete typedData.value.__typename;
    const { data, status, signTypedData } = useSignTypedData({
      domain: typedData.domain,
      types: typedData.types,
      value: typedData.value,
    });

    return (
      <div>
        <button
          onClick={() => {
            console.log("signing types data", typedData);
            signTypedData();
          }}
        >
          Sign data
        </button>
        <div>Status: {status}</div>
        <div
          onClick={() => {
            setSignature(data);
          }}
        >
          Signature: {data}
        </div>
      </div>
    );
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
        .postWithSig({
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
        })
        .then((res) => {
          console.log({ res });
        })
        .catch((err) => {
          console.log({ err });
        });
    }
    return <button onClick={signPostContract}>Sign Post Contract</button>;
  }
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <ConnectButton />
        <SignMsg />
        <Authenticate />
        <button onClick={fetchPosts}>Fetch Post</button>
        <button onClick={followProfile}>Follow Profile</button>
        <button onClick={approveFollow}>Approve Profile</button>
        <button onClick={getPendingFollowRequest}>
          Pending Follow Request
        </button>
        <button onClick={createProfile}>Create Profile</button>
        <button onClick={createNewPost}>Create Post</button>
        <button onClick={createSetDispatcher}>Set dispatcher</button>
        <button onClick={postWithDispatcher}>Post with dispatcher</button>
        {typedData ? <SignTypedData /> : null}
        <SignPostContract />
        <SignDispatcherContract />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
export default Lens;
