import React, { useEffect, useState } from 'react';
import profilepic from "../../images/profilepic.jpg";
import './sideWidgets.css';
import picture from '../../images/pexels-damon-hall-2274725.jpg';
import { HiUsers } from 'react-icons/hi';
import { TbReload } from 'react-icons/tb';
import { BsEnvelopePaperHeartFill, BsFillArrowRightSquareFill } from 'react-icons/bs';
import axios from "axios";
import { useCookies } from 'react-cookie';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Popover from 'react-bootstrap/Popover';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import JobsInt from '../JobsInt';
import { HiUserGroup } from 'react-icons/hi';
import { BsCurrencyRupee } from 'react-icons/bs';
import { GoSponsorTiers } from 'react-icons/go';
import { FaPlus } from 'react-icons/fa';
import { BiSolidBriefcase } from 'react-icons/bi';
import Groups from "../../images/Groups.svg";
import send from "../../images/send.svg";
import { updateProfile } from '../../store/profileSlice';
import { toast } from "react-toastify";
import { lineSpinner } from 'ldrs';
import baseUrl from '../../config';
import poll from '../../images/poll.svg';
import PollModal from '../CreatePost1/PollModal';
import { MdOutlineEvent } from 'react-icons/md';
import format from "date-fns/format";
import Modal from 'react-bootstrap/Modal';
import { Col, Row } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import Button from 'react-bootstrap/Button';

lineSpinner.register()

// Default values shown


