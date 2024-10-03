import { NavLink } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { BsGlobe } from 'react-icons/bs';
import { HiUserGroup } from 'react-icons/hi';
import { MdOutlineEvent } from 'react-icons/md';
import { FaBriefcase } from 'react-icons/fa';
import { HiOutlineBriefcase } from 'react-icons/hi';
import { IoIosNotifications } from 'react-icons/io';
import { useSelector } from 'react-redux';
import eps from "../../images/EPS _ Logo.png";

export default function LeftSidebar() {
  const profile = useSelector((state) => state.profile);

  const navItems = [
    { to: '/', icon: RxDashboard, label: 'News & Updates' },
    { to: '/members', icon: BsGlobe, label: 'Members' },
    { to: '/groups', icon: HiUserGroup, label: 'Groups' },
    { to: '/events', icon: MdOutlineEvent, label: 'Events' },
    { to: '/internships', icon: FaBriefcase, label: 'Internships' },
    { to: '/notifications', icon: IoIosNotifications, label: 'Notifications' },
    // Only show the Archive tab for profileLevel 0 or 1
    ...(profile?.profileLevel === 0 || profile?.profileLevel === 1
      ? [{ to: '/archive', icon: HiOutlineBriefcase, label: 'Archive' }]
      : []),
    // { to: '/settings', icon: MdSettings, label: 'Settings' },
  ];

  return (
    <div className="bg-[#004C8A] h-screen fixed w-[275px] pb-5">
      <div className="flex justify-center mt-7 mb-8">
        <img src={eps} alt="EPS Logo" className="w-[70px]" />
      </div>
      <nav className="sideBar">
        <ul className="w-full">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-5 py-2.5 px-10 text-lg ${
                    isActive ? 'bg-[#F8A700] text-white' : 'text-[#F8F8FF]'
                  }`
                }
              >
                <item.icon className="dashboard-icon w-7 h-7" />
                <p>{item.label}</p>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
