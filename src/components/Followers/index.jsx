import React, { useState, useEffect, useRef } from 'react';
import { HiUsers } from "react-icons/hi2";
import PageTitle from '../PageTitle';
import Profilecard from '../Profilecard';
import { useCookies } from 'react-cookie';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import baseUrl from '../../config';

export const Followers = () => {
  const title = 'Followers';
  const icon = <HiUsers className="text-blue-700" />;
  const [members, setMembers] = useState([]);
  const [cookie, setCookie] = useCookies(['access_token']);
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(true); 
  const LIMIT = 6;
  const [totalFollowers, setTotalFollowers] = useState(0);
  const activePage = useRef(1);
  const { id } = useParams();

  const fetchMembers = async (page) => {
    try {
      console.log('page', page);
      const response = await fetch(`${baseUrl}/alumni/${id}/followers?page=${page}&size=${LIMIT}`);
      if (response.ok) {
        const data = await response.json();
        setTotalFollowers(data.totalFollowers);
        setMembers((prevMembers) => [...prevMembers, ...data.followerDetails]);
      } else {
        console.error("Failed to fetch members");
      }
    } catch (error) {
      console.error("Error fetching members:", error);
    } finally {
      setLoading(false); // Set loading to false after fetching members
    }
  };

  useEffect(() => {
    fetchMembers(activePage.current);
  }, []);

  console.log('membersss', members);

  const updateFollowers = () => {
    console.log('Update Followers');
    activePage.current++;
    fetchMembers(activePage.current);
  };

  return (
    <div className="w-full  mt-5 px-10">
      <PageTitle title={title} icon={icon} />
      {loading ? ( // Conditionally render loading message
        <div className="text-center">Loading...</div>
      ) : members !== undefined && members.length > 0 ? (
        <>
          <div className="mt-4 flex flex-wrap gap-7">
            {members.map((member) => (
              <Profilecard key={member._id} member={member} name="follow" />
            ))}
          </div>
          {activePage.current < totalFollowers / LIMIT && (
            <div className="text-center mt-5">
              <button className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600" onClick={updateFollowers}>
                Load More
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center">No Followers</div>
      )}
    </div>
  );
};
