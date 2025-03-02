import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/landing-page";
import FormsPage from "./pages/Forms-page/FormsPage";
import { UserProvider } from "./context/UserContext";
import Feed from "./pages/Feed-page/Feed";

function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/forms" element={<FormsPage />} />
        <Route path="/feed" element={<Feed />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
