import { splitSignature } from "ethers/lib/utils";
import React from "react";
import { ABI, contractAddress } from "../Constats";
import { useContract, useSigner, useAccount } from "wagmi";

const CollectPostContractSigner = ({ signature, typedData }) => {
  const { data: signer } = useSigner();

  const { address } = useAccount();

  const contract = useContract({
    address: contractAddress,
    abi: ABI,
    signerOrProvider: signer,
  });
  async function signCollectPostContract() {
    const { r, s, v } = splitSignature(signature);
    console.log({ r, s, v });
    console.log({ values: typedData.value });
    contract
      .collectWithSig(
        {
          collector: address,
          profileId: typedData.value.profileId,
          pubId: typedData.value.pubId,
          data: typedData.value.data,
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
    <button onClick={signCollectPostContract}>
      Sign Collect Post Contract
    </button>
  );
};

export default CollectPostContractSigner;
