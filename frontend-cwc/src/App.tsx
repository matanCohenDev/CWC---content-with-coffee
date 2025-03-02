import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/landing-page";
import FormsPage from "./pages/Forms-page/FormsPage";
import { UserProvider } from "./context/UserContext";

function App() {
  return (
    <UserProvider>
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/forms" element={<FormsPage />} />
      </Routes>
    </Router>
    </UserProvider>
  );
}

export default App;
