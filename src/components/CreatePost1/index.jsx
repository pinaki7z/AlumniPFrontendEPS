import React, { useState, useRef } from "react";
import "../CreatePost/socialWall.css";
import picture from "../../images/profilepic.jpg";
import axios from "axios";
import JobsInt from "../JobsInt";
import { useCookies } from "react-cookie";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import video from "../../images/videocam.svg";
import gallery from "../../images/gallery.svg";
import poll from "../../images/poll.svg";
import PollModal from "./PollModal";
import baseUrl from "../../config";
import { Avatar } from "@mui/material";

const CreatePost1 = ({
  name,
  onNewPost,
  entityType,
  closeButton,
  close,
  postId,
  getPosts
}) => {
  const { _id } = useParams();
  const page = 1;
  const [isExpanded, setExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [picturePath, setPicturePath] = useState([]);
  const [videoPath, setVideoPath] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [posts, setPosts] = useState([]);
  const [imgUrl, setImgUrl] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [cookie, setCookie] = useCookies(["access_token"]);
  const profile = useSelector((state) => state.profile);
  const [showPollModal, setShowPollModal] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const onHideModal = (modalVisibility) => {
    setShowModal(modalVisibility);
  };

  const handleInputClick = () => {
    setExpanded(!isExpanded);
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length === 1) {
      console.log("ONLY ONE FILE");
      const file = files[0];
      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result;
        setPicturePath([base64String]);
      };
      reader.readAsDataURL(file);

      setSelectedFiles([]);
    } else if (files.length > 1) {
      if (files.length > 5) {
        alert("Maximum limit is 5 files");
        return;
      }
      setSelectedFile(null);
      const filePromises = files.map((file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });
      Promise.all(filePromises)
        .then((base64Strings) => {
          console.log("Base64 strings:", base64Strings);
          setSelectedFiles(base64Strings);
          setPicturePath(base64Strings);
        })
        .catch((error) =>
          console.error("Error converting files to base64:", error)
        );
    }

    simulateUpload();
  };

  const handleImageChange = async (e) => {
    const files = e.target.files;
    if (!files.length) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }

    try {
      // Post the images to the server
      const response = await axios.post(`${baseUrl}/uploadImage/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Update gallery with uploaded image URLs
      setPicturePath(response.data);
    } catch (error) {
      console.error("Error uploading files", error);
    }
  };
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    console.log("file", file);

    // Create a FormData object
    const formData = new FormData();
    formData.append('video', file); // 'video' should match the field name expected by the server

    // Send the FormData via Axios
    axios.post(`${baseUrl}/uploadImage/video`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        setVideoPath(res.data);
      })
      .catch(err => {
        console.log(err);
      });
  };


  const simulateUpload = () => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => setUploadProgress(0), 1000);
      }
    }, 500);
  };

  const removeMedia = (index) => {
    const newPicturePath = [...picturePath];
    newPicturePath.splice(index, 1);
    setPicturePath(newPicturePath);

    if (selectedFile && index === 0) {
      setSelectedFile(null);
    } else {
      const newSelectedFiles = [...selectedFiles];
      newSelectedFiles.splice(index, 1);
      setSelectedFiles(newSelectedFiles);
    }
  };


  const newHandleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      userId: profile._id,
      description: input,
      department: profile.department,
      profilePicture: profile.profilePicture,
    };

    if (_id) payload.groupID = _id;
    if (picturePath) payload.picturePath = picturePath;
    if (videoPath) payload.videoPath = videoPath;

    console.log("payload", payload);

    axios.post(
      `${baseUrl}/${entityType}/create`,
      payload
    ).then((res) => {
      setImgUrl("");
      setSelectedFile(null);
      setPicturePath([]);
      setVideoPath({});
      setInput("")
      getPosts(1);
    }).catch((err) => {
      console.log(err);
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("userId", profile._id);
    formData.append("description", input);
    formData.append("department", profile.department);
    formData.append("profilePicture", profile.profilePicture);
    if (_id) formData.append("groupID", _id);
    if (picturePath) {
      formData.append("picturePath", picturePath);
    }
    if (videoPath) {
      formData.append("videoPath", videoPath);
    }
    // if (selectedFile) {
    //   console.log("selected file is present", selectedFile);
    //   if (selectedFile.type.startsWith("image/")) {
    //     console.log("picture", picturePath);
    //     const reader = new window.FileReader();
    //     reader.onload = function (event) {
    //       const dataURL = event.target.result;

    //       const formDataObject = {
    //         picturePath: picturePath[0],
    //       };

    //       for (let pair of formData.entries()) {
    //         const key = pair[0];
    //         const value = pair[1];

    //         formDataObject[key] = value;
    //         console.log("FORMDATAOBJECT:", formDataObject);
    //       }
    //       uploadImage(formDataObject);
    //     };
    //     reader.readAsDataURL(selectedFile);
    //   } else {
    //     console.log("videoPath is present");
    //     formData.append("videoPath", selectedFile);
    //     const formDataObject = {};

    //     for (let pair of formData.entries()) {
    //       const key = pair[0];
    //       const value = pair[1];

    //       formDataObject[key] = value;
    //     }

    //     const currentDate = new Date();
    //     const folderName = currentDate.toISOString().split("T")[0];
    //     console.log("folder name:", folderName);

    //     uploadData(formDataObject, folderName);
    //   }
    // } else if (selectedFiles.length > 0) {
    //   console.log("selected files are present", selectedFiles);
    //   const formDataObject = {
    //     picturePath: picturePath,
    //   };

    //   for (let pair of formData.entries()) {
    //     const key = pair[0];
    //     const value = pair[1];
    //     formDataObject[key] = value;
    //   }
    //   console.log("FORMDATAOBJECT:", formDataObject);
    //   uploadImage(formDataObject);
    // } else {
    //   console.log("elseee");
    //   const formDataObject = {};

    //   for (let pair of formData.entries()) {
    //     const key = pair[0];
    //     const value = pair[1];

    //     formDataObject[key] = value;
    //     console.log("FORMDATAOBJECT:", formDataObject);
    //   }

    //   try {
    //     if (close) {
    //       console.log("EDITING POST");
    //       const response = await axios.put(
    //         `${baseUrl}/${entityType}/${postId}`,
    //         formDataObject
    //       );
    //       const newPost = await response.data;
    //       //onNewPost(newPost);
    //       setInput("");
    //       setImgUrl("");
    //       window.location.reload();
    //     } else {
    //       const response = await axios.post(
    //         `${baseUrl}/${entityType}/create`,
    //         formDataObject
    //       );
    //       const newPost = await response.data;
    //       onNewPost(newPost);
    //       setInput("");
    //       setImgUrl("");
    //       window.location.reload();
    //     }
    //   } catch (error) {
    //     console.error("Error posting:", error);
    //   }
    // }
    // console.log("formdata", formData)
    // axios.post(
    //   `${baseUrl}/${entityType}/create`,
    //   formData
    // ).then((res)=>{
    //   setImgUrl("");
    //   setSelectedFile(null);
    //   setPicturePath([])
    //   setVideoPath({})
    //   getPosts()

    // }).catch((err)=>{
    //   console.log(err)
    // })
  };

  const uploadData = async (formDataObject, folderName) => {
    try {
      console.log("request body", formDataObject);
      if (close) {
        console.log("EDITING POST");
        const response = await axios.put(
          `${baseUrl}/${entityType}/${postId}?folder=${folderName}`,
          formDataObject,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const newPost = await response.data;
        console.log(newPost);
        //onNewPost(newPost);
        setInput("");
        setImgUrl("");
        setSelectedFile(null);
        window.location.reload();
      } else {
        const response = await axios.post(
          `${baseUrl}/${entityType}/create?folder=${folderName}`,
          formDataObject,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const newPost = await response.data;
        console.log(newPost);
        onNewPost(newPost);
        setInput("");
        setImgUrl("");
        setSelectedFile(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  const uploadImage = async (formDataObject) => {
    try {
      console.log("request body", formDataObject);
      if (close) {
        const response = await axios.put(
          `${baseUrl}/${entityType}/${postId}`,
          formDataObject
        );
        const newPost = await response.data;
        //onNewPost(newPost);
        setInput("");
        setImgUrl("");
        setSelectedFile(null);
        window.location.reload();
      } else {
        const response = await axios.post(
          `${baseUrl}/${entityType}/create`,
          formDataObject
        );
        const newPost = await response.data;
        onNewPost(newPost);
        setInput("");
        setImgUrl("");
        setSelectedFile(null);
        window.location.reload();
      }
    } catch (error) {
      console.error("Error posting:", error);
    }
  };

  const handleCreatePoll = async (question, options, multipleAnswers) => {
    console.log("question1", question, options, multipleAnswers);
    const pollData = {
      userId: profile._id,
      userName: `${profile.firstName} ${profile.lastName}`,
      profilePicture: profile.profilePicture,
      question: question,
      options: options,
      multipleAnswers,
    };
    if (_id) pollData.groupID = _id;

    try {
      const response = await axios.post(`${baseUrl}/poll/createPoll`, pollData);
      const newPoll = await response.data;
      onNewPost(newPoll);
      setInput("");
      setShowPollModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error creating poll:", error);
    }
  };

  return (
    <div
      className={`social-media-post border w-full p-3 rounded shadow-sm ${isExpanded ? "expanded" : ""
        }`}
    >
      <div
        className={`overlay ${isExpanded ? "expanded" : ""}`}
        onClick={handleInputClick}
      ></div>
      <div
        className={`card ${isExpanded ? "expanded" : ""}`}
        style={{ border: "none", paddingTop: "0px" }}
      >
        <div
          className="card-header"
          style={{
            backgroundColor: "white",
            borderBottom: "none",
            padding: "0px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Avatar
              src={profile.profilePicture || picture}
              alt="Profile"
              style={{ borderRadius: "50%", width: "60px", height: "58px" }}
            />
            <div style={{ width: "93%" }}>
              <textarea
                type="text"
                value={input}
                className="w-full p-2 rounded border-2"
                rows={3}
                onChange={(e) => setInput(e.target.value)}
                placeholder="What's Going on??"
              />
            </div>
            {close && <button onClick={closeButton}>Close</button>}
          </div>
        </div>
        {picturePath.length > 0 && (
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {picturePath.map((path, index) => (
              <div key={index} className="relative">

                <img
                  src={path}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded"
                />

                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                >
                  X
                </button>
              </div>
            ))}


          </div>


        )}

        {videoPath?.videoPath &&
          <div className="w-50 ">

            <video
              src={videoPath?.videoPath}
              className="h-40  object-cover rounded"
              controls
            />
            <div className="flex justify-center bg-red">
              <button
                onClick={() => setVideoPath({})}
                className=" text-white rounded-full p-1 w-full  flex items-center justify-end"
              >
                Remove
              </button>
            </div>


          </div>
        }
        {uploadProgress > 0 && (
          <div className="mt-2 w-full">
            <div className="bg-gray-200 rounded-full h-2.5 w-full">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {uploadProgress}% uploaded
            </p>
          </div>
        )}
        <div
          className={`mt-2 flex flex-col gap-3 lg:ml-20 sm:flex-row justify-between items-center ${isExpanded ? "expanded" : ""
            }`}
        >
          <div className="flex gap-4 w-full  sm:mb-0">
            <label
              className="flex-1 sm:flex-none sm:w-[140px]"
              style={{
                border: "1px solid #F8A700",
                color: "black",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "3em",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "15px",
                gap: "5px",
              }}
            >
              <img src={gallery} alt="" />
              <div className="hidden sm:block">Image</div>
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageChange}
                multiple
              />
            </label>
            <button
              className="flex-1 sm:flex-none sm:w-[140px]"
              style={{
                backgroundColor: "white",
                color: "black",
                padding: "5px 10px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                fontSize: "15px",
                borderRadius: "3em",
                border: "1px solid #F8A700",
              }}
              onClick={() => setShowPollModal(true)}
            >
              <img src={poll} alt="" />
              <div className="hidden sm:block">Poll</div>
            </button>
            <label
              className="flex-1 sm:flex-none sm:w-[140px]"
              style={{
                border: "1px solid #F8A700",
                color: "black",
                padding: "5px 10px",
                cursor: "pointer",
                borderRadius: "3em",
                fontSize: "15px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <img src={video} alt="" />
              <div className="hidden sm:block">Video</div>
              <input
                type="file"
                accept="video/*"
                style={{ display: "none" }}
                onChange={handleVideoChange}
              />
            </label>
          </div>
          <div className="w-full   lg:w-[150px] ">
            <button
              className=" h-10  "
              onClick={newHandleSubmit}
              style={{
                color: "#ffffff",
                float: "right",
                backgroundColor: "#F8A700",
                borderColor: "#174873",
                fontSize: "20px",
                padding: "5px 10px",
                borderRadius: "5px",
                width: "100%",
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
      <PollModal
        show={showPollModal}
        onHide={() => setShowPollModal(false)}
        onCreatePoll={handleCreatePoll}
      />
    </div>
  );
};

export default CreatePost1;
