import { splitSignature } from "ethers/lib/utils";
import React from "react";
import { ABI, contractAddress } from "../Constats";
import { useContract, useSigner } from "wagmi";

function SetDispatcherContractSigner({ signature, typedData }) {
  const { data: signer } = useSigner();

  const contract = useContract({
    address: contractAddress,
    abi: ABI,
    signerOrProvider: signer,
  });
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

export default SetDispatcherContractSigner;
