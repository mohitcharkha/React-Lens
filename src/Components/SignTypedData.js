import React, { useEffect } from "react";
import { useSignTypedData } from "wagmi";
import { broadcastRequest } from "../utils";

function SignTypedData({ id, typedData, setSignature }) {
  delete typedData.domain.__typename;
  delete typedData.types.__typename;
  delete typedData.value.__typename;
  const { data, status, signTypedData } = useSignTypedData({
    domain: typedData.domain,
    types: typedData.types,
    value: typedData.value,
  });
  // useEffect(() => {
  //   console.log("signing type data");
  //   if (typedData) {
  //     signTypedData();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [typedData]);

  useEffect(() => {
    console.log({ data });
    if (data) {
      setSignature(data);
      console.log({ id });
      // if (id) {
      //   broadcastData(id, data);
      // }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  const broadcastData = async (id, data) => {
    console.log("in broadcast function");
    if (id) {
      const res = await broadcastRequest({ id, signature: data });
      console.log({ res });
    } else {
      console.log("id is null", id);
    }
  };

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
