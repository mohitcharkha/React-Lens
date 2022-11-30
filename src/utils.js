import {
  ApolloClient,
  ApolloLink,
  gql,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { NFTStorage } from "nft.storage";
import { IPFS_TOKEN, NFTStorageAPiKey } from "./Constats";

const API_URL = "https://api-mumbai.lens.dev";
const httpLink = new HttpLink({ uri: API_URL });

const client = new NFTStorage({ token: NFTStorageAPiKey });

const authLink = new ApolloLink((operation, forward) => {
  const token = sessionStorage.getItem("accessToken");

  operation.setContext({
    headers: {
      "x-access-token": token ? `Bearer ${token}` : "",
    },
  });

  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

const AUTHENTICATION = `
mutation($request: SignedAuthChallenge!) {
  authenticate(request: $request) {
    accessToken
    refreshToken
  }
}
`;

export const getAuthentication = async (address, signature) => {
  return await apolloClient.mutate({
    mutation: gql(AUTHENTICATION),
    variables: {
      request: {
        address,
        signature,
      },
    },
  });
};

const REFRESH_AUTHENTICATION = `
mutation Refresh($refreshToken: Jwt!) {
  refresh(request: {
    refreshToken: $refreshToken
  }) {
    accessToken
    refreshToken
  }
}
`;

export const refreshAuthentication = async () => {
  return await apolloClient.mutate({
    mutation: gql(REFRESH_AUTHENTICATION),
    variables: {
      refreshToken: window.sessionStorage.refreshToken,
    },
  });
};

const GET_PUBLICATIONS_QUERY = `
query {
  explorePublications(request: {
    sortCriteria: LATEST,
    publicationTypes: [POST],
    limit: 20
  }) {
    items {
      __typename
      ... on Post {
        ...PostFields
      }
    }
  }
}

fragment ProfileFields on Profile {
  id
  name
  metadata
  handle
  picture {
    ... on NftImage {
      uri
    }
    ... on MediaSet {
      original {
        ...MediaFields
      }
    }
  }
  stats {
    totalComments
    totalMirrors
    totalCollects
  }
}

fragment MediaFields on Media {
  url
}

fragment PublicationStatsFields on PublicationStats {
  totalAmountOfMirrors
  totalAmountOfCollects
  totalAmountOfComments
}

fragment MetadataOutputFields on MetadataOutput {
    content
  media {
    original {
      ...MediaFields
    }
  }
}

fragment PostFields on Post {
  id
  profile {
    ...ProfileFields
  }
  stats {
    ...PublicationStatsFields
  }
  metadata {
    ...MetadataOutputFields
  }
}
  `;

// publications = posts in Lens lingo
export const getPublications = async () => {
  const { data } = await apolloClient.query({
    query: gql(GET_PUBLICATIONS_QUERY),
  });
  return data.explorePublications.items;
};

// request: { follow: [{ profile: "0x5578", followModule: null
//  }] }
const REQUEST_FOLLOW_QUERY = `
mutation {
  createFollowTypedData(
      request: { follow: [{ profile: "0x5285", followModule: {
        feeFollowModule: {
         amount: {
          currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
          value: "0.01"
            }
          }
      } }] }
    ) {
      id
      expiresAt
      typedData {
        domain {
          name
          chainId
          version
          verifyingContract
          __typename
        }
        types {
          FollowWithSig {
            name
            type
            __typename
          }
          __typename
        }
        value {
          nonce
          deadline
          profileIds
          datas
          __typename
        }
        __typename
      }
      __typename
    }
  }
`;
export const requestFollow = async () => {
  return apolloClient.mutate({
    mutation: gql(REQUEST_FOLLOW_QUERY),
  });
};
const GET_CHALLENGE = `query($request: ChallengeRequest!) {
  challenge(request: $request) {
        text
    }
  }
`;
export const getChallengeText = async (address) => {
  return await apolloClient.query({
    query: gql(GET_CHALLENGE),
    variables: {
      request: {
        address,
      },
    },
  });
};

const CREATE_PROFILE = `mutation CreateProfile {
    createProfile(request:{ 
                  handle: "NewAccountNewUser",
                  profilePictureUri: null,
                  followNFTURI: null,
                  followModule: null
                  }) {
      ... on RelayerResult {
        txHash
      }
      ... on RelayError {
        reason
      }
      __typename
    }
  }`;

export const createProfile = async () => {
  const res = await apolloClient.mutate({
    mutation: gql(CREATE_PROFILE),
  });
  console.log({ res });
};

const SET_DEFAULT_PROFILE = `mutation CreateSetDefaultProfileTypedData {
  createSetDefaultProfileTypedData(request: { profileId: "0x5285"}) {
    id
    expiresAt
    typedData {
      types {
        SetDefaultProfileWithSig {
          name
          type
        }
      }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        wallet
        profileId
      }
    }
  }
}`;

export const setDefaultProfile = () => {
  return apolloClient.mutate({
    mutation: gql(SET_DEFAULT_PROFILE),
  });
};

const CREATE_POST = `mutation CreatePostTypedData($cid: Url!) {
    createPostTypedData(request: {
      profileId: "0x52b0",
      contentURI:  $cid,
      collectModule: {
        freeCollectModule:  {
          followerOnly: false
       }
      },
    referenceModule: {
        followerOnlyReferenceModule: false
    }
    }) {
      id
      expiresAt
      typedData {
        types {
          PostWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          profileId
          contentURI
          collectModule
          collectModuleInitData
          referenceModule
          referenceModuleInitData
        }
      }
    },
  }`;

export const createPost = async (cid) => {
  console.log({ cid });
  return apolloClient.mutate({
    mutation: gql(CREATE_POST),
    variables: {
      cid,
    },
  });
};

const MIRROR_POST = `mutation CreateMirrorTypedData {
  createMirrorTypedData(request: {
    profileId: "0x52d6",
    publicationId: "0x5285-0x14",
    referenceModule: {
      followerOnlyReferenceModule: false
    }
  }) {
    id
    expiresAt
    typedData {
      types {
        MirrorWithSig {
          name
          type
        }
      }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        profileIdPointed
        pubIdPointed
        referenceModule
        referenceModuleData
        referenceModuleInitData
      }
    }
  }
}`;

export const mirrorPost = async () => {
  return apolloClient.mutate({
    mutation: gql(MIRROR_POST),
  });
};

const COMMENT_POST = `mutation CreateCommentTypedData($cid: Url!) {
  createCommentTypedData(request: {
    profileId: "0x5285",
    publicationId: "0x5285-0x1a",
    contentURI: $cid,
    collectModule: {
      revertCollectModule: true
    },
    referenceModule: {
      followerOnlyReferenceModule: false
    }
  }) {
    id
    expiresAt
    typedData {
      types {
        CommentWithSig {
          name
          type
        }
      }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        profileIdPointed
        pubIdPointed
        contentURI
        referenceModuleData
        collectModule
        collectModuleInitData
        referenceModule
        referenceModuleInitData
      }
    }
  }
}`;

export const commentPost = async (cid) => {
  console.log({ cid });
  return apolloClient.mutate({
    mutation: gql(COMMENT_POST),
    variables: {
      cid,
    },
  });
};
// dispatcher: "0xE1ec35AE9ceb98d3b6DB6A4e0aa856BEA969B4DF"
const SET_DISPATCHER = `mutation CreateSetDispatcherTypedData {
    createSetDispatcherTypedData(request:{
        profileId: "0x5285",
    }) {
      id
      expiresAt
      typedData {
        types {
          SetDispatcherWithSig {
            name
            type
          }
        }
        domain {
          name
          chainId
          version
          verifyingContract
        }
        value {
          nonce
          deadline
          profileId
          dispatcher
        }
      }
    }
  }`;

export const setDispatcher = async () => {
  return apolloClient.mutate({
    mutation: gql(SET_DISPATCHER),
  });
};

const POST_WITH_DISPATCHER = `mutation CreatePostViaDispatcher {
    createPostViaDispatcher(
      request: {
        profileId: "0x5285"
        contentURI: "ipfs://bafkreicilvvgelqa4mu2jmbjvvrhir7454ukxn7jeambhgqccnjstfdb54",
        collectModule: {
          revertCollectModule: true
        },
      referenceModule: {
          followerOnlyReferenceModule: false
      }
      }) {
      ... on RelayerResult {
        txHash
        txId
      }
      ... on RelayError {
        reason
      }
    }
  }`;

export const postWithDispatcher = async () => {
  console.log("calling");
  const res = await apolloClient.mutate({
    mutation: gql(POST_WITH_DISPATCHER),
  });
  console.log({ res });
};

// currency: "0x3C68CE8504087f89c640D02d133646d98e64ddd9",
const SET_FOLLOW_MODULE = `mutation CreateSetFollowModuleTypedData {
  createSetFollowModuleTypedData(request:{
    profileId: "0x5285",
    followModule: {
      feeFollowModule: {
        amount: {
          currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
          value: "0.01"
            },
            recipient: "0xE1ec35AE9ceb98d3b6DB6A4e0aa856BEA969B4DF"
        }
     }
  }) {
    id
    expiresAt
    typedData {
      types {
        SetFollowModuleWithSig {
          name
          type
        }
      }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        followModule
        followModuleInitData
      }
    }
  }
}`;
export const setFollowModule = async () => {
  return await apolloClient.mutate({
    mutation: gql(SET_FOLLOW_MODULE),
  });
};

const CREATE_COLLECT = `mutation CreateCollectTypedData {
  createCollectTypedData(request: {
    publicationId: "0x52d6-0x01"
  }) {
    id
    expiresAt
    typedData {
      types {
        CollectWithSig {
          name
          type
        }
      }
      domain {
        name
        chainId
        version
        verifyingContract
      }
      value {
        nonce
        deadline
        profileId
        pubId
        data
      }
    }
  }
}`;

export const collectPost = async () => {
  return await apolloClient.mutate({
    mutation: gql(CREATE_COLLECT),
  });
};

const ENABLED_CURR = `query EnabledModuleCurrencies {
  enabledModuleCurrencies {
    name
    symbol
    decimals
    address
  }
}`;
export const enabledCurr = async () => {
  const res = await apolloClient.mutate({
    mutation: gql(ENABLED_CURR),
  });
  console.log({ res });
};

const BROADCAST = `mutation Broadcast($request: BroadcastRequest!) {
  broadcast(request: $request) {
    ... on RelayerResult {
      txHash
      txId
    }
    ... on RelayError {
      reason
    }
  }
}`;
export const broadcastRequest = async (request) => {
  const result = await apolloClient.mutate({
    mutation: gql(BROADCAST),
    variables: {
      request,
    },
  });

  return result?.data?.broadcast;
};

export async function uploadDataToIpfs(postData) {
  console.log({ postData: JSON.stringify(postData) });

  const response = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${IPFS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  });
  console.log({ response });
  const responseJson = await response?.json();
  const cid = responseJson?.cid;
  console.log("Content added with CID:", cid);
  return "ipfs://" + cid;
}

// export async function uploadDataFromInfura(postData){
//   const file = new File([postData], 'data.json');
//   const formData = new FormData();
//   formData.append("file", file);
//   const resp = await fetch("https://ipfs.infura.io:5001/api/v0/add", {
//     method: "POST",
//     body: formData,
//   })
// }

const VALIDATE_PUBLICATION = `query ValidatePublicationMetadata($metadata: PublicationMetadataV2Input) {
  validatePublicationMetadata(request: {
    metadatav2: $metadata
  }) {
    valid
    reason
  }
}`;

export const validatePublicationMetadata = async (metadata) => {
  const res = await apolloClient.query({
    query: gql(VALIDATE_PUBLICATION),
    variables: {
      metadata,
    },
  });
  console.log({ res });
};

export async function uploadMetaData(data) {
  console.log({ data });
  const metadata = await client.store(data);
  console.log(metadata.url);
  return metadata.url;
}

export async function uploadImage(image) {
  const uploadData = await client.store({
    name: "image",
    description: "image upload",
    image: image,
  });
  return uploadData.url;
}

export async function uploadToNFTPort(data) {
  console.log({ data: JSON.stringify(data) });
  const response = await fetch("https://api.nftport.xyz/v0/metadata", {
    method: "POST",
    headers: {
      Authorization: "81ce1dae-5630-4568-a525-213aef993cc7",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const jsonResponse = await response.json();
  console.log(jsonResponse);
  console.log(jsonResponse?.metadata_uri);
  return jsonResponse?.metadata_uri;
}

const ADD_REACTION = `mutation AddReaction {
  addReaction(request: { profileId: "0x5285", reaction: UPVOTE, publicationId: "0x52d6-0x15" })
}`;

export function addReaction() {
  apolloClient.mutate({
    mutation: gql(ADD_REACTION),
  });
}
