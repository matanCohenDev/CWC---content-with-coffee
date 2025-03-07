import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/landing-page";
import FormsPage from "./pages/Forms-page/FormsPage";
import { UserProvider } from "./context/UserContext";
import Feed from "./pages/Feed-page/Feed";
import Profile from "./pages/Profile/Profile";
import UserProfile from "./pages/User-profile/UserProfile";

function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<FormsPage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/UserProfile" element={<UserProfile />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
