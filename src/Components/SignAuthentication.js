import React from "react";
import { getAuthentication, getChallengeText } from "../utils";
import { useAccount, useSignMessage } from "wagmi";

function SignAuthentication() {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();

  const getChallenge = async () => {
    const resp = await getChallengeText(address);
    return resp.data.challenge.text;
  };

  const authenticate = async (signature) => {
    try {
      const res = await getAuthentication(address, signature);
      const { accessToken, refreshToken } = res.data.authenticate;
      window.sessionStorage.setItem("accessToken", accessToken);
      window.sessionStorage.setItem("refreshToken", refreshToken);
    } catch (error) {
      console.log({ error });
    }
  };

  async function signMsg() {
    if (address) {
      const challenge = await getChallenge();
      const signature = await signMessageAsync({
        message: challenge,
      });
      authenticate(signature);
    } else {
      alert("Connect Wallet to sign In");
    }
  }
  return (
    <button type="submit" onClick={signMsg}>
      Sign
    </button>
  );
}

export default SignAuthentication;
