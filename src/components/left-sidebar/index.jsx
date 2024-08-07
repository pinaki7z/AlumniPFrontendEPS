import { Link } from 'react-router-dom';
import './left-sidebar.css';
import { FaHeart, FaBriefcase } from 'react-icons/fa';
import { HiUserGroup, HiOutlineBriefcase } from 'react-icons/hi';
import { BsGlobe, BsCurrencyRupee } from 'react-icons/bs';
import { MdForum, MdOutlineEvent, MdSettings, MdOutlineLogout } from 'react-icons/md';
import { BiNews } from 'react-icons/bi';
import { GoSponsorTiers } from 'react-icons/go';
import { RxDashboard } from 'react-icons/rx';
import { updateMember } from "../../store/membersSlice";
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { IoIosNotifications } from "react-icons/io";
import baseUrl from "../../config";
import eps from "../../images/EPS _ Logo.png"


const LeftSidebar = () => {
    console.log('env ', process.env.REACT_APP_URL)

    const dispatch = useDispatch();

    useEffect(() => {
        const fetchMembers = async () => {
            try {
                const response = await fetch(`${baseUrl}/alumni/all`);
                if (response.ok) {
                    const membersData = await response.json();
                    dispatch(updateMember(membersData)); 
                } else {
                    throw new Error('Failed to fetch members');
                }
            } catch (error) {
                console.error('Error fetching members:', error);
            }
        };

        fetchMembers();
    }, []);

    return (
        <div style={{ width: '20%',backgroundColor: '#004C8A',height: '100vh',position: 'fixed' }}>
            <div style={{ textAlign: 'center', marginTop: '3em'}}>
                        <img src={eps} alt="" width="115px" height="145px"/>
                    </div>
                <div className='sideBar'>                    
                    <ul style={{paddingLeft: '0px', width: '100%'}}>
                        <li><a href="/" style={{ textDecoration: 'none' }}><RxDashboard className="dashboard-icon"/><p>News & Updates</p></a></li>
                        {/* <li><Link to="/socialWall" style={{ textDecoration: 'none' }}><FaHeart style={{ color: '#fd546b' }} /><p>Social Wall</p></Link></li> */}
                        <li><Link to="/members" style={{ textDecoration: 'none' }}><BsGlobe className="dashboard-icon" /><p>Members</p></Link></li>
                        <li><Link to="/groups" style={{ textDecoration: 'none' }}><HiUserGroup className="dashboard-icon" /><p>Groups</p></Link></li>
                        {/* <li><Link to="/chat" style={{ textDecoration: 'none' }}><MdSettings style={{ color: '#b744b7' }} /><p>Chat</p></Link></li> */}
                        {/* <li><Link to="/forums" style={{ textDecoration: 'none' }}><MdForum className="dashboard-icon" /><p>Forums</p></Link></li>
                        <li><Link to="/news" style={{ textDecoration: 'none' }}><BiNews className="dashboard-icon" /><p>News</p></Link></li>
                        <li><Link to="/donations" style={{ textDecoration: 'none' }}><BsCurrencyRupee className="dashboard-icon" /><p>Business Connect</p></Link></li> */}
                        {/* <li><Link to="/sponsorships" style={{ textDecoration: 'none' }}><GoSponsorTiers className="dashboard-icon" /><p>Sponsorships</p></Link></li> */}
                        <li><Link to="/events" style={{ textDecoration: 'none' }}><MdOutlineEvent className="dashboard-icon" /><p>Events</p></Link></li>
                        <li><Link to="/jobs" style={{ textDecoration: 'none' }}><FaBriefcase className="dashboard-icon" /><p>Internships</p></Link></li>
                        {/* <li><Link to="/internships" style={{ textDecoration: 'none' }}><HiOutlineBriefcase style={{ color: '#407093' }} /><p>Internships</p></Link></li> */}
                        <li><Link to="/archive" style={{ textDecoration: 'none' }}><HiOutlineBriefcase className="dashboard-icon" /><p>Archive</p></Link></li>
                        <li><Link to="/notifications" style={{ textDecoration: 'none' }}><IoIosNotifications className="dashboard-icon" /><p>Notifications</p></Link></li>
                        <li><Link to="/settings" style={{ textDecoration: 'none' }}><MdSettings className="dashboard-icon" /><p>Settings</p></Link></li>
                    </ul>
                </div>
        </div>
    )
}

export default LeftSidebar;