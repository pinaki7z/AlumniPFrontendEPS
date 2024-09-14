import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/left-sidebar";
import TopBar from "../../components/topbar";
import SocialMediaPost from "../../components/Social-wall-post";
import SideWidgets from "../../components/SideWidgets";
import Groups from "../Groups";
import Donations from "../Donations";
import Sponsorships from "../Sponsorships";
import Settings from "../Settings";
import ProfilePage from "../ProfilePage";
import Members from '../Members';
import Profile from '../Profile';
import Events from "../Events";
import Jobs from "../Jobs";
import IndividualJobPost from "../Jobs/IndividualJobPost.jsx";
import Internships from "../Internships";
import NotificationsPage from "../NotificationsPage";
import News from "../News/index.jsx";
import Forum from "../Forum";
import CreateForum from "../../components/Forum/CreateForum";
import IForum from "../../components/Forum/IForum";
import Chatbox from "../../components/Chatbox";
import { ProfileSettings } from "../ProfilePage/ProfileSettings/index.jsx";
import { Following } from "../../components/Following/index.jsx";
import { Followers } from "../../components/Followers/index.jsx";
import IndividualGroup from "../../components/Groups/IndividualGroup/index.jsx";
import Chat from "../../pages/Chat";
import { WorkExperience } from "../../components/WorkExperience/index.jsx";
import { Archive } from "../Jobs/Archive/index.jsx";
import DonSponRequest from "../../components/DonSponRequest/index.jsx";
import { SearchedResults } from "../../components/SearchedResults";
import { useSelector } from "react-redux";
import { useEffect, useState } from "react";
import ArchivePage from "../Archive";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const Dashboard = ({ handleLogout }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search');
  const navigate = useNavigate();
  const profile = useSelector((state) => state.profile);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  useEffect(() => {
    if (profile.accountDeleted === true || (profile.expirationDate && new Date(profile.expirationDate) < new Date())) {
      navigate("/login");
    }
  }, [profile.accountDeleted, profile.expirationDate, navigate]);

  return (
    <>
      <div className="grid grid-cols-2 lg:grid-cols-5  ">
        {/* Hamburger menu for medium screens and below */}
        <div className="lg:hidden">
          <IconButton
            onClick={toggleDrawer(true)}  // Opens the drawer when clicked
            style={{ position: "fixed", left: 10, top: 10, zIndex: 1000 }} // Ensure it's fixed and visible
          >
            <MenuIcon />
          </IconButton>
          <Drawer
            anchor="left"
            open={drawerOpen}
            onClose={toggleDrawer(false)} // Closes the drawer on clicking outside
          >
            <div
              role="presentation"
              onClick={toggleDrawer(false)}
              onKeyDown={toggleDrawer(false)} // Handles keyboard events for closing
            >
              <LeftSidebar />
            </div>
          </Drawer>
        </div>


        <div className=" lg:col-span-1 hidden lg:block z-10">
          <LeftSidebar />
        </div>

        <div className="col-span-2 lg:col-span-4">
          <TopBar handleLogout={handleLogout} />
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
                  <div
                    // style={{
                    //   display: 'flex',
                    //   width: '100%',
                    // }}
                  >
                    <div 
                    // style={{ width: '100%', gap: '2vw', display: 'flex', paddingLeft: '35px' }}
                    className="grid grid-cols-1 md:grid-cols-6 gap-4"
                    >
                      <div  className="md:col-span-4 sm:mx-[50px] mx-[15px] md:mx-[30px]"
                      // style={{ width: '65%' }}
                      >
                        <SocialMediaPost showCreatePost={true} />
                      </div>
                      <div className="md:col-span-2">
                      <SideWidgets />
                      </div>
                    </div>
                  </div>
                }
              />
            )}
            <Route path="/donations/*" element={<Donations />} />
            <Route path="/members/*" element={<div style={{ width: '100%', padding: '0% 5%' }}><Members showHeading={true} /></div>} />
            <Route path="/members/create" element={
              <div style={{ width: '100%', padding: '5%' }}>
                <DonSponRequest name='member' />
              </div>
            } />
            <Route path="/members/:id/*" element={<Profile />} />
            <Route path="/profile/*" element={<ProfilePage />} />
            <Route path="/notifications/*" element={<NotificationsPage />} />
            <Route path="/events/*" element={<Events />} />
            <Route path="/internships/*" element={<Jobs />} />
            <Route path="/settings/*" element={<Settings />} />
            <Route path="/jobs/:_id/:title" element={<IndividualJobPost />} />
            <Route path="/internships/:_id/:title" element={<IndividualJobPost />} />
            <Route path="/forums/*" element={<Forum />} />
            <Route path="/forums/create" element={<CreateForum />} />
            <Route path="/forums/:id/*" element={<IForum />} />
            <Route path="/profile/:id/following" element={<Following />} />
            <Route path="/profile/:id/followers" element={<Followers />} />
            <Route path="/profile/workExperience" element={<WorkExperience />} />
            <Route path="/profile/profile-settings" element={<ProfileSettings />} />
            <Route path="/archive/*" element={<ArchivePage />} />
            <Route path="/news/*" element={
              <div
                style={{
                  display: "flex",
                  gap: "2vw",
                  paddingTop: "20px",
                  width: "100%",
                  justifyContent: 'center'
                }}
              >
                <div style={{ width: "65%" }}>
                  <News />
                </div>
              </div>
            }
            />
          </Routes>
          <div className="chatbox-container" style={{ position: 'fixed', right: '0', bottom: '0', width: '300px', backgroundColor: 'white' }}>
            <Chatbox />
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
