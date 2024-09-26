import "./loginPage.css";
import "../../components/FrameComponent/FrameComponent.css";
import eps from "../../images/excelPublicSchool.png";
import bg from "./background.jpg";
import { useState, useEffect } from "react";
import "./loginPage.css";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../../store/userSlice";
import { updateProfile, setAdmin } from "../../store/profileSlice";
import baseUrl from "../../config";
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import CryptoJS from "crypto-js";
import { Avatar } from "@mui/material";

const LoginPage = ({ handleLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cookie, setCookie] = useCookies(["token"]);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const profile = useSelector((state) => state.profile);
  const backgroundImageUrl = `${process.env.REACT_APP_URL}/images/background.jpg`;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const SECRET_KEY =
    "f3c8a3c9b8a9f0b2440a646f3a5b8f9e6d6e46555a4b2b5c6d7c8d9e0a1b2c3d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8g9h0";

  const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  };

  const decrypt = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  useEffect(() => {
    const savedEmail = localStorage.getItem("savedEmail");
    const savedPassword = localStorage.getItem("savedPassword");
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(decrypt(savedPassword));
      setRememberDevice(true);
    }
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Manage remember device
      if (rememberDevice) {
        localStorage.setItem("savedEmail", email);
        localStorage.setItem("savedPassword", encrypt(password));
      } else {
        localStorage.removeItem("savedEmail");
        localStorage.removeItem("savedPassword");
      }

      const response = await fetch(`${baseUrl}/alumni/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Login failed", errorData);
        toast.error(errorData.message || "Login failed");
        return;
      }

      const { token, alumni } = await response.json();
      const currentDate = new Date();

      // Handle account expiration
      if (
        alumni.expirationDate &&
        new Date(alumni.expirationDate) < currentDate
      ) {
        toast.error(
          "Your account has expired. Contact admin to recover account"
        );
        return;
      }

      // Handle successful login
      handleLogin();
      dispatch(updateProfile(alumni));
      setCookie("token", token, { path: "/" });

      if (alumni.profileLevel === 0) {
        dispatch(setAdmin(true));
      }

      toast.success("Logged in successfully!");

      // Use navigate instead of window.location
      const isLoginPath = window.location.pathname.endsWith("/login");
      if (isLoginPath) {
        navigate("/");
      } else {
        navigate("/"); // Reload the current page
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast.error("An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page-1 ">
      <div className="main-container" style={{marginBottom: '20px'}}>
        <div className="content-area">
          <img src={eps} alt="" width='90px' height='120px' />
        </div>
      </div>
      <main className="login-panel">
        <div className="login-panel-child" />
        <div className="welcome-message">
          <div className="welcome-message-child" />
          <h1 className="rediscover-reconnect-reignite">
            REDISCOVER RECONNECT REIGNITE
          </h1>
          <h1 className="your-alumni-journey">
            Your Alumni Journey Starts Here!
          </h1>
        </div>
        <div className="login-fields">
          <form className="credentials-input" onSubmit={handleSubmit}>
            <h1 className="welcome-back" style={{color: '#36454F'}}>Welcome Back!</h1>
            <div className="university-affiliation">
              <div className="bhu-alumni-association-container">
                <b className="bhu">
                  <span className="bhu1" style={{color: '#36454F',fontSize: '60px'}}>Excel Public School</span>
                </b>
                <br />
                <span className="alumni-association">
                  <b className="b">{` `}</b>
                  <span className="alumni-association1" style={{color: '#36454F'}}>Alumni Association</span>
                </span>
              </div>
            </div>
            <div className="account-details-parent">
              <div className="account-details" style={{width: '100%'}}>
                <div className="email" style={{color: '#36454F'}}>Email</div>
                <div className="email1" style={{width: '100%'}}>
                  <div className="field">
                    <input
                      className="email-address"
                      placeholder="Email address"
                      type="text"
                      style={{ width: '100%'  }}
                      value={email} onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="password" style={{color: '#36454F'}}>Password</div>
              <div className="input-area">
                <div className="input">
                  <div className="input1" style={{position: 'relative'}}>
                    <div className="field1" style={{width: '100%'}}>
                      <input
                        className="email-address1"
                        placeholder="Password"
                        type={passwordVisible ? 'text' : 'password'}
                        style={{width: '80%'}}
                        value={password} onChange={(e) => setPassword(e.target.value)}
                      />
                    </div>
                    {passwordVisible ? (
                      <GoEyeClosed
                        style={{position: 'absolute', top: '15px', right: '15px', width: '1.5em', height: '1.5em', cursor: 'pointer'}}
                        onClick={() => setPasswordVisible(false)}
                      />
                    ) : (
                      <GoEye
                        style={{position: 'absolute', top: '15px', right: '15px', width: '1.5em', height: '1.5em', cursor: 'pointer'}}
                        onClick={() => setPasswordVisible(true)}
                      />
                    )}
                  </div>
                </div>
                <div className="remember-this-device-forgot">
                  <div className="remember-this-device">
                    <div className="controls">
                      <div className="checkmark">
                        <input
                          type="checkbox"
                          checked={rememberDevice}
                          onChange={() => setRememberDevice(!rememberDevice)}
                        />
                      </div>
                    </div>
                    <div className="remember-this-device1" style={{ color: '#008080' }}>Remember this device</div>
                  </div>
                  <div className="forgot-password">Forgot Password?</div>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button className="button" type='submit' style={{
                color: '#F8F8FF',
<<<<<<< Updated upstream
                background: '#F8A700'
=======
                background: '#5e5d56' 
>>>>>>> Stashed changes
              }}>
                <div className="button1" style={{ color: '#F8F8FF' }}>{loading? 'Logging in...' : 'Login'}</div>
              </button>
              <div className="signup-link-wrapper">
                <div className="signup-link">
                  <div className="dont-have-an" style={{ color: '#008080' }}>Don’t have an account?</div>
                  <a href='/register' style={{ textDecoration: 'none', color: '#36454F', fontSize: 'var(--font-size-sm)' }}>Register</a>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
    // <div
    //   className="min- overflow-auto h-screen   landing-page-1  bg-cover bg-center flex items-center justify-center p-4"
    //   style={{
    //     backgroundImage: `url(${bg})`,
    //   }}
    // >
    //   <div className="  ">
    //     <div className="flex mb-3 justify-center">
    //       <div className="mt-[-20px]">
    //         <div className="">
    //           <img src={eps} alt="" width="70px" height="90px" />
    //         </div>
    //       </div>
    //     </div>
    //     <div className="w-full max-w-6xl bg-white bg-opacity-90 shadow-xl rounded-2xl overflow-hidden">
    //       <div className="flex flex-col lg:flex-row">
    //         <div className="bg-blue-700 text-white p-6 sm:p-8 md:p-10 rounded-2xl  lg:w-7/12 flex flex-col justify-center">
    //           <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
    //             REDISCOVER
    //             <br />
    //             RECONNECT
    //             <br />
    //             REIGNITE
    //           </h2>
    //           <p className="text-lg sm:text-xl md:text-2xl">
    //             Your Alumni Journey Starts Here!
    //           </p>
    //         </div>
    //         <div className="p-6 sm:p-8 md:p-10 lg:w-7/12">
    //           <div className="mb-6">
                
    //             <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
    //               Welcome Back!
    //             </h1>
    //             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">
    //               Excel Public School
    //             </h2>
    //             <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-600">
    //               ALUMNI ASSOCIATION
    //             </p>
    //           </div>
    //           <form className="space-y-4 sm:space-y-6">
    //             <div>
    //               <label
    //                 htmlFor="email"
    //                 className="block text-sm font-medium text-gray-700 mb-1"
    //               >
    //                 Email
    //               </label>
    //               <input
    //                 type="email"
    //                 id="email"
    //                 className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //                 placeholder="admin12@gmail.com"
    //               />
    //             </div>
    //             <div>
    //               <label
    //                 htmlFor="password"
    //                 className="block text-sm font-medium text-gray-700 mb-1"
    //               >
    //                 Password
    //               </label>
    //               <div className="relative rounded-md shadow-sm">
    //                 <input
    //                   type={showPassword ? "text" : "password"}
    //                   id="password"
    //                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
    //                   placeholder="••••••••••"
    //                 />
    //                 <button
    //                   type="button"
    //                   onClick={() => setShowPassword(!showPassword)}
    //                   className="absolute inset-y-0 right-0 pr-3 flex items-center"
    //                 >
    //                   {showPassword ? (
    //                     <svg
    //                       xmlns="http://www.w3.org/2000/svg"
    //                       fill="none"
    //                       viewBox="0 0 24 24"
    //                       strokeWidth={1.5}
    //                       stroke="currentColor"
    //                       className="w-5 h-5 text-gray-400"
    //                     >
    //                       <path
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                         d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
    //                       />
    //                     </svg>
    //                   ) : (
    //                     <svg
    //                       xmlns="http://www.w3.org/2000/svg"
    //                       fill="none"
    //                       viewBox="0 0 24 24"
    //                       strokeWidth={1.5}
    //                       stroke="currentColor"
    //                       className="w-5 h-5 text-gray-400"
    //                     >
    //                       <path
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                         d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
    //                       />
    //                       <path
    //                         strokeLinecap="round"
    //                         strokeLinejoin="round"
    //                         d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    //                       />
    //                     </svg>
    //                   )}
    //                 </button>
    //               </div>
    //             </div>
    //             <div className="flex items-center">
    //               <input
    //                 id="remember"
    //                 type="checkbox"
    //                 className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
    //               />
    //               <label
    //                 htmlFor="remember"
    //                 className="ml-2 block text-sm text-gray-900"
    //               >
    //                 Remember this device
    //               </label>
    //             </div>
    //             <button
    //               type="submit"
    //               className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    //             >
    //               Login
    //             </button>
    //           </form>
    //           <div className="mt-6 flex flex-col sm:flex-row items-center justify-between">
    //             <div className="text-sm mb-2 sm:mb-0">
    //               <a
    //                 href="#"
    //                 className="font-medium text-blue-600 hover:text-blue-500"
    //               >
    //                 Forgot Password?
    //               </a>
    //             </div>
    //             <div className="text-sm">
    //               <span className="text-gray-500">Don't have an account?</span>{" "}
    //               <a
    //                 href="#"
    //                 className="font-medium text-blue-600 hover:text-blue-500"
    //               >
    //                 Register
    //               </a>
    //             </div>
    //           </div>
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default LoginPage;
