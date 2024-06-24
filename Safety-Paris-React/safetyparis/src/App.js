import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import AdminPage from "./pages/AdminPage";
import UserPage from "./pages/UserPage";
import "./App.css";

const apiUrl = process.env.REACT_APP_API_URL;

function Home() {
  const navigate = useNavigate();
  console.log(apiUrl);

  return (
    <div className="home-container">
      <h1>Safety Paris</h1>
      <div className="button-container">
        <button className="nav-button" onClick={() => navigate("/admin")}>
          관리자 페이지
        </button>
        <button className="nav-button" onClick={() => navigate("/user")}>
          사용자 페이지
        </button>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </Router>
  );
}

export default App;
