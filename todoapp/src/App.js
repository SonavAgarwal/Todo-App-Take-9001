// todo remove gauth wrapper from index js

import "./App.css";
import "./reset.css";

import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";

import { auth, firebaseConfig } from "./firebase";
import { useAuthState, useSignInWithGoogle } from "react-firebase-hooks/auth";
import { useEffect } from "react";
import Auth from "./pages/Auth";
import Home from "./pages/Home";

// const root = ReactDOM.createRoot(document.getElementById("root"));

function AppWrapper() {
    return (
        <BrowserRouter>
            <App></App>
        </BrowserRouter>
    );
}

function App() {
    const [user, loading, error] = useAuthState(auth);

    const navigate = useNavigate();

    useEffect(
        function () {
            if (user) {
                navigate("/");
            } else {
                navigate("/auth");
            }
        },
        [user]
    );

    return (
        <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/auth' element={<Auth />} />
        </Routes>
    );
}

export default AppWrapper;
