import React, { useRef } from "react";
import {
  createPost,
  uploadDataToIpfs,
  uploadMetaData,
  uploadToNFTPort,
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
    // const imageLink = `${cid}.ipfs.w3s.link`;
    // const imageLink =
    const imageLink = `ipfs://${cid}`;
    //   "https://static.plgworks.com/assets/images/open-source/applogger.png";

    // const postData = {
    //   description: "Description",
    //   file_url: imageLink,
    //   name: mediaFiles[0].name,
    //   attributes: [
    //     { trait_type: "type", displayType: "string", value: "image" },
    //   ],
    //   custom_fields: {
    //     version: "2.0.0",
    //     mainContentFocus: "IMAGE",
    //     metadata_id: uuidv4(),
    //     locale: "en-US",
    //     content: "Content Testing",
    //     external_url: null,
    //     imageMimeType: mediaFiles[0].type,
    //     media: [
    //       {
    //         item: imageLink,
    //         type: mediaFiles[0].type,
    //       },
    //     ],
    //     appId: "react_lens",
    //   },
    // };
    // const bufferData = Buffer.from(JSON.stringify(postData));
    // validatePublicationMetadata(postData);
    // image: `ipfs://${cid}`,
    // imageMimeType: mediaFiles[0]?.type,

    const postData = {
      version: "2.0.0",
      mainContentFocus: "IMAGE",
      metadata_id: uuidv4(),
      description: "Description",
      locale: "en-US",
      content: "Image",
      image: imageLink,
      imageMimeType: mediaFiles[0].type,
      name: mediaFiles[0].name,
      attributes: [],
      media: [
        {
          item: imageLink,
          type: mediaFiles[0].type,
        },
      ],
      tags: [],
      appId: "react_lens",
    };
    validatePublicationMetadata(postData);

    cidRef.current = await uploadDataToIpfs(postData);
    // cidRef.current = await uploadToNFTPort(postData);
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
