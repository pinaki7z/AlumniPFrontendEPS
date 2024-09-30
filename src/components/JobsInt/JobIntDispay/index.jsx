
import coverImage from '../../../images/cultural-1.jpg'
import { useParams } from "react-router-dom";
import { useCookies } from "react-cookie";
import axios from "axios";
import { useState, useEffect } from "react";
//import { useSelector } from "react-redux";
import { GiMoneyStack } from 'react-icons/gi';
import { FaLocationDot, FaTags } from 'react-icons/fa6';
import { FcBriefcase } from 'react-icons/fc';
import profilePic from '../../../images/profilepic.jpg';
import baseUrl from '../../../config';
import { useSelector } from "react-redux";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';
import { toast } from "react-toastify";

import './individualJobPost.css';
const JobIntDisplay = ({ picture, userId, jobId, jobTitle, location, userName,profilePicture,salaryMin, salaryMax, currency, jobType, category,locationType, description }) => {
    const { _id } = useParams();
    const [cookie] = useCookies(['access_token']);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [starLoading, setStarLoading] = useState(false);
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [candidateModalShow, setCandidateModalShow] = useState(false);
    const [appliedCandidates, setAppliedCandidates] = useState([]);
    const [appliedCandidatesDetails, setAppliedCandidatesDetails] = useState([]);
    const profile = useSelector((state) => state.profile);
    const [modalShow, setModalShow] = useState(false);
    // const title = 'Jobs'
    console.log('titleijb', locationType);

    const fetchAppliedUserIds = async () => {
        console.log('id', _id)
        const response = await axios.get(`${baseUrl}/internships/appliedCandidates/${_id}`)
        const data = response.data;
        setAppliedCandidates(data.userIds);
        setAppliedCandidatesDetails(data.appliedCandidates);
    }

    let starButtonText=''


    const handleStarred = (jobId) => {
        setStarLoading(true);
        axios.put(`${baseUrl}/internships/${jobId}`, {
            starred: true,
            userId: profile._id
        })
            .then(response => {
                console.log('Job starred successfully:', response.data);
                //fetchDonationPost();
                setStarLoading(false);
            })
            .catch(error => {
                console.error('Error starring job:', error);
                // Handle error if needed
            });

    };


    const viewCandidatesButton = (
        <button className="mb-4" onClick={() => setCandidateModalShow(true)}>View Interested Candidates (<span>{appliedCandidatesDetails.length}</span>)</button>
    );

    function MyVerticallyCenteredModal(props) {
        const [name, setName] = useState('');
        const [resume, setResume] = useState(null);
        const [questions, setQuestions] = useState([]);
        const [answers, setAnswers] = useState([]);
        const [applyLoading, setApplyLoading] = useState(false);

        // useEffect(() => {
        //     setQuestions(jobs.questions);
        //     setAnswers(jobs.questions.map(question => ({ question: question, answer: '' })));
        // }, [props.jobs]);

        const handleNameChange = (e) => {
            setName(e.target.value);
        };

        const handleResumeChange = (e) => {
            setResume(e.target.files[0]);
        };

        const handleAnswerChange = (index, e) => {
            const newAnswers = [...answers];
            newAnswers[index].answer = e.target.value;
            setAnswers(newAnswers);
        };

        const handleSubmit = () => {
            setApplyLoading(true);
            const apiUrl = `${baseUrl}/jobs/apply/${_id}`;
            const formData = new FormData();
            formData.append('userId', profile._id);
            formData.append('name', name);
            formData.append('resume', resume);


            answers.forEach((ans, index) => {
                formData.append(`answers[${index}][question]`, ans.question);
                formData.append(`answers[${index}][answer]`, ans.answer);
            });

            fetch(apiUrl, {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    if (response.ok) {
                        console.log('Application submitted successfully!');
                        toast.success("Applied");
                        window.location.reload();
                        setApplyLoading(false);
                        props.onHide();
                    } else {
                        console.error('Failed to submit application');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
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
                        Apply
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput1">
                            <Form.Label>Name</Form.Label>
                            <Form.Control type="text" placeholder="Name" value={name} onChange={handleNameChange} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlInput2">
                            <Form.Label>Upload Resume</Form.Label>
                            <Form.Control type="file" accept=".pdf" onChange={handleResumeChange} />
                        </Form.Group>
                        {questions.map((question, index) => (
                            <Form.Group key={index} className="mb-3" controlId={`question-${index}`}>
                                <Form.Label>{question}</Form.Label>
                                <Form.Control type="text" value={answers[index].answer} onChange={(e) => handleAnswerChange(index, e)} />
                            </Form.Group>
                        ))}
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={props.onHide}>Close</Button>
                    <Button onClick={handleSubmit}>{applyLoading ? 'Applying...' : 'Apply'}</Button>
                </Modal.Footer>
            </Modal>
        );
    }



    const isApplied = appliedCandidates.includes(profile._id);
   


    return (
        <div key={jobs._id}>
            {loading ? (<div>Loading..</div>) :
                (
                    <div className="ijp-card-container">
                        <div className="ijp-card">
                            <div className="ijp-image rounded-t-md" style={{ backgroundImage: picture ? `url(${picture})` : `url(${coverImage})`, backgroundRepeat: 'no-repeat', backgroundSize: 'cover' }}>
                               
                            </div>
                        
                            <div className="ijp-title">
                                <p>{jobTitle}</p>
                            </div>
                           
                            <div className="ijp-location-bar">
                                <div className="ijp-location">
                                    <FaLocationDot />
                                    <p>{location}</p>
                                </div>
                                <div className="ijp-jobType">
                                    <FcBriefcase />
                                    <p>{Object.keys(locationType).find(key => locationType[key])}</p>
                                </div>
                                <div className="ijp-category">
                                    <FaTags />
                                    <p>{category}</p>
                                </div>
                            </div>
                            <div className="ijp-candidates-button">
                                        {userId === profile._id ? (
                                            <>
                                                {viewCandidatesButton}

                                            </>
                                        ) : (
                                            isApplied ? (
                                                <>
                                                    <button style={{ backgroundColor: '#a3e3ff' }}>Applied</button>
                                                    {/* <span style={{fontSize: '15px', color: 'blueviolet', cursor: 'default'}}>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{profile.appliedJobs[0].status? profile.appliedJobs[0].status: null}</span> */}
                                                </>
                                            ) : profile.profileLevel === 0 || profile.profileLevel === 1 ? (
                                                <>
                                                </>
                                            ) : (
                                                <>
                                                    <button onClick={() => setModalShow(true)} style={{ backgroundColor: '#174873', padding: '7px 20px' }}>Apply</button>
                                                    {/* <button style={{ backgroundColor: '#ab021b', marginLeft: '10px', padding: '7px 20px' }} onClick={() => handleStarred(jobs._id)}>{starLoading ? 'Loading...' : starButtonText}</button> */}
                                                    <MyVerticallyCenteredModal
                                                        show={modalShow}
                                                        onHide={() => setModalShow(false)}
                                                    />
                                                </>
                                            )
                                        )}
                                    </div>

                            <div className="ijp-desc-salary">
                                <div className="ijp-user-details">
                                    <div className="ijp-minimum">
                                        <p >Minimum</p>
                                        <p>{salaryMin}{currency}</p>
                                    </div>
                                    <div className="ijp-maximum">
                                        <p>Maximum</p>
                                        <p>{salaryMax}{currency}</p>
                                    </div>
                                </div>
                                <div className="ijp-description">
                                    <p className='mb-3 text-lg'>Internship Details:-</p>
                                    <p style={{ fontSize: 'small', marginTop: '-15px' }}>{description}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    )


}

export default JobIntDisplay;