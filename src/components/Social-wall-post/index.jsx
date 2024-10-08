import React from 'react';
import Feeed from '../Feeed';
// import { useAuth } from '../../context/auth';
//import { useCookies } from 'react-cookie';
//import './SocialWall.scss';

function SocialMediaPost({showCreatePost,groupID}) {
  //const [cookie,setCookie]= useCookies(['access_token']);  
//   const photo = currentUser?.photoURL ?? undefined;
  //const user = cookie.access_token?.userName ?? null;


  return (
    <>
      {/* <Header photoUrl={photo} username={user} /> */}
      <div className='socialWallBody w-100' style={{height: '100%'}}>
        {/* <SideBar photoUrl={photo} username={user} /> */}
        <Feeed entityType='posts' showCreatePost={showCreatePost} showDeleteButton={true} groupID={groupID}/>
        {/* <Widget /> */}
      </div>
    </>
  );
}

export default SocialMediaPost;