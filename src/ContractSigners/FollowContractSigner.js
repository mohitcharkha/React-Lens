import { splitSignature } from "ethers/lib/utils";
import React from "react";
import { ABI, contractAddress } from "../Constats";
import { useContract, useSigner, useAccount } from "wagmi";

function FollowContractSigner({ signature, typedData }) {
  const { data: signer } = useSigner();

  const { address } = useAccount();

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

export default FollowContractSigner;
