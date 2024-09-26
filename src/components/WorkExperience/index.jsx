'use client'

import React, { useState, useEffect } from 'react';
import PageTitle from '../PageTitle';
import { RiBriefcase4Line } from "react-icons/ri";
import { useCookies } from 'react-cookie';
import { useSelector } from "react-redux";
import baseUrl from '../../config';
import { toast } from "react-toastify";
import { IoMdClose, IoIosList } from "react-icons/io";

export const WorkExperience = () => {
    const [workExperiences, setWorkExperiences] = useState([]);
    const icon = <RiBriefcase4Line />;
    const [cookie] = useCookies(['token']);
    const profile = useSelector((state) => state.profile);
    const [modalShow, setModalShow] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchWorkExperiences();
    }, []);

    const fetchWorkExperiences = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${baseUrl}/alumni/workExperience/${profile._id}`, {
                headers: {
                    'Authorization': `Bearer ${cookie.token}`
                }
            });
            if (!response.ok) {
                throw new Error('Failed to fetch work experiences');
            }
            const data = await response.json();
            setWorkExperiences(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching work experiences:', error);
            setLoading(false);
        }
    };

    function MyVerticallyCenteredModal(props) {
        const [forms, setForms] = useState([{}]);
        const [currentWork, setCurrentWork] = useState(false);
    
        const generateYears = () => {
          const currentYear = new Date().getFullYear();
          const years = [];
          for (let i = currentYear; i >= currentYear - 100; i--) {
            years.push(i);
          }
          return years;
        };
    
        const handleAddExperience = () => {
          setForms([...forms, {}]);
        };
    
        const handleCloseAdditionalForm = (index) => {
          setForms(forms.filter((_, i) => i !== index));
        };
    
        const handleInputChange = (event, index, field) => {
          const newForms = [...forms];
          newForms[index][field] = event.target.value;
          setForms(newForms);
        };
    
        const handleCurrentWorkChange = (index) => {
          const newForms = [...forms];
          newForms[index].currentWork = !newForms[index].currentWork;
          setForms(newForms);
          setCurrentWork(newForms[index].currentWork);
        };
    
        const handleSave = () => {
          const updatedForms = forms.map(form => {
            if (!form.endMonth && !form.endYear) {
              return {
                ...form,
                endMonth: 'current'
              };
            }
            return form;
          });
    
          let body = JSON.stringify(updatedForms);
    
          fetch(`${baseUrl}/alumni/workExperience/${profile._id}`, {
            method: 'PUT',
            body,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${cookie.token}`
            }
          })
            .then(response => response.json())
            .then(data => {
              console.log(data);
              toast.success("Added successfully!");
              // window.location.reload();
              fetchWorkExperiences();
              props.onHide();
            })
            .catch(error => console.error('Error:', error));
        };
    
        return (
          <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 ${props.show ? '' : 'hidden'}`}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] ">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-2xl font-bold">Add Experience</h2>
                <button onClick={props.onHide} className="text-gray-500 hover:text-gray-700">
                  <IoMdClose size={24} />
                </button>
              </div>
              <div className=" overflow-y-auto h-[60vh]">
                <button onClick={handleAddExperience} className="mb-4 px-8 ml-3 bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors duration-200">
                  Add
                </button>
                {forms.map((form, index) => (
                  <div key={index} className="mb-6 p-4 border rounded-lg">
                    {index > 0 && (
                      <div className="flex justify-between mb-4">
                        <button onClick={handleAddExperience} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors duration-200">
                          Add
                        </button>
                        <button onClick={() => handleCloseAdditionalForm(index)} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors duration-200">
                          <IoMdClose />
                        </button>
                      </div>
                    )}
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`title-${index}`}>
                        Title
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`title-${index}`}
                        type="text"
                        placeholder="Enter title"
                        value={form.title || ''}
                        onChange={(event) => handleInputChange(event, index, 'title')}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`companyName-${index}`}>
                        Company Name
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`companyName-${index}`}
                        type="text"
                        placeholder="Company Name"
                        value={form.companyName || ''}
                        onChange={(event) => handleInputChange(event, index, 'companyName')}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`location-${index}`}>
                        Location
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`location-${index}`}
                        type="text"
                        placeholder="Location"
                        value={form.location || ''}
                        onChange={(event) => handleInputChange(event, index, 'location')}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`locationType-${index}`}>
                        Location Type
                      </label>
                      <select
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`locationType-${index}`}
                        value={form.locationType || ''}
                        onChange={(event) => handleInputChange(event, index, 'locationType')}
                      >
                        <option value="">Location Type</option>
                        <option value="On-site">On-site</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                    <div className="mb-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-600"
                          checked={form.currentWork || false}
                          onChange={() => handleCurrentWorkChange(index)}
                        />
                        <span className="ml-2 text-gray-700">I currently work here</span>
                      </label>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Start Date
                      </label>
                      <div className="flex space-x-2">
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={form.startMonth || ''}
                          onChange={(event) => handleInputChange(event, index, 'startMonth')}
                        >
                          <option value="">Month</option>
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={form.startYear || ''}
                          onChange={(event) => handleInputChange(event, index, 'startYear')}
                        >
                          <option value="">Year</option>
                          {generateYears().map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        End Date
                      </label>
                      <div className="flex space-x-2">
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={form.endMonth || ''}
                          onChange={(event) => handleInputChange(event, index, 'endMonth')}
                          disabled={form.currentWork}
                        >
                          <option value="">Month</option>
                          {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                        <select
                          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          value={form.endYear || ''}
                          onChange={(event) => handleInputChange(event, index, 'endYear')}
                          disabled={form.currentWork}
                        >
                          <option value="">Year</option>
                          {generateYears().map((year) => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`industry-${index}`}>
                        Industry
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`industry-${index}`}
                        type="text"
                        placeholder="Industry"
                        value={form.industry || ''}
                        onChange={(event) => handleInputChange(event, index, 'industry')}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`description-${index}`}>
                        Description
                      </label>
                      <textarea
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`description-${index}`}
                        rows={3}
                        value={form.description || ''}
                        onChange={(event) => handleInputChange(event, index, 'description')}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`profileHeadline-${index}`}>
                        Profile Headline
                      </label>
                      <input
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        id={`profileHeadline-${index}`}
                        type="text"
                        placeholder="Profile Headline"
                        value={form.profileHeadline || ''}
                        onChange={(event) => handleInputChange(event, index, 'profileHeadline')}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end p-6 border-t">
                <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded mr-2 hover:bg-green-600 transition-colors duration-200">
                  Save
                </button>
                <button onClick={props.onHide} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-colors duration-200">
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      }

    return (
        <div className="w-full mt-4 p-[5%]">
            <PageTitle title='Work Experience' icon={icon} />
            <div className="pt-5">
              <button
                type="button"
<<<<<<< Updated upstream
                className="flex items-center gap-2 bg-white border-2 border-yellow-500 text-blue-700 rounded-md px-4 py-2 hover:bg-yellow-50 transition-colors duration-200"
=======
                style={{ backgroundColor: 'white', display: 'flex', alignItems: 'center', gap: '7px', border: '2px solid #5e5d56', color: '#004C8A', borderRadius: '5px',padding: '10px' }}
>>>>>>> Stashed changes
                onClick={() => setModalShow(true)}
              >
                <IoIosList/>
                <span>Add Work Experience</span>
              </button>
              <MyVerticallyCenteredModal
                show={modalShow}
                onHide={() => setModalShow(false)}
              />
            </div>
            <div className="mt-4">
                {loading && <p className="text-gray-600">Loading...</p>}
                {workExperiences.map((experience, index) => (
                    <div key={index} className="bg-white shadow-md rounded-lg p-4 mb-4">
                        <h3 className="text-xl font-semibold text-gray-800">{experience.title}</h3>
                        <p className="text-lg text-gray-600">{experience.companyName}</p>
                        <p className="text-sm text-gray-500">{`${experience.startMonth} ${experience.startYear} - ${experience.endMonth} ${experience.endYear || ''}`}</p>
                        <p className="text-sm text-gray-500">{`${experience.location} - ${experience.locationType}`}</p>
                    </div>
                ))}
                {(workExperiences.length === 0 && !loading) && <p className="text-gray-600">No work experience</p>}
            </div>
        </div>
    );
};