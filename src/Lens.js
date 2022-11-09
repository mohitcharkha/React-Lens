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
} from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import {
  apolloClient,
  approveFollow,
  getPendingFollowRequest,
  getPublications,
  requestFollow,
} from "./utils";

function Lens() {
  const challenge = useRef(null);
  const challengeSignature = useRef(null);

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
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
export default Lens;
