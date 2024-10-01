import React from "react";
import {
  ThumbUpRounded,
  ChatBubbleOutlineRounded,
  NearMeRounded,
  DeleteRounded,
  MoreVert,
} from "@mui/icons-material";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import {
  Avatar,
  TextField,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Modal,
  Box,
  Button,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import "./Post.scss";
import { useSelector } from "react-redux";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { useParams } from "react-router-dom";
import deleteButton from "../../images/delete.svg";
import commentIcon from "../../images/comment.svg";
import share from "../../images/share.svg";
import liked from "../../images/liked.svg";
import unliked from "../../images/unliked.svg";
import postDelete from "../../images/post-delete.svg";
import baseUrl from "../../config";
import CreatePost1 from "../CreatePost1";
import { FaHandsClapping } from "react-icons/fa6";
import { ImSmile2 } from "react-icons/im";
import { BiSolidLike } from "react-icons/bi";

function Post({
  userId,
  postId,
  profilePicture,
  username,
  text,
  timestamp,
  image,
  video,
  likes,
  smile,
  thumbsUp,
  clap,
  handleLikes,
  handleComments,
  className,
  onDeletePost,
  entityType,
  showDeleteButton,
  groupID,
  archived,
  profileLevel
}) {
  console.log("video pathh", video);

  const PrevButton = ({ onClick }) => {
    return (
      <button
        className="slick-arrow slick-prev"
        style={{ background: "black" }}
        onClick={onClick}
      >
        Previous
      </button>
    );
  };

  const NextButton = ({ onClick }) => {
    return (
      <button
        className="slick-arrow slick-next"
        style={{ background: "black" }}
        onClick={onClick}
      >
        Next
      </button>
    );
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    prevArrow: <PrevButton />,
    nextArrow: <NextButton />,
  };

  const { _id } = useParams();
  const [isLiked, setLiked] = useState(false);
  const [isThumbsUp, setIsThumbsUp] = useState(false);
  const [isClapped, setIsClapped] = useState(false);
  const [isSmile, setIsSmile] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [cookie, setCookie] = useCookies(["access_token"]);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const videoRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const loggedInUserId = profile._id;
  const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  console.log('profile level 1', username)


  console.log("groupIds in feed", _id, groupID);

  const handlePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        try {
          await videoRef.current.pause();
          setIsPlaying(false);
        } catch (error) {
          console.error("Error playing video:", error);
        }
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };


  const fetchComments = async () => {
    try {
      const response = await axios.get(`${baseUrl}/posts/${postId}/comments`);
      const fetchedComments = response.data.comments;
      setComments(fetchedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const handleLike = async (e) => {
    setLiked(!isLiked);
    try {
      const response = await axios.patch(
        `${baseUrl}/posts/${postId}/likes`,
        {
          userId: loggedInUserId,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleThumbsUp = async (e) => {
    setIsThumbsUp(!isThumbsUp);
    try {
      const response = await axios.patch(
        `${baseUrl}/posts/${postId}/thumbsUp`,
        {
          userId: loggedInUserId,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSmile = async (e) => {
    setIsSmile(!isSmile);
    try {
      const response = await axios.patch(
        `${baseUrl}/posts/${postId}/smile`,
        {
          userId: loggedInUserId,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleClap = async (e) => {
    setIsClapped(!isClapped);
    try {
      const response = await axios.patch(
        `${baseUrl}/posts/${postId}/clap`,
        {
          userId: loggedInUserId,
          userName: `${profile.firstName} ${profile.lastName}`,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const id = await response.data._id;
      handleLikes(id);
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleDeletePost = async (userId) => {
    if (userId === profile._id) {
      try {
        await axios.delete(`${baseUrl}/${entityType}/${postId}`);
        onDeletePost(postId);
      } catch (error) {
        console.error("Error deleting post:", error);
      }
    } else {
      console.log("Cannot Delete");
    }
  };

  const handleEditPost = () => {
    console.log("Edit post");
    setMenuAnchor(null);
    setShowCreatePost(true);
  };

  const handleArchivePost = () => {
    setMenuAnchor(null);
    setIsArchiveModalOpen(true);
  };

  const confirmArchivePost = async () => {
    setIsArchiveModalOpen(false);
    try {
      const url = `${baseUrl}/posts/${postId}/archive`;
      const response = await axios.put(url);

      if (response.status === 200) {
        console.log("Post archived successfully");
        //toast.success("Post archived successfully");
        // Optionally, update UI state or reload the page
        window.location.reload(); // Refresh the page to reflect changes
      } else {
        console.error("Failed to archive post");
        //toast.error("Failed to archive post");
      }
    } catch (error) {
      console.error("Error occurred while archiving post:", error);
      //toast.error("Error occurred while archiving post");
    }
  };

  const formatCreatedAt = (timestamp) => {
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    const timeString = new Date(timestamp).toLocaleTimeString(
      undefined,
      options
    );
    const dateString = new Date(timestamp).toLocaleDateString();

    return `${dateString} ${timeString}`;
  };

  const handleOpenReactionsModal = () => {
    setIsReactionsModalOpen(true);
  };

  // Handle closing of reactions modal
  const handleCloseReactionsModal = () => {
    setIsReactionsModalOpen(false);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };
  return (
    <div className={`   ${className}`}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className=" flex mb-2 justify-between items-center  ">
            <div className="flex ">
              {profilePicture ? (
                <img
                  src={profilePicture}
                  style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                />
              ) : (
                <Avatar src={comment} style={{ width: "50px", height: "50px" }} />
              )}
              <div className="info">
                <h4>{username}</h4>
                <span
                  style={{
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#004C8A",
                  }}
                >
                  {formatCreatedAt(timestamp)}
                </span>
              </div>
            </div>
            {console.log('profile level', profile.profileLevel)}
            {(profileLevel === 0 || userId === profile._id) && (
              <>
                <IconButton
                  onClick={(e) => setMenuAnchor(e.currentTarget)}
                  className="more-button"
                  style={{ marginLeft: "auto", color: "black" }}
                >
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem onClick={handleEditPost}>Edit</MenuItem>
                  <MenuItem onClick={handleArchivePost}>
                    {archived ? "Unarchive" : "Archive"}
                  </MenuItem>
                  <MenuItem onClick={() => setIsDeleteModalOpen(true)}>
                    Delete
                  </MenuItem>
                </Menu>
              </>
            )}
          </div>
          {text && (
            <div className="texxt">
              <p>{text}</p>
            </div>
          )}
          {image.length > 1 ? (
            <Slider {...settings}>
              {image.map((img, index) => (
                <div key={index} className="flex justify-center">
                  <img src={img} className=" object-cover" alt={`Post Image ${index + 1}`} />
                </div>
              ))}
            </Slider>
          ) : image.length === 1 ? (
            <div>
              <img
                className="shadow-sm"
                src={image}
                alt={`image`}
                style={{ width: "-webkit-fill-available", borderRadius: "5px" }}
              />
            </div>
          ) : null}

          {video && (
            <div className="relative video-player-container w-full">
              <video
                ref={videoRef}
                className="w-full h-auto rounded-md"
                autoPlay={false}
                preload="auto"
                controls={false}
                onClick={handlePlayPause}
              >
                <source src={video.videoPath} type="video/mp4" />
                Your browser does not support the video tag.
              </video>

              {/* Play/Pause Button */}
              <div
                className={`absolute inset-0 flex justify-center items-center transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"
                  }`}
                onClick={handlePlayPause}
              >
                {isPlaying ? (
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="90"
                      height="90"
                      fill="currentColor"
                      style={{ color: "white" }}
                      class="bi bi-pause-btn"
                      viewBox="0 0 16 16"
                    >
                      <path d="M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5" />
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                    </svg>
                  </div>
                ) : (
                  <div>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="90"
                      height="90"
                      fill="currentColor"
                      class="bi bi-play-btn"
                      style={{ color: "white" }}
                      viewBox="0 0 16 16"
                    >
                      <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                      <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Custom Play/Pause Button (Visible when clicked) */}
              <button
                className="absolute bottom-4 w-[150px] left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full"
                onClick={handlePlayPause}
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
            </div>
          )}
          <div
            className="reactions-count"
            onClick={handleOpenReactionsModal}
            style={{ cursor: "pointer" }}
          >
            {/* {likes.length + smile.length + thumbsUp.length + clap.length} people reacted */}
          </div>
          {/* <Modal open={isReactionsModalOpen} onClose={handleCloseReactionsModal}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: 400,
                bgcolor: 'background.paper',
                border: '2px solid #000',
                boxShadow: 24,
                p: 4,
                display: 'flex',
                flexDirection: 'column',
                width: 'auto',
                height: 'auto'
              }}
            >
              <Typography variant="h6" component="h2">
                Reactions
              </Typography>
              <div style={{display: 'flex', gap: '30px'
              }}>
                <Box sx={{ mt: 2,minWidth: '200px' }}>

                  <Typography variant="body1">
                  <img src={liked} alt="" style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  </Typography>
                  <ul style={{paddingLeft: '0px'}}>
                    {likes.map((user) => (
                      <li key={user.userId} style={{listStyleType: 'none',paddingTop: '20px'}}>{user.userName}</li>
                    ))}
                  </ul>
                </Box>
                <Box sx={{ mt: 2,minWidth: '200px' }}>
                  <Typography variant="body1">
                  <ImSmile2 style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  </Typography>
                  <ul style={{paddingLeft: '0px'}}>
                    {smile.map((user) => (
                      <li key={user.userId} style={{listStyleType: 'none',paddingTop: '20px'}}>{user.userName}</li>
                    ))}
                  </ul>
                </Box>
                <Box sx={{ mt: 2,minWidth: '200px' }}>
                  <Typography variant="body1">
                  <BiSolidLike style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  </Typography>
                  <ul style={{paddingLeft: '0px'}}>
                    {thumbsUp.map((user) => (
                      <li key={user.userId} style={{listStyleType: 'none',paddingTop: '20px'}}>{user.userName}</li>
                    ))}
                  </ul>
                </Box>
                <Box sx={{ mt: 2,minWidth: '200px'}}>
                  <Typography variant="body1">
                  <FaHandsClapping style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                  </Typography>
                  <ul style={{paddingLeft: '0px'}}>
                    {clap.map((user) => (
                      <li key={user.userId} style={{listStyleType: 'none',paddingTop: '20px'}}>{user.userName}</li>
                    ))}
                  </ul>
                </Box>
              </div>
              <Button onClick={handleCloseReactionsModal} variant="contained" sx={{ mt: 3 }}>
                Close
              </Button>
            </Box>
          </Modal> */}
          {entityType === "posts" && (
            <div className="bottomAction" style={{ padding: "25px" }}>
              {isThumbsUp ? (
                <BiSolidLike
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#004C8A",
                    cursor: "pointer",
                  }}
                  onClick={handleThumbsUp}
                />
              ) : (
                <BiSolidLike
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  onClick={handleThumbsUp}
                />
              )}
              {isSmile ? (
                <ImSmile2
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#004C8A",
                    cursor: "pointer",
                  }}
                  onClick={handleSmile}
                />
              ) : (
                <ImSmile2
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  onClick={handleSmile}
                />
              )}
              {isClapped ? (
                <FaHandsClapping
                  style={{
                    width: "20px",
                    height: "20px",
                    color: "#004C8A",
                    cursor: "pointer",
                  }}
                  onClick={handleClap}
                />
              ) : (
                <FaHandsClapping
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  onClick={handleClap}
                />
              )}
              {isLiked ? (
                <img
                  src={liked}
                  alt=""
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  onClick={handleLike}
                />
              ) : (
                <img
                  src={unliked}
                  alt=""
                  style={{ width: "20px", height: "20px", cursor: "pointer" }}
                  onClick={handleLike}
                />
              )}

              {/* <div className='action' onClick={handleLike}>
                {isLiked ? (
                  <img src={liked} alt="" />
                ) : (
                  <img src={unliked} alt="" />
                )}
                <h4>{isLiked ? 'Liked' : 'Like'}</h4>
              </div> */}
            </div>
          )}
        </>
      )}
      {showCreatePost && (
        <div className="post-overlay">
          <div className="post-overlay-content">
            <CreatePost1
              closeButton={() => setShowCreatePost(false)}
              close={true}
              entityType="posts"
              postId={postId}
            />
          </div>
        </div>
      )}
      {/* <Modal
        open={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        aria-labelledby="archive-modal-title"
        aria-describedby="archive-modal-description"
      >
        <Box sx={{ ...modalStyle, width: 400 }}>
          <Typography id="archive-modal-title" variant="h6" component="h2">
            Are you sure you want to {archived ? "unarchive" : "archive"} this
            post?
          </Typography>
          <Box mt={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={confirmArchivePost}
            >
              Yes
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => setIsArchiveModalOpen(false)}
              sx={{ ml: 2 }}
            >
              No
            </Button>
          </Box>
        </Box>
      </Modal> */}
      {isArchiveModalOpen && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
          <h2 className="text-lg font-bold mb-4">Archive Post</h2>
          <p>Are you sure you want to archive this Post?</p>
          <div className="flex justify-end mt-4">
            <button onClick={confirmArchivePost} className="bg-red-600 text-white py-2 px-4 rounded-md" style={{color: 'white', backgroundColor: '#004C8A'}}>Yes</button>
            <button onClick={() => setIsArchiveModalOpen(false)} className="ml-2 bg-gray-200 py-2 px-4 rounded-md">No</button>
          </div>
        </div>
      )}
      {isDeleteModalOpen && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                    <h2 className="text-lg font-bold mb-4">Delete Post</h2>
                    <p>Are you sure you want to delete this post?</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={()=>handleDeletePost(userId)} className="bg-red-600 text-white py-2 px-4 rounded-md" style={{color: 'white', backgroundColor: '#004C8A'}}>Yes</button>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="ml-2 bg-gray-200 py-2 px-4 rounded-md">No</button>
                    </div>
                </div>
            )}
    </div>
  );
}

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default Post;
