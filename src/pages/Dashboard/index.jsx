import React, { useState, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

import LeftSidebar from "../../components/left-sidebar";
import TopBar from "../../components/topbar";
import SocialMediaPost from "../../components/Social-wall-post";
import SideWidgets from "../../components/SideWidgets";
import Groups from "../Groups";
import Donations from "../Donations";
import Members from "../Members";
import Profile from "../Profile";
import ProfilePage from "../ProfilePage";
import Events from "../Events";
import Jobs from "../Jobs";
import IndividualJobPost from "../Jobs/IndividualJobPost";
import Internships from "../Internships";
import NotificationsPage from "../NotificationsPage";
import News from "../News";
import Forum from "../Forum";
import CreateForum from "../../components/Forum/CreateForum";
import IForum from "../../components/Forum/IForum";
import Chatbox from "../../components/Chatbox";
import { ProfileSettings } from "../ProfilePage/ProfileSettings";
import { Following } from "../../components/Following";
import { Followers } from "../../components/Followers";
import { WorkExperience } from "../../components/WorkExperience";
import { SearchedResults } from "../../components/SearchedResults";
import ArchivePage from "../Archive";
import DonSponRequest from "../../components/DonSponRequest";

const Dashboard = ({ handleLogout }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get("search");
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }
    setDrawerOpen(open);
  };

  useEffect(() => {
    if (
      profile.accountDeleted === true ||
      (profile.expirationDate && new Date(profile.expirationDate) < new Date())
    ) {
      navigate("/login");
    }
  }, [profile.accountDeleted, profile.expirationDate, navigate]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Left Sidebar - hidden on mobile, visible on larger screens */}
      <div className="hidden lg:block w-64 flex-shrink-0 border-r border-gray-200">
        <LeftSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden ">
        <div className="flex-shrink-0 bg-[#FEF7E7]">
          <TopBar handleLogout={handleLogout} />
        </div>
        {/* Top Bar */}

        {/* Scrollable Content Area */}
        <div className="flex-1 lg:ml-7 overflow-auto">
          <Routes>
            <Route path="/groups/*" element={<Groups />} />
            {searchQuery && (
              <Route
                path="/*"
                element={<SearchedResults searchQuery={searchQuery} />}
              />
            )}
            {!searchQuery && (
              <Route
                path="/*"
                element={
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4  p-2">
                    <div className="md:col-span-4">
                      <SocialMediaPost showCreatePost={true} />
                    </div>
                    <div className="md:col-span-2">
                      <SideWidgets />
                    </div>
                  </div>
                }
              />
            )}
            <Route path="/donations/*" element={<Donations />} />
            <Route
              path="/members/*"
              element={
                <div className="w-full px-[5%]">
                  <Members showHeading={true} />
                </div>
              }
            />
            <Route
              path="/members/create"
              element={
                <div className="w-full p-[5%]">
                  <DonSponRequest name="member" />
                </div>
              }
            />
            <Route path="/members/:id/*" element={<Profile />} />
            <Route path="/profile/*" element={<ProfilePage />} />
            <Route path="/notifications/*" element={<NotificationsPage />} />
            <Route path="/events/*" element={<Events />} />
            <Route path="/internships/*" element={<Jobs />} />
            <Route path="/jobs/:_id/:title" element={<IndividualJobPost />} />
            <Route
              path="/internships/:_id/:title"
              element={<IndividualJobPost />}
            />
            <Route path="/forums/*" element={<Forum />} />
            <Route path="/forums/create" element={<CreateForum />} />
            <Route path="/forums/:id/*" element={<IForum />} />
            <Route path="/profile/:id/following" element={<Following />} />
            <Route path="/profile/:id/followers" element={<Followers />} />
            <Route
              path="/profile/workExperience"
              element={<WorkExperience />}
            />
            <Route
              path="/profile/profile-settings"
              element={<ProfileSettings />}
            />
            <Route path="/archive/*" element={<ArchivePage />} />
            <Route
              path="/news/*"
              element={
                <div className="flex gap-2vw pt-5 w-full justify-center">
                  <div className="w-[65%]">
                    <News />
                  </div>
                </div>
              }
            />
          </Routes>
        </div>

        {/* Chatbox */}
        <div className="fixed hidden lg:block right-0 bottom-0 w-[300px] bg-white">
          <Chatbox />
        </div>
      </div>

      {/* Mobile Drawer */}
      <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
        <div
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <LeftSidebar />
        </div>
      </Drawer>

      {/* Hamburger Menu for Mobile */}
      <div className="lg:hidden fixed left-1 top-1 z-50">
        <IconButton onClick={toggleDrawer(true)}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="36"
            height="36"
            fill="currentColor"
            class="bi bi-list"
            viewBox="0 0 16 16"
            className="text-[#004C8A]"
          >
            <path
              fill-rule="evenodd"
              d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
            />
          </svg>
        </IconButton>
      </div>
    </div>
  );
};

export default Dashboard;
