import React from "react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

function Auth(props) {
    const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

    return (
        <div className='AuthPage'>
            <h1>To Do v9001</h1>
            <button
                onClick={function () {
                    signInWithGoogle();
                }}>
                Sign in with Google
            </button>
        </div>
    );
}

export default Auth;
