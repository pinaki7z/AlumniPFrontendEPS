import React from "react";
import { useParams } from "react-router-dom";
import "../Profile/profile.css";
import picture from "../../images/d-cover.jpg";
import { BiUserPlus } from "react-icons/bi";
import { LuMessageSquare } from "react-icons/lu";
import { BsThreeDotsVertical } from "react-icons/bs";
import Icons from "../../components/Icons";
import Icons1 from "../../components/Icons1";
import { useSelector, useDispatch } from "react-redux";
import { height, padding, textAlign } from "@mui/system";
import Feeed from "../../components/Feeed";
import about from "../../images/about.svg";
import work from "../../images/work.svg";
import location from "../../images/location.svg";
import time from "../../images/Time.svg";
import arrowRight from "../../images/arrowRight-w.svg";
import userProfile from "../../images/userProfile.svg";
import workExperience from "../../images/workExperience.svg";
import { arrow } from "@popperjs/core";
import { Link } from "react-router-dom";
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import baseUrl from "../../config";
import {
  HiMiniPlusCircle,
  HiMiniCheckCircle,
  HiMiniCheckBadge,
} from "react-icons/hi2";
import edit from "../../images/edit.svg";
import editProfilePicture from "../../images/edit-profile-picture.svg";
import check from "../../images/check.svg";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../../store/profileSlice";
import { toast } from "react-toastify";
import { lineSpinner } from "ldrs";
import profilePic from "../../images/profilepic.jpg";
import { fetchMembers } from "../../store";
import { Avatar } from "@mui/material";

lineSpinner.register();

