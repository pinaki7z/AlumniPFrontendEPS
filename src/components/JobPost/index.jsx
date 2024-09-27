import React from 'react';
import './JobPost.css';
import { useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import { GiMoneyStack } from 'react-icons/gi';
import { AiFillGold, AiOutlineDelete } from 'react-icons/ai';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-toastify';
import { BiSolidArchiveIn } from "react-icons/bi";
import { useState } from 'react';
import { FaBriefcase } from "react-icons/fa";
import { IoIosInformationCircle } from "react-icons/io";
import { CiLocationArrow1 } from "react-icons/ci";
import { RiHomeSmileLine } from "react-icons/ri";
import baseUrl from "../../config";
import location from "../../images/location-vector.svg";
import categoryV from "../../images/category.svg";
import amount from "../../images/amount.svg"

const JobPost = ({ userId, id, jobTitle, title, titleS, description, salaryMin, createdAt, picture, salaryMax, duration, jobType, questions, category, currency, attachments, appliedCandidates, searchQuery, type, locationType, company }) => {
    const profile = useSelector((state) => state.profile);
    const navigateTo = useNavigate();
    const [menuVisible, setMenuVisible] = useState(false);
    const [showModal, setShowModal] = useState(false);


    const handleClick = () => {
        console.log('titee', title)
        if (type === 'Job') {
            navigateTo(`/jobs/${id}/Jobs`);
        }

        if (type === 'Internship') {
            navigateTo(`/internships/${id}/Internships`);
        }
    }
    const [modalShow, setModalShow] = React.useState(false);
    const [deleteModalShow, setDeleteModalShow] = React.useState(false);

    function MyVerticallyCenteredModal(props) {
        const handleArchive = async () => {
            try {
                const response = await fetch(`${baseUrl}/${type + 's'}/${id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (response.ok) {
                    console.log('archived successfully');
                    toast.success(`success`)
                    setModalShow(false);
                    window.location.reload();
                } else {
                    console.error('Failed to delete job');
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };

        return (
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Archive {titleS}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        Are you sure you want to archive this {titleS}?
                    </p>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={handleArchive}>Yes</Button>
                    <Button onClick={props.onHide}>No</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    function DeleteModal(props) {
        return (
            <Modal
                {...props}
                size="lg"
                aria-labelledby="contained-modal-title-vcenter"
                centered
            >
                <Modal.Header closeButton>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Are you sure you want to delete this job ?You will lose access to all data including CVs received under this job.If you want to retain the data , Archive instead.
                    </Modal.Title>
                </Modal.Header>
                <Modal.Footer>
                    <Button onClick={handleDelete}>Delete</Button>
                    <Button onClick={props.onHide}>Close</Button>
                </Modal.Footer>
            </Modal>
        );
    }

    const handleDelete = async () => {
        setDeleteModalShow(false)
        try {
            console.log('id', id)
            const response = await fetch(`${baseUrl}/${type + 's'}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                console.log('deleted successfully');
                toast.success(`success`)
                setModalShow(false);
                window.location.reload();
            } else {
                console.error('Failed to delete job');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    return (
        <div className="donation-card" style={{ height: '100%', width: '100%' }}>
            <div className="donation-card-image" style={{ height: 'auto', width: '30%' }}>
                {attachments && attachments.map((attachment, index) => {
                    if (!attachment.endsWith('.pdf')) {
                        return (
                            <img
                                key={index}
                                src={attachment}  // Use the full URL directly
                                alt={`attachment-${index}`}  // Provide a descriptive alt text
                                className="src"
                            />
                        );
                    }
                    return null;
                })}

            </div>
            <div style={{ padding: '16px', width: '70%' }}>
                <div style={{ border: '1px', backgroundColor: "white", width: '100%' }}>
                    <div className="donation-card-title" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                        <p onClick={handleClick} style={{ cursor: 'pointer', fontFamily: 'Inter', fontSize: '24px', fontWeight: '600' }}>{jobTitle}</p>
                        {appliedCandidates && appliedCandidates.map(candidate => {
                            if (candidate.userId === profile._id) {
                                return (
                                    <>
                                        {candidate.userId === profile._id && (
                                            <div style={{ fontSize: '15px', cursor: 'pointer', color: 'blueviolet', display: 'flex', gap: '10px' }}>
                                                {candidate.comment && <span
                                                    key={candidate.userId}
                                                    style={{ fontSize: '20px', cursor: 'pointer', color: 'black', display: 'flex', alignItems: 'center' }}
                                                    onClick={() => setShowModal(true)}
                                                >
                                                    <IoIosInformationCircle />
                                                </span>}
                                                {candidate.status}
                                            </div>
                                        )}
                                        {showModal && (
                                            <div className="block" style={{
                                                position: 'fixed', top: '50%',
                                                left: '50%', transform: 'translate(-50%, -50%)',
                                                zIndex: '999', color: 'black', fontWeight: '700', backgroundColor: '#f9f9f9', minWidth: '24vw', padding: '10px', border: 'solid 2px'
                                            }}>
                                                <div>
                                                    <span className="close" style={{ cursor: 'pointer' }} onClick={() => setShowModal(false)}>&times;</span>
                                                    <p style={{ textAlign: 'center', fontWeight: '400' }}>{candidate.comment}</p>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                );
                            }
                            return null;
                        })}
                        {((profile.profileLevel === 0 || profile.profileLevel === 1) || userId === profile._id) && (
                            <div style={{ cursor: 'pointer', position: 'relative' }} onClick={() => setMenuVisible(!menuVisible)}>
                                &#8942;
                                {menuVisible && (
                                    <ul className="menu">
                                        <li style={{ listStyleType: 'none' }} onClick={() => setDeleteModalShow(true)}>Delete</li>
                                    </ul>
                                )}
                                <DeleteModal
                                    show={deleteModalShow}
                                    onHide={() => setDeleteModalShow(false)}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <div className="user-details">
                    <p style={{ cursor: 'pointer', fontFamily: 'Inter', fontSize: '20px', fontWeight: '600', marginLeft: '0px' }}>{company}</p>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '15px' }}>
                    {locationType && <div className="user-details">
                        <img src={location} />
                        <p style={{ cursor: 'pointer', fontFamily: 'Inter', fontSize: '16px', fontWeight: '500' }}>{Object.keys(locationType).find(key => locationType[key])}</p>
                    </div>}

                    <div className="user-details">
                        <img src={categoryV} />
                        <p style={{ cursor: 'pointer', fontFamily: 'Inter', fontSize: '16px', fontWeight: '500' }}>{category}</p>
                    </div>
                    <div className="user-details">
                        <img src={amount} />
                        {(salaryMin === null && salaryMax === null) ? <p style={{ cursor: 'pointer', fontFamily: 'Inter', fontSize: '16px', fontWeight: '500' }}>Unpaid</p> : (
                            <>
                                <p style={{ cursor: 'pointer', fontFamily: 'Inter', fontSize: '16px', fontWeight: '500' }}>{salaryMin} <span style={{ marginLeft: '5px' }}>-</span> <span style={{ marginLeft: '5px', cursor: 'pointer', fontFamily: 'Inter', fontSize: '16px', fontWeight: '500' }}>{salaryMax}</span></p>
                            </>
                        )}
                    </div>
                    {/* <div className="user-details">
                        <FaBriefcase />
                        <p>{type}</p>
                    </div> */}
                </div>
                {(userId === profile._id) && (
                    <div className="job-post-delete" >
                        <Button style={{ display: 'flex', gap: '1vw' }} onClick={() => setModalShow(true)}><BiSolidArchiveIn />Archive</Button>
                        <MyVerticallyCenteredModal
                            show={modalShow}
                            onHide={() => setModalShow(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default JobPost;
