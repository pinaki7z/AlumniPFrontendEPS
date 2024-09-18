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
import { lineSpinner } from 'ldrs';
import searchIcon from "../../../images/search.svg"
import { fetchMembers } from "../../../store";
lineSpinner.register()

const IndividualGroup = () => {
    const { _id } = useParams();
    const [group, setGroup] = useState([]);
    const [groupMembers, setGroupMembers] = useState(null);
    const profile = useSelector((state) => state.profile);
    const [isLoading, setIsLoading] = useState({});
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    // const allMembers = useSelector((state) => state.member);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [sendMembers, setSendMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);
    const [cookie, setCookie] = useCookies(["token"]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [saving,setSaving]= useState(false);
    const [allMembers, setAllMembers] = useState([]);

    
  const getMembers = async () => {
    console.log('inside this function')
    try {
      const membersData = await fetchMembers(); // Call the function from Redux
      if (membersData) {
        console.log("membersData", membersData);
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
  };

  useEffect(() => {
    getGroup();
  }, []);

  const handleFollow = async (memberId) => {
    setIsLoading((prev) => ({ ...prev, [memberId]: true }));
    setTimeout(() => {
      setIsLoading((prev) => ({ ...prev, [memberId]: false }));
    }, 2000);
  };

  const handleFollowToggle = async (memberId, userName) => {
    setIsLoading((prevLoading) => ({ ...prevLoading, [memberId]: true }));
    console.log("firstname lastname", userName);
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
    console.log("member id", memberId);
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
    console.log("selectedMembers", sendMembers, group[0]._id);
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
        `${baseUrl}/groups/${_id}`,
        {
          [fileType]: fileData,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        const responseData = await response.data;
        console.log("response data", responseData);
        setLoading(false);
        getGroup();
        toast.success(
          `${
            fileType === "groupPicture"
              ? "Group Picture"
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
                    <div className="w-full rounded-xl relative">
                      <div
                        className="bg-cover bg-center w-full min-h-[35vh] rounded-t-xl"
                        style={{
                          backgroundImage: `url(${profile.coverPicture})`,
                        }}
                      >
                        <div className="flex justify-end pt-5 pr-12">
                          {(profile._id === groupItem.userId || admin) && (
                            <Link to={`/groups/edit/${_id}`}>
                              <button className="bg-white border-2 border-[#6FBC94] rounded-full text-[#136175] px-4 py-2">
                                Edit
                              </button>
                            </Link>
                          )}
                        </div>
                      </div>

                      <div className="absolute lg:top-2/3 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                          <Avatar
                            src={
                              groupItem.groupPicture
                                ? groupItem.groupPicture
                                : profilePic
                            }
                            style={{ width: "150px", height: "150px" }}
                            alt="profile-picture"
                            className="rounded-full border-4 border-white"
                          />
                          <input
                            type="file"
                            name="profilePicture"
                            id="profilePicture"
                            className="hidden"
                            onChange={(event) =>
                              handleFileChange(event, "groupPicture")
                            }
                          />
                          <img
                            src={editProfilePicture}
                            alt="edit-profile-picture"
                            className="rounded-full border-4 border-white absolute top-5  right-5 cursor-pointer"
                            onClick={() =>
                              document.getElementById("profilePicture").click()
                            }
                          />
                          {loading && (
                            <l-line-spinner
                              size="30"
                              stroke="3"
                              speed="1"
                              color="black"
                              className="bg-white p-5 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                            ></l-line-spinner>
                          )}
                        </div>
                      </div>

                      <div className="bg-[#FEF7E7] w-full min-h-[15vh] rounded-b-xl py-5 px-4 lg:px-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-0 text-center lg:text-left">
                          <div>
                            <p className="font-semibold text-[#3A3A3A] text-2xl font-Inter">
                              {groupItem.groupName}
                            </p>
                            <p className="flex justify-center lg:justify-start items-center text-sm text-[#7a7a7a] mt-2">
                              <BsGlobeAmericas />
                              &nbsp;&nbsp;{groupItem.groupType}
                            </p>
                            <p className="flex justify-center lg:justify-start items-center text-sm text-[#7a7a7a] mt-2">
                              <BsFillTagFill />
                              &nbsp;&nbsp;{groupItem.category}
                            </p>
                          </div>

                          <div className="flex justify-center lg:justify-end gap-8">
                            <div className="text-center">
                              <p className="font-normal text-sm font-Inter">
                                Posts
                              </p>
                              <p className="font-medium text-lg font-Inter">
                                0
                              </p>
                            </div>
                            <div className="text-center">
                              <p className="font-normal text-sm font-Inter">
                                Members
                              </p>
                              <p className="font-medium text-lg font-Inter">
                                {groupItem.members.length}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row w-full container mx-auto gap-6 py-6">
                      <Routes>
                        <Route
                          exact
                          path="/"
                          element={
                            <SocialMediaPost
                              className="ml-0"
                              showCreatePost={true}
                              groupID={_id}
                            />
                          }
                        />
                        <Route
                          exact
                          path="/groupInvite"
                          element={<GroupInvite className="w-full pt-12" />}
                        />
                        <Route
                          exact
                          path="/invite"
                          element={<JoinGroup className="w-full" />}
                        />
                      </Routes>
                      <div className="w-full lg:w-[35%] pt-12">
                        <div className="ig-lc-card">
                          {(profile._id === groupItem.userId || admin) && (
                            <div>
                              <ul>
                                <li
                                  className="flex justify-end"
                                  onClick={() => setShowModal(true)}
                                >
                                  <div className="bg-[#F8A700] hover:bg-[#eab751] w-full flex gap-2 font-bold text-md cursor-pointer text-gray-800 rounded-lg p-2">
                                    <img src={Add} alt="" />
                                    Add or Remove Members From Group
                                  </div>
                                </li>
                                <Link
                                  to={`/groups/${_id}/groupInvite`}
                                  className="text-black no-underline"
                                >
                                  <li className="flex mt-2 justify-end">
                                    <div className="bg-[#F8A700] hover:bg-[#eab751] w-full flex gap-2 font-bold text-md cursor-pointer text-gray-800 rounded-lg p-2">
                                      <img src={LinkIcon} alt="" />
                                      Generate a Group Invite Link
                                    </div>
                                  </li>
                                </Link>
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="sideWidget2-post-card">
                          <div className="sideWidget2-post-header">
                            <p className="mb-0 font-medium text-xl">
                              Active Group Members
                            </p>
                          </div>
                          <div className="flex flex-col">
                            {groupItem.members
                              .filter((member) => member.userId !== profile._id)
                              .map((member) => (
                                <div
                                  key={member._id}
                                  className="flex gap-2 items-center p-3 border border-gray-300 rounded-lg"
                                >
                                  {member.profilePicture ? (
                                    <Avatar
                                      src={member.profilePicture}
                                      alt="Profile"
                                      className="w-12 h-12 rounded-full"
                                    />
                                  ) : (
                                    <img
                                      src={profilePic}
                                      alt="Profile"
                                      className="w-14 h-14 rounded-full"
                                    />
                                  )}
                                  <p className="mb-0 font-medium">
                                    {member.userName}
                                  </p>
                                  <button
                                    className={`${
                                      isFollowing(member.userId)
                                        ? "bg-[#F8A700] text-white"
                                        : "bg-white text-[#F8A700] border border-[#F8A700]"
                                    } rounded-full px-6 py-2 ml-auto`}
                                    onClick={() =>
                                      handleFollowToggle(
                                        member.userId,
                                        member.userName
                                      )
                                    }
                                    disabled={isLoading[member.userId]}
                                  >
                                    {isLoading[member.userId] ? (
                                      <l-line-spinner
                                        size="20"
                                        stroke="3"
                                        speed="1"
                                        color="#136175"
                                      ></l-line-spinner>
                                    ) : isFollowing(member.userId) ? (
                                      "Following"
                                    ) : (
                                      "Follow"
                                    )}
                                  </button>
                                </div>
                              ))}
                            <Link
                              to={`/groups/${_id}/add`}
                              className="text-black no-underline"
                            >
                              <div className="p-3">View All Group Members</div>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    {showModal && (
                      <div className="modal-overlay-forum">
                        <div className="modal-forum">
                          <div className="modal-header-forum">
                            <div>
                              <h2>Manage Members</h2>
                              <p>Add/Remove Members</p>
                            </div>
                            <button
                              className="text-xl text-[#004C8A]"
                              onClick={() => setShowModal(false)}
                            >
                              X
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type="text"
                              placeholder="Search people"
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="search-input bg-[#FEF7E7]"
                            />
                            <img
                              src={searchIcon}
                              alt=""
                              className="absolute top-2 right-2"
                            />
                          </div>
                          <ul className="members-list">
                            {filteredMembers.map((member, index) => (
                              <li key={index} className="member-item">
                                <div className="member-info flex gap-2">
                                  <img
                                    src={
                                      member.profilePicture
                                        ? member.profilePicture
                                        : profilePic
                                    }
                                    alt="avatar"
                                    className="member-avatar w-10 h-10 rounded-full"
                                  />
                                  <div className="flex flex-col">
                                    <span>{member.firstName}</span>
                                    <span className="member-role text-sm">
                                      {member.profileLevel === 0
                                        ? "Super Admin"
                                        : member.profileLevel === 1
                                        ? "Admin"
                                        : member.profileLevel === 2
                                        ? "Alumni"
                                        : "Student"}
                                    </span>
                                  </div>
                                </div>
                                <input
                                  type="checkbox"
                                  checked={selectedMembers.some(
                                    (selectedMember) =>
                                      selectedMember.userId === member._id
                                  )}
                                  onChange={() =>
                                    handleMemberSelect(
                                      member._id,
                                      member.profilePicture,
                                      member.firstName,
                                      member.lastName,
                                      member.profileLevel
                                    )
                                  }
                                />
                              </li>
                            ))}
                          </ul>
                          <button
                            className="save-button"
                            onClick={handleSaveMembers}
                          >
                            {saving ? "Saving..." : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </>
          }
        />
        <Route
          path="/add"
          element={
            <>
              <GroupMembers members={groupMembers} />
            </>
          }
        />
      </Routes>
    </div>
  );
};

export default IndividualGroup;
