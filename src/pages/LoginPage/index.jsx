import "./loginPage.css";
import "../../components/FrameComponent/FrameComponent.css";
import io from "../../images/io.png";
import { useState,useEffect } from 'react';
import './loginPage.css';
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useDispatch,useSelector } from "react-redux";
import { login } from '../../store/userSlice';
import { updateProfile,setAdmin } from "../../store/profileSlice";
import baseUrl from "../../config";
import { GoEye } from "react-icons/go";
import { GoEyeClosed } from "react-icons/go";
import CryptoJS from 'crypto-js';

const LoginPage = ({ handleLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cookie, setCookie] = useCookies(["token"]);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [loading,setLoading] = useState(false);
  const profile = useSelector((state)=> state.profile);
  const backgroundImageUrl = `${process.env.REACT_APP_URL}/images/background.jpg`;
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const SECRET_KEY = 'f3c8a3c9b8a9f0b2440a646f3a5b8f9e6d6e46555a4b2b5c6d7c8d9e0a1b2c3d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8g9h0';



  const encrypt = (text) => {
    return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
  };
  
  const decrypt = (cipherText) => {
    const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  useEffect(() => {
    
    const savedEmail = localStorage.getItem('savedEmail');
    const savedPassword = localStorage.getItem('savedPassword');
    if (savedEmail && savedPassword) {
      setEmail(savedEmail);
      setPassword(decrypt(savedPassword));
      setRememberDevice(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (rememberDevice) {
      localStorage.setItem('savedEmail', email);
      localStorage.setItem('savedPassword', encrypt(password));
    } else {
      localStorage.removeItem('savedEmail');
      localStorage.removeItem('savedPassword');
    }

    try {
      const currentDate = new Date();
      const response = await fetch(`${baseUrl}/alumni/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', 
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
      const responseData = await response.json();
  
      handleLogin();
      
      const { token, alumni } = responseData;
      dispatch(updateProfile(alumni))
      setCookie("token", token , { path: "/" });
      if(alumni.profileLevel===0){
        console.log("level zero")
        dispatch(setAdmin(true));
      }
      
      if (alumni.expirationDate && new Date(alumni.expirationDate) < currentDate) {
        toast.error("Your account has expired. Contact admin to recover account");
        setLoading(false);
        return; 
      }
  
      toast.success("Logged in successfully!");
      setLoading(false); 
      const currentUrl = window.location.href;
      
      const loginPath = '/login';
      const baseUrl = currentUrl.endsWith(loginPath)
          ? currentUrl.slice(0, -loginPath.length)
          : currentUrl;

      if (currentUrl.endsWith(loginPath)) {          
          window.location.href = baseUrl;
      } else {          
          window.location.href = window.location.href;
      }
      } else {
        const errorData = await response.json();
        console.error('Login failed',errorData);
        toast.error(errorData);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error during login:', error);
      setLoading(false);
      
    }
  };

  return (
    <div className="landing-page-1">
      <div className="main-container">
        <div className="content-area">
          <img src={io} alt="" width='200px' height='100px' />
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
                  <span className="bhu1" style={{color: '#36454F'}}>InsideOut</span>
                </b>
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
                background: '#F8A700' 
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
  );
};

export default LoginPage;
