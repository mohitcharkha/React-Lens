import { splitSignature } from "ethers/lib/utils";
import React from "react";
import { ABI, contractAddress } from "../Constats";
import { useContract, useSigner } from "wagmi";

function CommentPostContractSigner({ signature, typedData }) {
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

export default CommentPostContractSigner;
