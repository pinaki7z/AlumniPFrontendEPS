import React from 'react';
import '../Post/Post.scss';
import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import PlayCircleOutlineRoundedIcon from '@mui/icons-material/PlayCircleOutlineRounded';
import { Avatar, TextField, IconButton, Typography } from '@mui/material';
import { useSelector } from 'react-redux';
import { ThumbUpRounded, ChatBubbleOutlineRounded, NearMeRounded, DeleteRounded } from '@mui/icons-material';
import baseUrl from "../../config";
import newsImage from "../../images/d-group.jpg"


export const DisplayNews = ({ userId, postId, description, createdAt, picturePath, videoPath, department, onDeletePost }) => {
    console.log('video', videoPath)
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef(null);
    const profile = useSelector((state) => state.profile);
    const [loading, setLoading] = useState(false);
    const isUserDepartment = profile.department === 'All' || profile.department === department || department === 'All';
    let admin;
    if (profile.profileLevel === 0) {
        admin = true;
    }



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

    const handleDeletePost = async (userId) => {
        if (userId === profile._id) {
            try {
                await axios.delete(`${baseUrl}/news/${postId}`);
                onDeletePost(postId);
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
        else {
            console.log("Cannot Delete")
        }
    };

    return (
        <>
            {isUserDepartment && (
                <div className={`post post-box`} style={{flexDirection: 'row'}}>
                    {loading ? (<div> Loading...</div>) : (<>
                        <div>
                            <img src={newsImage} alt="" srcset="" />
                        </div>
                        <div>
                            <div className='top'>
                                <div className='info'>
                                    <h4>{createdAt}</h4>
                                </div>
                                {(admin || userId === profile._id) && (
                                    <IconButton onClick={() => handleDeletePost(postId)} className='delete-button'>
                                        <DeleteRounded />
                                    </IconButton>
                                )}
                            </div>
                            {description && (
                                <div className='texxt'>
                                    <p style={{padding: '1.1rem'}}>{description}</p>
                                </div>
                            )}
                            {picturePath && (
                                <div className='image'>
                                    <img src={picturePath} alt='Post Image' />
                                </div>
                            )}
                            {videoPath && (
                                <div className='video'>
                                    <video
                                        ref={videoRef}
                                        autoPlay={isPlaying}
                                        preload="auto"
                                        controls={false}
                                        onClick={handlePlay}
                                    >
                                        <source src={videoPath.videoPath} type='video/mp4' />
                                        Your browser does not support the video tag.
                                    </video>
                                    <div className={`play-button ${isPlaying ? '' : ''}`} onClick={handlePlay}>
                                        <PlayCircleOutlineRoundedIcon fontSize='large' />
                                    </div>
                                </div>
                            )}
                        </div>


                    </>)}
                </div>
            )}
        </>
    )
}
