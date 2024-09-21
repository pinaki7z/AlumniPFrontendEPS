import React, { useState, useEffect } from "react";
import "./profileSetings.css";
import PageTitle from "../../../components/PageTitle";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { CgProfile } from "react-icons/cg";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Dropdown from "react-bootstrap/Dropdown";
import { useCookies } from "react-cookie";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { updateProfile } from "../../../store/profileSlice";
import { IoMdAdd } from "react-icons/io";
import baseUrl from "../../../config";
import { padding } from "@mui/system";
import axios from "axios";

export const ProfileSettings = () => {
  const navigate = useNavigate();

  const [cookie, setCookie] = useCookies(["access_token"]);
  const profile = useSelector((state) => state.profile);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isCurrentStudent, setIsCurrentStudent] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropDown, setShowDropDown] = useState(false);

  const token = cookie.token;

  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      firstName: profile.firstName || "",
      lastName: profile.lastName || "",
      aboutMe: profile.aboutMe || "",
      workingAt: profile.workingAt || "",
      companyWebsite: profile.companyWebsite || "",
      location: profile.location || "",
      city: profile.city || "",
      country: profile.country || "",
      graduatingYear: profile.graduatingYear || "",
      class: profile.class || "",
      jobRole: profile.jobRole || "",
    }));
  }, [profile._id]);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    aboutMe: "",
    workingAt: "",
    companyWebsite: "",
    location: "",
    city: "",
    country: "",
    student: false,
    graduatingYear: "",
    class: "",
    jobRole: "",
  });
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
    formData.append('image', file);

    axios.post(`${baseUrl}/uploadImage/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        setFormData({ ...formData, profilePicture: res.data });
      })
      .catch(err => {
        console.log(err);
      });
   
    }
  };
  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
    formData.append('image', file);

    axios.post(`${baseUrl}/uploadImage/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        setFormData({ ...formData, coverPicture: res.data });
      })
      .catch(err => {
        console.log(err);
      });
   
    }
  };
  const handleUploadID = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
    formData.append('image', file);

    axios.post(`${baseUrl}/uploadImage/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
      .then(res => {
        setFormData({ ...formData, ID: res.data });
      })
      .catch(err => {
        console.log(err);
      });
   
    }
  };

  // const handleCoverImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFormData({ ...formData, coverPicture: reader.result });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };
  // const handleUploadID = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setFormData({ ...formData, ID: reader.result });
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCurrentStudentChange = () => {
    setIsCurrentStudent(!isCurrentStudent);
    if (!isCurrentStudent) {
      setFormData({
        ...formData,
        workingAt: "",
        student: true,
        graduatingYear: "",
        jobRole: "",
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    console.log("formData", formData);
    const userID = profile._id;

    try {
      const response = await fetch(`${baseUrl}/alumni/${userID}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const responseData = await response.json();
        dispatch(updateProfile(responseData));
        toast.success("User Updated Successfully");
        setLoading(false);
        navigateTo("/profile");
      } else {
        console.error("Failed to update user");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    setShowDropDown(true);
    const { value } = e.target;
    console.log("value", value);
    setFormData((prevFormData) => ({
      ...prevFormData,
      workingAt: value,
    }));

    if (value.length >= 3) {
      try {
        const response = await fetch(
          `${baseUrl}/search/search/company?q=${value}`
        );
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.companies);
        } else {
          console.error("Failed to fetch search results");
        }
      } catch (error) {
        console.error("Error fetching search results:", error);
      }
    } else {
      setSearchResults([]);
    }
  };

  // const handleChange = (e) => {
  //   const { value } = e.target;
  //   handleSearch(value);
  // };

  const handleSelectCompany = (company) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      workingAt: company,
    }));
    setShowDropDown(false);
  };

  const title = "Profile Settings";
  const icon = <CgProfile style={{ color: "#174873" }} />;

  return (
    <div className="w-full px-3 lg:px-10 py-5 bg-gray-100">
      {/* Page Title */}
      <PageTitle title={title} icon={icon} />

      {/* Form Container */}
      <div className="mt-8 bg-white shadow-md rounded-lg p-3">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First Name */}
            <div>
              <label
                htmlFor="firstName"
                className="block text-gray-700 font-medium mb-2"
              >
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="lastName"
                className="block text-gray-700 font-medium mb-2"
              >
                Last Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* About Me */}
          <div>
            <label
              htmlFor="aboutMe"
              className="block text-gray-700 font-medium mb-2"
            >
              About Me
            </label>
            <textarea
              id="aboutMe"
              name="aboutMe"
              rows="4"
              placeholder="Tell us about yourself"
              value={formData.aboutMe}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Current Student Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="currentStudent"
              checked={isCurrentStudent}
              onChange={handleCurrentStudentChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label
              htmlFor="currentStudent"
              className="ml-2 block text-gray-700"
            >
              Current Student
            </label>
          </div>

          {/* Working At and Company Website */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Working At */}
            <div className="relative">
              <label
                htmlFor="workingAt"
                className="block text-gray-700 font-medium mb-2"
              >
                Working At<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="workingAt"
                name="workingAt"
                placeholder="Enter Working at"
                value={formData.workingAt}
                onChange={handleSearch}
                required
                disabled={isCurrentStudent}
                className={`w-full px-4 py-2 border ${
                  isCurrentStudent
                    ? "bg-gray-100 cursor-not-allowed"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {/* Dropdown for Search Results */}
              {showDropDown && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((company) => (
                      <div
                        key={company._id}
                        onClick={() => handleSelectCompany(company.name)}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      >
                        {company.name}
                      </div>
                    ))
                  ) : formData.workingAt !== "" ? (
                    <div
                      onClick={() => handleSelectCompany(formData.workingAt)}
                      className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    >
                      <IoMdAdd className="text-blue-500 mr-2" />
                      <span>Add {formData.workingAt}</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Company Website */}
            <div>
              <label
                htmlFor="companyWebsite"
                className="block text-gray-700 font-medium mb-2"
              >
                Company Website
              </label>
              <input
                type="text"
                id="companyWebsite"
                name="companyWebsite"
                placeholder="Enter Company Website"
                value={formData.companyWebsite}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Class, Graduating Year, and Job Role */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Class */}
            <div>
              <label
                htmlFor="class"
                className="block text-gray-700 font-medium mb-2"
              >
                Class
              </label>
              <input
                type="number"
                id="class"
                name="class"
                placeholder="Enter your current class"
                value={formData.class}
                onChange={handleInputChange}
                required
                disabled={!isCurrentStudent}
                className={`w-full px-4 py-2 border ${
                  !isCurrentStudent
                    ? "bg-gray-100 cursor-not-allowed"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Graduating Year */}
            <div>
              <label
                htmlFor="graduatingYear"
                className="block text-gray-700 font-medium mb-2"
              >
                Graduating Year
              </label>
              <input
                type="text"
                id="graduatingYear"
                name="graduatingYear"
                placeholder="Enter your graduating year"
                value={formData.graduatingYear}
                onChange={handleInputChange}
                required
                disabled={isCurrentStudent}
                className={`w-full px-4 py-2 border ${
                  isCurrentStudent
                    ? "bg-gray-100 cursor-not-allowed"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>

            {/* Job Role */}
            <div>
              <label
                htmlFor="jobRole"
                className="block text-gray-700 font-medium mb-2"
              >
                Job Role
              </label>
              <input
                type="text"
                id="jobRole"
                name="jobRole"
                placeholder="Enter your job role"
                value={formData.jobRole}
                onChange={handleInputChange}
                required
                disabled={isCurrentStudent}
                className={`w-full px-4 py-2 border ${
                  isCurrentStudent
                    ? "bg-gray-100 cursor-not-allowed"
                    : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          {/* City and Country */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* City */}
            <div>
              <label
                htmlFor="city"
                className="block text-gray-700 font-medium mb-2"
              >
                City<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                name="city"
                placeholder="Enter City"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="country"
                className="block text-gray-700 font-medium mb-2"
              >
                Country<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="country"
                name="country"
                placeholder="Enter Country"
                value={formData.country}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Profile and Cover Picture Uploads */}
          <div className="grid grid-cols-1   md:grid-cols-2 gap-6">
            {/* Change Profile Picture */}
            <div>
              <label
                htmlFor="profileImage"
                className="block text-gray-700 font-medium mb-2"
              >
                Change Profile Picture
                <span className="text-gray-500">(Ratio: 1:1)</span>
              </label>
              <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition cursor-pointer">
                <label
                  htmlFor="profileImage"
                  className="flex flex-col cursor-pointer items-center text-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    fill="currentColor"
                    color="gray"
                    class="bi bi-cloud-plus"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"
                    />
                    <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
                  </svg>
                  <span className="mt-2 text-sm text-gray-600">
                    Drop files here or click to upload
                  </span>
                </label>
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleProfileImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* Change Cover Picture */}
            <div>
              <label
                htmlFor="coverImage"
                className="block text-gray-700 font-medium mb-2"
              >
                Change Cover Picture
              </label>
              <div className="flex items-center justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition cursor-pointer">
                <label
                  htmlFor="coverImage"
                  className="flex flex-col cursor-pointer items-center text-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="36"
                    height="36"
                    fill="currentColor"
                    color="gray"
                    class="bi bi-cloud-plus"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill-rule="evenodd"
                      d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"
                    />
                    <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
                  </svg>
                  <span className="mt-2 text-sm text-gray-600">
                    Drop files here or click to upload
                  </span>
                </label>
                <input
                  type="file"
                  id="coverImage"
                  accept="image/*"
                  onChange={handleCoverImageChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Upload ID */}
          <div className="cursor-pointer">
            <label
              htmlFor="uploadID"
              className="block  text-gray-700 cursor-pointer font-medium mb-2"
            >
              Upload ID (College ID, Aadhaar Card, PAN Card, Passport)
            </label>
            <div className="flex items-center  justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md hover:border-blue-500 transition cursor-pointer">
              <label
                htmlFor="uploadID"
                className="flex flex-col cursor-pointer items-center text-center w-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="36"
                  height="36"
                  fill="currentColor"
                  color="gray"
                  class="bi bi-cloud-plus"
                  viewBox="0 0 16 16"
                >
                  <path
                    fill-rule="evenodd"
                    d="M8 5.5a.5.5 0 0 1 .5.5v1.5H10a.5.5 0 0 1 0 1H8.5V10a.5.5 0 0 1-1 0V8.5H6a.5.5 0 0 1 0-1h1.5V6a.5.5 0 0 1 .5-.5"
                  />
                  <path d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z" />
                </svg>
                <span className="mt-2 text-sm text-gray-600">
                  Drop files here or click to upload
                </span>
              </label>
              <input
                type="file"
                id="uploadID"
                accept="image/*"
                onChange={handleUploadID}
                className="hidden"
              />
            </div>
          </div>

          {/* Submit and Cancel Buttons */}
          <div className="flex justify-center space-x-8 mt-8">
            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#174873] text-white font-semibold rounded-md hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={() => navigate("/profile")}
              className="px-6 py-2 bg-[#174873] text-white font-semibold rounded-md hover:bg-blue-700 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
