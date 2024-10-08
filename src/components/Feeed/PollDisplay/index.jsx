import React, { useState, useEffect } from 'react';
import './pollDisplay.css';
import { Avatar, IconButton, Modal as MModal, Modal as MMModal, Box, Menu, MenuItem } from '@mui/material';
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
import { lineSpinner } from 'ldrs'

lineSpinner.register()




const PollDisplay = ({ poll, archived }) => {
    const { _id } = useParams();
    const [hasVoted, setHasVoted] = useState(false);
    const [updatedPoll, setUpdatedPoll] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [modalShow, setModalShow] = useState(false);
    const profile = useSelector((state) => state.profile);
    const [showPollModal, setShowPollModal] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

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
        setLoading(true);
        if (poll.userId === profile._id) {
            toast.error("You cannot vote on your own poll.");
            setLoading(false);
            return;
        }

        if (hasVoted && !poll.multipleAnswers) {
            toast.error("You have already voted on this poll.");
            setLoading(false);
            return;
        }

        try {
            let body = {
                userId: profile._id,
                optionId: optionId,
                userName: `${profile.firstName} ${profile.lastName}`,
                profilePicture: profile.profilePicture,
                multipleAnswers: poll.multipleAnswers
            };

            const response = await axios.put(
                `${baseUrl}/poll/${poll._id}`,
                body
            );

            if (response.status === 200) {
                toast.success('Vote submitted successfully.');
                setUpdatedPoll(response.data.poll);
                setHasVoted(true);
                setLoading(false);
            } else {
                console.error('Unexpected response status:', response.status, response.message);
                alert('An unexpected error occurred. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error submitting vote:', error);
            toast.error(error.response.data.message);
            setLoading(false);
        }
    };

    const formatCreatedAt = (timestamp) => {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = new Date(timestamp).toLocaleTimeString(undefined, options);
        const dateString = new Date(timestamp).toLocaleDateString();

        return `${dateString} ${timeString}`;
    };

    const calculatePercentages = (options) => {
        console.log('calculating percent', options)
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

    const handleEditPoll = async (question, options, multipleAnswers) => {
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
            multipleAnswers
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
        setModalShow(true);
        setMenuAnchor(null);
    };

    const confirmArchivePoll = async () => {
        setModalShow(false); // Close the confirmation modal

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

    const handleCreatePoll = async (question, options, multipleAnswers) => {
        console.log('question1', question, options);
        const pollData = {
            userId: profile._id,
            userName: `${profile.firstName} ${profile.lastName}`,
            profilePicture: profile.profilePicture,
            question: question,
            options: options,
            multipleAnswers
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
    console.log('options with percentages', optionsWithPercentages)

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
            <h3 style={{ fontWeight: '600', fontSize: '20px', paddingTop: '30px', color: '#3A3A3A', fontFamily: 'Inter' }}>{poll.question}       {poll.multipleAnswers ? (
                <p style={{ color: 'grey', fontSize: '15px', paddingTop: '10px' }}>(Multiple choices can be made)</p>
            ) : (
                <p style={{ color: 'grey', fontSize: '15px', paddingTop: '10px' }}>(Choose only one option)</p>
            )}</h3>

            <div className="options-container">
                {poll.userId === profile._id && <div className='see-poll-results' style={{ textAlign: 'right' }} onClick={handleOpenModal}>See Poll Results</div>}
                {loading && <><l-line-spinner
                    size="20"
                    stroke="3"
                    speed="1"
                    color="black"
                ></l-line-spinner></>}
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
                                    {console.log('option per', option.percentage)}
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

            {/* <Modal show={archiveModalOpen} onHide={() => setArchiveModalOpen(false)}>
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
            </Modal> */}

            {modalShow && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                    <h2 className="text-lg font-bold mb-4">Archive Poll</h2>
                    <p>Are you sure you want to archive this poll?</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={confirmArchivePoll} className="bg-red-600 text-white py-2 px-4 rounded-md" style={{color: 'white', backgroundColor: '#004C8A'}}>Yes</button>
                        <button onClick={() => setModalShow(false)} className="ml-2 bg-gray-200 py-2 px-4 rounded-md">No</button>
                    </div>
                </div>
            )}

            {/* <Modal show={isDeleteModalOpen} onHide={() => setIsDeleteModalOpen(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>Are you sure you want to delete this poll?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>No</Button>
                    <Button variant="primary" onClick={confirmDeletePoll}>Yes</Button>
                </Modal.Footer>
            </Modal> */}

            {isDeleteModalOpen && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                    <h2 className="text-lg font-bold mb-4">Delete Poll</h2>
                    <p>Are you sure you want to delete this poll?</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={confirmDeletePoll} className="bg-red-600 text-white py-2 px-4 rounded-md" style={{color: 'white', backgroundColor: '#004C8A'}}>Yes</button>
                        <button onClick={() => setIsDeleteModalOpen(false)} className="ml-2 bg-gray-200 py-2 px-4 rounded-md">No</button>
                    </div>
                </div>
            )}

            <PollModal
                show={showPollModal}
                onHide={() => setShowPollModal(false)}
                onCreatePoll={handleCreatePoll}
                edit={true}
            />
        </>
    );
};

export default PollDisplay;
