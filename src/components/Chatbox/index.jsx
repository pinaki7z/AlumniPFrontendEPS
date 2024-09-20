import React, { useState } from "react";
import Chat from "../Chat";
import ChatM from "../../pages/Chat";
import arrowUp from "../../images/arrowDoubleUp.svg";
import arrowDown from "../../images/arrowDoubleDown.svg";
import profileIcon from "../../images/profile.svg";
import expand from "../../images/expand.svg";

const Chatbox = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const togglePopup = () => {
    setShowPopup(!showPopup);
  };

  return (
    <div>
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
      <div
        className={`fixed bottom-0 right-5 shadow-lg transition-transform duration-300 ${
          isExpanded ? "h-[500px] mb-10 w-[360px]" : "h-14 w-80"
        } bg-white rounded-t-lg`}
      >
        {/* Chatbox Header */}
        <div className="flex justify-between items-center px-4 py-3 mt-1 bg-gray-200 rounded-t-lg">
          <p className="text-lg font-semibold text-gray-800">Messages</p>
          <div className="flex items-center gap-4">
            <img
              src={expand}
              alt="Expand"
              onClick={togglePopup}
              className="w-6 h-6 cursor-pointer"
            />
            <img src={profileIcon} alt="Profile" className="w-6 h-6" />
            <img
              src={isExpanded ? arrowDown : arrowUp}
              alt="Toggle"
              onClick={toggleExpand}
              className="w-6 h-6 cursor-pointer transition-transform duration-200"
            />
          </div>
        </div>

        {/* Chatbox Content */}
        {isExpanded && (
          <div className="flex flex-col justify-between  bg-white h-full">
            <div className="flex-1 custom-scrollbar overflow-auto">
              <Chat />
            </div>
          </div>
        )}

        {/* Popup Modal */}
        {showPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className=" w-3/4 h-[100%] rounded-lg relative ">
              <div className="flex  p-2 justify-end items-center">
                <div
                  className=" p-2 border bg-gray-200 hover:bg-gray-400 rounded-full cursor-pointer "
                  onClick={togglePopup}
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

              <div className="p-5 pt-0 rounded  h-full">
                <ChatM togglePopup={togglePopup} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbox;
