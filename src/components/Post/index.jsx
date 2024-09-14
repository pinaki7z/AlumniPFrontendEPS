import React from 'react';
import { ThumbUpRounded, ChatBubbleOutlineRounded, NearMeRounded, DeleteRounded, MoreVert } from '@mui/icons-material';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Avatar, TextField, IconButton, Typography, Menu, MenuItem, Modal, Box, Button } from '@mui/material';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import './Post.scss';
import { useSelector } from 'react-redux';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useParams } from "react-router-dom";
import deleteButton from "../../images/delete.svg";
import commentIcon from "../../images/comment.svg";
import share from "../../images/share.svg";
import liked from "../../images/liked.svg";
import unliked from "../../images/unliked.svg";
import postDelete from "../../images/post-delete.svg";
import baseUrl from "../../config";
import CreatePost1 from '../CreatePost1';
import { FaHandsClapping } from "react-icons/fa6";
import { ImSmile2 } from "react-icons/im";
import { BiSolidLike } from "react-icons/bi";

function Post({ userId, postId, profilePicture, username, text, timestamp, image, video, likes, smile, thumbsUp, clap, handleLikes, handleComments, className, onDeletePost, entityType, showDeleteButton, groupID, archived }) {
  console.log('video pathh', video);

  const PrevButton = ({ onClick }) => {
    return <button className="slick-arrow slick-prev" style={{ background: 'black' }} onClick={onClick}>Previous</button>;
  };

  const NextButton = ({ onClick }) => {
    return <button className="slick-arrow slick-next" style={{ background: 'black' }} onClick={onClick}>Next</button>;
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
    nextArrow: <NextButton />
  };

  const { _id } = useParams();
  const [isLiked, setLiked] = useState(false);
  const [isThumbsUp, setIsThumbsUp] = useState(false);
  const [isClapped, setIsClapped] = useState(false);
  const [isSmile, setIsSmile] = useState(false);
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState([]);
  const [cookie, setCookie] = useCookies(['access_token']);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const videoRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const loggedInUserId = profile._id;
  const [isReactionsModalOpen, setIsReactionsModalOpen] = useState(false);
  let admin;
  if (profile.profileLevel === 0) {
    admin = true;
  }

  console.log('groupIds in feed', _id, groupID);

  const handlePlay = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        try {
          await videoRef.current.pause();
          setIsPlaying(false);
        } catch (error) {
          console.error('Error playing video:', error);
        }
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };



  // useEffect(() => {
  //   if (loggedInUserId && postId) {
  //     const postLiked = likes.some((like) => like.userId === loggedInUserId);
  //     setLiked(postLiked);
  //     const postSmiled = smile.some((smile) => smile.userId === loggedInUserId);
  //     setIsSmile(postSmiled);
  //     const postClapped = clap.some((clap) => clap.userId === loggedInUserId);
  //     setIsClapped(postClapped);
  //     const postThumbsUp = thumbsUp.some((thumbsUp) => thumbsUp.userId === loggedInUserId);
  //     setIsThumbsUp(postThumbsUp);
  //   }
  // }, [likes, loggedInUserId, postId, smile, thumbsUp, clap]);

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
        console.error('Error deleting post:', error);
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
    const options = { hour: 'numeric', minute: 'numeric', hour12: true };
    const timeString = new Date(timestamp).toLocaleTimeString(undefined, options);
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

  return (
    <div className={`   ${className}`}>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <div className=' flex mb-2 justify-between items-center  '>
            {profilePicture ? (
              <img src={profilePicture} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
            ) : (
              <Avatar src={comment} style={{ width: '50px', height: '50px' }} />
            )}
            <div className='info'>
              <h4>{username}</h4>
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#004C8A' }}>{formatCreatedAt(timestamp)}</span>
            </div>
            {(admin || userId === profile._id) && (
              <>
                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} className='more-button' style={{ marginLeft: 'auto', color: 'black' }}>
                  <MoreVert />
                </IconButton>
                <Menu
                  anchorEl={menuAnchor}
                  open={Boolean(menuAnchor)}
                  onClose={() => setMenuAnchor(null)}
                >
                  <MenuItem onClick={handleEditPost}>Edit</MenuItem>
                  <MenuItem onClick={handleArchivePost}>{archived ? 'Unarchive' : 'Archive'}</MenuItem>
                  <MenuItem onClick={() => handleDeletePost(userId)}>Delete</MenuItem>
                </Menu>
              </>
            )}
          </div>
          {text && (
            <div className='texxt'>
              <p>{text}</p>
            </div>
          )}
          {image.length > 1 ? (
            <Slider {...settings}>
              {image.map((img, index) => (
                <div key={index} className=''>
                  <img  src={img} alt={`Post Image ${index + 1}`} />
                </div>
              ))}
            </Slider>
          ) : image.length === 1 ? (
            <div>
              <img className='shadow-sm'  src={image} alt={`image`} style={{ width: '-webkit-fill-available' , borderRadius:"5px"}} />
            </div>
          ) : null}

          {video && (
            <div className='video'>
              <video
                ref={videoRef}
                autoPlay={isPlaying}
                preload="auto"
                controls={false}
                onClick={handlePlay}
              >
                <source src={video.videoPath} type='video/mp4' />
                Your browser does not support the video tag.
              </video>
              <div className={`play-button ${isPlaying ? '' : ''}`} onClick={handlePlay}>
                <PlayCircleOutlineRoundedIcon fontSize='large' />
              </div>
            </div>
          )}
          <div className="reactions-count" onClick={handleOpenReactionsModal} style={{cursor: 'pointer'}}>
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
          {entityType === 'posts' && (
            <div className='bottomAction' style={{ padding: '25px' }}>

              {isThumbsUp ? (<BiSolidLike style={{ width: '20px', height: '20px', color: 'red', cursor: 'pointer' }} onClick={handleThumbsUp} />) : (
                <BiSolidLike style={{ width: '20px', height: '20px', cursor: 'pointer' }} onClick={handleThumbsUp} />
              )}
              {isSmile ? (<ImSmile2 style={{ width: '20px', height: '20px', color: 'red', cursor: 'pointer' }} onClick={handleSmile} />) : (
                <ImSmile2 style={{ width: '20px', height: '20px', cursor: 'pointer' }} onClick={handleSmile} />
              )}
              {isClapped ? (<FaHandsClapping style={{ width: '20px', height: '20px', color: 'red', cursor: 'pointer' }} onClick={handleClap} />) : (
                <FaHandsClapping style={{ width: '20px', height: '20px', cursor: 'pointer' }} onClick={handleClap} />
              )}
              {isLiked ? (
                <img src={liked} alt="" style={{ width: '20px', height: '20px', cursor: 'pointer' }} onClick={handleLike} />
              ) : (
                <img src={unliked} alt="" style={{ width: '20px', height: '20px', cursor: 'pointer' }} onClick={handleLike} />
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
              entityType='posts'
              postId={postId}
            />
          </div>
        </div>
      )}
      <Modal
        open={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        aria-labelledby="archive-modal-title"
        aria-describedby="archive-modal-description"
      >
        <Box sx={{ ...modalStyle, width: 400 }}>
          <Typography id="archive-modal-title" variant="h6" component="h2">
            Are you sure you want to {archived ? 'unarchive' : 'archive'} this post?
          </Typography>
          <Box mt={2}>
            <Button variant="contained" color="primary" onClick={confirmArchivePost}>
              Yes
            </Button>
            <Button variant="outlined" color="secondary" onClick={() => setIsArchiveModalOpen(false)} sx={{ ml: 2 }}>
              No
            </Button>
          </Box>
        </Box>
      </Modal>
    </div>
  );
}

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default Post;
