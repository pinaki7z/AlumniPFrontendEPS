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
    // const membersred = useSelector((state) => state.member.filter(member => member.profileLevel !== 0));
  const [membersred, setMembersred] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [cookie, setCookie] = useCookies('token');
  const [displayedMembers, setDisplayedMembers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [noUsersFound, setNoUsersFound] = useState(false);
  const [loading, setLoading] = useState(true); // Initially true to indicate data is being fetched
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
      setLoading(false); // Set loading to false once the data is fetched
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
      initialMembers(); // Call initialMembers once loading is done
    }
  }, [loading, membersred]);

  useEffect(() => {
    if (searchQuery) {
      const filteredMembers = membersred.filter(
        (member) =>
          member.firstName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setDisplayedMembers(filteredMembers.slice(0, LIMIT));
      setNoUsersFound(filteredMembers.length === 0);
    } else {
      const initialBatch = membersred.slice(0, LIMIT);
      setDisplayedMembers(initialBatch);
      setNoUsersFound(false);
    }
  }, [searchQuery, membersred]);

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
        toast.success("Alumni Deleted");
        window.location.reload();
      } else {
        console.error('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
    }
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
        <div className=' w-full lg:w-[340px]'>
          <select className='w-full h-12 select-dropdown rounded shadow'>
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Alumni">Alumni</option>
            <option value="Current Student">Current Student</option>
          </select>
        </div>
      </div>

      <Routes>
        <Route path="/" element={
          <>
<<<<<<< Updated upstream
            <div className="flex flex-wrap gap-10 py-4">
             
              {loading ?null: <Link to={`/members/create`} style={{ textDecoration: 'none', color: 'black' }}>
                <button
                  className='relative lg:w-64 w-[330px]'
                  style={{ border: '2px dotted #F8A700', borderRadius: '8px', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
=======
      
            <div
              // className="pro"
              // style={{
              //   marginTop: '1em',
              //   display: 'flex',
              //   flexWrap: 'wrap',
              //   paddingBottom: '20px',
              // }}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4"
            >
              <Link to={`/members/create`} style={{ textDecoration: 'none', color: 'black' }}>
                <div 
                className='border-2 border-[2px dotted #5e5d56] rounded-3xl min-h-[200px] h-100 w-100 flex items-center justify-center'
                // style={{ border: '2px dotted #5e5d56', borderRadius: '8px', width: '17vw', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
>>>>>>> Stashed changes
                >
                  <img src={createMember} alt="" className='lg:w-20 py-5 text-center w-10' />
                </button>
              </Link>}
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
            {loading && <div className="loading-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '300px' }}>
        <l-tail-chase size="40" speed="1.75" color="#174873"></l-tail-chase>
      </div>}
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
