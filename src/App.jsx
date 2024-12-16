import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Logout from "./components/Logout";
import HomePage from "./components/homepage";

function App() {
    return (
        <Router>
            <nav>
                <Link to="/signup">Signup</Link> | <Link to="/login">Login</Link> |{" "}
                <Link to="/logout">Logout</Link>
            </nav>
            <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/homepage" element={<HomePage />} />
                <Route path="/logout" element={<Logout />} />
            </Routes>
        </Router>
    );
}

export default App;
