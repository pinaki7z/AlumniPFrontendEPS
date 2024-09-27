import React from 'react';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import baseUrl from '../../../config.js';
import { toast } from 'react-toastify';
import axios from "axios";

export const CreateInternship = () => {
  const profile = useSelector((state) => state.profile);
  const [loading, setLoading] = useState(false);
  const [internshipFormData, setInternshipFormData] = useState({
    userId: profile._id,
    title: '',
    location: '',
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    duration: 'per hour',
    company: profile.workingAt,
    //employmentType: 'Full-time',
    coverImage: null, 
    category: 'Other',
    type: 'Internship',
    description: '',
    attachments: [],
    locationType: {
      onSite: false,
      remote: false,
      hybrid: false
    }
  });

  const [isPaid, setIsPaid] = useState(false);
  const [isUnpaid, setIsUnpaid] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInternshipFormData(prevFormData => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handlePaidUnpaid = (e) => {
    const { name, checked } = e.target;
    if (name === 'isPaid') {
      setIsPaid(checked);
      setIsUnpaid(false);
    } else if (name === 'isUnpaid') {
      setIsUnpaid(checked);
      setIsPaid(false);
      setInternshipFormData(prevFormData => ({
        ...prevFormData,
        salaryMin: '',
        salaryMax: ''
      }));
    }
  };

  const handleLocationTypeChange = (type) => {
    setInternshipFormData(prevFormData => ({
      ...prevFormData,
      locationType: {
        onSite: type === 'onSite',
        remote: type === 'remote',
        hybrid: type === 'hybrid'
      }
    }));
  };

  const handleCoverImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      axios.post(`${baseUrl}/uploadImage/singleImage`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(res => {
          setInternshipFormData({ ...internshipFormData, coverImage: res.data });
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
  const handleImageChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
     
      const data = new FormData();
  
      // Append each file to the FormData object with the key 'images[]'
      Array.from(files).forEach((file) => {
        data.append('images', file);  // Use 'images' as the key for all files
      });
  
      // Send the FormData to the API
      axios.post(`${baseUrl}/uploadImage/image`, data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
        .then(res => {
          // Assuming res.data contains the uploaded files' data (like URLs or IDs)
          setInternshipFormData(prevState => ({
            ...prevState,
            attachments: res.data  // Update the attachments array in formData
          }));
        })
        .catch(err => {
          console.log(err);
        });
    }
  };
  
  

  const handlePublish = async (e) => {
    e.preventDefault();
    console.log('formData', internshipFormData);
    setLoading(true);
  
    try {
      // Prepare a plain JavaScript object based on internshipFormData
      const formDataToSend = { ...internshipFormData };
  
      // No need for any special handling of attachments, just include them as they are (array of URLs)
      formDataToSend.attachments = internshipFormData.attachments;
  
      // For locationType, we need to flatten the nested object structure
      for (const locationKey in internshipFormData.locationType) {
        formDataToSend[`locationType[${locationKey}]`] = internshipFormData.locationType[locationKey];
      }
  
      // Convert the entire formData object to a JSON string
      const requestBody = JSON.stringify(formDataToSend);
      console.log('request body',requestBody)
  
      // Make the request with the JSON body
      const response = await fetch(`${baseUrl}/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',  // Set content type to JSON
        },
        body: requestBody,
      });
  
      if (response.ok) {
        console.log('Data saved successfully');
        const successMessage = internshipFormData.type === 'Internship' 
          ? 'The internship post is being validated by the admin' 
          : 'The job post is being validated by the admin';
        toast.success(successMessage);
      } else {
        const errorData = await response.json();
        console.error('Failed to save data', errorData);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  
    setLoading(false);
  };
  
  return (
    <div style={{ padding: '5% 5%' }}>
      Create An Internship
      <div>
        <form>
          <div class="space-y-12">
            <div class="border-gray-900/10 pb-12">
              <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div class="col-span-full">
                  <label for="title" class="block text-sm font-medium leading-6 text-gray-900">Job Title</label>
                  <div class="mt-2">
                    <input type="text" name="title" id="title" autocomplete="title" value={internshipFormData.title} onChange={handleInputChange} class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="location" class="block text-sm font-medium leading-6 text-gray-900">Location</label>
                  <div class="mt-2">
                    <input type="text" name="location" id="location" autocomplete="location" value={internshipFormData.location}
                      onChange={handleInputChange}
                      disabled={internshipFormData?.locationType?.remote} class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="location" class="block text-sm font-medium leading-6 text-gray-900">Company</label>
                  <div class="mt-2">
                    <input type="text" name="company" id="company" autocomplete="company"
                      value={internshipFormData.company}
                      disabledclass="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="about" class="block text-sm font-medium leading-6 text-gray-900">Describe the responsibilities and preferred skills for this Internship</label>
                  <div class="mt-2">
                    <textarea id="description" name="description" rows="3" value={internshipFormData.description}
                      onChange={handleInputChange} class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="category" class="block text-sm font-medium leading-6 text-gray-900">Category</label>
                  <div class="mt-2">
                    <select id="category" name="category" autocomplete="category-name" onSelect={(eventKey) => {
                      setInternshipFormData(prevFormData => ({
                        ...prevFormData,
                        category: eventKey,
                      }));
                    }} class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                      <option>Technology</option>
                      <option>Business</option>
                      <option>Art & Design</option>
                      <option>Admin & Office</option>
                      <option>Other</option>
                    </select>
                  </div>
                </div>

                <div class="mt-6 space-y-6">
                  <div class="flex items-center gap-x-3">
                    <input id="paid" name="isPaid" type="radio" onChange={handlePaidUnpaid} checked={isPaid} class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                    <label for="paid" class="block text-sm font-medium leading-6 text-gray-900">Paid</label>
                  </div>
                  <div class="flex items-center gap-x-3">
                    <input id="unPaid" name="isUnpaid" type="radio" onChange={handlePaidUnpaid} checked={isUnpaid} class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                    <label for="isUnpaid" class="block text-sm font-medium leading-6 text-gray-900">Unpaid</label>
                  </div>
                </div>


                <div class="col-span-full grid grid-cols-1 sm:grid-cols-6 gap-x-6">
                  <div class="sm:col-span-5">
                    <label for="salaryMin" class="block text-sm font-medium leading-6 text-gray-900">Minimum Salary</label>
                    <div class="mt-2">
                      <input type="number" name="salaryMin" id="salaryMin" value={internshipFormData.salaryMin}
                        onChange={handleInputChange}
                        disabled={isUnpaid} autocomplete="salaryMin" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                  </div>
                  <div class="sm:col-span-1">
                    <div class="mt-8">
                      <select id="currency" name="currency" autocomplete="currency" onSelect={(eventKey) => {
                        setInternshipFormData(prevFormData => ({
                          ...prevFormData,
                          currency: eventKey,
                        }));
                      }} class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <option>INR</option>
                        <option>USD</option>
                        <option>EURO</option>
                      </select>
                    </div>
                  </div>
                </div>


                <div class="sm:col-span-5">
                  <label for="salaryMax" class="block text-sm font-medium leading-6 text-gray-900">Maximum Salary</label>
                  <div class="mt-2">
                    <input type="number" name="salaryMax" id="salaryMax" autocomplete="salaryMax" value={internshipFormData.salaryMax}
                      onChange={handleInputChange}
                      disabled={isUnpaid} class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="sm:col-span-1">
                  <div class="sm:col-span-1">
                    <div class="mt-8">
                      <select id="wages" name="wages" autocomplete="wages" onSelect={(eventKey) => {
                        setInternshipFormData(prevFormData => ({
                          ...prevFormData,
                          duration: eventKey,
                        }));
                      }} class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <option>per hour</option>
                        <option>per week</option>
                        <option>per month</option>
                        <option>per year</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="coverImage" class="block text-sm font-medium leading-6 text-gray-900">Add Cover Image</label>
                  <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div class="text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                      </svg>
                      <div class="mt-4 flex text-sm leading-6 text-gray-600">
                        <label for="coverImage" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input id="coverImage" name="coverImage" type="file" class="sr-only" onChange={handleCoverImageChange} accept=".jpg, .jpeg, .png, .pdf"/>
                        </label>
                        <p class="pl-1">or drag and drop</p>
                      </div>
                      <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="attachments" class="block text-sm font-medium leading-6 text-gray-900">Add images to help applicants see what it's like to work at this location</label>
                  <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div class="text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                      </svg>
                      <div class="mt-4 flex text-sm leading-6 text-gray-600">
                        <label for="attachments" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input id="attachments" name="attachments" type="file" class="sr-only" onChange={handleImageChange} multiple accept=".jpg, .jpeg, .png, .pdf"/>
                        </label>
                        <p class="pl-1">or drag and drop</p>
                      </div>
                      <p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  </div>
                </div>

                <fieldset>
                  <legend class="text-sm font-semibold leading-6 text-gray-900">Location Type</legend>
                  {/* <p class="mt-1 text-sm leading-6 text-gray-600">These are delivered via SMS to your mobile phone.</p> */}
                  <div class="mt-6 space-y-6">
                    <div class="flex items-center gap-x-3">
                      <input id="onSite" name="onSite" type="radio"  checked={internshipFormData?.locationType?.onSite} onChange={() => handleLocationTypeChange('onSite')} class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      <label for="onSite" class="block text-sm font-medium leading-6 text-gray-900">On-Site</label>
                    </div>
                    <div class="flex items-center gap-x-3">
                      <input id="remote" name="remote" type="radio" checked={internshipFormData?.locationType?.remote} onChange={() => handleLocationTypeChange('remote')} class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      <label for="remote" class="block text-sm font-medium leading-6 text-gray-900">Remote</label>
                    </div>
                    <div class="flex items-center gap-x-3">
                      <input id="hybrid" name="hybrid" type="radio" checked={internshipFormData?.locationType?.hybrid} onChange={() => handleLocationTypeChange('hybrid')} class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      <label for="hybrid" class="block text-sm font-medium leading-6 text-gray-900">Hybrid</label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
            <button type="submit" onClick={handlePublish} class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">{loading ? 'Publishing...' : 'Publish'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
