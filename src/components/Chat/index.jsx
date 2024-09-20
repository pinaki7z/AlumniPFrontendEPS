import React, { useState, useEffect, useRef } from "react";
import "./chat.css";
import Picture from "../../images/profilepic.jpg";
import { FaFaceSmile } from "react-icons/fa6";
import { FiSend } from "react-icons/fi";
import Picker from "emoji-picker-react";
import { MdOutlineOpenInNew } from "react-icons/md";
import { IoMdClose } from "react-icons/io";
import { IoIosContract } from "react-icons/io";
import { Link } from "react-router-dom";
import Contact from "../../pages/Chat/Contact";
import { useSelector } from "react-redux";
import { useCookies } from "react-cookie";
import axios from "axios";
import { AiOutlinePaperClip } from "react-icons/ai";
import { uniqBy } from "lodash";
import { MdBlock } from "react-icons/md";
import { toast } from "react-toastify";
import { IoIosExpand } from "react-icons/io";
import ChatM from "../../../src/pages/Chat";
import baseUrl from "../../config";
const Chat = () => {
  const [isProfile, setIsProfile] = useState(false);
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  let [selectedUsername, setSelectedUsername] = useState("");
  const [newMessageText, setNewMessageText] = useState("");
  const profile = useSelector((state) => state.profile);
  const [messages, setMessages] = useState([]);
  const divUnderMessages = useRef();
  const [cookie, setCookie] = useCookies("token");
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const [blockLoading, setBlockLoading] = useState(false);

  const handleChatbox = (activity, username) => {
    console.log("username handlechatbox", username);
    setIsProfile(activity);
    setSelectedUsername(username);
    setShowBlockModal(false);
  };

  const [inputStr, setInputStr] = useState("");
  const [showPicker, setShowPicker] = useState(false);

  const onEmojiClick = (event, emojiObject) => {
    setInputStr((prevInput) => prevInput + emojiObject.emoji);
    setShowPicker(false);
  };

  const fetchBlockedByUsers = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/alumni/${profile._id}/blockedByUsers`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch blocked by users");
      }
      const data = await response.json();
      setBlockedByUsers(data.blockedByUserIds); // Assuming the response contains an object with blockedByUserIds array
    } catch (error) {
      console.error("Error fetching blocked by users:", error.message);
      // Optionally handle the error here
    }
  };
  const fetchBlockedUsers = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/alumni/${profile._id}/blockedUsers`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch blocked by users");
      }
      const data = await response.json();
      setBlockedUsers(data.blockedUsers);
    } catch (error) {
      console.error("Error fetching blocked by users:", error.message);
    }
  };

  console.log("blocked by", blockedByUsers);
  console.log("blocked users", blockedUsers);

  useEffect(() => {
    fetchBlockedByUsers();
    fetchBlockedUsers();
    connectToWs();

    return () => {
      disconnectFromWs();
    };
  }, []);

  useEffect(() => {
    fetchBlockedByUsers();
    fetchBlockedUsers();
  }, [selectedUserId]);

  const connectToWs = () => {
    console.log("Connecting to WS");
    if (ws === null || !ws || ws) {
      console.log("Connecting..");
      const ws = new WebSocket("wss://alumni-backend-chi.vercel.app/");
      ws.addEventListener("message", handleMessage);
      setWs(ws);
    }
    // if (ws) {
    //   alert('ws is present')
    // }
    return;
  };
  console.log("ws creation", ws);

  const disconnectFromWs = () => {
    console.log("Disconnecting from WS");
    console.log("ws", ws);
    if (ws) {
      console.log("ws present for deletion");
      ws.close();
      setWs(null);
      console.log("WebSocket connection closed");
    }
  };

  const showOnlinePeople = (peopleArray) => {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePeople(people);
  };
  const handleMessage = (ev) => {
    const messageData = JSON.parse(ev.data);
    console.log({ ev, messageData });
    if ("online" in messageData) {
      console.log("online");
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      console.log("text");

      if (selectedUserId === null) {
        console.log("messageData", messageData);
        setSelectedUserId(messageData.sender);
      }
      console.log(
        "selecteduserId,messageData sender",
        selectedUserId,
        messageData.sender
      );
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  };
  console.log("selectedUserId", selectedUserId);

  const sendMessage = async (ev, file = null) => {
    console.log("sending message");
    if (ev) {
      ev.preventDefault();
    }

    try {
      await fetchBlockedByUsers();
      console.log("blockedByUsers:", blockedByUsers);

      if (blockedByUsers.includes(selectedUserId)) {
        console.log("The user has blocked you");
        return;
      }

      ws.send(
        JSON.stringify({
          recipient: selectedUserId,
          text: newMessageText,
          file,
        })
      );

      if (file) {
        console.log("file", file);
        const res = await axios.get(`${baseUrl}/messages/${selectedUserId}`, {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
        });
        console.log("message file", res.data);
        setMessages((prev) => [
          ...prev,
          {
            file: file.name,
            sender: profile._id,
            recipient: selectedUserId,
            _id: Date.now(),
            createdAt: Date.now(),
          },
        ]);
      } else {
        console.log("no file message");
        setNewMessageText("");
        setMessages((prev) => [
          ...prev,
          {
            text: newMessageText,
            sender: profile._id,
            recipient: selectedUserId,
            _id: Date.now(),
            createdAt: Date.now(),
          },
        ]);
      }
    } catch (error) {
      console.error("Error sending message:", error.message);
      // Optionally handle the error here
    }
  };

  const sendFile = (ev) => {
    if (ev.target.files) {
      const file = ev.target.files[0];
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > 50) {
        console.log("File size exceeds 50MB. Please select a smaller file.");
        alert("File size exceeds 50MB. Please select a smaller file.");
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64Data = reader.result.split(",")[1];
        sendMessage(null, {
          name: file.name,
          data: base64Data,
        });
      };
    }
  };

  useEffect(() => {
    const div = divUnderMessages.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  useEffect(() => {
    axios
      .get(`${baseUrl}/alumni/all/allAlumni`, {
        headers: {
          Authorization: `Bearer ${cookie.token}`,
        },
      })
      .then((res) => {
        console.log("res data", res.data);
        const offlinePeopleArray = res.data
          .filter((p) => p._id !== profile._id)
          .filter((p) => p.profileLevel !== 2)
          .filter((p) => p.profileLevel !== 3)
          .filter((p) => p.profileLevel !== null)
          .filter((p) => !Object.keys(onlinePeople).includes(p._id));
        const offlinePeople = {};
        offlinePeopleArray.forEach((p) => {
          offlinePeople[p._id] = p;
        });
        setOfflinePeople(offlinePeople);
      });
  }, [onlinePeople]);

  useEffect(() => {
    const div = divUnderMessages.current;
    console.log("selected user id in useEffect", selectedUserId);
    if (selectedUserId) {
      axios
        .get(`${baseUrl}/messages/${selectedUserId}`, {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
        })
        .then((res) => {
          setMessages(res.data);
        });
    }
  }, [selectedUserId]);

  const onlinePeopleExclOurUser = { ...onlinePeople };
  delete onlinePeopleExclOurUser[profile._id];

  const messagesWithoutDupes = uniqBy(messages, "_id");

  const formatCreatedAt = (createdAt) => {
    const options = { hour: "numeric", minute: "numeric", hour12: true };
    const timeString = new Date(createdAt).toLocaleTimeString(
      undefined,
      options
    );
    const dateString = new Date(createdAt).toLocaleDateString();

    return `${timeString} ${dateString}`;
  };
  console.log("selected username ", selectedUsername);

  const handleBlock = () => {
    console.log("handling block");
    setShowBlockModal(true);
  };

  const handleConfirmBlock = (userId) => {
    const profileId = profile._id;

    setBlockLoading(true);
    axios
      .put(`${baseUrl}/alumni/${profileId}/blockUser`, {
        blockedUserId: userId,
      })
      .then((response) => {
        console.log("User blocked successfully");
        setShowBlockModal(false);
        fetchBlockedByUsers();
        fetchBlockedUsers();
        toast.success(
          `${
            blockedUsers.includes(selectedUserId)
              ? "User unblocked"
              : "User blocked"
          }`
        );
        setBlockLoading(false);
      })
      .catch((error) => {
        console.error("Error blocking user:", error);
        // Handle error, if needed
      });
  };
  const handleCancelBlock = () => {
    setShowBlockModal(false);
  };
  console.log("show block modal", showBlockModal);

  //   const [isFullscreen, setIsFullscreen] = useState(false);
  //   const toggleFullscreen = () => {
  //     setIsFullscreen(!isFullscreen);
  // };
  // const chatStyle = isFullscreen ? {
  //   position: 'fixed',
  //   top: 0,
  //   left: 0,
  //   width: '100%',
  //   height: '100%',
  //   zIndex: 1000,
  //   backgroundColor: '#174873',
  //   display: 'flex',
  //   flexDirection: 'row', // Assuming you want a column layout when fullscreen
  // } : {
  //   width: '100%', // '100%' should be in quotes
  //   display: 'flex',
  //   justifyContent: 'space-between',
  //   padding: '10px',
  //   backgroundColor: 'black',
  //   borderRadius: '10px 10px 0 0', // Correct syntax for border-radius
  //   height: '20%',
  // };
  // const [isFullscreen, setIsFullscreen] = useState(false);

  // const toggleFullscreen = () => {
  //   const elem = document.querySelector('.profile-chat'); // adjust this selector to target the specific element you want fullscreen
  //   if (!document.fullscreenElement) {
  //     elem.requestFullscreen().catch(err => {
  //       alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
  //     });
  //     setIsFullscreen(true);
  //   } else {
  //     document.exitFullscreen();
  //     setIsFullscreen(false);
  //   }
  // };

  // useEffect(() => {
  //   const handleFullscreenChange = () => {
  //     setIsFullscreen(!!document.fullscreenElement);
  //   };

  //   document.addEventListener("fullscreenchange", handleFullscreenChange);

  //   return () => {
  //     document.removeEventListener("fullscreenchange", handleFullscreenChange);
  //   };
  // }, []);
  const [showPopup, setShowPopup] = useState(false);

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="w-full bg-gray-800 text-white shadow-lg overflow-y-auto">
        <div className="p-4 bg-gray-900 text-2xl font-bold">Contacts</div>
        <div className="space-y-2 p-2">
          {Object.keys(onlinePeopleExclOurUser).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={true}
              username={onlinePeopleExclOurUser[userId]}
              onClick={() => {
                setSelectedUserId(userId);
                handleChatbox(true, onlinePeopleExclOurUser[userId]);
              }}
              selected={userId === selectedUserId}
            />
          ))}
          {Object.keys(offlinePeople).map((userId) => (
            <Contact
              key={userId}
              id={userId}
              online={false}
              username={offlinePeople[userId].firstName}
              onClick={() => {
                setSelectedUserId(userId);
                handleChatbox(true, offlinePeople[userId].firstName);
              }}
              selected={userId === selectedUserId}
            />
          ))}
        </div>
      </div>
      {isProfile && !!selectedUserId && (
        <div className="flex-1 flex flex-col bg-white">
          <div className="bg-indigo-600 text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center space-x-4">
              <img
                src={Picture}
                className="w-12 h-12 rounded-full border-2 border-white"
                alt="Profile"
              />
              <span className="font-semibold text-xl">{selectedUsername}</span>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={togglePopup}
                className="p-2 rounded-full hover:bg-indigo-500 transition duration-200"
              >
                <IoIosExpand className="text-2xl" />
              </button>
              {selectedUsername !== "SuperAdmin" && (
                <button
                  onClick={handleBlock}
                  className="p-2 rounded-full hover:bg-indigo-500 transition duration-200"
                >
                  <MdBlock className="text-2xl" />
                </button>
              )}
              <button
                onClick={() => handleChatbox(false)}
                className="p-2 rounded-full hover:bg-indigo-500 transition duration-200"
              >
                <IoMdClose className="text-2xl" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto
          
          p-6 bg-gray-50">
            {messagesWithoutDupes.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender === profile._id
                    ? "justify-end"
                    : "justify-start"
                } mb-4`}
              >
                <div
                  className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 shadow-md ${
                    message.sender === profile._id
                      ? "bg-indigo-500 text-white"
                      : "bg-white"
                  }`}
                >
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {formatCreatedAt(message.createdAt)}
                  </p>
                  {message.file && (
                    <div className="mt-2 flex items-center space-x-2 text-xs">
                      <AiOutlinePaperClip className="text-lg" />
                      <a
                        href={`${baseUrl}/uploads/${message.file}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-indigo-300"
                      >
                        {message.file}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
            <div ref={divUnderMessages}></div>
          </div>
          {blockedByUsers.includes(selectedUserId) ? (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 text-sm">
              The user has blocked you. Learn{" "}
              <a href="#" className="underline hover:text-red-800">
                more
              </a>
            </div>
          ) : blockedUsers.includes(selectedUserId) ? (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 text-sm">
              You have blocked this user. Unblock to continue chat.
            </div>
          ) : (
            <form
              onSubmit={sendMessage}
              className="bg-gray-100 p-4 flex items-center space-x-3"
            >
              <label className="p-2 bg-white rounded-full cursor-pointer hover:bg-gray-200 transition duration-200">
                <input type="file" className="hidden" onChange={sendFile} />
                <AiOutlinePaperClip className="text-gray-600 text-xl" />
              </label>
              <input
                type="text"
                value={newMessageText}
                onChange={(ev) => setNewMessageText(ev.target.value)}
                placeholder="Type a message"
                className="flex-1 p-3 border-2 border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
              />
              <button
                type="submit"
                className="bg-indigo-500 text-white p-3 rounded-full hover:bg-indigo-600 transition duration-200"
              >
                <FiSend className="text-xl" />
              </button>
            </form>
          )}
        </div>
      )}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-2xl w-11/12 h-5/6 max-w-4xl">
            <div className=" border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">Chat Details</h2>
              <button
                onClick={togglePopup}
                className="text-gray-500 hover:text-gray-700 transition duration-200"
              >
                <IoIosContract className="text-3xl" />
              </button>
            </div>
            <div className=" h-full w-full  ">
              <ChatM userId={selectedUserId} />
            </div>
          </div>
        </div>
      )}
      {showBlockModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-96 shadow-2xl">
            <p className="text-xl font-semibold mb-6 text-gray-800">
              Are you sure you want to{" "}
              {blockedUsers.includes(selectedUserId) ? "unblock" : "block"} this
              user?
            </p>
            <div className="flex justify-end space-x-4">
              {blockLoading ? (
                <span className="text-indigo-500">Loading...</span>
              ) : (
                <>
                  <button
                    onClick={() => handleConfirmBlock(selectedUserId)}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-200"
                  >
                    Yes
                  </button>
                  <button
                    onClick={handleCancelBlock}
                    className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition duration-200"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
