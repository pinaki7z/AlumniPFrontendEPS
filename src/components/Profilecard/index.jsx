import React, { useState, useEffect } from "react";
import "./profilecard.css";
import picture from "../../images/profilepic.jpg";
import { HiUsers } from "react-icons/hi";
import { IoIosReorder } from "react-icons/io";
import { MdLocationOn } from "react-icons/md";
import Swal from 'sweetalert2';
import { BiUserPlus } from "react-icons/bi";
import { Link } from "react-router-dom";
import axios from "axios";
import { useCookies } from "react-cookie";
import { orbit } from "ldrs";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import delButton from "../../images/deleteButton.svg";
import profileImage from "../../images/profileImage.png";
import { MdOutlineRestore } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import baseUrl from "../../config";
import { updateProfile } from "../../store/profileSlice";
import { toast } from "react-toastify";
import { Avatar } from "@mui/material";

orbit.register();

const Profilecard = ({
  member,
  name,
  addButton,
  groupMembers,
  owner,
  deleteButton,
  handleDelete,
}) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [cookie, setCookie] = useCookies(["access_token"]);
  const [loading, setLoading] = useState(true);
  const { _id, id } = useParams();
  const dispatch = useDispatch();
  let [isAdded, setIsAdded] = useState();
  const profile = useSelector((state) => state.profile);
  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }
  const isFollowPresent = window.location.href.includes("follow");
  console.log("isFollowPresent", member);

  const isGroupURL = window.location.href.includes(
    "http://localhost:3000/groups/"
  );
  const isForumURL = window.location.href.includes(
    "http://localhost:3000/forums/"
  );

  useEffect(() => {
    // if (isGroupURL) {
    //   setIsAdded(groupMembers.includes(member._id));
    // }
    if (isForumURL) {
      setIsAdded(groupMembers.includes(member._id));
    }
  }, [isGroupURL, groupMembers, member._id]);

  useEffect(() => {
    const checkFollowingStatus = async () => {
      try {
        const response = await axios.get(
          `${baseUrl}/alumni/${profile._id}/following/all`
        );
        const followingDetails = response.data.followingDetails;
        const isUserFollowing = followingDetails.some(
          (detail) => detail.userId === member._id
        );
        setIsFollowing(isUserFollowing);
        setLoading(false);
      } catch (error) {
        console.error("Error checking following status:", error);
      }
    };

    checkFollowingStatus();
  }, [member._id, profile._id, isAdded]);

  const handleFollowToggle = async () => {
    setLoading(true);
    try {
      if (!isFollowing) {
        const response = await axios.patch(
          `${baseUrl}/alumni/${member._id}/follow`,
          {
            userId: profile._id,
          }
        );
        if (response.status === 200) {
          const responseData = await response.data;
          const { alumni } = responseData;
          dispatch(updateProfile(alumni));
          toast.success("Followed");
          setIsFollowing(true);
          setLoading(false);
        }
      } else {
        const response = await axios.patch(
          `${baseUrl}/alumni/${member._id}/follow`,
          {
            userId: profile._id,
          }
        );
        if (response.status === 200) {
          const responseData = await response.data;
          const { alumni } = responseData;
          dispatch(updateProfile(alumni));
          toast.success("Unfollowed");
          setIsFollowing(false);
          setLoading(false);
        }
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setLoading(false);
    }
  };

  const handleAddMember = async (groupId, memberId) => {
    console.log("handle add ", groupId, memberId);
    setLoading(true);
    try {
      const response = await axios.put(
        `${baseUrl}/${isGroupURL
          ? `groups/members/${groupId}`
          : isForumURL
            ? `forums/members/${groupId}`
            : ""
        }`,
        {
          userId: memberId,
        }
      );

      if (response.status === 200) {
        const { isUserAdded } = response.data;
        if (isUserAdded === true) {
          setIsAdded(true);
          setLoading(false);
        }
        if (isUserAdded === false) {
          setIsAdded(false);
          setLoading(false);
        }
        console.log("User added/removed to/from the group:", isUserAdded);
      } else {
        console.error("Failed to add/remove user to/from the group");
      }
    } catch (error) {
      console.error("Error adding/removing user to/from the group:", error);
    }
  };

  const isOwner = member._id === owner;

  const onDeleteChange = () => {
    Swal.fire({
      title: member?.accountDeleted === true ? 'This account will be restored' : 'This account will be deactivated',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes',
      cancelButtonText: 'No',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          handleDelete()

        } catch (error) {
          console.error('Error deleting alumni:', error);
          toast.dismiss();
          toast.error('An error occurred while deleting');
        }
      }
    });
  }


  return (
    <>
      <div className="border text-card-foreground py-4 sm:py-6 px-2 sm:px-4 bg-background shadow-md rounded-lg overflow-hidden relative w-full sm:w-96 md:w-80 lg:w-64">
        {addButton && (
          <button
            onClick={
              isOwner ? null : () => handleAddMember(_id ? _id : id, member._id)
            }
            disabled={isOwner}
            className="absolute top-2 right-2 bg-gray-200 hover:bg-gray-300 text-black rounded-full p-2"
          >
            {isOwner ? (
              "Group Admin"
            ) : isAdded ? (
              "Remove"
            ) : (
              <BiUserPlus style={{ fontSize: "17px" }} />
            )}
          </button>
        )}
        <div className="flex flex-col items-center">
          <div className="flex justify-center mb-4">
            <Avatar
              src={member?.profilePicture}
              alt="Member Avatar"
              style={{ width: "65px", height: "65px" }}
              className="rounded-full object-cover w-20 h-20 sm:w-20 sm:h-20"
            />
          </div>
          {admin &&
            deleteButton &&
            !(profile.profileLevel === 1 && member.profileLevel === 1) && (
              <>
                {member.accountDeleted === true ? (
                  <MdOutlineRestore
                    onClick={onDeleteChange}
                    className="absolute top-2 right-2 text-gray-500 cursor-pointer"
                    style={{ width: "25px", height: "25px" }}
                  />
                ) : (
                  <img
                    src={delButton}
                    onClick={onDeleteChange}
                    className="absolute top-2 right-2 bg-white p-1 cursor-pointer"
                    style={{ width: "25px", height: "25px" }}
                  />
                )}
              </>
            )}
        </div>
        <Link
          to={
            isFollowPresent
              ? `/members/${member.userId}`
              : `/members/${member._id}`
          }
          className="text-center mb-3 no-underline text-black"
        >
          <h3 className="font-semibold text-md mb-1 ">
            {member.userName || `${member.firstName} ${member.lastName}`}
          </h3>
          <div className="flex justify-center ">
            <h3 className="text-md border px-2 rounded-[4px] bg-[#F8A700] mb-1  font-semibold">
              {member.profileLevel === 1
                ? "ADMIN"
                : member.profileLevel === 2
                  ? "ALUMNI"
                  : member.profileLevel === 3
                    ? "STUDENT"
                    : "SUPER ADMIN"}
            </h3>
          </div>
          <p className="text-muted-foreground">{member.department}</p>
          <div className="flex justify-center mb-2 gap-4 mt-2">
            {member?.class && (
              <div>
                <p className="text-gray-600 font-medium text-sm">Class</p>
                <p className="text-black font-medium text-lg">{member?.class}</p>
              </div>
            )}
            {member?.graduatingYear && (
              <div>
                <p className="text-gray-600 font-medium text-sm">Graduated Year</p>
                <p className="text-black font-medium text-lg">{member?.graduatingYear}</p>
              </div>
            )}
          </div>

        </Link>
        <br />
        {/* {loading ? (
          <div className="text-center mt-4">
            <l-orbit size="35" speed="1.5" color="black"></l-orbit>
          </div>
        ) : (
          name !== "follow" && (
            <button
              onClick={handleFollowToggle}
              className={`absolute left-0 bottom-0 w-full h-12 font-semibold text-lg ${
                isFollowing
                  ? "bg-[#004C8A] text-white"
                  : "bg-[#F8A700] text-black"
              } hover:bg-[#F8A700]`}
              style={{ borderRadius: "0 0 8px 8px" }}
            >
              {isFollowing ? "Following" : "Follow"}
            </button>
          )
        )} */}
        {(profile.profileLevel === 0 || profile.profileLevel === 1) && (
          <button
            // onClick={handleFollowToggle}
            className={`absolute left-0 bottom-0 w-full h-12 font-semibold text-lg bg-[#004C8A] text-white hover:bg-[#F8A700]`}
            style={{ borderRadius: "0 0 8px 8px" }}
          >
            Message
          </button>
        )}

      </div>
    </>
  );
};

export default Profilecard;
