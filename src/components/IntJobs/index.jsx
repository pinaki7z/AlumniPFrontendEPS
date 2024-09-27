import "../../pages/Jobs/jobs.css";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Modal from "react-bootstrap/Modal";
import React from "react";
import { useState, useEffect } from "react";
import Accordion from "react-bootstrap/Accordion";
import { useAccordionButton } from "react-bootstrap/AccordionButton";
import Card from "react-bootstrap/Card";
import { Col, Row } from "react-bootstrap";
import axios from "axios";
import { toast } from "react-toastify";
import JobPost from "../JobPost";
import { useSelector } from "react-redux";
import PageSubTitle from "../PageSubTitle";
import { Route, Routes } from "react-router-dom";
import Donations from "../../pages/Donations";
import Sponsorships from "../../pages/Sponsorships";
import { useLocation } from "react-router-dom";
import { Archive } from "../../pages/Jobs/Archive";
import baseUrl from "../../config";
import { Link } from "react-router-dom";

const IntJobs = (props) => {
  const [modalShow, setModalShow] = React.useState(false);
  const [rangeValue, setRangeValue] = useState(0);
  const [questions, setQuestions] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [internships, setInternships] = useState([]);
  const [archivedJobs, setArchivedJobs] = useState([]);
  const [archivedInternships, setArchivedInternships] = useState([]);
  const title = props.title;
  const titleS = props.titleS;
  const handleDropdownSelect = props.handleDropdownSelect;
  const profile = useSelector((state) => state.profile);
  const buttontext1Link = "/jobs";
  const buttontext2Link = "/jobs/archive";
  const buttontext3Link = "/internships";
  const buttontext4Link = "/internships/archive";
  const [selectedEmploymentType, setSelectedEmploymentType] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [showSalaryFields, setShowSalaryFields] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isUnpaid, setIsUnpaid] = useState(false);
  console.log("isUnpaid", profile.profileLevel);

  let admin;
  if (profile.profileLevel === 0 || profile.profileLevel === 1) {
    admin = true;
  }
  const pathname = useLocation().pathname;

  const handleSearchChange = (e, selectedOption, type) => {
    let updatedSearchQuery = { ...props.searchQuery };

    if (type === "text") {
      updatedSearchQuery.title = e.target.value;
    } else if (type === "employmentType") {
      if (selectedOption === "") {
        setSelectedEmploymentType("");
        updatedSearchQuery.employmentType = "";
        setSelectedEmploymentType("Employment-Type");
      } else {
        setSelectedEmploymentType(selectedOption);
        updatedSearchQuery.employmentType = selectedOption;
      }
    } else if (type === "category") {
      if (selectedOption === "") {
        setSelectedCategory("");
        updatedSearchQuery.category = "";
        setSelectedCategory("Category");
      } else {
        setSelectedCategory(selectedOption);
        updatedSearchQuery.category = selectedOption;
      }
    }

    props.setSearchQuery(updatedSearchQuery);
    console.log("search", props.setSearchQuery);
  };

  function CustomToggle({ children, eventKey }) {
    const decoratedOnClick = useAccordionButton(eventKey, () =>
      console.log("totally custom!")
    );
    return (
      <button
        type="button"
        style={{ backgroundColor: "pink" }}
        onClick={decoratedOnClick}
      >
        {children}
      </button>
    );
  }

  const handleRangeChange = (event) => {
    setRangeValue(event.target.value);
  };

  function MyVerticallyCenteredModal(props) {
    const [formData, setFormData] = useState({
      userId: profile._id,
      title: "",
      location: "",
      salaryMin: "",
      salaryMax: "",
      currency: "INR",
      duration: "per hour",
      company: profile.workingAt,
      employmentType: "Full-time",
      category: "Other",
      type: "",
      description: "",
      attachments: [],
      locationType: {
        onSite: false,
        remote: false,
        hybrid: false,
      },
    });
    const [loading, setLoading] = useState(false);
    const [isJobChecked, setIsJobChecked] = useState(false);
    const [isInternshipChecked, setIsInternshipChecked] = useState(false);
    const [formError, setFormError] = useState("");
    const [isPaid, setIsPaid] = useState(false);
    const [isUnpaid, setIsUnpaid] = useState(false);
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevFormData) => ({
        ...prevFormData,
        [name]: value,
      }));
    };

    const handleCoverImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const coverImageData = reader.result;
          setFormData((prevFormData) => ({
            ...prevFormData,
            coverImage: coverImageData,
          }));
        };
        reader.readAsDataURL(file);
      }
    };

    const handleImageChange = (e) => {
      const files = e.target.files;
      if (files) {
        const filesArray = Array.from(files);
        setFormData((prevFormData) => ({
          ...prevFormData,
          attachments: filesArray,
        }));
      }
    };

    const handlePublish = async () => {
      if (!formData.type) {
        setFormError("Please select either Job or Internship.");
        return;
      }
      setLoading(true);

      try {
        const formDataToSend = new FormData();

        for (const key in formData) {
          if (key === "attachments") {
            formData.attachments.forEach((file) => {
              formDataToSend.append("attachments", file);
            });
          } else if (key === "locationType") {
            for (const locationKey in formData.locationType) {
              formDataToSend.append(
                `locationType[${locationKey}]`,
                formData.locationType[locationKey]
              );
            }
          } else {
            formDataToSend.append(key, formData[key]);
          }
        }
        console.log("job formdata", formData);
        const response = await fetch(`${baseUrl}/jobs/create`, {
          method: "POST",
          body: formDataToSend,
        });
        if (response.ok) {
          console.log("Data saved successfully");
          const successMessage =
            formData.type === "Internship"
              ? "The internship post is being validated by the admin"
              : "The job post is being validated by the admin";
          toast.success(successMessage);
          props.onHide();
        } else {
          const errorData = await response.json();
          console.error("Failed to save data", errorData);
        }
      } catch (error) {
        console.error("Error:", error);
      }
      setLoading(false);
    };
    const handleCheckboxChange = (e) => {
      const { name, checked } = e.target;
      if (name === "isJob" && checked) {
        setIsUnpaid(false);
        setIsJobChecked(true);
        setIsInternshipChecked(false);
        setFormData((prevFormData) => ({
          ...prevFormData,
          type: "Job",
        }));
      } else if (name === "isInternship" && checked) {
        setIsInternshipChecked(true);
        setIsJobChecked(false);
        setFormData((prevFormData) => ({
          ...prevFormData,
          type: "Internship",
          employmentType: "Internship",
        }));
      }
      setFormError("");
    };

    const handlePaidUnpaid = (e) => {
      const { name, checked } = e.target;
      if (name === "isPaid") {
        setIsPaid(checked);
        setIsUnpaid(false);
      } else if (name === "isUnpaid") {
        setIsUnpaid(checked);
        setIsPaid(false);
        setFormData((prevFormData) => ({
          ...prevFormData,
          salaryMin: "",
          salaryMax: "",
        }));
      }
    };

    const handleLocationTypeChange = (type) => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        locationType: {
          onSite: type === "onSite",
          remote: type === "remote",
          hybrid: type === "hybrid",
        },
      }));
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
            Create an Internship post
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form encType="multipart/form-data">
            <Row>
              <Col>
                <Form.Group as={Col}>
                  <Form.Label htmlFor="job">Title</Form.Label>
                  <Form.Control
                    id="job"
                    type="text"
                    placeholder="Enter job/internship title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group as={Col} controlId="location">
                  <Form.Label>Location</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    disabled={formData.locationType.remote}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Form.Group as={Col}>
              <Form.Label htmlFor="company">Company Name</Form.Label>
              <Form.Control
                id="company"
                type="text"
                placeholder="Enter company name"
                name="company"
                value={formData.company}
                disabled
              />
            </Form.Group>
            <Row>
              <Col>
                <Form.Group controlId="salaryRange">
                  <Form.Label>Salary Range</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Minimum"
                    name="salaryMin"
                    className="mb-2"
                    value={formData.salaryMin}
                    onChange={handleInputChange}
                    disabled={isUnpaid}
                  />
                  To
                  <Form.Control
                    type="text"
                    placeholder="Maximum"
                    name="salaryMax"
                    className="mt-2"
                    value={formData.salaryMax}
                    onChange={handleInputChange}
                    disabled={isUnpaid}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group controlId="currency">
                  <Form.Label>Currency</Form.Label>
                  <DropdownButton
                    id="createJob-currency-dropdown"
                    title={formData.currency}
                    style={{ marginTop: "0px" }}
                    onSelect={(eventKey) => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        currency: eventKey,
                      }));
                    }}
                  >
                    <div className="scrollable-dropdown">
                      <Dropdown.Item eventKey="INR">INR</Dropdown.Item>
                      <Dropdown.Item eventKey="USD">USD</Dropdown.Item>
                      <Dropdown.Item eventKey="JPY">JPY</Dropdown.Item>
                      <Dropdown.Item eventKey="EUR">EUR</Dropdown.Item>
                      <Dropdown.Item eventKey="GBP">GBP</Dropdown.Item>
                    </div>
                  </DropdownButton>
                </Form.Group>
                <Form.Group controlId="wages">
                  <Form.Label style={{ marginBottom: "0px" }}>Wages</Form.Label>
                  <DropdownButton
                    id="createJob-timings-dropdown"
                    title={formData.duration}
                    style={{ marginTop: "0px" }}
                    onSelect={(eventKey) => {
                      setFormData((prevFormData) => ({
                        ...prevFormData,
                        duration: eventKey,
                      }));
                    }}
                  >
                    <div className="scrollable-dropdown">
                      <Dropdown.Item eventKey="per hour">
                        per hour
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="per week">
                        per week
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="per month">
                        per month
                      </Dropdown.Item>
                      <Dropdown.Item eventKey="per year">
                        per year
                      </Dropdown.Item>
                    </div>
                  </DropdownButton>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group controlId="job-internship">
              <Form.Check
                type="checkbox"
                id="job-checkbox"
                label="Job"
                name="isJob"
                checked={formData.type === "Job"}
                onChange={handleCheckboxChange}
              />
              <Form.Check
                type="checkbox"
                id="internship-checkbox"
                label="Internship"
                name="isInternship"
                checked={formData.type === "Internship"}
                onChange={handleCheckboxChange}
              />
              {formError && <div className="text-danger">{formError}</div>}
            </Form.Group>
            <Form.Group controlId="employmentType">
              <Form.Label>Employment Type</Form.Label>
              <DropdownButton
                id="createEmployment-type-dropdown"
                title={formData.employmentType}
                disabled={!isJobChecked}
                onSelect={(eventKey) => {
                  if (eventKey !== "Volunteer") {
                    setIsUnpaid(false);
                  }
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    employmentType: eventKey,
                  }));
                }}
              >
                <div className="scrollable-dropdown">
                  <Dropdown.Item eventKey="Full-time">Full-time</Dropdown.Item>
                  <Dropdown.Item eventKey="Part-time">Part-time</Dropdown.Item>
                  <Dropdown.Item eventKey="Volunteer">Volunteer</Dropdown.Item>
                  <Dropdown.Item eventKey="Contract">Contract</Dropdown.Item>
                </div>
              </DropdownButton>
            </Form.Group>
            {(formData.type === "Internship" ||
              formData.employmentType === "Volunteer") && (
              <Form.Group controlId="internship-type">
                <Form.Check
                  type="checkbox"
                  id="paid-checkbox"
                  label="Paid"
                  name="isPaid"
                  checked={isPaid}
                  onChange={handlePaidUnpaid}
                />
                <Form.Check
                  type="checkbox"
                  id="unpaid-checkbox"
                  label="Unpaid"
                  name="isUnpaid"
                  checked={isUnpaid}
                  onChange={handlePaidUnpaid}
                />
              </Form.Group>
            )}
            <Form.Group controlId="category">
              <Form.Label>Category</Form.Label>
              <DropdownButton
                id="createJob-categories-dropdown"
                title={formData.category}
                onSelect={(eventKey) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    category: eventKey,
                  }));
                }}
              >
                <div className="scrollable-dropdown">
                  <Dropdown.Item eventKey="Other">Other</Dropdown.Item>
                  <Dropdown.Item eventKey="Admin & Office">
                    Admin & Office
                  </Dropdown.Item>
                  <Dropdown.Item eventKey="Art & Design">
                    Art & Design
                  </Dropdown.Item>
                  {/* Other category items */}
                </div>
              </DropdownButton>
            </Form.Group>
            <Form.Group controlId="locationType">
              <Form.Label>Location Type</Form.Label>
              <div>
                <Form.Check
                  type="checkbox"
                  id="onSite-checkbox"
                  label="On-site"
                  checked={formData.locationType.onSite}
                  onChange={() => handleLocationTypeChange("onSite")}
                />
                <Form.Check
                  type="checkbox"
                  id="remote-checkbox"
                  label="Remote"
                  checked={formData.locationType.remote}
                  onChange={() => handleLocationTypeChange("remote")}
                />
                <Form.Check
                  type="checkbox"
                  id="hybrid-checkbox"
                  label="Hybrid"
                  checked={formData.locationType.hybrid}
                  onChange={() => handleLocationTypeChange("hybrid")}
                />
              </div>
            </Form.Group>
            <Accordion defaultActiveKey="0">
              <Card>
                <Card.Header>
                  <CustomToggle eventKey="1" style={{ padding: "10px" }}>
                    Add a question
                  </CustomToggle>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter question"
                      name="questions"
                      value={formData.questions}
                      onChange={handleInputChange}
                    />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder={`Enter ${formData.type.toLowerCase()} description`}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group controlId="coverImage">
              <Form.Label>Add cover image</Form.Label>
              <input
                className="form-control"
                type="file"
                onChange={handleCoverImageChange}
                accept=".jpg, .jpeg, .png, .pdf"
              />
            </Form.Group>
            <Form.Group controlId="attachments">
              <Form.Label>Add attachments</Form.Label>
              <input
                className="form-control"
                type="file"
                onChange={handleImageChange}
                multiple
                accept=".jpg, .jpeg, .png, .pdf"
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={props.onHide}>Close</Button>
          <Button onClick={handlePublish}>
            {loading ? "Publishing..." : "Publish"}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }

  const generateTitle = () => {
    let title = props.title;
    let categoryTitle =
      selectedCategory !== "All" ? selectedCategory : "Categories";
    let jobTypeTitle =
      selectedEmploymentType !== "All"
        ? selectedEmploymentType
        : `Employment Type`;

    return { categoryTitle, jobTypeTitle };
  };

  return (
    <>
      {" "}
      <div className="jobs-page   p-2 lg:p-10 lg:px-20 rounded-lg">
        <div className="bg-[#d3d3d3] rounded-lg  text-start lg:p-8 p-2">
          <p className="lg:text-2xl font-bold">Internships</p>
          <p className="lg:text-2xl text-gray-500">
            Search, find and apply to internships opportunities at Alumni Portal
          </p>
        </div>
        <div>
          <form className="lg:my-7 my-3">
            <input
              type="text"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500"
              onChange={(e) => handleSearchChange(e, e.target.value, "text")}
              placeholder="Search for internships"
            />
          </form>
        </div>
        <div className="centered-content flex justify-center mt-6">
          <div className="jobs-search-box w-full  p-4  rounded-lg">
            <div className="">
              <div className="flex flex-col lg:flex-row gap-4 lg:justify-between font-medium text-base">
                {/* Job Type Selector */}
                <div className="w-full">
                  <select
                    onChange={(e) =>
                      handleSearchChange("", e.target.value, "employmentType")
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={generateTitle().jobTypeTitle}
                  >
                    <option value="">Employment Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Volunteer">Volunteer</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                {/* Category Selector */}
                <div className="w-full">
                  <select
                    onChange={(e) =>
                      handleSearchChange("", e.target.value, "category")
                    }
                    className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={generateTitle().categoryTitle}
                  >
                    <option value="">Category</option>
                    <option value="Other">Other</option>
                    <option value="Admin & Office">Admin & Office</option>
                    <option value="Art & Design">Art & Design</option>
                    <option value="Business Operations">
                      Business Operations
                    </option>
                    <option value="Cleaning & Facilities">
                      Cleaning & Facilities
                    </option>
                    <option value="Community & Social Services">
                      Community & Social Services
                    </option>
                    <option value="Computer & Data">Computer & Data</option>
                    <option value="Construction & Mining">
                      Construction & Mining
                    </option>
                    <option value="Education">Education</option>
                    <option value="Farming & Forestry">
                      Farming & Forestry
                    </option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Installation,Maintenance & Repair">
                      Installation, Maintenance & Repair
                    </option>
                    <option value="Legal">Legal</option>
                    <option value="Management">Management</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Media & Communication">
                      Media & Communication
                    </option>
                    <option value="Personal Care">Personal Care</option>
                    <option value="Protective Services">
                      Protective Services
                    </option>
                    <option value="Restaurants & Hospitality">
                      Restaurants & Hospitality
                    </option>
                    <option value="Retail & Sales">Retail & Sales</option>
                    <option value="Science & Engineering">
                      Science & Engineering
                    </option>
                    <option value="Sports & Entertainment">
                      Sports & Entertainment
                    </option>
                    <option value="Transportation">Transportation</option>
                  </select>
                </div>
              </div>

              {profile.profileLevel === 0 || profile.profileLevel === 1 ? (
                <div className="pt-4 flex justify-start">
                  <Link
                    to="/internships/create"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Create
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default IntJobs;
