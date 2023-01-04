import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
	arrayRemove,
	arrayUnion,
	deleteDoc,
	deleteField,
	doc,
	getFirestore,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import {
	defaultTask,
	mainTaskListName,
	parseNewTextToUpdateObject,
} from "./misc/options";

export const firebaseConfig = {
	apiKey: "AIzaSyCF7OvgCxXof4ZYWlPWDud9eHGy7byiO4k",
	authDomain: "blockschedule-88b65.firebaseapp.com",
	databaseURL: "https://blockschedule-88b65-default-rtdb.firebaseio.com",
	projectId: "blockschedule-88b65",
	storageBucket: "blockschedule-88b65.appspot.com",
	messagingSenderId: "135479349433",
	appId: "1:135479349433:web:3cb85d8c8706411da40b68",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const firestore = getFirestore(app);

let user = null;

onAuthStateChanged(auth, function (u) {
	if (u) {
		user = u;
	}
});

export function createTask(taskList, text) {
	if (!text) return;

	console.log("Creating task: " + text);

	let taskUuid = uuidv4();
	let updateObject = {
		order: arrayUnion(taskUuid),
	};

	let taskUpdateObject = {};

	if (taskList !== mainTaskListName) {
		taskUpdateObject.type = "short";
	}

	Object.assign(taskUpdateObject, parseNewTextToUpdateObject(text));

	// prevent deep nested tasks
	if (taskList !== mainTaskListName) {
		// taskUpdateObject.type = defaultTask.type; // why tf was this here
		taskUpdateObject.wasList = false; // todo wastes storage space
	}

	updateObject.order = arrayUnion(taskUuid);
	console.log(taskUpdateObject);
	console.log({ ...defaultTask, ...taskUpdateObject });
	updateObject[taskUuid] = { ...defaultTask, ...taskUpdateObject };

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	setDoc(taskDocRef, updateObject, { merge: true });
}

export function updateTask(taskList, taskId, newData) {
	console.log("Updating task " + taskId);

	// newData is an object

	let updateObject = {};

	for (let key of Object.keys(newData)) {
		console.log(key);
		let updateObjectKey = taskId + "." + key;
		let newDataPiece = newData[key];
		console.log(newDataPiece);
		updateObject[updateObjectKey] = newDataPiece;
	}

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	updateDoc(taskDocRef, updateObject);
}

export function deleteTask(taskList, taskId, wasList) {
	console.log("Deleting " + taskId);

	if (wasList) {
		console.log("Deleting potential sub list");
		// will be counted as a delete op even if the list was never populated
		deleteDoc(doc(firestore, `users/${user.uid}/data`, taskId));
	}

	let updateObject = {
		order: arrayRemove(taskId),
	};
	updateObject[taskId] = deleteField();

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	updateDoc(taskDocRef, updateObject);
}

export function updateTaskOrder(taskList, newOrder) {
	console.log("Rearranging", newOrder);
	let updateObject = {
		order: newOrder,
	};
	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	updateDoc(taskDocRef, updateObject);
}

export function updateConfigColors(word, color) {
	console.log("Saving colors");
	let updateObject = {
		[word]: color,
	};

	if (color.toLowerCase() === "#ffffff") {
		updateObject[word] = deleteField();
	}
	const configDocRef = doc(firestore, `users/${user.uid}/data`, "config");
	setDoc(configDocRef, updateObject, { merge: true });
}

export function cleanUnusedListDocs(mainTaskIdList) {}
