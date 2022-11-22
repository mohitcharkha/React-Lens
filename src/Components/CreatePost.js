import React, { useRef } from "react";
import { createPost, uploadDataToIpfs } from "../utils";
import { v4 as uuidv4 } from "uuid";

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

    const postData = {
      version: "2.0.0",
      mainContentFocus: "TEXT_ONLY",
      metadata_id: uuidv4(),
      description: "Description",
      locale: "en-US",
      content: "Content Testing",
      external_url: null,
      image: mediaFiles[0],
      imageMimeType: mediaFiles[0]?.type,
      name: mediaFiles[0].name,
      attributes: [],
      appId: "react_lens",
    };

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
