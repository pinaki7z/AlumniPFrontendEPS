import React, { useState, useEffect } from 'react';
import './pollDisplay.css';
import { Avatar, IconButton, Modal as MModal, Box, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
import pic from "../../../images/profilepic.jpg";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from "react-toastify";
import baseUrl from '../../../config';
import PollModal from '../../CreatePost1/PollModal';
import { useParams } from "react-router-dom";
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const PollDisplay = ({ poll, archived }) => {
    const { _id } = useParams();
    const [hasVoted, setHasVoted] = useState(false);
    const [updatedPoll, setUpdatedPoll] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [archiveModalOpen, setArchiveModalOpen] = useState(false);
    const profile = useSelector((state) => state.profile);
    const [showPollModal, setShowPollModal] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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

    const handleEditPoll = async (question, options) => {
        console.log("Edit poll");
        setShowPollModal(true)
        setMenuAnchor(null);
        console.log('question1', question, options);
        const pollData = {
            userId: profile._id,
            userName: `${profile.firstName} ${profile.lastName}`,
            profilePicture: profile.profilePicture,
            question: question,
            options: options,
        };
        if (_id) pollData.groupID = _id;

        try {
            const response = await axios.put(
                `${baseUrl}/poll/${poll._id}/editPoll`,
                pollData,
            );
            const newPoll = await response.data;
            setShowPollModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Error creating poll:", error);
        }
    };

    const handleArchivePoll = () => {
        setArchiveModalOpen(true);
        setMenuAnchor(null);
    };

    const confirmArchivePoll = async () => {
        setArchiveModalOpen(false); // Close the confirmation modal

        try {
            const url = `${baseUrl}/poll/${poll._id}/archive`;
            const response = await axios.put(url);

            if (response.status === 200) {
                console.log("Poll archived successfully");
                toast.success("Poll archived successfully");
                // Optionally, update UI state or reload the page
                window.location.reload(); // Refresh the page to reflect changes
            } else {
                console.error("Failed to archive poll");
                toast.error("Failed to archive poll");
            }
        } catch (error) {
            console.error("Error occurred while archiving poll:", error);
            toast.error("Error occurred while archiving poll");
        }
    };


    const handleDeletePoll = async () => {

        setIsDeleteModalOpen(true);

        setMenuAnchor(null);
        // try {
        //     const url = `${baseUrl}/poll/${poll._id}`;
        //     const response = await axios.delete(url);

        //     if (response.status === 200) {
        //         console.log("Poll deleted successfully");
        //         toast.success("Poll deleted successfully");
        //         window.location.reload();
        //     } else {
        //         console.error("Failed to delete poll");
        //         toast.error("Failed to delete poll");
        //     }
        // } catch (error) {
        //     console.error("Error occurred while deleting poll:", error);
        // }
    };

    const confirmDeletePoll = async () => {
        setIsDeleteModalOpen(false);
        toast.success('deleted poll');
        console.log('poll id', poll._id)
        try {
            const url = `${baseUrl}/poll/${poll._id}`;
            const response = await axios.delete(url);

            if (response.status === 200) {
                console.log("Poll deleted successfully");
                toast.success("Poll deleted successfully");
                window.location.reload();
            } else {
                console.error("Failed to delete poll");
                toast.error("Failed to delete poll");
            }
        } catch (error) {
            console.error("Error occurred while deleting poll:", error);
        }
    };

    const handleCreatePoll = async (question, options) => {
        console.log('question1', question, options);
        const pollData = {
            userId: profile._id,
            userName: `${profile.firstName} ${profile.lastName}`,
            profilePicture: profile.profilePicture,
            question: question,
            options: options,
        };
        if (_id) pollData.groupID = _id;

        try {
            const response = await axios.post(
                `${baseUrl}/poll/createPoll`,
                pollData,
            );
            const newPoll = await response.data;
            setShowPollModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Error creating poll:", error);
        }
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
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#004C8A' }}>{formatCreatedAt(poll.createdAt)}</span>
                </div>
                {(poll.userId === profile._id) && (
                    <>
                        <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} className='more-button' style={{ marginLeft: 'auto', color: 'black' }}>
                            <MoreVert />
                        </IconButton>
                        <Menu
                            anchorEl={menuAnchor}
                            open={Boolean(menuAnchor)}
                            onClose={() => setMenuAnchor(null)}
                        >
                            <MenuItem onClick={handleEditPoll}>Edit</MenuItem>
                            <MenuItem onClick={handleArchivePoll}>{archived ? 'Unarchive' : 'Archive'}</MenuItem>
                            <MenuItem onClick={handleDeletePoll}>Delete</MenuItem>
                        </Menu>
                    </>
                )}
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

            <MModal open={modalOpen} onClose={handleCloseModal}>
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
            </MModal>

            <Modal show={archiveModalOpen} onHide={() => setArchiveModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm {archived ? 'Unarchive' : 'Archive'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to {archived ? 'unarchive' : 'archive'} this poll?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setArchiveModalOpen(false)}>
                        No
                    </Button>
                    <Button variant="primary" onClick={confirmArchivePoll}>
                        Yes
                    </Button>
                </Modal.Footer>
            </Modal>
            <Modal show={isDeleteModalOpen} onHide={() => setIsDeleteModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this poll?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>No</Button>
                    <Button variant="primary" onClick={confirmDeletePoll}>Yes</Button>
                </Modal.Footer>
            </Modal>

            <PollModal
                show={showPollModal}
                onHide={() => setShowPollModal(false)}
                onCreatePoll={handleEditPoll}
                edit={true}
            />
        </>
    );
};

export default PollDisplay;
