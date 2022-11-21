import React, { useRef } from "react";
import { commentPost, createPost } from "../utils";
import { v4 as uuidv4 } from "uuid";

function CreatePost({ type, setTypedData }) {
  async function createNewPost(cid) {
    console.log("create new post", { cid });
    const response = await createPost(cid);
    setTypedData(response?.data?.createPostTypedData?.typedData);
    console.log(response?.data?.createPostTypedData?.typedData);
  }
  async function createComment(cid) {
    console.log("create comment", { cid });
    const response = await commentPost(cid);
    setTypedData(response?.data?.createCommentTypedData?.typedData);
    console.log(response?.data?.createCommentTypedData?.typedData);
  }

  const token =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDYxRjA0OWJjYTJFOWQyOGEyNTNmOTM0MDhDYzk3Q0YyMzIxOTFmM0IiLCJpc3MiOiJ3ZWIzLXN0b3JhZ2UiLCJpYXQiOjE2Njc0ODUzNTQ4NTksIm5hbWUiOiJGaXJzdCBUb2tlbiJ9.eArlzoXBOs_rac_Zk8OHdv7kT1oa3RxEJ4zaoLg5WtY";
  const cidRef = useRef(
    "ipfs://bafkreidlk5omzwhe2o4uic6wzfy32otfjuix3zhd2tez5iupmgtxrnqjpi"
  );

  async function handleChange(event) {
    const mediaFiles = event.target.files;
    // let formData = new FormData(); //formdata object
    console.log({ image: mediaFiles[0] });

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
      // media: mediaFiles,
      tags: ["using_api_examples"],
      appId: "api_examples_github",
    };

    // formData.append("file", data);
    console.log({ postData });
    const response = await fetch("https://api.web3.storage/upload", {
      method: "POST",
      headers: {
        // "X-NAME": mediaFiles[0].name,
        Authorization: `Bearer ${token}`,
        contentType: "application/json",
      },
      body: JSON.stringify(postData),
    });
    const responseJson = await response?.json();
    const cid = responseJson?.cid;
    console.log("Content added with CID:", cid);
    cidRef.current = "ipfs://" + cid;
  }

  return (
    <div>
      <form>
        <h4>File Upload</h4>
        <input type="file" onChange={handleChange} />
        <button type="submit">
          {/* {type === "POST" ? "Upload" : "Comment"} */}
          Upload
        </button>
      </form>
      <button
        onClick={() => {
          if (type === "POST") {
            createNewPost(cidRef.current);
          } else {
            createComment(cidRef.current);
          }
        }}
      >
        Create POST
        {/* {type === "POST" ? "Create Post" : "Create Comment"} */}
      </button>
    </div>
  );
}

export default CreatePost;
