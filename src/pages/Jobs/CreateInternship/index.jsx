import React from 'react';
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import baseUrl from '../../../config.js';
import { toast } from 'react-toastify';

export const CreateInternship = () => {
  const profile = useSelector((state) => state.profile);


  return (
    <div>
      Create An Internship
      <div>
        <form>
          <div class="space-y-12">
            <div class="border-gray-900/10 pb-12">
              <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                <div class="col-span-full">
                  <label for="jobTitle" class="block text-sm font-medium leading-6 text-gray-900">Job Title</label>
                  <div class="mt-2">
                    <input type="text" name="jobTitle" id="jobTitle" autocomplete="jobTitle" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="location" class="block text-sm font-medium leading-6 text-gray-900">Location</label>
                  <div class="mt-2">
                    <input type="text" name="location" id="location" autocomplete="location" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="location" class="block text-sm font-medium leading-6 text-gray-900">Company</label>
                  <div class="mt-2">
                    <input type="text" name="company" id="company" autocomplete="company" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="about" class="block text-sm font-medium leading-6 text-gray-900">Describe the responsibilities and preferred skills for this Internship</label>
                  <div class="mt-2">
                    <textarea id="about" name="about" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="category" class="block text-sm font-medium leading-6 text-gray-900">Category</label>
                  <div class="mt-2">
                    <select id="category" name="category" autocomplete="category-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                      <option>Technology</option>
                      <option>Business</option>
                      <option>Design</option>
                    </select>
                  </div>
                </div>

                <div class="mt-6 space-y-6">
                    <div class="flex items-center gap-x-3">
                      <input id="push-everything" name="push-notifications" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      <label for="push-everything" class="block text-sm font-medium leading-6 text-gray-900">Paid</label>
                    </div>
                    <div class="flex items-center gap-x-3">
                      <input id="push-email" name="push-notifications" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      <label for="push-email" class="block text-sm font-medium leading-6 text-gray-900">Unpaid</label>
                    </div>
                  </div>


                <div class="col-span-full grid grid-cols-1 sm:grid-cols-6 gap-x-6">
                  <div class="sm:col-span-5">
                    <label for="minimum-salary" class="block text-sm font-medium leading-6 text-gray-900">Minimum Salary</label>
                    <div class="mt-2">
                      <input type="text" name="minimum-salary" id="minimum-salary" autocomplete="minimum-salary" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                    </div>
                  </div>
                  <div class="sm:col-span-1">
                    <div class="mt-8">
                      <select id="currency" name="currency" autocomplete="currency" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
                        <option>INR</option>
                        <option>USD</option>
                        <option>EURO</option>
                      </select>
                    </div>
                  </div>
                </div>


                <div class="sm:col-span-5">
                  <label for="first-name" class="block text-sm font-medium leading-6 text-gray-900">Maximum Salary</label>
                  <div class="mt-2">
                    <input type="text" name="first-name" id="first-name" autocomplete="given-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="sm:col-span-1">
                  <label for="last-name" class="block text-sm font-medium leading-6 text-gray-900">Per Hour</label>
                  <div class="mt-2">
                    <input type="text" name="last-name" id="last-name" autocomplete="family-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6" />
                  </div>
                </div>

                <div class="col-span-full">
                  <label for="cover-photo" class="block text-sm font-medium leading-6 text-gray-900">Add images to help applicants see what it's like to work at this location</label>
                  <div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                    <div class="text-center">
                      <svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
                      </svg>
                      <div class="mt-4 flex text-sm leading-6 text-gray-600">
                        <label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" class="sr-only" />
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
                      <input id="push-everything" name="push-notifications" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      <label for="push-everything" class="block text-sm font-medium leading-6 text-gray-900">On-Site</label>
                    </div>
                    <div class="flex items-center gap-x-3">
                      <input id="push-email" name="push-notifications" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      <label for="push-email" class="block text-sm font-medium leading-6 text-gray-900">Remote</label>
                    </div>
                    <div class="flex items-center gap-x-3">
                      <input id="push-nothing" name="push-notifications" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                      <label for="push-nothing" class="block text-sm font-medium leading-6 text-gray-900">Hybrid</label>
                    </div>
                  </div>
                </fieldset>
              </div>
            </div>
          </div>

          <div class="mt-6 flex items-center justify-end gap-x-6">
            <button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
            <button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
