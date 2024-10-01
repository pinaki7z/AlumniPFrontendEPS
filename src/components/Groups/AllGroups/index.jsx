import DisplayPost from "../../DisplayPost";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";
import axios from "axios";
import baseUrl from "../../../config";

const AllGroups = ({ groupType,searchQuery }) => {
  const title = 'SuggestedGroups';
  const [groups, setGroups] = useState([]);
  const [totalGroups, setTotalGroups] = useState(0);
  const [loading, setLoading] = useState(false);
  const LIMIT = 4;
  const profile = useSelector((state) => state.profile);
  let [page, setPage] = useState(1);
  let [previousPage, setPreviousPage] = useState(0);

  const getGroups = async () => {
    setLoading(true);
    if (page === previousPage) {
      return;
    }
    try {
      const response = await axios.get(
        `${baseUrl}/groups?page=${page}&size=${LIMIT}`,
        { userId: profile._id }
      );
      const postsData = response.data.records;
      setGroups((prevItems) => [...prevItems, ...postsData]);
      setTotalGroups(response.data.total);
      setPreviousPage(page);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getGroups();
  }, [page]);

  const handleLoadMore = () => {
    setPage(page + 1);
  };

  // Filter the groups based on the groupType passed in the prop
  const filteredGroups = groups.filter((group) => {
    const matchesType = groupType ? group.groupType === groupType : true;
    const matchesSearch = searchQuery
      ? group.groupName.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesType && matchesSearch;
  });

  return (
    <div style={{ paddingBottom: '3vh' }}>
      <DisplayPost title={title} groups={filteredGroups} loading={loading} />
      {page <= totalGroups / LIMIT && (
        <div style={{ textAlign: 'center', marginTop: '3vh' }}>
          <button className="load-more-button" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default AllGroups;
