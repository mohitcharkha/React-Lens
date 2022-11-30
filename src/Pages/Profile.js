import React from "react";
import { image } from "../assets";
import "./Profile.css";

const Profile = () => {
  return (
    <>
      <h1>Profile Page</h1>
      {[0, 1, 2].map(() => {
        return (
          <div className="bodyContainer">
            <div
              style={{
                borderWidth: 10,
                margin: 20,
                borderRadius: 10,
                overflow: "hidden",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <img
                src={image}
                height={200}
                width={200}
                style={{
                  height: 200,
                  width: 200,
                  borderRadius: 20,
                  zIndex: 1,
                  marginVertical: 20,
                }}
                alt={"Profile"}
              />
              <img
                src={image}
                height={220}
                width={220}
                style={{
                  marginLeft: -170,
                  borderRadius: 20,
                  zIndex: 2,
                  opacity: 1,
                }}
                alt={"Profile"}
              />
              <img
                src={image}
                height={240}
                width={240}
                style={{
                  marginLeft: -190,
                  borderRadius: 20,
                  zIndex: 3,
                  opacity: 1,
                }}
                alt={"Profile"}
              />
            </div>
            <div className="BorderBox">
              <p
                className="AddToThreadButton"
                // onClick={history.push("/publish")}
              >
                + Add To The Thread
              </p>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Profile;
