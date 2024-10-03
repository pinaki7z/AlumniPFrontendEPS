"use client";

import React, { useState, useEffect, useRef } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import enUS from "date-fns/locale/en-US";
import "react-big-calendar/lib/css/react-big-calendar.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarPlus } from "react-icons/fa";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import axios from "axios";
import { Avatar } from "@mui/material";
import { useParams } from "react-router-dom";
import baseUrl from "../../config";

const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function EventCalendar() {
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [attendees, setAttendees] = useState();
  const [isEditing, setIsEditing] = useState(false);
  const [modalShow, setModalShow] = useState(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState(null);
  const [selectedEventDetailsPopup, setSelectedEventDetailsPopup] =
    useState(null);
  const [loading, setLoading] = useState(false);
  const [addEventLoading, setAddEventLoading] = useState(false);
  const [deleteEventLoading, setDeleteEventLoading] = useState(false);
  const [editEventLoading, setEditEventLoading] = useState(false);
  const [reminderModalShow, setReminderModalShow] = useState(false);
  const calendarRef = useRef(null);
  const profile = useSelector((state) => state.profile);
  const { _id } = useParams();

  const [newEvent, setNewEvent] = useState({
    title: "",
    start: new Date(),
    end: new Date(),
    startTime: "00:00",
    endTime: "00:00",
    picture: "",
    cName: "",
    cNumber: "",
    cEmail: "",
    location: "",
  });

  const isAdmin = profile.profileLevel === 0 || profile.profileLevel === 1;

  useEffect(() => {
    fetchEvents();
    if (_id) {
      fetchEventDetails(_id);
    }
  }, [_id]);

  const fetchEvents = async () => {
    try {
      const response = await axios.get(`${baseUrl}/events`);
      const eventsWithDates = response.data.map((event) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        id: event._id,
      }));
      setAllEvents(eventsWithDates);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    }
  };

  // const fetchEvents = async () => {
  //   try {
  //     const response = await axios.get(`${baseUrl}/events`);
  //     const eventsWithDates = response.data.map((event) => ({
  //       ...event,
  //       start: new Date(event.start),
  //       end: new Date(event.end),
  //       id: event._id,
  //     }));
  //     setAllEvents(eventsWithDates);
  //   } catch (error) {
  //     console.error("Error fetching events:", error);
  //     toast.error("Failed to fetch events");
  //   }
  // };

  const fetchEventDetails = async (eventId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/events/${eventId}`);
      setSelectedEventDetailsPopup(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching event details:", error);
      setLoading(false);
      toast.error("Failed to fetch event details");
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    checkAttendanceStatus(event._id);
    setIsEditing(true);
    setSelectedEventDetails(event);
  };

  const checkAttendanceStatus = async (eventId) => {
    try {
      const response = await axios.get(
        `${baseUrl}/events/attendees/${eventId}`
      );
      setAttendees(response.data);
    } catch (error) {
      console.error("Error fetching attendees:", error);
      toast.error("Failed to fetch attendees");
    }
  };

  // const handleAddEvent = async () => {
  //   try {
  //     const response = await axios.post(`${baseUrl}/events/createEvent`, {
  //       ...newEvent,
  //       userId: profile._id,
  //       userName: `${profile.firstName} ${profile.lastName}`,
  //       profilePicture: profile.profilePicture,
  //       department: profile.department,
  //     });
  //     setAllEvents([...allEvents, response.data]);
  //     setModalShow(false);
  //     toast.success("Event added successfully");
  //     resetNewEvent();
  //   } catch (error) {
  //     console.error("Error adding event:", error);
  //     toast.error("Failed to add event");
  //   }
  // };

  const handleAddEvent = async () => {
    try {
      setAddEventLoading(true);
      const eventToAdd = {
        ...newEvent,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
        userId: profile._id,
        userName: `${profile.firstName} ${profile.lastName}`,
        profilePicture: profile.profilePicture,
        department: profile.department,
      };
      const response = await axios.post(`${baseUrl}/events/createEvent`, eventToAdd);
      setAllEvents([...allEvents, { ...response.data, start: new Date(response.data.start), end: new Date(response.data.end) }]);
      setModalShow(false);
      toast.success("Event added successfully");
      setAddEventLoading(false);
      resetNewEvent();
    } catch (error) {
      console.error("Error adding event:", error);
      toast.error("Failed to add event");
      setAddEventLoading(false);
    }
  };

  // const handleEditEvent = async () => {
  //   try {
  //     const response = await axios.put(
  //       `${baseUrl}/events/${selectedEvent._id}`,
  //       newEvent
  //     );
  //     const updatedEvents = allEvents.map((event) =>
  //       event._id === selectedEvent._id ? response.data : event
  //     );
  //     setAllEvents(updatedEvents);
  //     setModalShow(false);
  //     setIsEditing(false);
  //     toast.success("Event updated successfully");
  //     resetNewEvent();
  //   } catch (error) {
  //     console.error("Error updating event:", error);
  //     toast.error("Failed to update event");
  //   }
  // };

  const handleEditEvent = async () => {
    try {
      const eventToUpdate = {
        ...newEvent,
        start: new Date(newEvent.start),
        end: new Date(newEvent.end),
      };
      const response = await axios.put(
        `${baseUrl}/events/${selectedEvent._id}`,
        eventToUpdate
      );
      const updatedEvents = allEvents.map((event) =>
        event._id === selectedEvent._id ? { ...response.data, start: new Date(response.data.start), end: new Date(response.data.end) } : event
      );
      setAllEvents(updatedEvents);
      setModalShow(false);
      setIsEditing(false);
      toast.success("Event updated successfully");
      resetNewEvent();
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };


  const handleDeleteEvent = async () => {
    
    if (!selectedEvent) return;
    try {
      setDeleteEventLoading(true);
      await axios.delete(`${baseUrl}/events/${selectedEvent._id}`);
      setAllEvents(
        allEvents.filter((event) => event._id !== selectedEvent._id)
      );
      setSelectedEvent(null);
      setIsEditing(false);
      setSelectedEventDetails(null);
      setDeleteEventLoading(false);
      toast.success("Event deleted successfully");
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
      setDeleteEventLoading(false);
    }
  };

  const resetNewEvent = () => {
    setNewEvent({
      title: "",
      start: new Date(),
      end: new Date(),
      startTime: "00:00",
      endTime: "00:00",
      picture: "",
      cName: "",
      cNumber: "",
      cEmail: "",
      location: "",
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-semibold text-[#174873] text-center mb-8">
        Event Calendar
      </h1>
      <div ref={calendarRef} className="bg-white rounded-lg shadow-lg p-4">
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "60vh" }}
          selectable
          onSelectEvent={handleEventClick}
        />
      </div>
      <div className="flex justify-end mt-4">
        {isAdmin && (
          <button
            onClick={() => {
              setIsEditing(false);
              setModalShow(true);
            }}
            className="bg-[#174873] text-white rounded-full w-16 h-16 flex items-center justify-center text-2xl shadow-lg hover:bg-[#0d2b4a] transition-colors duration-300"
          >
            <FaCalendarPlus />
          </button>
        )}
      </div>

      {modalShow && (
        <EventModal
          isEditing={isEditing}
          newEvent={newEvent}
          setNewEvent={setNewEvent}
          addEventLoading={addEventLoading}
          setAddEventLoading={setAddEventLoading}
          editEventLoading={editEventLoading}
          setEditEventLoading={setEditEventLoading}
          onClose={() => {
            setModalShow(false);
            resetNewEvent();
          }}
          onSubmit={isEditing ? handleEditEvent : handleAddEvent}
        />
      )}

      {selectedEventDetails && (
        <EventDetailsModal
          event={selectedEventDetails}
          onClose={() => setSelectedEventDetails(null)}
          onEdit={() => {
            setNewEvent(selectedEventDetails);
            setModalShow(true);
          }}
          onDelete={handleDeleteEvent}
          deleteEventLoading={deleteEventLoading}
          setDeleteEventLoading={setDeleteEventLoading}
          onAddReminder={() => setReminderModalShow(true)}
          attendees={attendees}
          profile={profile}
        />
      )}

      {reminderModalShow && (
        <ReminderModal
          event={selectedEventDetails}
          onClose={() => setReminderModalShow(false)}
        />
      )}

      {loading && <LoadingSpinner />}
    </div>
  );
}

function EventModal({ isEditing, newEvent, setNewEvent, onClose, onSubmit, addEventLoading, setAddEventLoading, editEventLoading, setEditEventLoading }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewEvent({ ...newEvent, [name]: value });
  };

  const handleDateChange = (date, field) => {
    setNewEvent({ ...newEvent, [field]: date });
  };

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

  return (
    <>
      <style>
        {`
          /* Internal CSS for scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px; /* Adjust scrollbar width here */
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1; /* Track color */
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #888; /* Thumb color */
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555; /* Thumb hover color */
          }
        `}
      </style>
      <div className="fixed inset-0 bg-gray-800 bg-opacity-80   flex justify-center items-center z-50">
        <div className="  bg-white p-4 rounded-lg mx-3  shadow-xl">
          <div className="flex justify-between mb-3 items-center">
            <h2 className="text-2xl font-bold ">
              {isEditing ? "Edit Event" : "Add Event"}
            </h2>

            <div
              onClick={onClose}
              className="flex justify-center cursor-pointer items-center p-2  bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-x-lg"
                viewBox="0 0 16 16"
              >
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
              </svg>
            </div>
          </div>
          <div
            className=" lg:h-[400px] h-[500px]  w-full bg-gray-100 rounded  p-2 max-w-2xl custom-scrollbar overflow-x-auto"
            style={{ scrollbarWidth: "thin", scrollbarColor: "#888 #f1f1f1" }}
          >
            {" "}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSubmit();
              }}
              className="space-y-4"
            >
              <input
                type="text"
                name="title"
                value={newEvent.title}
                onChange={handleChange}
                placeholder="Event Title"
                className="w-full p-2 border rounded"
                required
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <DatePicker
                    selected={newEvent.start}
                    onChange={(date) => handleDateChange(date, "start")}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <DatePicker
                    selected={newEvent.end}
                    onChange={(date) => handleDateChange(date, "end")}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="time"
                  name="startTime"
                  value={newEvent.startTime}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
                <input
                  type="time"
                  name="endTime"
                  value={newEvent.endTime}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                />
              </div>
              <input
                type="text"
                name="location"
                value={newEvent.location}
                onChange={handleChange}
                placeholder="Event Location"
                className="w-full p-2 border rounded"
              />
              <input
                type="text"
                name="cName"
                value={newEvent.cName}
                onChange={handleChange}
                placeholder="Coordinator Name"
                className="w-full p-2 border rounded"
              />
              <input
                type="tel"
                name="cNumber"
                value={newEvent.cNumber}
                onChange={handleChange}
                placeholder="Coordinator Number"
                className="w-full p-2 border rounded"
              />
              <input
                type="email"
                name="cEmail"
                value={newEvent.cEmail}
                onChange={handleChange}
                placeholder="Coordinator Email"
                className="w-full p-2 border rounded"
              />
              <input
                type="file"
                onChange={handleImageChange}
                className="w-full p-2 border rounded"
              />
              <div className="flex mt-2 justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  // type="submit"
                  onSubmit={onSubmit}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {addEventLoading
                    ? "Adding Event..."
                    : editEventLoading
                      ? "Updating Event..."
                      : isEditing
                        ? "Update Event"
                        : "Add Event"}
                </button>

              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

function EventDetailsModal({
  event,
  onClose,
  onEdit,
  onDelete,
  onAddReminder,
  attendees,
  profile,
  deleteEventLoading,
  setDeleteEventLoading
}) {
  return (
    <>
      <style>
        {`
          /* Internal CSS for scrollbar */
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px; /* Adjust scrollbar width here */
          }
          
          .custom-scrollbar::-webkit-scrollbar-track {
            background: #f1f1f1; /* Track color */
          }
          
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: #888; /* Thumb color */
            border-radius: 10px;
          }

          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: #555; /* Thumb hover color */
          }
        `}
      </style>
      <div className="fixed inset-0 bg-gray-600 bg-opacity-80 flex  justify-center items-center z-50">
        <div className="bg-white  mx-3 p-3 rounded-lg">
          <div className="flex justify-between mb-2 items-center">
            <h2 className="text-2xl font-bold ">{event.title}</h2>{" "}
            <div
              onClick={onClose}
              className="flex justify-center cursor-pointer items-center p-2  bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-x-lg"
                viewBox="0 0 16 16"
              >
                <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z" />
              </svg>
            </div>
          </div>
          <div className=" lg:h-[350px] h-[500px] custom-scrollbar overflow-x-auto  w-full max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p>
                  <span className="font-semibold">Start:</span>{" "}
                  {formatDate(event.start)}
                </p>
                <p>
                  <span className="font-semibold">End:</span>{" "}
                  {formatDate(event.end)}
                </p>
                <p>
                  <span className="font-semibold">Time:</span> {event.startTime}{" "}
                  - {event.endTime}
                </p>
                <p>
                  <span className="font-semibold">Location:</span>{" "}
                  {event.location}
                </p>
                <p>
                  <span className="font-semibold">Coordinator:</span>{" "}
                  {event.cName}
                </p>
                <p>
                  <span className="font-semibold">Contact:</span>{" "}
                  {event.cNumber}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {event.cEmail}
                </p>
              </div>
              <div>
                <img
                  src={event.picture}
                  alt={event.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            </div>
            <div className="mt-6 flex flex-wrap lg gap-4">
              {/* <button
                onClick={onAddReminder}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add Reminder
              </button> */}
              {(event.userId === profile._id || profile.profileLevel === 0) && (
                <>
                  <button
                    onClick={() => {
                      onEdit();
                      onClose();
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Edit Event
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    {deleteEventLoading ? 'Deleting...' : 'Delete Event'}
                  </button>
                </>
              )}
            </div>
            {attendees && (
              <div className="mt-6">
                <h3 className="text-xl font-semibold mb-2">Attendees</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {["willAttend", "mightAttend", "willNotAttend"].map(
                    (status) => (
                      <div key={status}>
                        <h4 className="font-medium mb-2">
                          {status
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())}
                        </h4>
                        <div className="space-y-2">
                          {attendees[status].map((user) => (
                            <div
                              key={user.userId}
                              className="flex items-center gap-2"
                            >
                              <Avatar
                                src={user.profilePicture}
                                alt={user.userName}
                                className="w-8 h-8"
                              />
                              <span>{user.userName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function ReminderModal({ event, onClose }) {
  const [reminderDate, setReminderDate] = useState(new Date());
  const [reminderTime, setReminderTime] = useState("12:00");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the reminder data to your backend
    console.log("Reminder set for:", reminderDate, reminderTime);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">
          Set Reminder for {event.title}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="reminderDate"
              className="block text-sm font-medium text-gray-700"
            >
              Date
            </label>
            <DatePicker
              id="reminderDate"
              selected={reminderDate}
              onChange={(date) => setReminderDate(date)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div>
            <label
              htmlFor="reminderTime"
              className="block text-sm font-medium text-gray-700"
            >
              Time
            </label>
            <input
              type="time"
              id="reminderTime"
              value={reminderTime}
              onChange={(e) => setReminderTime(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Set Reminder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
      <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-[#174873]"></div>
    </div>
  );
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}
