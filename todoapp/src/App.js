import "./App.css";
import "./reset.css";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import Auth from "./pages/Auth";
import Home from "./pages/Home";

function AppWrapper() {
    return (
        <BrowserRouter>
            <App></App>
        </BrowserRouter>
    );
}

function App() {
    const [user] = useAuthState(auth); // loading, error

    const navigate = useNavigate();

    useEffect(
        function () {
            if (user) {
                navigate("/");
            } else {
                navigate("/auth");
            }
        },
        [user, navigate]
    );

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/auth' element={<Auth />} />
        </Routes>
    );
}

export default AppWrapper;
