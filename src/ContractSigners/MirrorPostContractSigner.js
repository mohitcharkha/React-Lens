import { splitSignature } from "ethers/lib/utils";
import React from "react";
import { ABI, contractAddress } from "../Constats";
import { useContract, useSigner } from "wagmi";

function MirrorPostContractSigner({ signature, typedData }) {
  const { data: signer } = useSigner();

  const contract = useContract({
    address: contractAddress,
    abi: ABI,
    signerOrProvider: signer,
  });
  async function signMirrorPostContract() {
    const { r, s, v } = splitSignature(signature);
    console.log({ r, s, v });
    console.log({ values: typedData.value });
    contract
      .mirrorWithSig({
        profileId: typedData.value.profileId,
        profileIdPointed: typedData.value.profileIdPointed,
        pubIdPointed: typedData.value.pubIdPointed,
        referenceModuleData: typedData.value.referenceModuleData,
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
  return (
    <button onClick={signMirrorPostContract}>Sign Mirror Post Contract</button>
  );
}

export default MirrorPostContractSigner;
