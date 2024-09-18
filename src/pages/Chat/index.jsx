import { useEffect, useRef, useState } from "react";
import { IoMdChatbubbles } from "react-icons/io";
import Avatar from "./Avatar";
import "./Chat.css";
import Logo from "./Logo";
import { useSelector } from "react-redux";
import { uniqBy } from "lodash";
import axios from "axios";
import { useCookies } from "react-cookie";
import Contact from "./Contact";
import { useNavigate } from "react-router-dom";
import { AiOutlinePaperClip } from "react-icons/ai";
import baseUrl from "../../config";

const Chat = ({ userId, togglePopup }) => {
  console.log("selected user id from chat", userId);
  const [ws, setWs] = useState(null);
  const [onlinePeople, setOnlinePeople] = useState({});
  const [offlinePeople, setOfflinePeople] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const profile = useSelector((state) => state.profile);
  const [messages, setMessages] = useState([]);
  const divUnderMessages = useRef();
  const [cookie, setCookie] = useCookies("token");
  const [blockedByUsers, setBlockedByUsers] = useState([]);
  const [blockedUsers, setBlockedUsers] = useState([]);
  const navigateTo = useNavigate();

  useEffect(() => {
    fetchBlockedByUsers();
    fetchBlockedUsers();
    connectToWs();
    console.log("CHAT PAGE");

    return () => {
      console.log("Unmounting Chat component...");
      disconnectFromWs();
    };
  }, [selectedUserId]);

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

  console.log("blocked by1", blockedByUsers);
  console.log("blocked users1", blockedUsers);

  const connectToWs = () => {
    console.log("connecting");
    const ws = new WebSocket("ws://alumni-backend-chi.vercel.app/");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  };

  const disconnectFromWs = () => {
    console.log("Disconnecting from WebSocket server...");
    if (ws) {
      ws.close();
      setWs(null);
      console.log("WebSocket connection closed");
    }
  };

  // const Lout = () => {

  //   disconnectFromWs();
  //   navigateTo("/");

  // };

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
      if (messageData.sender === selectedUserId) {
        setMessages((prev) => [...prev, { ...messageData }]);
      }
    }
  };

  const sendMessage = (ev, file = null) => {
    if (ev) {
      ev.preventDefault();
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
      axios
        .get(`${baseUrl}/messages/${selectedUserId}`, {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
        })
        .then((res) => {
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
        });
    } else {
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
  };

  const sendFile = (ev) => {
    console.log("file");
    const file = ev.target.files[0];
    const fileSizeMB = file.size / (1024 * 1024);
    console.log("file size", file.size, fileSizeMB);
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
      <div className="flex h-[90vh] rounded-lg z-50 bg-gray-100">
        <div className="w-1/4 bg-white shadow rounded-lg h-[90vh] overflow-y-auto">
          <div className="p-4 overflow-hidden bg-[#004C8A]">
            <Logo className="w-32 text-white mx-auto" />
          </div>
          <div className="">
            <div className="p-4 rounded-lg space-y-2">
              {Object.keys(onlinePeopleExclOurUser).map((userId) => (
                <Contact
                  key={userId}
                  id={userId}
                  online={true}
                  username={onlinePeopleExclOurUser[userId]}
                  onClick={() => setSelectedUserId(userId)}
                  selected={userId === selectedUserId}
                />
              ))}
              {Object.keys(offlinePeople).map((userId) => (
                <Contact
                  key={userId}
                  id={userId}
                  online={false}
                  username={offlinePeople[userId].firstName}
                  onClick={() => setSelectedUserId(userId)}
                  selected={userId === selectedUserId}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="flex-1 flex flex-col shadow  rounded-lg bg-gray-50">
          {!selectedUserId ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 text-xl">
              Select a person from the sidebar to start chatting
            </div>
          ) : (
            <>
              <div className="bg-white shadow-md p-4 h-[65px] rounded-lg flex items-center justify-between ">
                <div className="flex items-center">
                  <Avatar
                    userId={selectedUserId}
                    username={
                      onlinePeopleExclOurUser[selectedUserId] ||
                      offlinePeople[selectedUserId]?.firstName
                    }
                  />
                  <span className="ml-4 font-semibold text-lg">
                    {onlinePeopleExclOurUser[selectedUserId] ||
                      offlinePeople[selectedUserId]?.firstName}
                  </span>
                 </div>
                 
              </div>
              <div className="flex-1 overflow-y-auto mr-2 p-4 custom-scrollbar space-y-4">
                {messagesWithoutDupes.map((message) => (
                  <div
                    key={message._id}
                    className={`flex ${
                      message.sender === profile._id
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md xl:max-w-lg rounded-lg p-3 ${
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
                            className="underline hover:text-indigo-200"
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
              <div className="bg-white p-4 rounded-lg border-t">
                {blockedByUsers.includes(selectedUserId) ? (
                  <div className="text-red-500 text-center">
                    The user has blocked you.{" "}
                    <a href="#" className="underline">
                      Learn more
                    </a>
                  </div>
                ) : blockedUsers.includes(selectedUserId) ? (
                  <div className="text-yellow-500 text-center">
                    You have blocked this user. Unblock to continue chat.
                  </div>
                ) : (
                  <form
                    onSubmit={sendMessage}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="text"
                      value={newMessageText}
                      onChange={(ev) => setNewMessageText(ev.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <label className="p-2 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300 transition duration-200">
                      <input
                        type="file"
                        className="hidden"
                        onChange={sendFile}
                      />
                      <AiOutlinePaperClip className="text-gray-600 " />
                    </label>
                    <button
                      type="submit"
                      className="p-2 px-3 bg-indigo-500 flex items-center gap-2 text-white rounded-full hover:bg-indigo-600 transition duration-200"
                    >
                      Send{" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-send"
                        className=""
                        viewBox="0 0 16 16"
                      >
                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                      </svg>
                    </button>
                  </form>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Chat;
