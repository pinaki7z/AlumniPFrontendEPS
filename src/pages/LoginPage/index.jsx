import "./loginPage.css";
import "../../components/FrameComponent/FrameComponent.css";
import eps from "../../images/excelPublicSchool.png";
import { useState, useEffect } from "react";
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
import bg1 from "../../images/login-bg-1.jpg"; // Image 1
import bg2 from "../../images/login-bg-2.jpg"; // Image 2

const LoginPage = ({ handleLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cookie, setCookie] = useCookies(["token"]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const profile = useSelector((state) => state.profile);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [currentBg, setCurrentBg] = useState(bg1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [slideDirection, setSlideDirection] = useState("left");
  const [nextBg, setNextBg] = useState(bg2);

  const SECRET_KEY = "f3c8a3c9b8a9f0b2440a646f3a5b8f9e6d6e46555a4b2b5c6d7c8d9e0a1b2c3d4f5e6a7b8c9d0e1f2a3b4c5d6e7f8g9h0";

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

      await new Promise(resolve => setTimeout(resolve, 1000));

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
        toast.error(errorData || "Login failed");
        return;
      }

      const { token, alumni } = await response.json();
      const currentDate = new Date();

      // Handle account expiration
      if (alumni.expirationDate && new Date(alumni.expirationDate) < currentDate) {
        toast.error("Your account has expired. Contact admin to recover account");
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

  // Change background images every 2 seconds with sliding animation
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection(prev => prev === "left" ? "right" : "left");
      setTimeout(() => {
        setCurrentBg(prev => prev === bg1 ? bg2 : bg1);
        setNextBg(prev => prev === bg1 ? bg2 : bg1);
      }, 12000);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="landing-page-1 min-h-screen p-5 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{
          backgroundImage: `url(${currentBg})`,
          transform: `translateX(${slideDirection === "left" ? "-100%" : "0"})`
        }}
      />
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000"
        style={{
          backgroundImage: `url(${nextBg})`,
          transform: `translateX(${slideDirection === "left" ? "0" : "100%"})`
        }}
      />
      <main className="login-panel">
        <div className="bg-[#004C8A] flex flex-col items-center md:w-[578px]" style={{ borderRadius: '24px 0px 0px 24px' }}>
          <div className="p-8">
            <h1 className="rediscover-reconnect-reignite">Excel Connect</h1>
            <h1 className="your-alumni-journey">Reconnect with your Alma Mater</h1>
            <div style={{ fontSize: '0.26em', color: 'white' }}>
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
        <div className="login-fields">
          <form className="credentials-input" onSubmit={handleSubmit}>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', paddingTop: '70px' }}>
              <img src={eps} alt="" width='110px' height='170px' />
            </div>
            <div style={{ paddingTop: '1em', width: '100%' }}>
              <div className="account-details-parent">
                <div className="account-details" style={{ width: '100%' }}>
                  <div className="email" style={{ color: '#36454F' }}>Email</div>
                  <div className="email1" style={{ width: '100%' }}>
                    <div className="field">
                      <input
                        className="email-address"
                        placeholder="Email address"
                        type="text"
                        style={{ width: '100%' }}
                        value={email} onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="password" style={{ color: '#36454F' }}>Password</div>
                <div className="input-area">
                  <div className="input">
                    <div className="input1" style={{ position: 'relative' }}>
                      <div className="field1" style={{ width: '100%' }}>
                        <input
                          className="email-address1"
                          placeholder="Password"
                          type={passwordVisible ? 'text' : 'password'}
                          style={{ width: '80%' }}
                          value={password} onChange={(e) => setPassword(e.target.value)}
                        />
                      </div>
                      {passwordVisible ? (
                        <GoEyeClosed
                          style={{ position: 'absolute', top: '15px', right: '15px', width: '1.5em', height: '1.5em', cursor: 'pointer' }}
                          onClick={() => setPasswordVisible(false)}
                        />
                      ) : (
                        <GoEye
                          style={{ position: 'absolute', top: '15px', right: '15px', width: '1.5em', height: '1.5em', cursor: 'pointer' }}
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
                    <div onClick={() => navigate('/forgot-password')} className="cursor-pointer underline whitespace-nowrap text-sm text-blue-400 hover:text-blue-600 active:text-blue-900 select-none">Forgot Password?</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button className="button" type='submit' style={{
                color: '#F8F8FF',
                background: '#F8A700'
              }}>
                <div className="button1" style={{ color: '#F8F8FF' }}>{loading ? 'Logging in...' : 'Login'}</div>
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
