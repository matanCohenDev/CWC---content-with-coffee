
import { useNavigate } from "react-router-dom";
import HeaderStyle from "./Header.module.css";
import logo from "../../../../assets/pics/landingPage-pics/logo.png";
import { useUser } from "../../../../context/UserContext";

export default function Header() {
  const navigate = useNavigate();
  const { user, token } = useUser();
  const handleLoginClick = () => {
    if (user && token) {
      navigate("/feed");
    } else {
      navigate("/login");
    }
  };
  return (
    <header className={HeaderStyle.header}>
      <div className={HeaderStyle.container}>
        <img src={logo} alt="logo" className={HeaderStyle.logo} />

        <div className={HeaderStyle.hanburgerAndLogin}>
          <div className={HeaderStyle.LogInSignUpContainer}>
            <button className={HeaderStyle.userButton} onClick={handleLoginClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="7" r="4" />
                <path d="M5 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" />
              </svg>
            </button>
          </div>

          
        </div>
      </div>
    </header>
  );
}
