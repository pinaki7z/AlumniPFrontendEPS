import React, { useState, useEffect, useRef } from 'react';
import CreatePost1 from '../../components/CreatePost1';
import Post from '../../components/Post';
import axios from 'axios';
import '../../components/Feeed/feed.scss';
import { toast } from "react-toastify";
import CommentSection from '../../components/CommentSection';
import JobIntDisplay from '../../components/JobsInt/JobIntDispay';
import { useSelector } from 'react-redux';
import { DisplayNews } from '../../components/DisplayNews';
import { dotPulse } from 'ldrs';
import EventDisplay from '../../components/Feeed/EventDisplay';
import { useParams } from 'react-router-dom';
import PollDisplay from '../../components/Feeed/PollDisplay';
import baseUrl from '../../config';
dotPulse.register();

function Archive({ photoUrl, username, showCreatePost, entityId, entityType, showDeleteButton, admin, userId, groupID, showCreateButton }) {
  const [posts, setPosts] = useState([]);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const [totalPosts, setTotalPosts] = useState(0);
  const activePageRef = useRef(1);
  const isFetchingRef = useRef(false);
  let lastFetchedPageRef = useRef(0);
  const { _id } = useParams();
  const LIMIT = 4;

  useEffect(() => {
    const container = scrollContainerRef.current;

    const handleScroll = () => {
      if (container) {
        const { scrollTop, clientHeight, scrollHeight } = container;
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
  }, [loading, posts.length, totalPosts]);

  useEffect(() => {
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

  const getPosts = async (page) => {
    setLoading(true);
    isFetchingRef.current = false;
    try {
      let response;
      if (userId) {
        response = await axios.get(`${baseUrl}/posts/userPosts/${userId}?page=${page}&size=${LIMIT}`);
      } else if (groupID) {
        response = await axios.get(`${baseUrl}/groups/groups/${groupID}?page=${page}&size=${LIMIT}`);
      } else {
        response = await axios.get(`${baseUrl}/posts/posts/archive?page=${page}&size=${LIMIT}`);
      }
      const postsData = response.data.records;
      setPosts((prevItems) => [...prevItems, ...postsData]);
      setTotalPosts(response.data.total);
      lastFetchedPageRef.current = page;
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
    isFetchingRef.current = true;
    setLoading(false);
  };

  return (
    <div className=' p-3 lg:ml-6 flex justify-center'>
    <div className='feed' style={{width: '70%'}}>
      {(showCreatePost && (profile.profileLevel === 0 || profile.profileLevel === 1)) && (
        <CreatePost1
          photoUrl={photoUrl}
          username={username}
          onNewPost={handleNewPost}
          entityType={entityType}
        />
      )}
      {showCreateButton &&
        <div cla style={{ width: '100%' }}>
          <button style={{ fontFamily: 'Inter', fontWeight: '500', fontSize: '20px', padding: '30px', borderRadius: '8px', border: 'none', height: '0vh', width: '20%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Create
          </button>
        </div>}
      <div className='infiniteScroll' ref={scrollContainerRef} style={{   width: "100%", display: "flex", flexDirection: "column", alignItems: "center" }}>
        {posts.map((post, index) => {
          if (post.type === 'Post' && post.groupID === _id && (post.archive === true)) {
            return (
              <div key={post._id} className="post-box p-4" style={{ width: '100%', marginBottom: '20px' }}>
                <Post
                  userId={post.userId}
                  postId={post._id}
                  username={`${post.firstName} ${post.lastName}`}
                  text={post.description}
                  image={post.picturePath}
                  profilePicture={post.profilePicture}
                  video={post.videoPath}
                  timestamp={post.createdAt}
                  likes={post.likes}
                  entityType={entityType}
                  admin={admin}
                  showDeleteButton={showDeleteButton}
                  handleLikes={handleLikes}
                  onDeletePost={() => handleDeletePost(post._id)}
                  groupID={post.groupID}
                  archived={true}
                />
                {(entityType === 'posts' || entityType === 'forums') && (profile.profileLevel === 0 || profile.profileLevel === 1) &&(
                  <CommentSection 
                    entityId={post._id} 
                    entityType="posts" 
                    onCommentSubmit={refreshComments}
                    onDeleteComment={refreshComments} 
                    comments={post ? post.comments : null} 
                  />
                )}
              </div>
            );
          } else if (post.type === 'Internship' && (post.groupID === _id)) {
            return (
              <div key={post._id} className="job-box p-4" style={{ width: '100%', marginBottom: '20px' }}>
                <JobIntDisplay
                  jobId={post._id}
                  picture={post.coverImage}
                  jobTitle={post.jobTitle}
                  location={post.location}
                  salaryMin={post.salaryMin}
                  salaryMax={post.salaryMax}
                  currency={post.currency}
                  jobType={post.jobType}
                  category={post.category}
                  description={post.description}
                />
              </div>
            );
          } else if ((post.type === 'poll') && (post.archive === true)) {
            return (
              <div key={post._id} className="post-box p-4" style={{ width: '100%', marginBottom: '20px' }}>
                <PollDisplay poll={post} archived={true}/>
              </div>
            );
          } else if ((post.type === 'event') && (post.archive === true)) {
            return (
              <div key={post._id} className="post-box p-4" style={{ width: '100%', marginBottom: '20px' }}>
                <EventDisplay event={post} archived={true}/>
              </div>
            );
          }
          else if (entityType === 'news') {
            return (
              <div className='p-4' key={post._id} style={{ width: '100%', marginBottom: '20px' }}>
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
        {loading && <div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginTop: '20px' }}>
          <l-dot-pulse
            size="35"
            speed="1.0"
            color="#b3b4b5"
          ></l-dot-pulse></div>}
        {totalPosts !== 0 && activePageRef.current >= totalPosts / LIMIT && (
          <p style={{ textAlign: 'center', width: '100%', marginTop: '20px' }}>You have seen all the {entityType}</p>
        )}
        {totalPosts === 0 && (
          <p style={{ textAlign: 'center', width: '100%', marginTop: '20px' }}>No Further Archived Posts</p>
        )}
      </div>
    </div>
    </div>
  );
}

export default Archive;