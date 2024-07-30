import React, { useState, useEffect } from 'react';
import './pollDisplay.css';
import { Avatar, IconButton, Modal, Box } from '@mui/material';
import postDelete from "../../../images/post-delete.svg";
import pic from "../../../images/profilepic.jpg";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from "react-toastify";
import { flexbox } from '@mui/system';
import baseUrl from '../../../config';

const PollDisplay = ({ poll }) => {
    const [hasVoted, setHasVoted] = useState(false);
    const [updatedPoll, setUpdatedPoll] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const profile = useSelector((state) => state.profile);

    useEffect(() => {
        const userVoted = poll.options.some(option =>
            option.votes.some(vote => vote.userId === profile._id)
        );

        setHasVoted(userVoted);
        if (userVoted) {
            setUpdatedPoll(poll);
        }
    }, [poll, profile._id]);

    const handleVote = async (optionId) => {
        console.log('handling vote')
        if (poll.userId === profile._id) {
            toast.error("You cannot vote on your own poll.");
            return;
        }

        try {
            let body = {
                userId: profile._id,
                optionId: optionId,
                userName: `${profile.firstName} ${profile.lastName}`,
                profilePicture: profile.profilePicture
            };

            const response = await axios.put(
                `${baseUrl}/poll/${poll._id}`,
                body
            );

            if (response.status === 200) {
                toast.success('Vote submitted successfully.');
                setUpdatedPoll(response.data.poll);
                setHasVoted(true);
            } else {
                console.error('Unexpected response status:', response.status, response.message);
                alert('An unexpected error occurred. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            toast.error(error.response.data.message);
        }
    };

    const formatCreatedAt = (timestamp) => {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = new Date(timestamp).toLocaleTimeString(undefined, options);
        const dateString = new Date(timestamp).toLocaleDateString();

        return `${dateString} ${timeString}`;
    };

    const calculatePercentages = (options) => {
        const totalVotes = options.reduce((acc, option) => acc + option.votes.length, 0);
        return options.map(option => ({
            ...option,
            percentage: totalVotes ? (option.votes.length / totalVotes) * 100 : 0
        }));
    };

    const handleOpenModal = () => {
        if (poll.userId === profile._id) {
            setModalOpen(true);
        } else {
            toast.error("You are not authorized to view this information.");
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const pollData = hasVoted ? updatedPoll : poll;
    const optionsWithPercentages = calculatePercentages(pollData.options);

    return (
        <>
            <div className='top'>
                {poll.profilePicture ? (
                    <img src={poll.profilePicture} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                ) : (
                    <Avatar src={pic} style={{ width: '50px', height: '50px' }} />
                )}
                <div className='info'>
                    <h4>{poll.userName}</h4>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#136175' }}>{formatCreatedAt(poll.createdAt)}</span>
                </div>
                <IconButton className='delete-button' style={{ marginRight: '10px', marginLeft: 'auto' }}>
                    <svg width="14" height="18" viewBox="0 0 14 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 16C1 17.1 1.9 18 3 18H11C12.1 18 13 17.1 13 16V4H1V16ZM14 1H10.5L9.5 0H4.5L3.5 1H0V3H14V1Z" fill="#003366" />
                    </svg>
                </IconButton>
            </div>
            <h3 style={{ fontWeight: '600', fontSize: '20px', paddingTop: '30px', color: '#3A3A3A', fontFamily: 'Inter' }}>{poll.question}</h3>

            <div className="options-container">
                {poll.userId === profile._id && <div className='see-poll-results' style={{ textAlign: 'right' }} onClick={handleOpenModal}>See Poll Results</div>}
                {optionsWithPercentages.map(option => (
                    <div
                        key={option._id}
                        className={`option ${hasVoted ? 'voted' : 'clickable'}`}
                        onClick={() => !hasVoted && handleVote(option._id)}
                    >
                        <div style={{ textAlign: 'center' }}>{option.option}</div>
                        {hasVoted && (
                            <div className="percentage-bar-container" onClick={() => handleVote(option._id)}>
                                <div className="percentage-bar" style={{ width: `${option.percentage}%` }}>
                                    {option.percentage.toFixed(2)}%
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <Modal open={modalOpen} onClose={handleCloseModal}>
                <Box className='poll-modal-box'>
                    <div className='voters-container'>
                        {pollData.options.map(option => (
                            <div key={option._id} className='option-result'>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <h3>{option.option} </h3>
                                    <h3>Total votes- {option.votes.length} </h3>
                                </div>
                                {option.votes && option.votes.length > 0 ? (
                                    option.votes.map(vote => (
                                        <div key={vote.userId} className='voter-info'>
                                            <Avatar src={vote.profilePicture || pic} />
                                            <span>{vote.userName}</span>
                                        </div>
                                    ))
                                ) : (
                                    <>No voters</>
                                )}
                            </div>
                        ))}
                    </div>
                </Box>
            </Modal>
        </>
    );
};

export default PollDisplay;
