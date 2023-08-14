import { useSignInWithGoogle } from "react-firebase-hooks/auth";
import { auth } from "../firebase.ts";
import { VERSION_NUMBER } from "../misc/options.ts";

function Auth() {
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
			<p>v {VERSION_NUMBER}</p>
		</div>
	);
}

export default Auth;
