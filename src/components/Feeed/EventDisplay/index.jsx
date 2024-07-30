import pic from "../../../images/profilepic.jpg";
import { Avatar, IconButton, Modal, Box } from '@mui/material';
import postDelete from "../../../images/post-delete.svg";
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';
import { toast } from "react-toastify";
import axios from 'axios';
import { lineSpinner } from 'ldrs';
import format from "date-fns/format";
import getDay from "date-fns/getDay";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import { EventBusy } from "@mui/icons-material";
import baseUrl from "../../../config"

lineSpinner.register();

const EventDisplay = ({ event }) => {
    const profile = useSelector((state) => state.profile);
    const [newEvent, setNewEvent] = useState(event);
    const [attendanceStatus, setAttendanceStatus] = useState(null);
    const [attendees, setAttendees] = useState();
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        checkAttendanceStatus();
    }, []);

    const checkAttendanceStatus = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${baseUrl}/events/attendees/${event._id}`,
            );
            if (response.status === 200) {
                setAttendees(response.data);
                determineAttendanceStatus(response.data);
                setLoading(false);
            }
        } catch (error) {
            console.error('Error :', error);
            toast.error(error.response?.data?.message || 'An error occurred.');
        }
    };

    const determineAttendanceStatus = (attendees) => {
        if (attendees.willAttend.some(user => user.userId === profile._id)) {
            setAttendanceStatus(0);
        } else if (attendees.mightAttend.some(user => user.userId === profile._id)) {
            setAttendanceStatus(1);
        } else if (attendees.willNotAttend.some(user => user.userId === profile._id)) {
            setAttendanceStatus(2);
        } else {
            setAttendanceStatus(null);
        }
    };

    const handleAttendance = async (attendance, eventId) => {
        console.log('handling attendance')
        setLoading(true);
        console.log('event titlee',event.title,attendance)
        try {
            let body = {
                userId: profile._id,
                userName: `${profile.firstName} ${profile.lastName}`,
                profilePicture: profile.profilePicture,
                attendance,
                groupName: event.title
            };

            const response = await axios.put(
                `${baseUrl}/events/attendEvent/${eventId}`,
                body
            );

            if (response.status === 200) {
                toast.success('Vote submitted successfully.');
                setNewEvent(response.data.event);
                checkAttendanceStatus();
            } else {
                console.error('Unexpected response status:', response.status, response.message);
                alert('An unexpected error occurred. Please try again.');
                setLoading(false);
            }
        } catch (error) {
            console.error('Error submitting attendance:', error);
            toast.error(error.response?.data?.message || 'An error occurred.');
            setLoading(false);
        }
    };

    const formatCreatedAt = (timestamp) => {
        const options = { hour: 'numeric', minute: 'numeric', hour12: true };
        const timeString = new Date(timestamp).toLocaleTimeString(undefined, options);
        const dateString = new Date(timestamp).toLocaleDateString();
        return `${dateString} ${timeString}`;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };
        return date.toLocaleDateString('en-US', options);
    };

    const handleOpen = () => {
        checkAttendanceStatus();
        setOpen(true)
    };
    const handleClose = () => setOpen(false);

    const handleDeleteEvent = async () => {
        console.log('deleting event')
        try {
         
          const url = `${baseUrl}/events/${event._id}`;
          
         
          const requestBody = {
            groupName: event.title
          };
      
        
          const response = await axios.delete(url, { data: requestBody });
      
          if (response.status === 200) {
            console.log("Event deleted successfully");
            toast.success("Event deleted successfully");
            window.location.reload();
          } else {
            console.error("Failed to delete event");
            toast.error("Failed to delete event");
         
          }
        } catch (error) {
          console.error("Error occurred while deleting event:", error);
        }
      };

    return (
        <>
            <div className='top'>
                {event.profilePicture ? (
                    <img src={event.profilePicture} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
                ) : (
                    <Avatar src={pic} style={{ width: '50px', height: '50px' }} />
                )}
                <div className='info'>
                    <h4>{event.userName ? event.userName : null}</h4>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#136175' }}>{formatCreatedAt(event.createdAt)}</span>
                </div>
                {event.userId === profile._id && <IconButton className='delete-button' style={{ marginRight: '10px', marginLeft: 'auto' }}>
                    <img src={postDelete} onClick={handleDeleteEvent}/>
                </IconButton>}
            </div>
            <div style={{ paddingTop: '20px'}}>
                <p><span style={{ fontWeight: '500' }}>Title:</span> {event.title}</p>
                <p><span style={{ fontWeight: '500' }}>Start Date:</span> {formatDate(event.start)}</p>
                <p><span style={{ fontWeight: '500' }}>End Date:</span> {formatDate(event.end)}</p>
                <p><span style={{ fontWeight: '500' }}>Start Time:</span>  {event.startTime} hrs</p>
                <p><span style={{ fontWeight: '500' }}>End Time:</span> {event.endTime} hrs</p>
                <p><span style={{ fontWeight: '500' }}>Coordinator Name:</span> {event.cName}</p>
                <p><span style={{ fontWeight: '500' }}>Coordinator Number:</span> {event.cNumber}</p>
                <p><span style={{ fontWeight: '500' }}>Coordinator Email:</span> {event.cEmail}</p>
                <p><span style={{ fontWeight: '500' }}>Location:</span> {event.location}</p>
            </div>

            <div className="options-container">
                {event.userId === profile._id && <div className='see-event-results' style={{ textAlign: 'right', cursor: 'pointer' }} onClick={handleOpen}>See event attendees</div>}
                <div>
                    <ul style={{ paddingLeft: '0px' }}>
                        <div className="percentage-bar-container" onClick={() => handleAttendance(0, event._id)}>
                            I will attend {attendanceStatus === 0 && <span>✔</span>}
                        </div>
                        <div className="percentage-bar-container" onClick={() => handleAttendance(1, event._id)}>
                            I might attend {attendanceStatus === 1 && <span>✔</span>}
                        </div>
                        <div className="percentage-bar-container" onClick={() => handleAttendance(2, event._id)}>
                            I will not attend {attendanceStatus === 2 && <span>✔</span>}
                        </div>
                        {loading && <div><l-line-spinner
                            size="20"
                            stroke="3"
                            speed="1"
                            color="black"
                        ></l-line-spinner></div>}
                    </ul>
                </div>
            </div>

            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box className='poll-modal-box'>
                    <h2 id="modal-title">Event Attendees</h2>
                    <div className='voters-container'>
                        <div>
                            <h3>Will Attend</h3>
                            <h5>Total:- {attendees?.willAttend.length}</h5>
                            {attendees?.willAttend.map(user => (
                                <div key={user.userId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Avatar src={user.profilePicture || pic} />
                                    <span>{user.userName}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h3>Might Attend</h3>
                            <h5>Total:- {attendees?.mightAttend.length}</h5>
                            {attendees?.mightAttend.map(user => (
                                <div key={user.userId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Avatar src={user.profilePicture || pic} />
                                    <span>{user.userName}</span>
                                </div>
                            ))}
                        </div>
                        <div>
                            <h3>Will Not Attend</h3>
                            <h5>Total:- {attendees?.willNotAttend.length}</h5>
                            {attendees?.willNotAttend.map(user => (
                                <div key={user.userId} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Avatar src={user.profilePicture || pic} />
                                    <span>{user.userName}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Box>
            </Modal>
        </>
    );
}

export default EventDisplay;
