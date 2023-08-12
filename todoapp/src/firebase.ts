import { initializeApp } from "firebase/app";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import {
	FieldValue,
	arrayRemove,
	arrayUnion,
	deleteDoc,
	deleteField,
	doc,
	getFirestore,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import * as shortUUID from "short-uuid";
import {
	defaultTask,
	mainTaskListName,
	parseNewTextToUpdateObject,
} from "./misc/options";
import { Task } from "./misc/types";
import { FieldValue } from "react-hook-form";

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

let user: User | null = null;

onAuthStateChanged(auth, function (u) {
	if (u) {
		user = u;
	}
});

export function createTask(taskList: string, text: string) {
	if (!user) return;
	if (!text) return;

	let taskUuid = shortUUID.generate();
	let taskUpdateObject: Task = { ...defaultTask };

	if (taskList !== mainTaskListName) {
		taskUpdateObject.type = "short";
	}

	Object.assign(taskUpdateObject, parseNewTextToUpdateObject(text));

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	setDoc(
		taskDocRef,
		{
			order: arrayUnion(taskUuid),
			[taskUuid]: taskUpdateObject,
		},
		{ merge: true }
	);
}

export function updateTask(taskList: string, taskId: string, newData: Task) {
	if (!user) return;
	// newData is an object

	let updateObject: {
		[key: string]: any;
	} = {};

	for (let key of Object.keys(newData)) {
		let updateObjectKey = taskId + "." + key;
		let newDataPiece = newData[key as keyof Task];
		updateObject[updateObjectKey] = newDataPiece;
	}

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	updateDoc(taskDocRef, updateObject);
}

export function deleteTask(taskList: string, taskId: string, wasList: boolean) {
	if (!user) return;
	if (wasList) {
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

export function updateTaskOrder(taskList: string, newOrder: string[]) {
	if (!user) return;
	let updateObject = {
		order: newOrder,
	};
	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	updateDoc(taskDocRef, updateObject);
}

export function updateConfigColors(word: string, color: string) {
	if (!user) return;
	let updateObject: {
		[key: string]: string | FieldValue;
	} = {
		[word]: color,
	};

	if (color.toLowerCase() === "#ffffff") {
		updateObject[word] = deleteField();
	}
	const configDocRef = doc(firestore, `users/${user.uid}/data`, "config");
	setDoc(configDocRef, updateObject, { merge: true });
}

export function cleanUnusedListDocs(mainTaskIdList) {}
