import { splitSignature } from "ethers/lib/utils";
import React from "react";
import { ABI, contractAddress } from "../Constats";
import { useContract, useSigner } from "wagmi";

function PostContractSigner({ signature, typedData }) {
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

export default PostContractSigner;
