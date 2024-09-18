

import React from "react";
import { useParams } from "react-router-dom";
import "../Profile/profile.css";
import picture from "../../images/d-cover.jpg";
import { BiUserPlus } from 'react-icons/bi'
import { LuMessageSquare } from 'react-icons/lu'
import { BsThreeDotsVertical } from 'react-icons/bs'
import Icons from '../../components/Icons'
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
import { Link } from 'react-router-dom';
import { useCookies } from "react-cookie";
import { useEffect, useState } from "react";
import baseUrl from "../../config";
import { HiMiniPlusCircle, HiMiniCheckCircle, HiMiniCheckBadge } from "react-icons/hi2";
import edit from "../../images/edit.svg";
import editProfilePicture from "../../images/edit-profile-picture.svg";
import check from "../../images/check.svg";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from "../../store/profileSlice";
import { toast } from 'react-toastify';
import { lineSpinner } from 'ldrs';
import profilePic from "../../images/profilepic.jpg"
import { fetchMembers } from "../../store";

lineSpinner.register()



const ProfilePage = () => {
  const { id } = useParams();
  console.log('member id', id);
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
    console.log('inside this function')
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
    fetchData()
  }, []);
  // useEffect(() => {
  //  if(members.length > 0){
  //   setMember(members.find(member => member._id === (profile._id || id)));
  //  }
  // }, [members])

  const fetchData = ()=>{
    axios.get(`${baseUrl}/alumni/${id || profile._id}`)
    .then(res=>{
      setMember(res.data);
    })
  }

  const token = cookie.token;

  const totalProperties = 5;
  let completedProperties = 0;

  if (profile && profile.profilePicture) completedProperties++;
  if (profile && profile.firstName) completedProperties++;
  if (profile && profile.workExperience && profile.workExperience.length > 0) completedProperties++;
  if (profile && profile.country) completedProperties++;
  if (profile && profile.city) completedProperties++;

  const completionPercentage = (completedProperties / totalProperties) * 100;

  useEffect(() => {
    fetchWorkExperiences();
  }, [])

  const renderExpirationDateMessage = () => {
    if (profile.ID && profile.expirationDate) {
      return 'Your account is being validated';
    }

    if (profile.expirationDate !== null) {
      const currentDate = new Date();
      const expirationDate = new Date(profile.expirationDate);
      const timeDiff = expirationDate.getTime() - currentDate.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      if (daysDiff > 0) {
        return (
          <>
            <p>Your account is not validated and will expire in {daysDiff} days.
              <Link to='/profile/profile-settings'>
                <span> Upload your ID</span>
              </Link>
              &nbsp;&nbsp;to validate your account
            </p>
          </>
        );
      } else if (daysDiff < 0) {
        return 'Your account has expired';
      }
    }
    return null;
  };

  // if (!member) {
  //   return <div>Member not found</div>;
  // }

  const fetchWorkExperiences = async () => {
    try {
      const response = await fetch(`${baseUrl}/alumni/workExperience/${profile._id}`, {
        headers: {
          'Authorization': `Bearer ${cookie.token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch work experiences');
      }
      const data = await response.json();
      setWorkExperiences(data);
    } catch (error) {
      console.error('Error fetching work experiences:', error);
    }
  };




  // const currentWork = member.workExperience.find(exp => exp.endMonth.toLowerCase() === 'current');
  // console.log('current work', member.workExperience)

  const findCurrentWorkingAt = () => {
    const currentWorkExperience = workExperiences.find(experience => experience.endMonth === 'current');
    if (currentWorkExperience) {
      return currentWorkExperience.companyName;
    } else {
      return 'No current work experience found';
    }
  };

  const handleFileChange = (event, fileType) => {
    console.log('file type in handleFileChange', fileType, event)
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
      alert('Please select an image to upload.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.put(`${baseUrl}/alumni/${profile._id}`, {
        [fileType]: fileData
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });

      if (response.status === 200) {
        const responseData = await response.data;
        console.log('response data', responseData)
        dispatch(updateProfile(responseData));
        setLoading(false);
        toast.success(`${fileType === 'profilePicture' ? 'Profile Picture' : fileType === 'coverPicture' ? 'Cover Picture' : 'Image'} updated successfully.`);
      } else {
        alert('Failed to update cover picture.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error updating cover picture:', error);
      alert('An error occurred while updating the cover picture.');
      setLoading(false)
    }
  };

  return (
    <>
      <div style={{ width: '100%', padding: '0 5%', paddingTop: '4%' }}>
        <div className="container-div" style={{ width: '100%', borderRadius: '12px', position: 'relative' }}>
          <div className="upper-div" style={{
            backgroundImage: `url(${profile.coverPicture})`,
            width: '100%',
            minHeight: '35vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '12px 12px 0px 0px'
          }}>
            <div style={{ paddingBottom: "1.5em", display: 'flex', justifyContent: 'center' }}>
              {renderExpirationDateMessage() && (
                <p style={{ color: 'orangered', margin: '0', fontSize: '25px', fontWeight: '600', backgroundColor: 'cornsilk', width: '70%', padding: '10px', borderRadius: '5px', marginBottom: '10px' }}>
                  {renderExpirationDateMessage()}
                </p>
              )}
              {/* <h2 style={{ color: "#ffffff", backgroundColor: 'darkgrey', width: 'fit-content',borderRadius: '5px', padding: '0px 15px', textAlign: 'center' }}>{profile.firstName}{profile.validated === true ? <HiMiniCheckBadge style={{ color: '#51a8f5' }} /> : null}</h2> */}
            </div>
            <div className="message-follow" style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '20px' }}>
              <input type="file" name="coverPicture" id="coverPicture" onChange={(event) => handleFileChange(event, 'coverPicture')} style={{ display: 'none' }} />
              <button
                type="button"
                style={{ backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '7px', border: '2px solid #F8A700', color: '#004C8A' }}
                onClick={() => document.getElementById('coverPicture').click()}
              >
                <img src={edit} alt="edit" />
                <p style={{ marginBottom: '0px' }}>Edit Cover Picture </p>
              </button>
              <Link to='/profile/profile-settings' style={{ textDecoration: 'none', color: 'black' }}>
                <button style={{ backgroundColor: 'white', border: '2px solid #F8A700', color: '#004C8A' }}>Edit Profile</button></Link>
            </div>
            <div style={{ textAlign: 'center' }}>
              {loading ? 
                <l-line-spinner
                  size="30"
                  stroke="3"
                  speed="1"
                  color="black"
                  style={{backgroundColor: 'whitesmoke',padding: '20px'}}
                ></l-line-spinner> : null}
            </div>
          </div>
          <div style={{ position: 'absolute', top: '10vh', left: '50%', transform: 'translateX(-50%) translateY(50%)' }}>
            <div style={{ position: 'relative' }}>
              <img src={profile.profilePicture? profile.profilePicture : profilePic} alt="profile-picture" style={{ width: '200px', height: '200px', borderRadius: '50%', border: '5px solid white' }} />
              <input type="file" name="profilePicture" id="profilePicture" onChange={(event) => handleFileChange(event, 'profilePicture')} style={{ display: 'none' }} />
              <img src={editProfilePicture} alt="profile-picture" style={{ borderRadius: '50%', border: '5px solid white', position: 'absolute', bottom: '20px', right: '5px', cursor: 'pointer' }} onClick={() => document.getElementById('profilePicture').click()} />
            </div>

          </div>
          <div className="lower-div" style={{
            backgroundColor: '#FEF7E7',
            width: '100%',
            minHeight: '25vh',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '0px 0px 12px 12px'
          }}>
            {/* <div className="message-follow" style={{ display: 'flex', justifyContent: 'space-around', paddingTop: '20px' }}>
              <button>Message</button>
              <button>Follow</button>
            </div> */}
            <div style={{ textAlign: 'center', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '40%', paddingTop: '100px' }}>
                <p style={{ fontWeight: '700', color: '#3A3A3A', fontSize: '24px', fontFamily: 'Inter' }}>{member.firstName} {member.lastName} {profile.validated === true ? <HiMiniCheckBadge style={{ color: '#51a8f5' }} /> : null}</p>
                <p style={{ fontWeight: '300', color: '#000000', fontSize: '14px', fontFamily: 'Inter' }}>{member.profileLevel === 1 ? 'ADMIN' : member.profileLevel === 2 ? 'ALUMNI' : member.profileLevel === 3 ? 'STUDENT' : 'SUPERADMIN'}</p>
                <p style={{ fontWeight: '400', color: '#3A3A3A', fontSize: '16px', fontFamily: 'Inter' }}>Passionate soul, chasing dreams, inspiring others, embracing life's adventures joyfully.</p>
                <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
                  <div style={{ cursor: 'pointer' }}>
                    <Link to={`/groups/${profile._id}/joined-groups`} style={{ textDecoration: 'none', color: 'black' }}>
                      <p>Groups</p>
                      <p style={{ fontWeight: '500', color: '#3A3A3A', fontSize: '18px', fontFamily: 'Inter' }}>{profile.groupNames.length}</p>
                    </Link>
                  </div>
                  <div style={{ cursor: 'pointer' }}>
                    <Link to={`/profile/${profile._id}/followers`} style={{ textDecoration: 'none', color: 'black' }}>
                      <p>Followers</p>
                      <p style={{ fontWeight: '500', color: '#3A3A3A', fontSize: '18px', fontFamily: 'Inter' }}>{profile.followers.length}</p>
                    </Link>
                  </div>
                  <div style={{ cursor: 'pointer' }}>
                    <Link to={`/profile/${profile._id}/following`} style={{ textDecoration: 'none', color: 'black' }}>
                      <p>Following</p>
                      <p style={{ fontWeight: '500', color: '#3A3A3A', fontSize: '18px', fontFamily: 'Inter' }}>{profile.following.length}</p>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div >
        <div style={{ display: 'flex', gap: '2%' }}>
          <div style={{ width: '70%' }}><Feeed entityType='posts' showCreatePost={false} showDeleteButton={true} userId={member._id} /></div>
          <div style={{ width: '28%', paddingTop: '37px' }}>
            <div>
              <div style={{ backgroundColor: '#004C8A', color: '#F8F8FF', borderRadius: '12px 12px 0px 0px', padding: '12px 16px 12px 16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={userProfile} alt="" />
                <p style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '20px', marginBottom: '0px' }}>Profile Completion</p>
              </div>
              <div style={{ backgroundColor: 'white', padding: '5px' }}>
                {completionPercentage < 100 && (
                  <div style={{ width: '100%', borderRadius: '5px', marginBottom: '10px', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                    <p style={{ textAlign: 'center', margin: '5px 0', fontSize: '14px', color: '#000' }}>
                      {Math.round(completionPercentage)}%
                    </p>
                    <div
                      style={{
                        width: `${completionPercentage}%`,
                        height: '10px',
                        backgroundColor: '#4caf50',
                        borderRadius: '5px',
                      }}
                    ></div>
                  </div>
                )}
                <ul style={{ padding: '5px', listStyleType: 'none' }}>
                  <li>
                    {profile && profile.profilePicture ? (
                      <p><img src={check} alt="" srcset="" /> Profile Picture Added</p>
                    ) : (
                      <Link to='/profile/profile-settings' style={{ textDecoration: 'none', color: 'black' }}>
                        <li><HiMiniPlusCircle style={{ width: '19px', height: '19px' }} /> Add your profile picture</li>
                      </Link>
                    )}
                  </li>
                  <li>
                    {profile && profile.firstName ? (
                      <p><img src={check} alt="" srcset="" />  Name: {profile.firstName}</p>
                    ) : (
                      <Link to='/profile/profile-settings' style={{ textDecoration: 'none', color: 'black' }}>
                        <li><HiMiniPlusCircle style={{ width: '19px', height: '19px' }} /> Add your name</li>
                      </Link>
                    )}
                  </li>
                  <li>
                    {profile && profile.workExperience && profile.workExperience.length > 0 ? (
                      <p><img src={check} alt="" srcset="" />  Workplace: {findCurrentWorkingAt()}</p>
                    ) : (
                      <Link to='/profile/profile-settings' style={{ textDecoration: 'none', color: 'black' }}>
                        <li><HiMiniPlusCircle style={{ width: '19px', height: '19px' }} /> Add your workplace</li>
                      </Link>
                    )}
                  </li>
                  <li>
                    {profile && profile.country ? (
                      <p><img src={check} alt="" srcset="" /> Country: {profile.country}</p>
                    ) : (
                      <Link to='/profile/profile-settings' style={{ textDecoration: 'none', color: 'black' }}>
                        <li><HiMiniPlusCircle style={{ width: '19px', height: '19px' }} /> Add your country</li>
                      </Link>
                    )}
                  </li>
                  <li>
                    {profile && profile.city ? (
                      <p><img src={check} alt="" srcset="" />  Address: {profile.city}</p>
                    ) : (
                      <Link to='/profile/profile-settings' style={{ textDecoration: 'none', color: 'black' }}>
                        <li><HiMiniPlusCircle style={{ width: '19px', height: '19px' }} />  Add your address</li>
                      </Link>
                    )}
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <div style={{ backgroundColor: '#004C8A', color: '#F8F8FF', borderRadius: '12px 12px 0px 0px', padding: '12px 16px 12px 16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={about} alt="" />
                <p style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '20px', marginBottom: '0px' }}>About Me</p>
              </div>
              <p style={{ backgroundColor: '#FEF7E7', borderRadius: '0px 0px 12px 12px', padding: '10px 16px 10px 16px', fontFamily: 'Inter', fontWeight: '500', fontSize: '16px', color: '#636364' }}>{member.aboutMe ? member.aboutMe : 'User has not updated his Bio'}</p>
            </div>
            {/* <div>
              <div style={{ backgroundColor: '#004C8A', color: '#F8F8FF', borderRadius: '12px 12px 0px 0px', padding: '12px 16px 12px 16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={work} alt="" />
                <p style={{ fontFamily: 'Inter', fontWeight: '600', fontSize: '20px', marginBottom: '0px' }}>Currently Working As</p>
              </div>
              <div style={{ backgroundColor: '#FEF7E7' }}>
                <p style={{ backgroundColor: '#FEF7E7', borderRadius: '0px 0px 12px 12px', padding: '10px 16px 10px 16px', fontFamily: 'Inter', fontWeight: '500', fontSize: '16px', color: '#636364', marginBottom: '0px' }}>{currentWork && currentWork.title ? currentWork.title : 'User has not updated his current work title'}</p>
                <div style={{ padding: '16px' }}>
                  <p style={{ color: '#004C8A', fontWeight: '500', fontSize: '18px' }}>{currentWork && currentWork.companyName ? currentWork.companyName : 'User has not updated his current work place'}</p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    {currentWork && (currentWork.startMonth && currentWork.startYear && currentWork.endMonth)
                      ? <img src={time} alt="" /> : ''}
                    <p style={{ marginBottom: '0px' }}>
                      {currentWork && (currentWork.startMonth && currentWork.startYear && currentWork.endMonth)
                        ? `${currentWork.startMonth} ${currentWork.startYear} - ${currentWork.endMonth}`
                        : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', paddingLeft: '3px' }}>
                    {currentWork && (currentWork.location && currentWork.locationType) ? <img src={location} alt="" /> : ''}
                    <p style={{ marginBottom: '0px' }}>{currentWork && (currentWork.location && currentWork.locationType) ? `${currentWork.location} - ${currentWork.locationType}` : ''}</p>
                  </div>
                </div>
                



              </div>

            </div> */}
            <Link to='/profile/workExperience' style={{ textDecoration: 'none', color: 'black' }}>
              <div style={{ backgroundColor: '#004C8A', color: '#F8F8FF', borderRadius: '12px', padding: '12px 16px 12px 16px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img src={workExperience} alt="" />
                <p style={{ marginBottom: '0px' }}>Work Experience </p>
                <img src={arrowRight} alt="" style={{ marginLeft: 'auto' }} />
              </div>
            </Link>
          </div>
        </div>
      </div >
    </>
  );
};

export default ProfilePage;
