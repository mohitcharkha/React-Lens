import {
  ApolloClient,
  ApolloLink,
  gql,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";

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

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
});

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

const REQUEST_FOLLOW_QUERY = `
  mutation {
    createFollowTypedData(
      request: { follow: [{ profile: "0x01", followModule: null }] }
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
  const { data } = await apolloClient.mutate({
    mutation: gql(REQUEST_FOLLOW_QUERY),
  });
  console.log({ data });
};

const APPROVE_FOLLOW = `
mutation($request: FollowRequest!) { 
 follow(request: $request)
}
`;

export const approveFollow = () => {
  return apolloClient.mutate({
    mutation: gql(APPROVE_FOLLOW),
    variables: {
      request: {
        profileId: "0x01",
      },
    },
  });
};

const PENDING_FOLLOW_REQUEST = `query Followers {
    pendingApprovalFollows(request: { 
                limit: 10
               }) {
      items {
        id
        name
        bio
        attributes {
          displayType
          traitType
          key
          value
        }
        followNftAddress
        metadata
        isDefault
        handle
        picture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              mimeType
              height
              width
              url
            }
            small {
              url
              width
              height
              mimeType
            }
            medium {
              url
              width
              height
              mimeType
            }
          }
        }
        coverPicture {
          ... on NftImage {
            contractAddress
            tokenId
            uri
            verified
          }
          ... on MediaSet {
            original {
              width
              url
              height
              mimeType
            }
            small {
              height
              width
              url
              mimeType
            }
            medium {
              url
              width
              height
              mimeType
            }
          }
        }
        ownedBy
        dispatcher {
          address
          canUseRelay
        }
        stats {
          totalFollowers
          totalFollowing
          totalPosts
          totalComments
          totalMirrors
          totalPublications
          totalCollects
        }
        followModule {
          ... on FeeFollowModuleSettings {
            type
            amount {
              asset {
                name
                symbol
                decimals
                address
              }
              value
            }
            recipient
          }
          ... on ProfileFollowModuleSettings {
           type
          }
          ... on RevertFollowModuleSettings {
           type
          }
        }
      }
      pageInfo {
        prev
        next
        totalCount
      }
    }
  }`;
export const getPendingFollowRequest = async () => {
  const res = await apolloClient.query({
    query: gql(PENDING_FOLLOW_REQUEST),
  });
  console.log(res);
};

const CREATE_PROFILE = `mutation CreateProfile {
    createProfile(request:{ 
                  handle: "newtestuser",
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

export const createProfile = () => {
  return apolloClient.mutate({
    mutation: gql(CREATE_PROFILE),
  });
};

const CREATE_POST = `mutation CreatePostTypedData {
    createPostTypedData(request: {
      profileId: "0x5285",
      contentURI: "ipfs://bafkreieqpzbdwrhzafbbrmxn3247eo6tx25rjztf3kqlanwz2ydqv45rbu",
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
    }
  }`;

export const createPost = async () => {
  return apolloClient.mutate({
    mutation: gql(CREATE_POST),
  });
};

// dispatcher: "0xE1ec35AE9ceb98d3b6DB6A4e0aa856BEA969B4DF"
// dispatcher: "0x1638CF7D0E72B2e3b5eBECBe794D77c90aB02b26",
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
