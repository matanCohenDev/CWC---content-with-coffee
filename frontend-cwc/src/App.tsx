import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page/landing-page";
import FormsPage from "./pages/Forms-page/FormsPage";
import { UserProvider } from "./context/UserContext";
import Feed from "./pages/Feed-page/Feed";
import Profile from "./pages/Profile/Profile";
import UserProfile from "./pages/User-profile/UserProfile";
import ProtectedRoute from "./components/ProtectedRoute"; 
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}> 

    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<FormsPage />} />

          {/* Protected routes */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/UserProfile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </UserProvider>
    </QueryClientProvider>

  );
}

export default App;
