import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import picture from "../../images/d-cover.jpg";
import { useSelector } from "react-redux";
import Feeed from "../../components/Feeed";
import about from "../../images/about.svg";
import work from "../../images/work.svg";
import location from "../../images/location.svg";
import time from "../../images/Time.svg";
import arrowRight from "../../images/arrowRight.svg";
import { fetchMembers } from "../../store";
import { Avatar } from "@mui/material";

const Profile = () => {
  const { id } = useParams();
  const [members, setMembers] = useState([]);
  const [member, setMember] = useState(null);
  const [currentWork, setCurrentWork] = useState(null);

  useEffect(() => {
    const foundMember = members.find((member) => member._id === id);
    setMember(foundMember);
    if (foundMember) {
      const currentWorkExp = foundMember.workExperience.find(
        (exp) => exp.endMonth.toLowerCase() === "current"
      );
      setCurrentWork(currentWorkExp);
    }
  }, [members, id]);

  const getMembers = async () => {
    try {
      const membersData = await fetchMembers();
      if (membersData) {
        setMembers(membersData);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  return (
    <div className="w-full px-6 py-8 lg:px-24">
      {member ? (
        <div className="relative w-full bg-white rounded-lg shadow-lg">
          {/* Upper section with cover image */}
          <div
            className="w-full h-56 lg:h-72 bg-cover bg-center rounded-t-lg"
            style={{
              backgroundImage: `url(${member.coverPicture || picture})`,
            }}
          ></div>

          {/* Profile Picture */}
          <div className="absolute top-1/1 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Avatar
              src={member.profilePicture || picture}
              alt="profile"
              sx={{ width: "140px", height: "140px" }}
              className=" rounded-full border-4 border-white"
            />
          </div>

          {/* Lower section with member details */}
          <div className="bg-gray-50 p-6 rounded-b-lg">
            <div className="text-center mt-16">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-800">
                {member.firstName} {member.lastName}
              </h2>
              <p className="text-sm lg:text-base text-gray-500">
                {member.profileLevel === 1
                  ? "ADMIN"
                  : member.profileLevel === 2
                    ? "ALUMNI"
                    : member.profileLevel === 3
                      ? "STUDENT"
                      : "SUPERADMIN"}
              </p>
              <p className="mt-2 text-sm lg:text-base text-gray-700">
                Passionate soul, chasing dreams, inspiring others, embracing
                life's adventures joyfully.
              </p>

              <div className="flex justify-center mt-4 space-x-6">
                <div className="text-center">
                  <p className="text-sm lg:text-base text-gray-500">Groups</p>
                  <p className="font-semibold text-lg lg:text-xl text-gray-800">
                    {member?.groupNames?.length ?? '0'}
                  </p>

                </div>
                {/* <div className="text-center">
                  <p className="text-sm lg:text-base text-gray-500">Followers</p>
                  <p className="font-semibold text-lg lg:text-xl text-gray-800">0</p>
                </div>
                <div className="text-center">
                  <p className="text-sm lg:text-base text-gray-500">Following</p>
                  <p className="font-semibold text-lg lg:text-xl text-gray-800">0</p>
                </div> */}
              </div>

              <div className="flex justify-around mt-6">
                <button className="px-4 py-2 bg-[#004C8A] text-white rounded font-medium hover:bg-[#1e5887]">
                  Message
                </button>
                {/* <button className="px-4 py-2 bg-[#004C8A] text-white rounded font-medium hover:bg-[#1e5887]">
                  Follow
                </button> */}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-[90vh]">
          <div className="spinner-border animate-spin w-8 h-8 border-4 rounded-full border-blue-500"></div>
        </div>
      )}

      <div className="lg:flex lg:gap-8 mt-10">
        {member && (
          <>
            {/* Posts/Feed Section */}
            <div className="w-full lg:w-3/4">
              <Feeed
                entityType="posts"
                showCreatePost={false}
                showDeleteButton={true}
                userId={member._id}
              />
            </div>

            {/* About & Work Section */}
            <div className="w-full lg:w-1/4 mt-8 lg:mt-0 space-y-6">
              {/* About Section */}
              <div className="bg-white rounded shadow-md ">
                <div className="flex rounded-t p-2 items-center space-x-4 bg-[#004C8A]">
                  <img src={about} alt="About Icon" className="w-6 h-6" />
                  <h3 className="text-lg text-white font-semibold">About {member.firstName}</h3>
                </div>
                <p className="mt-4 text-sm p-3 text-gray-600">
                  {member.aboutMe || "User has not updated their bio"}
                </p>
              </div>

              {/* Work Section */}
              <div className="bg-white rounded-lg shadow-md ">
                <div className="flex items-center bg-[#004C8A] rounded-t p-3 space-x-4">
                  <img src={work} alt="Work Icon" className="w-6 h-6" />
                  <h3 className="text-lg text-white font-semibold">Currently Working As</h3>
                </div>
                <p className="mt-4 text-sm p-3 text-gray-600">
                  {currentWork ? currentWork.title : "No current work info"}
                </p>
                {currentWork && (
                  <div className="mt-4 p-2">
                    <p className="text-sm font-medium text-blue-600">
                      {currentWork.companyName}
                    </p>
                    {currentWork.startMonth && currentWork.startYear && (
                      <div className="flex items-center space-x-2 mt-2 text-sm">
                        <img src={time} alt="Time Icon" className="w-4 h-4" />
                        <span>
                          {currentWork.startMonth} {currentWork.startYear} -{" "}
                          {currentWork.endMonth}
                        </span>
                      </div>
                    )}
                    {currentWork.location && currentWork.locationType && (
                      <div className="flex items-center space-x-2 mt-2 text-sm">
                        <img src={location} alt="Location Icon" className="w-4 h-4" />
                        <span>{`${currentWork.location} - ${currentWork.locationType}`}</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="flex p-3 justify-between items-center border-t py-4 mt-4">
                  <p className="text-sm">Work Experience</p>
                  <img src={arrowRight} alt="Arrow Right" className="w-4 h-4" />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
