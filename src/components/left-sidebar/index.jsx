import { NavLink } from 'react-router-dom';
import { RxDashboard } from 'react-icons/rx';
import { BsGlobe } from 'react-icons/bs';
import { HiUserGroup } from 'react-icons/hi';
import { MdOutlineEvent, MdSettings } from 'react-icons/md';
import { FaBriefcase } from 'react-icons/fa';
import { HiOutlineBriefcase } from 'react-icons/hi';
import { IoIosNotifications } from 'react-icons/io';
// import './LeftSidebar.css';
import eps from "../../images/EPS _ Logo.png";
const navItems = [
  { to: '/', icon: RxDashboard, label: 'News & Updates' },
  { to: '/members', icon: BsGlobe, label: 'Members' },
  { to: '/groups', icon: HiUserGroup, label: 'Groups' },
  { to: '/events', icon: MdOutlineEvent, label: 'Events' },
  { to: '/internships', icon: FaBriefcase, label: 'Internships' },
  { to: '/archive', icon: HiOutlineBriefcase, label: 'Archive' },
  { to: '/notifications', icon: IoIosNotifications, label: 'Notifications' },
  // { to: '/settings', icon: MdSettings, label: 'Settings' },
];

export default function LeftSidebar() {
  return (
    <div className="bg-[#004C8A] h-screen fixed w-[275px]  pb-5">
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
                    isActive ? 'bg-[#5e5d56] text-white' : 'text-[#F8F8FF]'
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