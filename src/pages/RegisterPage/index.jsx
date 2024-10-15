import FrameComponent1 from "../../components/FrameComponent/FrameComponent1.jsx";
import "./registerpage.css";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import "./registerpage.css";
import "../LoginPage/loginPage.css"
import backgroundPic from "../../images/imgb.jpg";
import pic from "../../images/bhuUni.jpg";
import logo from "../../images/bhu.png";
import { useNavigate } from 'react-router-dom';
import { toast } from "react-toastify";
import baseUrl from "../../config.js";
import bg1 from "../../images/login-bg-1.jpg";
import bg2 from "../../images/login-bg-2.jpg";

const RegisterPage = () => {
  const navigateTo = useNavigate();
  const [currentBg, setCurrentBg] = useState(bg1);
  const [nextBg, setNextBg] = useState(bg2);
  const [slideDirection, setSlideDirection] = useState("left");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    accept: false,
    graduatedFromClass: '',
    graduatingYear: ''
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let val = type === 'checkbox' ? checked : value;

    // Convert specific fields to numbers
    if (name === 'graduatedFromClass' || name === 'graduatingYear') {
      val = parseInt(val, 10); // Convert value to number
    }

    setFormData({ ...formData, [name]: val });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      console.log('formData', formData);
      const response = await axios.post(`${baseUrl}/alumni/register`, formData);
      console.log('Registration successful!', response.data);
      toast.success("User Registered successfully!");
      navigateTo('/');
      setLoading(false);
    } catch (error) {
      console.error('Registration failed!', error.response.data);
      toast.error(error.response.data.error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection(prev => prev === "left" ? "right" : "left");
      setTimeout(() => {
        setCurrentBg(prev => prev === bg1 ? bg2 : bg1);
        setNextBg(prev => prev === bg1 ? bg2 : bg1);
      }, 1000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 1; i >= currentYear - 100; i--) {
      years.push(`${i}`);
    }
    return years;
  };

  return (
    <div className="register">
      <main className="rectangle-parent">
        <div className="rectangle-group">
          <div className="bhu-alumni-association-container1">
            <div className="p-8">
              <p style={{ fontSize: '35px', fontWeight: '700', color: '#f8f8ff' }}>Excel Connect<br /></p>
              <p className="subheading" style={{ fontSize: '30px', fontWeight: '0', color: '#f8f8ff', lineHeight: '85%' }}>Reconnect with your Alma Mater</p>
              <div style={{ fontSize: '0.22em', color: 'white', paddingTop: '25px' }}>
                <p>Dear Excellites,</p><br />
                <p>Welcome back to your EPS!</p><br />
                <p>As a member of our vibrant and accomplished alumni community, you are an integral part of the legacy we continue to build. Whether you walked through our portals years ago or just recently graduated, your time at Excel Public School shaped your future and contributed to the school's growth and success.</p><br />

                <p>I am excited to welcome you to EXCEL CONNECT—a platform designed to reconnect, reminisce, and collaborate. This platform is more than just a space to keep in touch; it is a gateway to share achievements, engage in meaningful dialogues, and contribute to the ongoing development of your alma mater. Through this, we hope to strengthen the bond between past and present, creating a community of lifelong learners and leaders.</p><br />

                <p>At Excel Public School, we take immense pride in the journeys our alumni have embarked upon, and we are always eager to hear your stories, celebrate your successes, and collaborate on future endeavours. EXCEL CONNECT offers opportunities to stay connected with fellow alumni, mentor current students, and participate in events that bring us closer.</p><br />

                <p>As you reconnect with your school, batch mates, and schoolmates, we invite you to contribute your experiences, skills, and knowledge. Together, let us continue to inspire and lead, as we always have, guided by the values and education that Excel Public School instilled in all of you.</p><br />

                <p>I look forward to your active participation and to celebrating your future milestones. Remember, Excel Public School will always be your home away from home no matter where life takes you.</p><br />

                <p>Welcome back to where it all began!</p><br />

                <p>Warm Regards,</p>
                <p>Mathew K G</p>
                <p>(Principal)</p>
              </div>
            </div>
          </div>
        </div>
        <div className="first-name-field-wrapper">
          <form className="first-name-field" onSubmit={handleSubmit} >
            <h1 className="create-an-account">Register Now</h1>
            <div className="last-name-field-parent">
              <div className="last-name-field">First Name</div>
              <div className="input">
                <div className="input1">
                  <div className="field">
                    <input
                      className="register-email-address"
                      placeholder="Enter First Name"
                      type="text"
                      style={{ width: '100%' }}
                      name='firstName' id='firstName' onChange={handleChange} required
                    />
                  </div>
                </div>
              </div>
              <div className="last-name-field">Last Name</div>
              <div className="input">
                <div className="input1">
                  <div className="field">
                    <input
                      className="register-email-address"
                      placeholder="Enter Last Name"
                      type="text"
                      style={{ width: '100%' }}
                      name='lastName' id='lastName' onChange={handleChange} required
                    />
                  </div>
                </div>
              </div>
              <div className="last-name-field">E-mail</div>
              <div className="input">
                <div className="input1">
                  <div className="field">
                    <input
                      className="register-email-address"
                      placeholder="Enter Email Address"
                      type="text"
                      style={{ width: '100%' }}
                      name='email' id='email' onChange={handleChange} required
                    />
                  </div>
                </div>

              </div>
              <div className="last-name-field1">
                <div className="password">Password</div>
                <div className="input2">
                  <div className="input3">
                    <div className="field1">
                      <input
                        className="email-address1"
                        placeholder="Enter Password"
                        type="password"
                        style={{ width: '100%' }}
                        name='password' id='password' onChange={handleChange} required
                      />
                    </div>
                  </div>

                </div>
              </div>
              <div className="last-name-field2">
                <div className="password">Confirm Password</div>
                <div className="input2">
                  <div className="input3">
                    <div className="field1">
                      <input
                        className="email-address1"
                        placeholder="Confirm Password"
                        type="password"
                        style={{ width: '100%' }}
                        name='confirmPassword' id='confirmPassword' onChange={handleChange} required
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="last-name-field3">
                <div className="gender">Gender</div>
                <div className="gender1">
                  <select name='gender' id='gender' style={{ fontSize: 'var(--input-text-title-size)', width: '100%', height: '100%', borderRadius: 'var(--br-9xs)', border: '1px solid var(--outline-box)', boxSizing: 'border-box', backgroundColor: 'var(--background-light)' }} onChange={handleChange} required>
                    <option value='' disabled selected >Select Gender</option>
                    <option value='Male'>Male</option>
                    <option value='Female'>Female</option>
                    <option value='Other'>Other</option>
                  </select>

                </div>
              </div>
              <div className="last-name-field4">
                <div className="department">Graduated From Class</div>
                <div className="dept">
                  <select name='graduatedFromClass' id='graduatedFromClass' style={{ fontSize: 'var(--input-text-title-size)', width: '100%', height: '100%', borderRadius: 'var(--br-9xs)', border: '1px solid var(--outline-box)', boxSizing: 'border-box', backgroundColor: 'var(--background-light)' }} onChange={handleChange} required>
                    <option value='' disabled selected >Select Graduated From Class</option>
                    <option value='1'>1st</option>
                    <option value='2'>2nd</option>
                    <option value='3'>3rd</option>
                    <option value='4'>4th</option>
                    <option value='5'>5th</option>
                    <option value='6'>6th</option>
                    <option value='7'>7th</option>
                    <option value='8'>8th</option>
                    <option value='9'>9th</option>
                    <option value='10'>10th</option>
                    <option value='11'>11th</option>
                    <option value='12'>12th</option>
                  </select>
                </div>
              </div>
              <div className="last-name-field5">
                <div className="batch">Graduating Year</div>
                <div className="batch1">
                  <select name='graduatingYear' id='graduatingYear' style={{ fontSize: 'var(--input-text-title-size)', width: '100%', height: '100%', borderRadius: 'var(--br-9xs)', border: '1px solid var(--outline-box)', boxSizing: 'border-box', backgroundColor: 'var(--background-light)' }} onChange={handleChange} required>
                    <option value='' disabled selected>Select Graduating Year</option>
                    {generateYears().map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="privacy-policy-link">
                <div className="by-creating-your">
                  <label>
                    <input
                      type="checkbox"
                      name="accept"
                      id="accept"
                      onChange={handleChange}
                      required
                    /> I agree to the terms & conditions
                  </label>
                </div>
                <div className="privacy-policy">Privacy Policy</div>
              </div>

            </div>
            <button
              className="register-button"
              type='submit'
              id='btn'
              name='btn'
              disabled={!formData.accept || loading}
            >
              <div className="register-button1">{loading ? 'Registering...' : "Let's go"}</div>
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
