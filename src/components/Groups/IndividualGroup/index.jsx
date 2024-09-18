import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import picture from "../../../images/d-group.jpg";
import { Link } from "react-router-dom";
import "./IndividualGroup.css";
import SocialMediaPost from "../../Social-wall-post";
import { IoMdInformationCircle } from "react-icons/io";
import { MdGroup, MdFeed } from "react-icons/md";
import { BsGlobeAmericas, BsFillTagFill } from "react-icons/bs";
import { IoIosAdd } from "react-icons/io";
import { Route, Routes } from "react-router-dom";
import { AddMembers } from "../AddMembers";
import { useSelector, useDispatch } from "react-redux";
import { FcInvite } from "react-icons/fc";
import { GroupInvite } from "../GroupInvite";
import { JoinGroup } from "../JoinGroup";
import profilePic from "../../../images/profilepic.jpg";
import baseUrl from "../../../config";
import LinkIcon from "../../../images/Link.svg";
import Add from "../../../images/Add.svg";
import { updateProfile } from "../../../store/profileSlice";
import { toast } from "react-toastify";
import GroupMembers from "../GroupMembers";
import editProfilePicture from "../../../images/edit-profile-picture.svg";
import { useCookies } from "react-cookie";
import { lineSpinner } from "ldrs";
import searchIcon from "../../../images/search.svg";
import { fetchMembers } from "../../../store";
import { Avatar } from "@mui/material";

lineSpinner.register();

const IndividualGroup = () => {
  const { _id } = useParams();
  const [group, setGroup] = useState([]);
  const [groupMembers, setGroupMembers] = useState(null);
  const profile = useSelector((state) => state.profile);
  const [isLoading, setIsLoading] = useState({});
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [sendMembers, setSendMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [cookie, setCookie] = useCookies(["token"]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [allMembers, setAllMembers] = useState([]);

  const getMembers = async () => {
    try {
      const membersData = await fetchMembers(); // Call the function from Redux
      if (membersData) {
        setAllMembers(membersData);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  const token = cookie.token;
  let admin;
  if (profile.profileLevel === 0) {
    admin = true;
  }

  const getGroup = async () => {
    try {
      setPageLoading(true);
      const response = await axios.get(`${baseUrl}/groups/${_id}`);
      setGroup([response.data]);
      setGroupMembers(response.data.members);
      setSelectedMembers(
        response.data.members.map((member) => ({
          userId: member.userId,
          profilePicture: member.profilePicture,
          userName: member.userName,
        }))
      );
      setPageLoading(false);
    } catch (error) {
      console.error("Error fetching group details:", error);
      setPageLoading(false);
    }
  };

  useEffect(() => {
    getGroup();
  }, []);

  const handleFollowToggle = async (memberId, userName) => {
    setIsLoading((prevLoading) => ({ ...prevLoading, [memberId]: true }));
    try {
      const response = await axios.patch(
        `${baseUrl}/alumni/${memberId}/follow`,
        {
          userId: profile._id,
          requestedUserName: `${profile.firstName} ${profile.lastName}`,
          followedUserName: userName,
        }
      );

      if (response.status === 200) {
        const responseData = await response.data;
        const { alumni } = responseData;
        dispatch(updateProfile(alumni));
      }
      setIsLoading((prevLoading) => ({ ...prevLoading, [memberId]: false }));
    } catch (error) {
      console.error("Error toggling follow status:", error);
      setIsLoading((prevLoading) => ({ ...prevLoading, [memberId]: false }));
    }
  };

  const isFollowing = (memberId) => {
    return profile.following.some((follower) => follower.userId === memberId);
  };

  const filteredMembers = allMembers.filter((member) =>
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleMemberSelect = (
    memberId,
    profilePicture,
    firstName,
    lastName,
    profileLevel
  ) => {
    setSelectedMembers((prevSelected) => {
      const memberIndex = prevSelected.findIndex(
        (member) => member.userId === memberId
      );

      if (memberIndex !== -1) {
        return prevSelected.filter((member) => member.userId !== memberId);
      } else {
        return [
          ...prevSelected,
          {
            userId: memberId,
            profilePicture: profilePicture,
            userName: `${firstName} ${lastName}`,
            profileLevel: profileLevel,
          },
        ];
      }
    });

    setSendMembers((prevSelected) => {
      const memberIndex = prevSelected.findIndex(
        (member) => member.userId === memberId
      );

      if (memberIndex !== -1) {
        return prevSelected.filter((member) => member.userId !== memberId);
      } else {
        return [
          ...prevSelected,
          {
            userId: memberId,
            profilePicture: profilePicture,
            userName: `${firstName} ${lastName}`,
            profileLevel: profileLevel,
          },
        ];
      }
    });
  };

  const handleSaveMembers = async () => {
    try {
      setSaving(true);
      const response = await axios.put(
        `${baseUrl}/groups/members/${group[0]._id}`,
        {
          members: sendMembers,
        }
      );
      setShowModal(false);
      setSendMembers([]);
      getGroup();
      toast.success("Group updated successfully!");
      setSaving(false);
    } catch (error) {
      console.error("Error updating members:", error);
      toast.error("Failed to update members.");
      setSaving(false);
    }
  };

  return (
    <div className="w-full">
      <Routes>
        <Route
          exact
          path="*"
          element={
            <>
              {pageLoading ? (
                <div className="text-center">
                  <l-line-spinner
                    size="30"
                    stroke="3"
                    speed="1"
                    color="black"
                  ></l-line-spinner>
                </div>
              ) : (
                group.map((groupItem) => (
                  <div key={groupItem._id} className="ig-container">
                    {/* Group content goes here */}
                  </div>
                ))
              )}
            </>
          }
        />
        <Route
          path="/add"
          element={<GroupMembers members={groupMembers} />}
        />
      </Routes>
    </div>
  );
};

export default IndividualGroup;
