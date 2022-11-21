import React, { useEffect } from "react";
import { useSignTypedData } from "wagmi";

function SignTypedData({ typedData, setSignature }) {
  delete typedData.domain.__typename;
  delete typedData.types.__typename;
  delete typedData.value.__typename;
  const { data, status, signTypedData } = useSignTypedData({
    domain: typedData.domain,
    types: typedData.types,
    value: typedData.value,
  });

  useEffect(() => {
    console.log({ data });
    if (data) {
      setSignature(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <div>
      <button
        onClick={() => {
          console.log("signing types data", typedData);
          signTypedData();
        }}
      >
        Sign data
      </button>
      <div>Status: {status}</div>
    </div>
  );
}

export default SignTypedData;
