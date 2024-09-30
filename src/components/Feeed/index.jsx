import React, { useState, useEffect, useRef } from 'react';
import CreatePost1 from '../CreatePost1';
import Post from '../Post';
import axios from 'axios';
import './feed.scss';
import { toast } from "react-toastify";
import CommentSection from '../CommentSection';
import JobIntDisplay from '../JobsInt/JobIntDispay';
import { useSelector } from 'react-redux';
import { DisplayNews } from '../DisplayNews';
import { dotPulse } from 'ldrs';
import EventDisplay from './EventDisplay';
import { useParams } from 'react-router-dom';
import PollDisplay from './PollDisplay';
import baseUrl from '../../config';
import {
  ThumbUpRounded,
  ChatBubbleOutlineRounded,
  NearMeRounded,
  DeleteRounded,
  MoreVert,
} from "@mui/icons-material";
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
dotPulse.register();





function Feed({ photoUrl, username, showCreatePost, entityId, entityType, showDeleteButton, admin, userId, groupID, showCreateButton }) {
  const [posts, setPosts] = useState([]);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(false);
  const scrollContainerRef = useRef(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [displayCreatePost, setDisplayCreatePost] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const activePageRef = useRef(1);
  const isFetchingRef = useRef(false);
  let lastFetchedPageRef = useRef(0);
  console.log("Entity type1", entityType)
  const [jobs, setJobs] = useState([]);
  const { _id } = useParams();
  console.log('user id for profile',userId)


  const LIMIT = 4;

  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleScroll = () => {
      // console.log('scrolling', container)
      if (container) {
        const { scrollTop, clientHeight, scrollHeight } = container;
        console.log('checking for false', scrollTop + clientHeight, scrollHeight - 10)
        if (
          scrollTop + clientHeight >= scrollHeight - 10 &&
          !loading &&
          isFetchingRef.current &&
          activePageRef.current <= totalPosts / LIMIT
        ) {
          isFetchingRef.current = true;
          activePageRef.current++;
          if (posts.length < totalPosts) {
            getPosts(activePageRef.current);
          }
        }
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [loading]);



  useEffect(() => {
    console.log("useeffect");
    console.log('active and last', activePageRef.current, lastFetchedPageRef.current);
    //lastFetchedPageRef.current++;
    if (activePageRef.current !== lastFetchedPageRef.current) {
      getPosts(activePageRef.current);
    }
  }, []);


  const handleDeletePost = () => {

    getPosts(activePageRef.current);
    toast.success('Deleted successfully!');
    window.location.reload();


  }

  const handleLikes = async (entityId) => {
    try {
      const response = await axios.get(`${baseUrl}/${entityType}/${entityId}`);
      const updatedPost = response.data;


      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post._id === entityId) {
            return updatedPost;
          }
          return post;
        });
      });
    } catch (error) {
      console.error("Error fetching likes:", error);
    }
  }



  const handleNewPost = () => {
    toast.success('Posted successfully!');
    window.location.reload();
  };

  const refreshComments = async (postId) => {
    try {
      const response = await axios.get(`${baseUrl}/${entityType}/${postId}`);
      const updatedPost = response.data;
      setPosts((prevPosts) => {
        return prevPosts.map((post) => {
          if (post._id === postId) {
            return updatedPost;
          }
          return post;
        });
      });
    } catch (error) {
      console.error("Error fetching comments:", error);
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

  const getPosts = async (page) => {
    console.log('getting posts')
    setLoading(true);
    isFetchingRef.current = false;
    console.log("Getting posts/news")
    try {
      if (userId) {
        console.log('fetching user posts')
        const response = await axios.get(
          `${baseUrl}/${entityType}/userPosts/${userId}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts((prevItems) => [...prevItems, ...postsData]);
        setTotalPosts(response.data.total);
        lastFetchedPageRef.current = page;
      } else if (groupID) {
        const response = await axios.get(
          `${baseUrl}/groups/groups/${groupID}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts((prevItems) => [...prevItems, ...postsData]);
        setTotalPosts(response.data.total);
        lastFetchedPageRef.current = page;
      }
      else {
        const response = await axios.get(
          `${baseUrl}/${entityType}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts((prevItems) => [...prevItems, ...postsData]);
        setTotalPosts(response.data.total);
        lastFetchedPageRef.current = page;
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    isFetchingRef.current = true;
    setLoading(false);
  };

  const getPostsFromPage1 = async (page = 1) => {
    console.log('getting posts from page 1');
    setLoading(true);
    isFetchingRef.current = false;
    console.log("Getting posts/news from page 1");

    try {
      if (userId) {
        const response = await axios.get(
          `${baseUrl}/${entityType}/userPosts/${userId}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts(postsData);  // Replace the current posts
        setTotalPosts(response.data.total);
        lastFetchedPageRef.current = page;
      } else if (groupID) {
        const response = await axios.get(
          `${baseUrl}/groups/groups/${groupID}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts(postsData);  // Replace the current posts
        setTotalPosts(response.data.total);
        lastFetchedPageRef.current = page;
      } else {
        const response = await axios.get(
          `${baseUrl}/${entityType}?page=${page}&size=${LIMIT}`
        );
        const postsData = response.data.records;
        setPosts(postsData);  // Replace the current posts
        setTotalPosts(response.data.total);
        lastFetchedPageRef.current = page;
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally{
      setLoadingPost(false);
    }

    isFetchingRef.current = true;
    setLoading(false);
  };

  const handleEditPost = () => {
    console.log("Edit post");
    setMenuAnchor(null);
    setDisplayCreatePost(true);
  };

  const handleArchivePost = () => {
    setMenuAnchor(null);
    setIsArchiveModalOpen(true);
  };


  return (
    <div className='feed'>
      {(showCreatePost && (profile.profileLevel === 0 || profile.profileLevel === 1)) && (
        <CreatePost1
          photoUrl={photoUrl}
          username={username}
          onNewPost={handleNewPost}
          entityType={entityType}
          getPosts={getPostsFromPage1}
          loadingPost={loadingPost}
          setLoadingPost={setLoadingPost}
        />
      )}
      {showCreateButton &&
        <div style={{ width: '100%' }}>
          <button className='' style={{ fontFamily: 'Inter', fontWeight: '500', fontSize: '20px', padding: '30px', borderRadius: '8px', border: 'none', width: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}>
            Create
          </button>
        </div>}
      <div className='infiniteScroll' ref={scrollContainerRef} style={{ height: "90%", marginTop: '10px', overflowY: "auto", width: "100%", display: "flex", flexDirection: "column", alignItems: "center", paddingTop: '27px' }}>
        {posts.map((post, index) => {
          if (post.type === 'Post' && post.groupID === _id && (post.archive === false || post.archive === undefined)) {
            return (
              <div key={post._id} className="post-box p-2 lg:p-4 ">
                <Post
                  userId={post.userId}
                  postId={post._id}
                  username={post.userName}
                  text={post.description}
                  image={post.picturePath}
                  profilePicture={post.profilePicture}
                  video={post.videoPath}
                  timestamp={post.createdAt}
                  likes={post.likes}
                  thumbsUp={post.thumbsUp}
                  clap={post.clap}
                  smile={post.smile}
                  entityType={entityType}
                  admin={admin}
                  showDeleteButton={showDeleteButton}
                  handleLikes={handleLikes}
                  onDeletePost={() => handleDeletePost(post._id)}
                  groupID={post.groupID}
                  profileLevel={profile.profileLevel}
                />
                {/* {console.log("entityType", entityType)} */}
                {/* {(entityType === 'posts' || entityType === 'forums') && (profile.profileLevel === 0 || profile.profileLevel === 1) &&(<CommentSection entityId={post._id} entityType="posts" onCommentSubmit={refreshComments}
                  onDeleteComment={refreshComments} comments={post ? post.comments : null} />)} */}
              </div>
            );
          } else if (post.type === 'Internship' && (post.groupID === _id)) {
            return (
              <div key={post._id} className="post-box  p-2 lg:p-4 " style={{ width: '100%' }}>
                <div className=" flex mb-2 justify-between items-center  ">
                  <div className='flex '>
                  {post.profilePicture ? (
                    <img
                      src={post.profilePicture}
                      style={{ width: "50px", height: "50px", borderRadius: "50%" }}
                    />
                  ) : null}
                  <div className="info">
                    <h4>{post.userName}</h4>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#004C8A",
                      }}
                    >
                      {formatCreatedAt(post.createdAt)}
                    </span>
                  </div>
                  </div>
                  {(profile.profileLevel === 0 || userId === profile._id) && (
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
                          {/* {archived ? "Unarchive" : "Archive"} */}
                        </MenuItem>
                        <MenuItem onClick={() => handleDeletePost(userId)}>
                          Delete
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </div>
                <JobIntDisplay
                  jobId={post._id}
                  picture={post.coverImage}
                  jobTitle={post.title}
                  location={post.location}
                  locationType={post.locationType}
                  salaryMin={post.salaryMin}
                  userName={post.userName}
                  profilePicture={post.profilePicture}
                  salaryMax={post.salaryMax}
                  currency={post.currency}
                  jobType={post.jobType}
                  userId={post.userId}
                  category={post.category}
                  description={post.description}
                />
              </div>
            );
          } else if ((post.type === 'poll') && (post.archive === false || post.archive === undefined)) {
            return (
              <div key={post._id} className="post-box p-2 lg:p-4 ">
                <PollDisplay poll={post} />
              </div>
            );
          } else if ((post.type === 'event') && (post.archive === false || post.archive === undefined)) {
            return (
              <div key={post._id} className="post-box p-2 lg:p-4">
                <EventDisplay event={post} />
              </div>
            );
          }
          else if (entityType === 'news') {
            return (
              <div key={post._id} className='p-2 lg:p-4' style={{ width: '100%' }}>
                <DisplayNews
                  userId={post.userId}
                  postId={post._id}
                  description={post.description}
                  createdAt={post.createdAt}
                  picturePath={post.picturePath}
                  videoPath={post.videoPath}
                  department={post.department}
                  onDeletePost={() => handleDeletePost(post._id)}
                />
              </div>
            )

          }
          return null;
        })}
        {loading && <div>
          <l-dot-pulse
            size="35"
            speed="1.0"
            color="#b3b4b5"
          ></l-dot-pulse></div>}
        {totalPosts != 0 && activePageRef.current >= totalPosts / LIMIT && (
          <p>You have seen all the {entityType}</p>
        )}
      </div>
    </div>
  );


}

export default Feed;