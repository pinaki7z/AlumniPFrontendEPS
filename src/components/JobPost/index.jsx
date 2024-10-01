import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { GiMoneyStack } from 'react-icons/gi';
import { AiFillGold, AiOutlineDelete } from 'react-icons/ai';
import { toast } from 'react-toastify';
import { BiSolidArchiveIn } from "react-icons/bi";
import { FaBriefcase } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import baseUrl from "../../config";
import location from "../../images/location-vector.svg";
import categoryV from "../../images/category.svg";
import amount from "../../images/amount.svg";

const JobPost = ({ userId, id, jobTitle, title, titleS, description, salaryMin, createdAt, picture, salaryMax, duration, jobType, questions, category, currency, attachments, appliedCandidates, searchQuery, type, locationType, company }) => {
    const profile = useSelector((state) => state.profile);
    const navigateTo = useNavigate();
    const [menuVisible, setMenuVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const [deleteModalShow, setDeleteModalShow] = useState(false);

    const handleClick = () => {
        if (type === 'Job') {
            navigateTo(`/jobs/${id}/Jobs`);
        }

        if (type === 'Internship') {
            navigateTo(`/internships/${id}/Internships`);
        }
    }

    const handleArchive = async () => {
        try {
            const response = await fetch(`${baseUrl}/${type + 's'}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                toast.success(`Archived successfully`);
                setModalShow(false);
                window.location.reload();
            } else {
                console.error('Failed to archive job');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleDelete = async () => {
        setDeleteModalShow(false);
        try {
            const response = await fetch(`${baseUrl}/${type + 's'}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                toast.success(`Deleted successfully`);
                window.location.reload();
            } else {
                console.error('Failed to delete job');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className="border rounded-lg shadow-md p-4 flex flex-col md:flex-row w-full">
            <div className="md:w-1/3 w-full">
                {attachments && attachments.map((attachment, index) => {
                    if (!attachment.endsWith('.pdf')) {
                        return (
                            <img
                                key={index}
                                src={attachment}
                                alt={`attachment-${index}`}
                                className="rounded-md"
                            />
                        );
                    }
                    return null;
                })}
            </div>

            <div className="md:w-2/3 w-full p-4">
                <div className="flex justify-between items-center">
                    <p onClick={handleClick} className="text-xl font-bold cursor-pointer">
                        {jobTitle}
                    </p>
                    {appliedCandidates && appliedCandidates.map(candidate => {
                        if (candidate.userId === profile._id) {
                            return (
                                <>
                                    {candidate.comment && (
                                        <span
                                            key={candidate.userId}
                                            className="text-lg cursor-pointer text-blue-600"
                                            onClick={() => setShowModal(true)}
                                        >
                                            <IoIosInformationCircle />
                                        </span>
                                    )}
                                    {showModal && (
                                        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white shadow-lg p-6 rounded-lg z-50">
                                            <span className="absolute top-2 right-2 cursor-pointer" onClick={() => setShowModal(false)}>&times;</span>
                                            <p className="text-center">{candidate.comment}</p>
                                        </div>
                                    )}
                                </>
                            );
                        }
                        return null;
                    })}

                    {(profile.profileLevel === 0 || profile.profileLevel === 1 || userId === profile._id) && (
                        <div className="relative">
                            <span className="text-2xl cursor-pointer" onClick={() => setMenuVisible(!menuVisible)}>&#8942;</span>
                            {menuVisible && (
                                <ul className="absolute right-0 bg-white shadow-lg rounded-md p-2">
                                    <li className="cursor-pointer" onClick={() => setDeleteModalShow(true)}>Delete</li>
                                </ul>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-2 text-lg font-semibold">{company}</div>

                <div className="flex justify-between items-center mt-4">
                    {locationType && (
                        <div className="flex items-center">
                            <img src={location} alt="location" className="w-6 h-6" />
                            <p className="ml-2">{Object.keys(locationType).find(key => locationType[key])}</p>
                        </div>
                    )}
                    <div className="flex items-center">
                        <img src={categoryV} alt="category" className="w-6 h-6" />
                        <p className="ml-2">{category}</p>
                    </div>
                    <div className="flex items-center">
                        <img src={amount} alt="salary" className="w-6 h-6" />
                        <p className="ml-2">{salaryMin === null && salaryMax === null ? 'Unpaid' : `${salaryMin} - ${salaryMax}`}</p>
                    </div>
                </div>

                {userId === profile._id && (
                    <div className="mt-4 flex gap-4">
                        <button
                            onClick={() => setModalShow(true)}
                            className="bg-blue-600 text-white py-2 px-4 rounded-md flex items-center"
                        >
                            <BiSolidArchiveIn className="mr-2" /> Archive
                        </button>
                        {modalShow && (
                            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                                <h2 className="text-lg font-bold mb-4">Archive {titleS}</h2>
                                <p>Are you sure you want to archive this {titleS}?</p>
                                <div className="flex justify-end mt-4">
                                    <button onClick={handleArchive} className="bg-red-600 text-white py-2 px-4 rounded-md">Yes</button>
                                    <button onClick={() => setModalShow(false)} className="ml-2 bg-gray-200 py-2 px-4 rounded-md">No</button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {deleteModalShow && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-50">
                    <h2 className="text-lg font-bold mb-4">Delete Job</h2>
                    <p>Are you sure you want to delete this job? You will lose access to all data including CVs received under this job.</p>
                    <div className="flex justify-end mt-4">
                        <button onClick={handleDelete} className="bg-red-600 text-white py-2 px-4 rounded-md">Delete</button>
                        <button onClick={() => setDeleteModalShow(false)} className="ml-2 bg-gray-200 py-2 px-4 rounded-md">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default JobPost;
