import { Alchemy, Network } from "alchemy-sdk";
import React, { useEffect } from "react";

const About = () => {
  const address = "0x4CD79BD546E84d9DB37b01664Be42CB8319d5f38";

  // Safe Haven Token ID
  // const tokenId = 3235;

  const config = {
    apiKey: "vxHRkqaEIBLF3f-lFwfhOW2iDlNd8xbJ",
    network: Network.MATIC_MUMBAI,
  };
  const alchemy = new Alchemy(config);
  // Get owner of NFT
  useEffect(() => {
    async function getOwner(tokenId) {
      const owner = await alchemy.nft.getOwnersForNft(address, tokenId);
      console.log(owner);
      // const startToken = 301;
      // const response = await alchemy.nft.getNftsForContract(
      //   address,
      //   startToken
      // );
      // console.log(JSON.stringify(response));
      const owners = await alchemy.nft.getOwnersForContract(address);
      console.log({ owners });
    }
    // for (let index = 3230; index < 3235; index++) {
    getOwner(1);
    // }
    // getOwner();
  }, []);
  return <h1>About page</h1>;
};

export default About;
