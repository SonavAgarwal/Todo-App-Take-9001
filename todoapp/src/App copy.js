// /* global gapi */

// import "./App.css";
// import "./reset.css";
// import { auth, firebaseConfig } from "./firebase";
// import { GoogleAuthProvider, signInWithCredential, signInWithRedirect, signOut } from "firebase/auth";
// import { useEffect, useState } from "react";
// import { GoogleOAuthProvider, GoogleLogin, googleLogout, useGoogleLogin } from "@react-oauth/google";
// import { decode } from "jsonwebtoken";

// // const drive = require("@googleapis/drive");

// function App() {
//     const [userName, setUserName] = useState("");
//     const [gapiReady, setGapiReady] = useState(false);
//     useEffect(function () {
//         let oasc = auth.onAuthStateChanged(function (user) {
//             if (user) {
//                 console.log(user.displayName);
//                 setUserName(user.displayName);
//             } else {
//                 console.log("no user");
//             }

//             // console.log(user.to);

//             // console.log("setting up drive");
//             // async function makeDoc() {
//             //     console.log("gapi");
//             //     // let client = await drive.drive({ version: "v3", auth: auth });
//             //     // client.documents.create({
//             //     //     requestBody: {
//             //     //         title: "Your new document!",
//             //     //     },
//             //     // });
//             //     function loadGapi() {
//             //         const script = document.createElement("script");
//             //         script.src = "https://apis.google.com/js/client.js";

//             //         script.onload = () => {
//             //             gapi.load("client", () => {
//             //                 gapi.client.setApiKey(firebaseConfig.apiKey);
//             //                 gapi.client.load("sheets", "v4", () => {
//             //                     setGapiReady(true);
//             //                 });
//             //             });
//             //         };

//             //         document.body.appendChild(script);
//             //     }

//             //     loadGapi();
//             // }
//             // if (user) {
//             //     makeDoc();
//             // }
//         });
//         return oasc;
//     }, []);

//     // useEffect(function () {
//     //     let unsubscribe = gapiAuth.isSignedIn.listen((isSignedIn) => {
//     //         if (isSignedIn) {
//     //             const currentUser = gapiAuth.currentUser.get();
//     //             console.log(currentUser);
//     //             // setUserName(currentUser)
//     //             const authResponse = currentUser.getAuthResponse(true);
//     //             console.log(authResponse.id_token);
//     //             console.log(authResponse.access_token);
//     //         }
//     //     });
//     // }, []);

//     const login = useGoogleLogin({
//         onSuccess: function (tokenResponse) {
//             console.log(tokenResponse);
//         },
//         scope: "https://www.googleapis.com/auth/drive.file",
//     });

//     useEffect(function () {
//         console.log("Loading Gapi");

//         function loadGapi() {
//             const script = document.createElement("script");
//             script.src = "https://apis.google.com/js/client.js";

//             script.onload = function () {
//                 gapi.load("client", async function () {
//                     await gapi.client.init({
//                         apiKey: firebaseConfig.apiKey,
//                         discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
//                     });

//                     setGapiReady(true);

//                     // gapi.client.setApiKey(firebaseConfig.apiKey);
//                     // gapi.client.load("sheets", "v4", () => {
//                     //     setGapiReady(true);
//                     // });
//                 });
//             };

//             document.body.appendChild(script);
//         }

//         loadGapi();
//     }, []);

//     return (
//         <div className='App'>
//             <button
//                 onClick={function () {
//                     login();
//                 }}>
//                 Sign In
//             </button>

//             {/* <GoogleLogin
//                     onSuccess={(credentialResponse) => {
//                         console.log(credentialResponse);

//                         console.log(decode(credentialResponse.credential));

//                         const user = decode(credentialResponse.credential);

//                         // setUserName(user.name);

//                         signInWithCredential(auth, GoogleAuthProvider.credential(credentialResponse.credential));
//                     }}
//                     onError={() => {
//                         console.log("Login Failed");
//                     }}
//                 /> */}
//             <button
//                 onClick={function () {
//                     signOut(auth);
//                     googleLogout();
//                 }}>
//                 Sign Out
//             </button>
//             <button
//                 onClick={function () {
//                     console.log("trying to create");
//                     console.log(gapi);
//                     console.log(gapi.client.sheets);
//                     // console.log(gapi.client.drive);
//                     // console.log(gapi.client.drive.files);
//                     // console.log(gapi);
//                     // console.log(gapi);
//                     gapi.client.sheets.spreadsheets
//                         .create({
//                             properties: {
//                                 title: "hello world",
//                             },
//                         })
//                         .then((response) => {
//                             console.log("Spreadsheet ID: " + response.result.spreadsheetId);
//                         });
//                 }}>
//                 Create Sheet
//             </button>
//             <div>currentuser: {userName + ""}</div>
//             <div>gapiReady: {gapiReady + ""}</div>
//         </div>
//     );
// }

// export default App;