const ProfilePage = () => {
  const { id } = useParams();
  console.log("member id", id);
  // const members = useSelector((state) => state.member);
  const [members, setMembers] = useState([]);
  // console.log('members profile page',members)
  const profile = useSelector((state) => state.profile);
  const [member, setMember] = useState({});
  // const member = members.find(member => member._id === profile._id);
  const [workExperiences, setWorkExperiences] = useState([]);
  const [cookie, setCookie] = useCookies(["token"]);
  const [selectedFile, setSelectedFile] = useState(null);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const getMembers = async () => {
    console.log("inside this function");
    try {
      const membersData = await fetchMembers(); // Call the function from Redux
      if (membersData) {
        console.log("membersData", membersData);
        setMembers(membersData);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };
  useEffect(() => {
    // getMembers();
    fetchData();
  }, []);
  // useEffect(() => {
  //  if(members.length > 0){
  //   setMember(members.find(member => member._id === (profile._id || id)));
  //  }
  // }, [members])

  const fetchData = () => {
    axios.get(`${baseUrl}/alumni/${id || profile._id}`).then((res) => {
      setMember(res.data);
    });
  };

  const token = cookie.token;

  const totalProperties = 5;
  let completedProperties = 0;

  if (profile && profile.profilePicture) completedProperties++;
  if (profile && profile.firstName) completedProperties++;
  if (profile && profile.workExperience && profile.workExperience.length > 0)
    completedProperties++;
  if (profile && profile.country) completedProperties++;
  if (profile && profile.city) completedProperties++;

  const completionPercentage = (completedProperties / totalProperties) * 100;

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const renderExpirationDateMessage = () => {
    if (profile.ID && profile.expirationDate) {
      return "Your account is being validated";
    }

    if (profile.expirationDate !== null) {
      const currentDate = new Date();
      const expirationDate = new Date(profile.expirationDate);
      const timeDiff = expirationDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysDiff > 0) {
        return (
          <>
            <p>
              Your account is not validated and will expire in {daysDiff} days.
              <Link to="/profile/profile-settings">
                <span> Upload your ID</span>
              </Link>
              &nbsp;&nbsp;to validate your account
            </p>
          </>
        );
      } else if (daysDiff < 0) {
        return "Your account has expired";
      }
    }
    return null;
  };

  // if (!member) {
  //   return <div>Member not found</div>;
  // }

  const fetchWorkExperiences = async () => {
    try {
      const response = await fetch(
        `${baseUrl}/alumni/workExperience/${profile._id}`,
        {
          headers: {
            Authorization: `Bearer ${cookie.token}`,
          },
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch work experiences");
      }
      const data = await response.json();
      setWorkExperiences(data);
    } catch (error) {
      console.error("Error fetching work experiences:", error);
    }
  };

  // const currentWork = member.workExperience.find(exp => exp.endMonth.toLowerCase() === 'current');
  // console.log('current work', member.workExperience)

  const findCurrentWorkingAt = () => {
    const currentWorkExperience = workExperiences.find(
      (experience) => experience.endMonth === "current"
    );
    if (currentWorkExperience) {
      return currentWorkExperience.companyName;
    } else {
      return "No current work experience found";
    }
  };

  const handleFileChange = (event, fileType) => {
    console.log("file type in handleFileChange", fileType, event);
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(reader.result);
        handleSubmit(reader.result, fileType);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (fileData, fileType) => {
    setLoading(true);
    if (!fileData) {
      alert("Please select an image to upload.");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(
        `${baseUrl}/alumni/${profile._id}`,
        {
          [fileType]: fileData,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        const responseData = await response.data;
        console.log("response data", responseData);
        dispatch(updateProfile(responseData));
        setLoading(false);
        toast.success(
          `${
            fileType === "profilePicture"
              ? "Profile Picture"
              : fileType === "coverPicture"
              ? "Cover Picture"
              : "Image"
          } updated successfully.`
        );
      } else {
        alert("Failed to update cover picture.");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error updating cover picture:", error);
      alert("An error occurred while updating the cover picture.");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-full px-2 lg:px-10 pt-2 lg:pt-16 pb-8 bg-gray-100">
        <div className="relative w-full max-w-7xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Upper Section */}
          <div
            className="w-full min-h-[35vh] bg-cover bg-center rounded-t-lg relative"
            style={{ backgroundImage: `url(${profile.coverPicture})` }}
          >
            {/* Expiration Date Message */}
            {renderExpirationDateMessage() && (
              <div className="flex justify-center pb-6">
                <p className="text-orangered text-2xl font-semibold bg-cornsilk w-7/10 p-2.5 rounded mb-2.5">
                  {renderExpirationDateMessage()}
                </p>
              </div>
            )}

            {/* Edit Buttons */}
            <div className="flex justify-between lg:px-20 px-4 space-x-4 pt-5">
              {/* Cover Picture Upload */}
              <div className="rounded-lg font-bold">
                <input
                  type="file"
                  name="coverPicture"
                  id="coverPicture"
                  onChange={(event) => handleFileChange(event, "coverPicture")}
                  className="hidden"
                />
                <button
                  type="button"
                  className="flex items-center gap-2 border-2 border-[#F8A700] text-[#004C8A] bg-white px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition"
                  onClick={() =>
                    document.getElementById("coverPicture").click()
                  }
                >
                  <img src={edit} alt="edit" className="w-5 h-5" />
                  <span>Edit Cover</span>
                </button>
              </div>

              {/* Edit Profile Link */}
              <Link to="/profile/profile-settings" className="no-underline">
                <button className="border-2  border-[#F8A700] text-[#004C8A] bg-white px-4 py-2 rounded-lg font-bold hover:bg-gray-50 transition">
                  Edit Profile
                </button>
              </Link>
            </div>

            {/* Loading Spinner */}
            {loading && (
              <div className="flex justify-center mt-4">
                <l-line-spinner
                  size="30"
                  stroke="3"
                  speed="1"
                  color="black"
                  className="bg-whitesmoke p-5 rounded"
                />
              </div>
            )}
          </div>

          {/* Profile Picture */}
          <div className="absolute lg:top-[20vh] top-[120px] left-1/2 transform -translate-x-1/2">
            <div className="relative">
              <Avatar
                src={profile.profilePicture || profilePic}
                alt="profile-picture"
                sx={{width:"150px" , height:"150px"}}
                className=" rounded-full border-4 border-white object-cover"
              />
              <input
                type="file"
                name="profilePicture"
                id="profilePicture"
                onChange={(event) => handleFileChange(event, "profilePicture")}
                className="hidden"
              />
              <img
                src={editProfilePicture}
                alt="edit-profile"
                className="absolute top-0 right-0 w-10 h-10 cursor-pointer"
                onClick={() =>
                  document.getElementById("profilePicture").click()
                }
              />
            </div>
          </div>

          {/* Lower Section */}
          <div className="bg-[#eeeeee] pt-14 pb-8 rounded-b-lg">
            <div className="flex justify-center px-4">
              <div className="w-full max-w-4xl">
                <div className="text-center">
                  <p className="font-bold flex items-center justify-center gap-3 text-gray-800 text-2xl">
                    {member.firstName} {member.lastName}{" "}
                    {profile.validated && (
                      <HiMiniCheckBadge className="inline text-[#51a8f5]" />
                    )}
                  </p>
                  <p className="font-light text-black text-sm">
                    {member.profileLevel === 1
                      ? "ADMIN"
                      : member.profileLevel === 2
                      ? "ALUMNI"
                      : member.profileLevel === 3
                      ? "STUDENT"
                      : "SUPERADMIN"}
                  </p>
                  <p className="font-medium text-gray-800 text-base mt-2">
                    Passionate soul, chasing dreams, inspiring others, embracing
                    life's adventures joyfully.
                  </p>
                  <div className="flex justify-center space-x-8 mt-4">
                    {/* Groups */}
                    <Link
                      to={`/groups/${profile._id}/joined-groups`}
                      className="no-underline text-center"
                    >
                      <p className="text-sm">Groups</p>
                      <p className="font-medium text-gray-800 text-lg">
                        {profile.groupNames.length}
                      </p>
                    </Link>

                    {/* Followers */}
                    <Link
                      to={`/profile/${profile._id}/followers`}
                      className="no-underline text-center"
                    >
                      <p className="text-sm">Followers</p>
                      <p className="font-medium text-gray-800 text-lg">
                        {profile.followers.length}
                      </p>
                    </Link>

                    {/* Following */}
                    <Link
                      to={`/profile/${profile._id}/following`}
                      className="no-underline text-center"
                    >
                      <p className="text-sm">Following</p>
                      <p className="font-medium text-gray-800 text-lg">
                        {profile.following.length}
                      </p>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-3  max-w-7xl mx-auto">
          {/* Feed Section */}
          <div className="w-full lg:w-2/3">
            <Feeed
              entityType="posts"
              showCreatePost={false}
              showDeleteButton={true}
              userId={member._id}
            />
          </div>

          {/* Sidebar Section */}
          <div className="w-full lg:w-1/3 mt-9 space-y-8">
            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow">
              <div className="bg-[#004C8A] text-[#F8F8FF] rounded-t-lg px-4 py-3 flex items-center gap-4">
                <img
                  src={userProfile}
                  alt="Profile Completion"
                  className="w-6 h-6"
                />
                <p className="font-semibold text-xl">Profile Completion</p>
              </div>
              <div className="p-4">
                {/* Progress Bar */}
                {completionPercentage < 100 && (
                  <div className="w-full mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <p className="text-sm text-black">
                        {Math.round(completionPercentage)}%
                      </p>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-green-500 h-2.5 rounded-full"
                          style={{ width: `${completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                {/* Completion List */}
                <ul className="space-y-2">
                  {/* Profile Picture */}
                  <li>
                    {profile?.profilePicture ? (
                      <p className="flex items-center text-green-600">
                        <img
                          src={check}
                          alt="checked"
                          className="w-4 h-4 mr-2"
                        />
                        Profile Picture Added
                      </p>
                    ) : (
                      <Link
                        to="/profile/profile-settings"
                        className="flex items-center text-black hover:text-blue-600"
                      >
                        <HiMiniPlusCircle className="w-5 h-5 mr-2 text-blue-500" />
                        Add your profile picture
                      </Link>
                    )}
                  </li>

                  {/* Name */}
                  <li>
                    {profile?.firstName ? (
                      <p className="flex items-center text-green-600">
                        <img
                          src={check}
                          alt="checked"
                          className="w-4 h-4 mr-2"
                        />
                        Name: {profile.firstName}
                      </p>
                    ) : (
                      <Link
                        to="/profile/profile-settings"
                        className="flex items-center text-black hover:text-blue-600"
                      >
                        <HiMiniPlusCircle className="w-5 h-5 mr-2 text-blue-500" />
                        Add your name
                      </Link>
                    )}
                  </li>

                  {/* Workplace */}
                  <li>
                    {profile?.workExperience?.length > 0 ? (
                      <p className="flex items-center text-green-600">
                        <img
                          src={check}
                          alt="checked"
                          className="w-4 h-4 mr-2"
                        />
                        Workplace: {findCurrentWorkingAt()}
                      </p>
                    ) : (
                      <Link
                        to="/profile/profile-settings"
                        className="flex items-center text-black hover:text-blue-600"
                      >
                        <HiMiniPlusCircle className="w-5 h-5 mr-2 text-blue-500" />
                        Add your workplace
                      </Link>
                    )}
                  </li>

                  {/* Country */}
                  <li>
                    {profile?.country ? (
                      <p className="flex items-center text-green-600">
                        <img
                          src={check}
                          alt="checked"
                          className="w-4 h-4 mr-2"
                        />
                        Country: {profile.country}
                      </p>
                    ) : (
                      <Link
                        to="/profile/profile-settings"
                        className="flex items-center text-black hover:text-blue-600"
                      >
                        <HiMiniPlusCircle className="w-5 h-5 mr-2 text-blue-500" />
                        Add your country
                      </Link>
                    )}
                  </li>

                  {/* Address */}
                  <li>
                    {profile?.city ? (
                      <p className="flex items-center text-green-600">
                        <img
                          src={check}
                          alt="checked"
                          className="w-4 h-4 mr-2"
                        />
                        Address: {profile.city}
                      </p>
                    ) : (
                      <Link
                        to="/profile/profile-settings"
                        className="flex items-center text-black hover:text-blue-600"
                      >
                        <HiMiniPlusCircle className="w-5 h-5 mr-2 text-blue-500" />
                        Add your address
                      </Link>
                    )}
                  </li>
                </ul>
              </div>
            </div>

            {/* About Me */}
            <div className="bg-white rounded-lg shadow">
              <div className="bg-[#004C8A] text-[#F8F8FF] rounded-t-lg px-4 py-3 flex items-center gap-4">
                <img src={about} alt="About Me" className="w-6 h-6" />
                <p className="font-semibold text-xl">About Me</p>
              </div>
              <p className="bg-[#FEF7E7] rounded-b-lg p-4 font-medium text-base text-gray-600">
                {member.aboutMe
                  ? member.aboutMe
                  : "User has not updated their Bio"}
              </p>
            </div>

            {/* Work Experience */}
            <Link to="/profile/workExperience" className="no-underline">
              <div className="bg-[#004C8A] mt-5 rounded-lg shadow flex items-center justify-between p-4 hover:bg-gray-600 transition">
                <div className="flex items-center gap-4">
                  <img
                    src={workExperience}
                    alt="Work Experience"
                    className="w-6 h-6"
                  />
                  <p className="font-semibold text-xl text-white">Work Experience</p>
                </div>
                <img src={arrowRight} alt="Arrow Right" className="w-4 h-4" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;
