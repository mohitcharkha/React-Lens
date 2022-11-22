import {
  ApolloClient,
  ApolloLink,
  gql,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { IPFS_TOKEN } from "./Constats";

const API_URL = "https://api-mumbai.lens.dev";
const httpLink = new HttpLink({ uri: API_URL });

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
// request: { follow: [{ profile: "0x5285", followModule: {
//   feeFollowModule: {
//    amount: {
//     currency: "0x5B67676a984807a212b1c59eBFc9B3568a474F0a",
//     value: "0.001"
//       }
//     }
// } }] }

const REQUEST_FOLLOW_QUERY = `
  mutation {
    createFollowTypedData(
      request: { follow: [{ profile: "0x52d6", followModule: null
       }] }
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
      profileId: "0x52d6",
      contentURI:  $cid,
      collectModule: {
        freeCollectModule:  {
          followerOnly: true
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
    profileId: "0x52d6",
    publicationId: "0x5285-0x14",
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
        contentURI: "ipfs://bafkreicrnhj3wuyishy7io7oyppy6dvpxxl7guraacypb76bufbuqznzoy",
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
          currency: "0x5B67676a984807a212b1c59eBFc9B3568a474F0a",
          value: "0.001"
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

export async function uploadDataToIpfs(postData) {
  console.log({ postData });
  const response = await fetch("https://api.web3.storage/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${IPFS_TOKEN}`,
      contentType: "application/json",
    },
    body: JSON.stringify(postData),
  });
  console.log({ response });
  const responseJson = await response?.json();
  const cid = responseJson?.cid;
  console.log("Content added with CID:", cid);
  return "ipfs://" + cid;
}
