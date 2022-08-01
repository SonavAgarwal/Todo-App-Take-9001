// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { arrayRemove, arrayUnion, deleteField, doc, getFirestore, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
    apiKey: "AIzaSyCF7OvgCxXof4ZYWlPWDud9eHGy7byiO4k",
    authDomain: "blockschedule-88b65.firebaseapp.com",
    databaseURL: "https://blockschedule-88b65-default-rtdb.firebaseio.com",
    projectId: "blockschedule-88b65",
    storageBucket: "blockschedule-88b65.appspot.com",
    messagingSenderId: "135479349433",
    appId: "1:135479349433:web:3cb85d8c8706411da40b68",

    clientId: "135479349433-509r7l8a8amotfihra8i5112n9acntm9.apps.googleusercontent.com",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// export const gapiAuth = gapi.auth2.getAuthInstance();

// .signIn();

// export function signOut() {
//     gapiAuth.signOut().then(() => {
//         return auth.signOut();
//     });
// }

let user = null;

onAuthStateChanged(auth, function (u) {
    if (u) {
        user = u;
    }
});

export function createTask(text) {
    if (!text) return;

    console.log("creating task");

    let taskUuid = uuidv4();
    let updateObject = {
        order: arrayUnion(taskUuid),
    };
    updateObject[taskUuid] = {
        text: text,
        type: "long",
        length: 30,
        done: false,
        plate: false,
    };
    const taskDocRef = doc(firestore, `users/${user.uid}/data`, "tasks");
    setDoc(taskDocRef, updateObject, { merge: true });
}

export function updateTask(taskId, newData) {
    console.log("updating " + taskId);

    // newData is an object

    let updateObject = {};

    for (let key of Object.keys(newData)) {
        console.log(key);
        let updateObjectKey = taskId + "." + key;
        let newDataPiece = newData[key];
        console.log(newDataPiece);
        updateObject[updateObjectKey] = newDataPiece;
    }

    const taskDocRef = doc(firestore, `users/${user.uid}/data`, "tasks");
    updateDoc(taskDocRef, updateObject);
}

export function deleteTask(taskId) {
    console.log("deleting task");

    let updateObject = {
        order: arrayRemove(taskId),
    };
    updateObject[taskId] = deleteField();

    const taskDocRef = doc(firestore, `users/${user.uid}/data`, "tasks");
    updateDoc(taskDocRef, updateObject);
}

export function updateTaskOrder(newOrder) {
    console.log("update task order");
    console.log(newOrder);
    let updateObject = {
        order: newOrder,
    };
    const taskDocRef = doc(firestore, `users/${user.uid}/data`, "tasks");
    updateDoc(taskDocRef, updateObject);
}

export function updateConfigColors(word, color) {
    console.log("update config colors");
    let updateObject = {
        [word]: color,
    };

    if (color.toLowerCase() === "#ffffff") {
        updateObject[word] = deleteField();
    }
    const configDocRef = doc(firestore, `users/${user.uid}/data`, "config");
    setDoc(configDocRef, updateObject, { merge: true });
}