const SideWidgets = () => {
    const [cookie, setCookie] = useCookies(["access_token"]);
    const profile = useSelector((state) => state.profile);
    const [notifications, setNotifications] = useState([]);
    const members = useSelector((state) => state.member);
    const [showPopover, setShowPopover] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isloading, setIsLoading] = useState({});
    const [load, setLoad] = useState(false);
    const [showPollModal, setShowPollModal] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    const itemsPerPage = 3;
    const [modalShow, setModalShow] = React.useState(false);
    const dispatch = useDispatch();
    console.log('notifications1', notifications, profile);


    const popover = (popoverVisibility) => {
        setShowPopover(popoverVisibility);
    };

    const onHideModal = (modalVisibility) => {
        setShowModal(modalVisibility);
    };

    const fetchNotifications = async () => {
        setLoad(true);
        try {
            const response = await axios.get(`${baseUrl}/notifications`);
            const sortedNotifications = response.data.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
            setNotifications(sortedNotifications);
        } catch (error) {
            console.log('error', error)
        }
        setLoad(false);
    }

    useEffect(() => {
        fetchNotifications();
    }, [isloading]);



    const followingIds = profile.following.map((follow) => follow.userId);
    const peopleYouMayKnow = members.filter(member => !followingIds.includes(member._id));

    const displayedMembers = peopleYouMayKnow.slice(0, currentPage * itemsPerPage);

    const handleFollowToggle = async (memberId, firstName, lastName) => {
        setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: true }));
        try {
            const response = await axios.patch(`${baseUrl}/alumni/${memberId}/follow`, {
                userId: profile._id,
                requestedUserName: `${profile.firstName} ${profile.lastName}`,
                followedUserName: `${firstName} ${lastName}`
            });

            if (response.status === 200) {
                const responseData = await response.data;
                const { alumni } = responseData;
                dispatch(updateProfile(alumni));
                console.log('followed');
                toast.success('Followed');
                if (loading) setLoading(false);
                else setLoading(true);
            }
            setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: false }));
        } catch (error) {
            console.error("Error toggling follow status:", error);
            setIsLoading(prevLoading => ({ ...prevLoading, [memberId]: false }));
        }
    };

    const timeAgo = (date) => {
        const now = new Date();
        const notificationDate = new Date(date);
        const diffInSeconds = Math.floor((now - notificationDate) / 1000);

        const intervals = [
            { label: 'year', seconds: 31536000 },
            { label: 'month', seconds: 2592000 },
            { label: 'day', seconds: 86400 },
            { label: 'hour', seconds: 3600 },
            { label: 'minute', seconds: 60 },
            { label: 'second', seconds: 1 },
        ];

        for (const interval of intervals) {
            const count = Math.floor(diffInSeconds / interval.seconds);
            if (count >= 1) {
                return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
            }
        }

        return 'just now';
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
        //if (_id) pollData.groupID = _id;

        try {
            const response = await axios.post(
                `${baseUrl}/poll/createPoll`,
                pollData,
            );
            const newPoll = await response.data;
            //onNewPost(newPoll);
            //setInput("");
            setShowPollModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Error creating poll:", error);
        }
    };

    function MyVerticallyCenteredModal(props) {
        const [isEditing, setIsEditing] = useState(false);
        const profile = useSelector((state) => state.profile);
        const [createGroup, setCreateGroup] = useState(false);
        const [loading, setLoading] = useState(false);

        const [newEvent, setNewEvent] = useState({
            title: "", start: "", end: "", startTime: "00:00",
            endTime: "00:00", picture: "", cName: "",
            cNumber: "", cEmail: "", location: ""
        });
        const [allEvents, setAllEvents] = useState([]);
        const [selectedEvent, setSelectedEvent] = useState([props.selectedEvent])


        const handleImageChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setNewEvent({ ...newEvent, picture: reader.result });
                };
                reader.readAsDataURL(file);
            }
        };




        const handleAddEvent = () => {
            const { title, start, end, startTime, endTime, picture, cName, cNumber, cEmail, location } = newEvent;

            if (!title || !start || !end || !picture) {
                alert("Please provide title, start date, end date and image");
                return;
            }

            const formattedStart = format(new Date(start), "yyyy-MM-dd");
            const formattedEnd = format(new Date(end), "yyyy-MM-dd");
            setLoading(true);

            const eventData = {
                userId: profile._id,
                title,
                start: formattedStart,
                end: formattedEnd,
                startTime,
                userName: `${profile.firstName} ${profile.lastName}`,
                profilePicture: profile.profilePicture,
                endTime,
                picture,
                cName,
                cNumber,
                cEmail,
                location,
                department: profile.department,
                createGroup
            };
            console.log('eventData', eventData)

            fetch(`${baseUrl}/events/createEvent`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(eventData),
            })
                .then((response) => response.json())
                .then((createdEvent) => {
                    setAllEvents([...allEvents, createdEvent]);
                    setLoading(false);
                    window.location.reload();

                    setNewEvent({ title: "", start: "", end: "", startTime: "", endTime: "", picture: null, cEmail: "", cName: "", cNumber: "", location: "" });
                })
                .catch((error) => console.error("Error creating event:", error));
        };


        const handleEditEvent = () => {
            const { title, start, end, startTime, endTime, picture, cName, cNumber, cEmail, location } = newEvent;
            const eventId = props.selectedEvent._id;

            if (!title || !start || !end) {
                alert("Please provide title, start date, and end date.");
                return;
            }

            try {
                const formattedStart = format(new Date(start), "yyyy-MM-dd");
                const formattedEnd = format(new Date(end), "yyyy-MM-dd");


                const updatedEvent = {
                    title: title,
                    start: formattedStart,
                    end: formattedEnd,
                    startTime,
                    endTime,
                    picture,
                    cName,
                    cNumber,
                    cEmail,
                    location
                };

                const jsonEventData = JSON.stringify(updatedEvent);

                fetch(`${baseUrl}/events/${eventId}`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: jsonEventData,
                })
                    .then(() => {
                        const updatedEvents = allEvents.map((event) =>
                            event._id === eventId ? updatedEvent : event
                        );

                        setAllEvents(updatedEvents);
                        setSelectedEvent(null);
                        props.onHide();
                        toast.success("Event updated successfully.");
                        window.location.reload();
                    })
                    .catch((error) => console.error("Error updating event:", error));
            } catch (jsonError) {
                console.error("JSON serialization error:", jsonError);
                alert("Error updating event: JSON serialization error");
            }
        };

        const handleDateChange = (date, field) => {
            if (props.isEditing) {
                const updatedEvent = { ...newEvent };
                updatedEvent[field] = date;
                setNewEvent(updatedEvent);
                setIsEditing(true)
            } else {
                setNewEvent({ ...newEvent, [field]: date });
            }
        };

        const handleTimeChange = (time, field) => {
            const updatedEvent = { ...newEvent };
            updatedEvent[field] = time;
            setNewEvent(updatedEvent);
        };



        return (
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header style={{ backgroundColor: '#f5dad2' }} closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        {props.isEditing ? "Edit Event" : "Add Event"}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ display: 'flex', gap: '2em', backgroundColor: '#eaf6ff' }}>
                    <Col>
                        <Row style={{ padding: '0px 5px' }}>
                            <input
                                type="text"
                                placeholder="Add/Edit Title"
                                style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
                                value={newEvent.title}
                                onChange={(e) =>
                                    setNewEvent({ ...newEvent, title: e.target.value })
                                }
                            />
                            <br />
                            <br />
                            <label htmlFor={newEvent.picture}>Insert a Picture:-</label>
                            <br />
                            <input type="file" name={newEvent.picture}
                                style={{ width: '60%' }}
                                onChange={handleImageChange} />


                            <input
                                type="text"
                                placeholder="Enter Coordinator Name"
                                style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
                                value={newEvent.cName}
                                onChange={(e) =>
                                    setNewEvent({ ...newEvent, cName: e.target.value })
                                }
                            />



                        </Row>



                    </Col>




                    <Col>
                        <DatePicker
                            placeholderText="Start Date"
                            style={{ marginRight: "10px", padding: "0.5em" }}
                            selected={newEvent.start}
                            onChange={(date) => handleDateChange(date, "start")}
                        />
                        <br /><br />
                        <input type="time" id="appt" name="startTime" value={newEvent.startTime} onChange={(e) =>
                            setNewEvent({ ...newEvent, startTime: e.target.value })
                        } />
                        <br /><br />
                        <input
                            type="number"
                            placeholder="Enter Coordinator Contact Number"
                            style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
                            value={newEvent.cNumber}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, cNumber: e.target.value })
                            }
                        />

                        <input
                            type="text"
                            placeholder="Enter event location"
                            style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
                            value={newEvent.location}
                            onChange={(e) =>
                                setNewEvent({ ...newEvent, location: e.target.value })
                            }
                        />

                    </Col>


                    <Col>
                        <Col>
                            <DatePicker
                                placeholderText="End Date"
                                style={{ padding: "0.5em" }}
                                selected={newEvent.end}
                                onChange={(date) => handleDateChange(date, "end")}
                            />
                            <br /><br />
                            <input type="time" id="appt" name="endTime" value={newEvent.endTime} onChange={(e) =>
                                setNewEvent({ ...newEvent, endTime: e.target.value })
                            } />
                            <input
                                type="email"
                                placeholder="Enter Coordinator Email"
                                style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
                                value={newEvent.cEmail}
                                onChange={(e) =>
                                    setNewEvent({ ...newEvent, cEmail: e.target.value })
                                }
                            />
                        </Col>

                    </Col>

                </Modal.Body>

                <Modal.Footer style={{ backgroundColor: '#f5dad2' }}>
                    <div style={{ marginRight: 'auto', display: 'flex', alignItems: 'center' }}>
                        <input
                            type="checkbox"
                            id="create-group"
                            checked={createGroup}
                            onChange={(e) => setCreateGroup(e.target.checked)}
                        />
                        <label htmlFor="create-group" style={{ marginLeft: '0.5em' }}>Create a group with the same event title name</label>
                    </div>
                    <Button
                        onClick={props.isEditing ? handleEditEvent : handleAddEvent}
                    >
                        {loading
                            ? 'Adding Event...'
                            : props.isEditing
                                ? 'Edit Event'
                                : 'Add Event'}

                    </Button>
                    <Button onClick={props.onHide}>Close</Button>
                </Modal.Footer>

            </Modal>
        );
    }


    return (
        <div className="sideWidget-feed">
            <div style={{ float: 'right' }}>
                <OverlayTrigger
                    trigger="click"
                    key='bottom'
                    show={showPopover}
                    placement='bottom'
                    overlay={
                        <Popover id={`popover-positioned-bottom`}>
                            <Popover.Body>
                                <div className='img-job-vide' style={{ flexDirection: 'column', gap: '10px' }}>
                                    <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                        <a href="/groups/create" style={{ textDecoration: 'none', color: 'black' }}><HiUserGroup style={{ color: 'ffcf63' }} /> Group</a>
                                    </label>
                                    <button style={{ backgroundColor: '#f3f3f3', color: 'black', padding: '5px 10px' }} onClick={() => {
                                        setShowModal(true);
                                    }}><BiSolidBriefcase style={{ color: 'black' }} />Internships</button>
                                    {showModal && <JobsInt modalShow={showModal} onHideModal={onHideModal} popover={popover} />}
                                    {/* <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                        <a href="/sponsorships/create" style={{ textDecoration: 'none', color: 'black' }}><GoSponsorTiers style={{ color: '#d8887d' }} /> Sponsorships</a>
                                    </label> */}
                                    <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }}>
                                        <button style={{ color: 'black', marginLeft: '0px', fontSize: '15px', width: '100%' }} onClick={() => setShowPollModal(true)}><img src={poll} alt="" width='12px' srcset="" />Poll</button>
                                    </label>
                                    <label style={{ backgroundColor: '#f3f3f3', textAlign: 'center', color: 'black', padding: '5px 10px', cursor: 'pointer', borderRadius: '3em' }} onClick={() => setModalShow(true)}>
                                        <MdOutlineEvent style={{ color: '#d8887d' }} /> Event
                                    </label>
                                </div>

                            </Popover.Body>
                        </Popover>
                    }
                >
                    {(profile.profileLevel === 0 || profile.profileLevel === 1) ? (
                        <button
                            onClick={() => setShowPopover(!showPopover)}
                            style={{
                                backgroundColor: '#004C8A',
                                color: '#FFFFF0',
                                width: '125px',
                                height: '45px',
                                borderRadius: '8px',
                                border: 'none',
                                fontSize: '20px'
                            }}
                        >
                            Create
                        </button>
                    ) : (
                        <></>
                    )}
                </OverlayTrigger>
            </div>
            <PollModal
                show={showPollModal}
                onHide={() => setShowPollModal(false)}
                onCreatePoll={handleCreatePoll}
            />
            <MyVerticallyCenteredModal
          show={modalShow}
          //isEditing={isEditing}
          //selectedEvent={selectedEvent}
          onHide={() => {
            setModalShow(false);
            //setSelectedEventDetails(null);
          }}
        />
            <div className="sideWidget-post-card">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <img src={profile.profilePicture} alt="Profile" width="60px" height="60px" style={{ borderRadius: '50%' }} />
                    <Link to='/profile' style={{ textDecoration: 'none', color: 'black' }}>
                        <p style={{ marginBottom: '0rem', fontWeight: '500', fontSize: '20px' }}>{profile.firstName}</p>
                    </Link>
                    <p style={{ marginBottom: '0rem', fontSize: '14px', backgroundColor: '#F8A700', paddingLeft: '5px', paddingRight: '5px' }}>@{profile.firstName}</p>
                </div>
                <div style={{ height: '20%' }}>
                    <ul style={{ paddingLeft: '0px', marginBottom: '0px', display: 'flex', gap: '10px' }}>
                        <li style={{ display: 'inline-block', borderRight: '1px solid #e9e9e9', textAlign: 'center', paddingRight: '7px' }}><a href="" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'black' }}><span>Posts</span><span style={{ fontWeight: '500', color: '#004C8A' }}>5</span></a></li>
                        <li style={{ display: 'inline-block', borderRight: '1px solid #e9e9e9', textAlign: 'center', paddingRight: '7px' }}><a href="" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'black' }}><span>Following</span><span style={{ fontWeight: '500', color: '#004C8A' }}>1</span></a></li>
                        <li style={{ display: 'inline-block', textAlign: 'center' }}><a href="" style={{ display: 'flex', flexDirection: 'column', textDecoration: 'none', color: 'black' }}><span>Followers</span><span style={{ fontWeight: '500', color: '#004C8A' }}>1</span></a></li>
                    </ul>
                </div>
            </div>

            <div className='sideWidget2-post-card'>
                <div className="sideWidget2-post-header">
                    <p style={{ marginBottom: '0rem', fontWeight: '500', fontSize: '20px' }}>People You May Know</p>
                    <button style={{ border: 'none', backgroundColor: '#004C8A' }}><TbReload style={{ color: '#F8F8FF' }} /></button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {displayedMembers.map((member, index) => (
                        <div key={member._id} style={{ display: 'flex', gap: '10px', alignItems: 'center', padding: '10px', border: '1px solid #e9e9e9', borderRadius: '10px', width: '100%' }}>
                            {member.profilePicture ? <img src={member.profilePicture} alt="Profile" width="60px" height="60px" style={{ borderRadius: '50%' }} /> : <img src={profilepic} alt="Profile" width="60px" height="60px" style={{ borderRadius: '50%' }} />}
                            <p style={{ marginBottom: '0rem', fontWeight: '500' }}>{member.firstName}</p>
                            <button onClick={() => handleFollowToggle(member._id, member.firstName, member.lastName)} style={{ backgroundColor: '#F8A700', color: 'white', borderRadius: '32px', border: 'none', marginLeft: 'auto', color: '#F8F8FF', padding: '8px 32px', pointer: 'cursor' }}>{isloading[member._id] ? <l-line-spinner
                                size="20"
                                stroke="3"
                                speed="1"
                                color="rgb(19, 97, 117)"
                            ></l-line-spinner> : <>Follow</>}</button>
                        </div>
                    ))}
                    {peopleYouMayKnow.length > displayedMembers.length && (
                        <p onClick={() => setCurrentPage(currentPage + 1)} style={{ color: '#004C8A', borderRadius: '10px', borderColor: 'white', padding: '10px', marginTop: '10px', cursor: 'pointer', fontWeight: '500' }}>See More</p>
                    )}
                </div>

            </div>
            <div className='online'>
                <p style={{ marginBottom: '0rem', marginTop: '0rem', fontSize: '20px' }}>Online Users</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1vw' }}>
                    <img src={Groups} alt='group-icon' />
                    <p style={{ marginBottom: '0rem', marginTop: '0rem' }}>1</p>
                </div>
            </div>
            <div className="sideWidget2-post-card">
                <div className="sideWidget2-post-header">
                    <p style={{ marginBottom: '0rem', fontWeight: '500', fontSize: '20px' }}>Latest Activities</p>
                    <button style={{ border: 'none', backgroundColor: '#004C8A' }}><TbReload onClick={fetchNotifications} style={{
                        color: '#F8F8FF'
                    }} /></button>
                </div>
                {load ? (
                    <p style={{ textAlign: 'center' }}><l-line-spinner
                        size="20"
                        stroke="3"
                        speed="1"
                        color="rgb(19, 97, 117)"
                    ></l-line-spinner></p>
                ) : notifications.length === 0 ? (
                    <p style={{ textAlign: 'center', margin: '1rem 0' }}>No Latest Activities</p>
                ) : (
                    notifications.map(notification => (
                        <div key={notification._id} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '7px', paddingLeft: '15px', paddingRight: '5px', paddingTop: '10px', height: '11vh' }}>

                            <p style={{
                                marginBottom: '0rem', fontSize: '15px',
                                borderRadius: '18px',
                                color: '#36454F'
                            }}>
                                {notification.requestedUserName} started following {notification.followedUserName}
                            </p>
                            <p style={{
                                marginBottom: '0rem', fontSize: '12px',
                                color: '#888'
                            }}>
                                {timeAgo(notification.updatedAt)}
                            </p>
                        </div>
                    ))
                )}
            </div>
            <div className='invite'>
                <div>
                    <p style={{ marginBottom: '0rem' }}>Invite Friends</p>
                </div>

                <div className='sideWidget-email' style={{ position: 'relative', width: '100%' }}>
                    <input
                        type="text"
                        placeholder='Enter E-mail address'
                        style={{ width: '100%', padding: '10px 40px 10px 10px', boxSizing: 'border-box' }}
                    />
                    <button
                        style={{
                            position: 'absolute',
                            right: '10px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            border: 'none',
                            background: 'transparent',
                            padding: '0',
                            cursor: 'pointer'
                        }}
                    >
                        <img src={send} alt='send-icon' style={{ width: '20px', height: '20px' }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SideWidgets;
