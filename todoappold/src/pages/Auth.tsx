import React from "react";
import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../firebase.js";
import { versionNumber } from "../misc/options.js";

function Auth(props) {
	const [signInWithGoogle] = useSignInWithGoogle(auth);

	return (
		<div className="AuthPage">
			<div>
				<h1>To Do v9001</h1>
				<button
					onClick={function () {
						signInWithGoogle();
					}}
				>
					Sign in with Google
				</button>
			</div>
			<p>v {versionNumber}</p>
		</div>
	);
}

export default Auth;
