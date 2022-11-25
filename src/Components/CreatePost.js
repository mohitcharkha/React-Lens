import React, { useRef } from "react";
import {
  createPost,
  uploadDataToIpfs,
  uploadMetaData,
  validatePublicationMetadata,
} from "../utils";
import { v4 as uuidv4 } from "uuid";
import { IPFS_TOKEN } from "../Constats";

function CreatePost({ setTypedData }) {
  async function createNewPost(cid) {
    console.log("create new post", { cid });
    const response = await createPost(cid);
    setTypedData(response?.data?.createPostTypedData?.typedData);
    console.log(response?.data?.createPostTypedData?.typedData);
  }

  const cidRef = useRef(null);

  async function uploadFile(event) {
    const mediaFiles = event.target.files;
    let formData = new FormData(); //formdata object

    formData.append("file", mediaFiles[0]);
    const response = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        "X-NAME": mediaFiles[0].name,
        Authorization: `Bearer ${IPFS_TOKEN}`,
      },
      body: formData,
    });
    const responseJson = await response?.json();

    const cid = responseJson?.cid;
    // const cid = await uploadImage(mediaFiles[0]);
    console.log("Image cid ", cid);
    console.log({ mediaFiles });
    // access file here

    const postData = {
      version: "2.0.0",
      mainContentFocus: "IMAGE",
      metadata_id: uuidv4(),
      description: "Description",
      locale: "en-US",
      content: "Content Testing",
      external_url: null,
      image: `ipfs://${cid}`,
      imageMimeType: mediaFiles[0].type,
      name: mediaFiles[0].name,
      attributes: [
        { traitType: "type", displayType: "string", value: "image" },
      ],
      media: [
        {
          item: `ipfs://${cid}`,
          type: mediaFiles[0].type,
        },
      ],
      appId: "react_lens",
    };
    // const bufferData = Buffer.from(JSON.stringify(postData));
    validatePublicationMetadata(postData);
    // image: `ipfs://${cid}`,
    // imageMimeType: mediaFiles[0]?.type,

    cidRef.current = await uploadDataToIpfs(postData);
  }

  return (
    <div>
      {/* <form> */}
      <h4>File Upload</h4>
      <input type={"File"} onChange={uploadFile} />
      {/* </form> */}
      <button
        onClick={() => {
          createNewPost(cidRef.current);
        }}
      >
        Create Post
      </button>
    </div>
  );
}

export default CreatePost;
