import pic from "../../../images/profilepic.jpg";
import { Avatar, IconButton, Modal as MModal, Box, Menu, MenuItem } from '@mui/material';
import { MoreVert } from '@mui/icons-material';
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
import baseUrl from "../../../config";
import { Col, Row } from 'react-bootstrap';
import Button from 'react-bootstrap/Button';
import DatePicker from "react-datepicker";
import Modal from 'react-bootstrap/Modal';

lineSpinner.register();

const EventDisplay = ({ event }) => {
  const profile = useSelector((state) => state.profile);
  const [newEvent, setNewEvent] = useState(event);
  const [isEditing, setIsEditing] = useState(false);
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [attendees, setAttendees] = useState();
  const [loading, setLoading] = useState(false);
  const [modalShow, setModalShow] = React.useState(false);
  const [open, setOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);

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
    console.log('handling attendance');
    setLoading(true);
    console.log('event title', event.title, attendance);
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
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const handleDeleteEvent = async () => {
    console.log('deleting event');
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

  const handleEditEvent = () => {
    console.log("Edit event");
    setIsEditing(true);
    setModalShow(true);
    setMenuAnchor(null);
  };

  const handleArchiveEvent = () => {
    console.log("Archive event");
    setMenuAnchor(null);
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
              <label htmlFor={newEvent.picture} style={{ marginTop: '20px' }}>Insert a Picture:-</label>
              <br />
              <input type="file" name={newEvent.picture}
                style={{ width: '60%' }}
                onChange={handleImageChange} />


              <input
                type="text"
                placeholder="Enter Coordinator Name"
                style={{ width: "100%", padding: "0.5em", borderRadius: "10px", marginTop: '20px' }}
                value={newEvent.cName}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, cName: e.target.value })
                }
              />
              <input
                type="text"
                placeholder="Enter event location"
                style={{ width: "100%", padding: "0.5em", borderRadius: "10px", marginTop: '10px' }}
                value={newEvent.location}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, location: e.target.value })
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
            <input type="time" id="appt" name="startTime" style={{marginTop: '20px'}} value={newEvent.startTime} onChange={(e) =>
              setNewEvent({ ...newEvent, startTime: e.target.value })
            } />
            <br /><br />
            <input
              type="number"
              placeholder="Enter Coordinator Contact Number"
              style={{ width: "100%", padding: "0.5em", borderRadius: "10px",marginTop: '26px' }}
              value={newEvent.cNumber}
              onChange={(e) =>
                setNewEvent({ ...newEvent, cNumber: e.target.value })
              }
            />

            {/* <input
              type="text"
              placeholder="Enter event location"
              style={{ width: "100%", padding: "0.5em", borderRadius: "10px" }}
              value={newEvent.location}
              onChange={(e) =>
                setNewEvent({ ...newEvent, location: e.target.value })
              }
            /> */}

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
              <input type="time" id="appt" name="endTime" style={{marginTop: '20px'}} value={newEvent.endTime} onChange={(e) =>
                setNewEvent({ ...newEvent, endTime: e.target.value })
              } />
              <input
                type="email"
                placeholder="Enter Coordinator Email"
                style={{ width: "100%", padding: "0.5em", borderRadius: "10px",marginTop: '45px' }}
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
    <>

      <div className='top'>
        {event.profilePicture ? (
          <img src={event.profilePicture} style={{ width: '50px', height: '50px', borderRadius: '50%' }} />
        ) : (
          <Avatar src={pic} style={{ width: '50px', height: '50px' }} />
        )}
        <div className='info'>
          <h4>{event.userName ? event.userName : null}</h4>
          <span style={{ fontSize: '14px', fontWeight: '500', color: '#004C8A' }}>{formatCreatedAt(event.createdAt)}</span>
        </div>
        <MyVerticallyCenteredModal
          show={modalShow}
          isEditing={isEditing}
          selectedEvent={event}
          onHide={() => {
            setModalShow(false);
            //setSelectedEventDetails(null);
          }}
        />
        {(event.userId === profile._id) && (
          <>
            <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)} className='more-button' style={{ marginLeft: 'auto', color: 'black' }}>
              <MoreVert />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              <MenuItem onClick={handleEditEvent}>Edit</MenuItem>
              <MenuItem onClick={handleArchiveEvent}>Archive</MenuItem>
              <MenuItem onClick={handleDeleteEvent}>Delete</MenuItem>
            </Menu>
          </>
        )}
      </div>
      <div style={{ paddingTop: '20px' }}>
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

      <MModal
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
      </MModal>

    </>
  );
}

export default EventDisplay;
