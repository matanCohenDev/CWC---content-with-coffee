import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/landing-page";
import FormsPage from "./pages/Forms-page/FormsPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/forms" element={<FormsPage />} />
      </Routes>
    </Router>
  );
}

export default App;
