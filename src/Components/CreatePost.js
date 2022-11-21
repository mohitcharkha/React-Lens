import React, { useRef, useState } from "react";
import { commentPost, createPost } from "../utils";
import { v4 as uuidv4 } from "uuid";

function CreatePost({ type, setTypedData }) {
  const [commentText, setCommentText] = useState("");
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

  function uploadFile(event) {
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

    uploadDataToIpfs(postData);
  }

  async function uploadDataToIpfs(postData) {
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
    console.log({ response });
    const responseJson = await response?.json();
    const cid = responseJson?.cid;
    console.log("Content added with CID:", cid);
    cidRef.current = "ipfs://" + cid;
  }

  const updateCommentText = (event) => {
    const newText = event.target.value;
    setCommentText(newText);
    console.log({ commentText, newText });
  };

  const generateCommentPost = () => {
    const postData = {
      version: "2.0.0",
      mainContentFocus: "TEXT_ONLY",
      metadata_id: uuidv4(),
      description: "Description",
      locale: "en-US",
      content: commentText,
      external_url: null,
      attributes: [],
      appId: "react_lens",
      name: "comment",
    };
    uploadDataToIpfs(postData);
    // setCommentText("");
  };

  return (
    <div>
      {/* <form> */}
      <h4>File Upload</h4>
      <input
        type={type === "POST" ? "File" : "Text"}
        onChange={type === "POST" ? uploadFile : updateCommentText}
        value={commentText}
      />
      {type === "COMMENT" ? (
        <button onClick={generateCommentPost}>Comment</button>
      ) : null}
      {/* </form> */}
      <button
        onClick={() => {
          if (type === "POST") {
            createNewPost(cidRef.current);
          } else {
            createComment(cidRef.current);
          }
        }}
      >
        {type === "POST" ? "Create Post" : "Create Comment"}
      </button>
    </div>
  );
}

export default CreatePost;
