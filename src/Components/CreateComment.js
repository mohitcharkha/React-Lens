import React, { useRef, useState } from "react";
import { commentPost, uploadDataToIpfs } from "../utils";
import { v4 as uuidv4 } from "uuid";

const CreateComment = ({ setTypedData }) => {
  const [commentText, setCommentText] = useState("");
  async function createComment(cid) {
    console.log("create comment", { cid });
    const response = await commentPost(cid);
    setTypedData(response?.data?.createCommentTypedData?.typedData);
    console.log(response?.data?.createCommentTypedData?.typedData);
  }

  const cidRef = useRef(null);

  const updateCommentText = (event) => {
    const newText = event.target.value;
    setCommentText(newText);
    console.log({ commentText, newText });
  };

  const generateCommentPost = async () => {
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
      tags: [],
    };
    cidRef.current = await uploadDataToIpfs(postData);
    // setCommentText("");
  };

  return (
    <div>
      <h4>File Upload</h4>
      <input type="Text" onChange={updateCommentText} value={commentText} />
      <button onClick={generateCommentPost}>Comment</button>

      <button
        onClick={() => {
          createComment(cidRef.current);
        }}
      >
        Create Comment
      </button>
    </div>
  );
};

export default CreateComment;
