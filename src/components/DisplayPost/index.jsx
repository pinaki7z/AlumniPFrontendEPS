import "./displayPost.css";
import NoGroups from "../Groups/NoGroups";
import picture from "../../images/d-group.jpg";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import axios from "axios";
import { lineSpinner } from "ldrs";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import React from "react";
import baseUrl from "../../config";
import groupMembers from "../../images/Groups-c.svg";
import groupPic from "../../images/d-group.jpg";

lineSpinner.register();

const DisplayPost = ({ title, groups = [], loading, joined }) => {
  const profile = useSelector((state) => state.profile);
  const [notificationList, setNotificationList] = useState([]);
  const [modalShow, setModalShow] = React.useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [selectedGroupName, setSelectedGroupName] = useState("");
  const [selectedGroupUserId, setSelectedGroupUserId] = useState("");
  const navigateTo = useNavigate();
  console.log("groups display post", groups);
  const admin = profile.profileLevel === 0;

  const getRequest = async () => {
    try {
      const response = await axios.get(`${baseUrl}/groups/requests/req`);
      setNotificationList(response.data);
    } catch (error) {
      console.error("Error fetching request:", error);
    }
  };

  useEffect(() => {
    getRequest();
  }, []);

  const GroupItem = ({ group }) => {
    const [requestStatus, setRequestStatus] = useState("Request to Join");
    console.log("request ", requestStatus);

    function MyVerticallyCenteredModal(props) {
      return (
        <Modal
          {...props}
          size="lg"
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">
              Verify your Business
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <h4>Upload a document:-</h4>
            <input
              type="file"
              name="businessVerification"
              id="businessVerification"
            />
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleRequest}>Submit</Button>
            <Button onClick={props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
      );
    }

    useEffect(() => {
      const matchingNotification = notificationList.find(
        (notification) =>
          notification.groupId === group._id &&
          notification.userId === profile._id
      );
      if (matchingNotification) {
        setRequestStatus("Requested");
      } else {
        setRequestStatus("Request to Join");
      }
    }, [group._id, notificationList, profile._id]);

    const handleRequest = async (
      ownerId,
      groupId,
      userId,
      groupName,
      firstName,
      lastName
    ) => {
      if (document.getElementById("businessVerification")) {
        setRequestStatus("Loading...");
        const formData = new FormData();
        const requestedUserName = `${profile.firstName} ${profile.lastName}`;
        const userId = profile._id;
        const body = {
          ownerId: selectedGroupUserId,
          groupId: selectedGroupId,
          userId,
          groupName: selectedGroupName,
          requestedUserName,
        };
        const pdfFile = document.getElementById("businessVerification")
          .files[0];

        formData.append("businessVerification", pdfFile);

        for (const key in body) {
          formData.append(key, body[key]);
        }

        try {
          const config = {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          };
          const response = await axios.post(
            `${baseUrl}/groups/createRequest`,
            formData,
            config
          );
          setModalShow(false);
          toast.success("requested");
          if (response.data.requested === true) {
            setRequestStatus("Requested");
            console.log("requested if");
          } else setRequestStatus("Request to Join");
        } catch (error) {
          console.error("Error creating request:", error);
        }
      }

      setRequestStatus("Loading...");
      try {
        const requestedUserName = `${firstName} ${lastName}`;
        const body = {
          ownerId,
          groupId,
          userId,
          groupName,
          requestedUserName,
        };
        const response = await axios.post(
          `${baseUrl}/groups/createRequest`,
          body
        );
        console.log("body", response.data);
        if (response.data.requested === true) setRequestStatus("Requested");
        else setRequestStatus("Request");
      } catch (error) {
        console.error("Error creating request:", error);
      }
    };

    const handleAddMember = async (groupId) => {
      console.log("adding member", groupId);
      try {
        const response = await axios.put(
          `${baseUrl}/groups/members/${groupId}`,
          {
            members: {
              userId: profile._id,
              profilePicture: profile.profilePicture,
              userName: `${profile.firstName} ${profile.lastName}`,
              profileLevel: profile.profileLevel,
            },
          }
        );

        if (response.status === 200) {
          const { isUserAdded } = response.data;
          if (isUserAdded === true) {
            toast.success("added");
            navigateTo(`/groups/${groupId}`);
          }
          if (isUserAdded === false) {
            toast.success("removed");
          }
          console.log("User added/removed to/from the group:", isUserAdded);
        } else {
          console.error("Failed to add/remove user to/from the group");
        }
      } catch (error) {
        console.error("Error adding/removing user to/from the group:", error);
      }
    };

    return (
      <div
  key={group._id}
  className="w-full min-h-[300px] md:min-h-[400px] bg-[#FEF7E7] border border-gray-300 rounded-lg overflow-hidden shadow-lg"
>
  {profile.profileLevel === 0 ||
  (group.groupType === "Public" &&
    group.members.some((member) => member.userId === profile._id)) ||
  (group.groupType === "Private" &&
    group.members.some((member) => member.userId === profile._id)) ||
  group.businessConnect === true ? (
    <Link to={`/groups/${group._id}`} className="block h-full">
      <div className="relative w-full h-[50vw] md:h-[80%] overflow-hidden rounded-t-lg">
        <div
          className="w-full h-full bg-cover bg-center"
          style={{
            backgroundImage: group.groupPicture
              ? `url(${group.groupPicture})`
              : `url(${groupPic})`,
            backgroundColor: group.groupPicture ? "transparent" : "#FFFFFF",
          }}
        ></div>
        <p className="absolute top-2 right-4 bg-white py-1 px-3 border border-gray-200 text-xs md:text-sm font-semibold rounded-lg">
          {group.groupType}
        </p>
      </div>
      <div className="p-2 md:p-4">
        <p className="font-semibold text-base md:text-lg">{group.groupName}</p>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-2 mt-2">
          <div className="flex justify-start gap-3">
            <img src={groupMembers} alt="" className="w-4 h-4 md:w-5 md:h-5" />
            <p className="text-gray-500 text-xs md:text-sm font-medium">
              {group.members.length} Members
            </p>
          </div>
          <div className="text-gray-500 text-xs md:text-md font-medium">
            22nd April 2024
          </div>
        </div>
      </div>
    </Link>
  ) : (
    <div className="relative w-full h-[50vw] md:h-[80%] overflow-hidden rounded-t-lg">
      <div
        className="w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: group.groupPicture
            ? `url(${group.groupPicture})`
            : `url(${groupPic})`,
          backgroundColor: group.groupPicture ? "transparent" : "#FFFFFF",
        }}
      ></div>
      <p className="absolute top-2 right-4 bg-white py-1 px-3 border border-gray-200 text-xs md:text-sm font-semibold rounded-lg">
        {group.groupType}
      </p>
    </div>
  )}

  <div className="p-2 md:p-4 flex justify-end">
    {group.groupType === "Public" &&
    !group.members.some((member) => member.userId === profile._id) ? (
      <button
        onClick={() => handleAddMember(group._id)}
        className="py-1 md:py-2 px-4 md:px-6 bg-blue-600 text-white text-xs md:text-sm font-semibold rounded-md hover:bg-blue-500 transition"
      >
        Join
      </button>
    ) : (
      group.groupType === "Private" &&
      !group.members.some((member) => member.userId === profile._id) && (
        <button
          className="py-1 md:py-2 px-4 md:px-6 bg-blue-600 text-white text-xs md:text-sm font-semibold rounded-md hover:bg-blue-500 transition"
          onClick={() => {
            if (group.category === "Business Connect") {
              if (requestStatus === "Requested") {
                handleRequest(
                  group.userId,
                  group._id,
                  profile._id,
                  group.groupName,
                  profile.firstName,
                  profile.lastName
                );
              } else {
                setModalShow(true);
                setSelectedGroupId(group._id);
                setSelectedGroupName(group.groupName);
                setSelectedGroupUserId(group.userId);
              }
            } else {
              handleRequest(
                group.userId,
                group._id,
                profile._id,
                group.groupName,
                profile.firstName,
                profile.lastName
              );
            }
          }}
        >
          {requestStatus}
        </button>
      )
    )}
  </div>

  <MyVerticallyCenteredModal
    show={modalShow}
    onHide={() => setModalShow(false)}
  />
</div>

    );
  };

  let filteredGroups;
  if (profile.department === "All") {
    filteredGroups = groups;
  } else {
    filteredGroups = groups.filter(
      (group) =>
        group.groupType === "Public" ||
        (group.groupType === "Private" &&
          profile.department === group.department) ||
        group.category === "Business Connect" ||
        group.department === "All"
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3   gap-5 mt-4 rounded-xl">
      {loading ? (
        <div
          // style={{ display: 'flex', width: '100vw', height: '40vh', alignItems: 'center', justifyContent: 'center' }}
          className="flex justify-center items-center w-[75vw] h-[40vh]"
        >
          <l-line-spinner
            size="40"
            stroke="3"
            speed="1"
            color="black"
          ></l-line-spinner>
        </div>
      ) : filteredGroups.length > 0 ? (
        filteredGroups.map((group) => (
          <GroupItem key={group._id} group={group} />
        ))
      ) : (
        <div className="display-post-noGroups">No groups</div>
      )}
    </div>
  );
};

export default DisplayPost;
