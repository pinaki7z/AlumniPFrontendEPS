import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import './members.css';
import Profilecard from '../../components/Profilecard';
import PageSubTitle from '../../components/PageSubTitle';
import { Route, Routes } from "react-router-dom";
import DonSponRequest from '../../components/DonSponRequest';
import axios from 'axios';
import { useCookies } from 'react-cookie';
import { toast } from "react-toastify";
import { IoSearchSharp } from "react-icons/io5";
import createMember from "../../images/create.svg";
import { Link } from 'react-router-dom';
import baseUrl from '../../config';
import { fetchMembers } from '../../store';

const Members = ({ addButton, groupMembers, owner, deleteButton }) => {
  const [membersred, setMembersred] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [cookie] = useCookies('token');
  const [displayedMembers, setDisplayedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [memberRole, setMemberRole] = useState(""); // Dropdown state for role filter
  const [noUsersFound, setNoUsersFound] = useState(false);
  const [loading, setLoading] = useState(true);
  const activePageRef = useRef(1);
  const LIMIT = 6;
  const profile = useSelector((state) => state.profile);
  
  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }

  const totalMembers = membersred.length;

  const getMembers = async () => {
    try {
      const membersData = await fetchMembers();
      if (membersData) {
        setAllMembers(membersData);
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getMembers();
  }, []);

  useEffect(() => {
    setMembersred(allMembers?.filter(member => member.profileLevel !== 0));
  }, [allMembers]);

  useEffect(() => {
    if (!loading) {
      initialMembers();
    }
  }, [loading, membersred]);

  // New useEffect that filters based on both search query and member role
  useEffect(() => {
    let filteredMembers = membersred;

    // Filter by search query if provided
    if (searchQuery) {
      filteredMembers = filteredMembers.filter(
        (member) =>
          member.firstName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by member role if selected
    if (memberRole) {
      const roleMapping = {
        "1": 1, // Admin
        "2": 2, // Alumni
        "3": 3  // Current Student
      };
      filteredMembers = filteredMembers.filter(
        (member) => member.profileLevel === roleMapping[memberRole]
      );
    }

    // Handle no users found scenario
    setNoUsersFound(filteredMembers.length === 0);

    // Display only the first LIMIT number of members
    setDisplayedMembers(filteredMembers.slice(0, LIMIT));
  }, [searchQuery, memberRole, membersred]);

  const loadMoreMembers = () => {
    setLoading(true);
    const startIndex = activePageRef.current * LIMIT;
    const endIndex = startIndex + LIMIT;
    const nextBatch = membersred.slice(startIndex, endIndex);
    setDisplayedMembers((prevMembers) => [...prevMembers, ...nextBatch]);
    activePageRef.current++;
    setLoading(false);
  };

  const initialMembers = () => {
    setLoading(true);
    const startIndex = activePageRef.current * LIMIT;
    const endIndex = startIndex + LIMIT;
    const nextBatch = membersred.slice(startIndex, endIndex);
    setDisplayedMembers(nextBatch);
    setLoading(false);
  };

  const handleDelete = async (memberId) => {
    try {
      const token = cookie.token;
      const response = await axios.delete(`${baseUrl}/alumni/${memberId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (response.status === 200) {
        toast.dismiss();
        toast.success("Success");
        getMembers();
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Handler to update the memberRole when an option is selected
  const handleMemberRoleChange = (e) => {
    setMemberRole(e.target.value); // Store selected option in state
  };

  return (
    <div className="member-container mb-10">
      <p style={{ fontWeight: '600', paddingBottom: '0px', color: '#3A3A3A', fontSize: '32px' }}>Members</p>
      <div className='grid grid-cols-1 lg:grid-cols-2 lg:flex  gap-3'>
        <div className="search" style={{ display: 'flex', width: '100%' }}>
          <form style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="search"
                name="search"
                id="search"
                placeholder="Search for members"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '10px 40px 10px 10px', border: '1px solid #004C8A', backgroundColor: 'white' }}
              />
              <button
                type="submit"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'white',
                  border: 'none',
                  padding: '5px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <IoSearchSharp style={{ color: '#004C8A', width: '25px', height: '25px' }} />
              </button>
            </div>
          </form>
        </div>
        <div className='w-full lg:w-[340px]'>
          <select className='w-full h-12 select-dropdown rounded shadow' value={memberRole} onChange={handleMemberRoleChange}>
            <option value="">All Roles</option>
            <option value="1">Admin</option>
            <option value="2">Alumni</option>
            <option value="3">Current Student</option>
          </select>
        </div>
      </div>

      <Routes>
        <Route path="/" element={
          <>
            <div className="flex flex-wrap gap-10 py-4">
              {loading ? null : (
                <Link to={`/members/create`} style={{ textDecoration: 'none', color: 'black' }}>
                  <button
                    className='relative lg:w-64 w-[330px]'
                    style={{ border: '2px dotted #F8A700', borderRadius: '8px', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                  >
                    <img src={createMember} alt="" className='lg:w-20 py-5 text-center w-10' />
                  </button>
                </Link>
              )}
              {displayedMembers.map((member) => (
                <Profilecard
                  key={member._id}
                  member={member}
                  addButton={addButton}
                  groupMembers={groupMembers}
                  owner={owner}
                  deleteButton={deleteButton !== undefined ? deleteButton : true}
                  handleDelete={() => handleDelete(member._id)}
                />
              ))}
            </div>
            {loading && (
              <div className="loading-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
                <l-tail-chase size="40" speed="1.75" color="#174873"></l-tail-chase>
              </div>
            )}
            {activePageRef.current * LIMIT < totalMembers && (
              <div style={{ textAlign: 'center' }}>
                <button className="load-more-button" onClick={loadMoreMembers}>
                  Load More
                </button>
              </div>
            )}
          </>
        } />
        <Route path="/create" element={<DonSponRequest name='member' />} />
      </Routes>
    </div>
  );
};

export default Members;
