import { initializeApp } from "firebase/app";
import { User, getAuth, onAuthStateChanged } from "firebase/auth";
import {
	DocumentData,
	FieldValue,
	arrayRemove,
	arrayUnion,
	collection,
	deleteDoc,
	deleteField,
	doc,
	getDoc,
	getDocs,
	getFirestore,
	setDoc,
	updateDoc,
} from "firebase/firestore";
import * as shortUUID from "short-uuid";
import {
	DEFAULT_TASK,
	MAIN_TASK_LIST_NAME,
	parseNewTextToUpdateObject,
	VERSION_NUMBER,
} from "./misc/options";
import { Task, TaskType, TaskUpdateObject } from "./misc/types";
import { dataCache } from "./misc/cache";
import { isEqual } from "lodash";

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
	let taskUpdateObject: Task = { ...DEFAULT_TASK };
	if (taskList !== MAIN_TASK_LIST_NAME) taskUpdateObject.type = TaskType.short;
	Object.assign(taskUpdateObject, parseNewTextToUpdateObject(text));

	const updateObject = {
		order: arrayUnion(taskUuid),
		tasks: {
			[taskUuid]: taskUpdateObject,
		},
	};

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	setDoc(taskDocRef, updateObject, { merge: true });
}

export function updateTask(
	taskList: string,
	taskId: string,
	taskUpdateObject: TaskUpdateObject
) {
	if (!user) return;
	// ensure there is a key in TaskUpdateObject
	let keys = Object.keys(taskUpdateObject);
	if (keys.length === 0) return;

	const newTaskText = taskUpdateObject.text;
	if (newTaskText)
		Object.assign(taskUpdateObject, parseNewTextToUpdateObject(newTaskText));

	// test to see if the task has changed
	const originalTask = dataCache.get(taskList)?.tasks[taskId];
	const newTask = { ...originalTask, ...taskUpdateObject };
	if (isEqual(originalTask, newTask)) return;

	const updateObject = {
		tasks: {
			[taskId]: taskUpdateObject,
		},
	};

	console.log(
		"Updating task: " + taskId + " in list: " + taskList + " to:",
		updateObject
	);

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	setDoc(taskDocRef, updateObject, { merge: true });
}

export function deleteTask(taskList: string, taskId: string) {
	if (!user) return;

	const wasList = dataCache.get(taskList)?.tasks[taskId].wasList;
	if (wasList) {
		// will be counted as a delete op even if the list was never populated
		deleteDoc(doc(firestore, `users/${user.uid}/data`, taskId));
	}

	const updateObject = {
		order: arrayRemove(taskId),
		tasks: {
			[taskId]: deleteField(),
		},
	};

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskList);
	setDoc(taskDocRef, updateObject, { merge: true });
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
	if (!word || !color) return;

	const updateObject: {
		colors: {
			[key: string]: string | FieldValue;
		};
	} = {
		colors: {
			[word]: color,
		},
	};

	// TODO: delete field if color is white
	// if (color.toLowerCase() === "#ffffff") {
	// 	updateObject[word] = deleteField();
	// }

	const configDocRef = doc(firestore, `users/${user.uid}/data`, "config");
	setDoc(configDocRef, updateObject, { merge: true });
}

// export function cleanUnusedListDocs(mainTaskIdList) {}

export async function reorganizeTaskLists() {
	if (!user) return;
	// read all task lists from users/{user.uid}/data
	// for each task list, take all the keys that are in the order array
	// and delete all the keys that are not in the order array
	// add all the keys that are in the order array under the key tasks

	// get all task lists
	const taskListsRef = collection(firestore, `users/${user.uid}/data`);
	const taskListsSnapshot = await getDocs(taskListsRef);

	console.log("reorganizing task lists");
	taskListsSnapshot.forEach((taskListDoc) => {
		if (!user) return;
		let taskListData = taskListDoc.data();
		let taskListId = taskListDoc.id;

		console.log("=============");
		console.log("reorganizing task list: " + taskListDoc.id);
		console.log(taskListData);

		if (!taskListDoc.exists()) return;
		if (!taskListData) return;

		if (taskListId === "config") return;

		let taskListOrder = taskListData.order;

		let newOrderData: {
			order: string[];
		} = {
			order: taskListOrder,
		};
		let newTasksData: {
			tasks: {
				[key: string]: Task;
			};
		} = {
			tasks: {},
		};
		let deleteOldFields: {
			[key: string]: FieldValue;
		} = {};

		for (let taskId of taskListOrder) {
			if (taskId === "order") continue;
			if (taskId === "tasks") continue;

			if (!taskListData[taskId]) continue;

			deleteOldFields[taskId] = deleteField();
			newTasksData.tasks[taskId] = taskListData[taskId];
		}

		let combinedObject: any = {
			...deleteOldFields,
			...newOrderData,
		};

		if (Object.keys(newTasksData.tasks).length > 0) {
			combinedObject = {
				...combinedObject,
				...newTasksData,
			};
		}

		const taskDocRef = doc(firestore, `users/${user.uid}/data`, taskListId);
		setDoc(taskDocRef, combinedObject, { merge: true });
	});
}

export async function reorganizeConfig() {
	if (!user) return;
	// read config from users/{user.uid}/data
	// for each key in config, if the key is not in the list of options, delete it

	// get config
	const configDocRef = doc(firestore, `users/${user.uid}/data`, "config");
	const configDoc = await getDoc(configDocRef);
	let configData: DocumentData = configDoc.data() as DocumentData;

	let newColorsData: {
		colors: {
			[key: string]: string;
		};
	} = {
		colors: {},
	};

	let versionNumberData = {
		versionNumber: VERSION_NUMBER,
	};

	let deleteOldFields: {
		[key: string]: FieldValue;
	} = {};

	// get keys from config
	let keys = Object.keys(configData);

	for (let key of keys) {
		if (key === "versionNumber") continue;
		if (key === "colors") continue;

		if (!configData[key]) continue;

		console.log("setting key: " + key + " to " + configData[key]);
		newColorsData.colors[key] = configData[key];
		deleteOldFields[key] = deleteField();
	}

	let combinedObject: any = {
		...deleteOldFields,
		...versionNumberData,
	};

	if (Object.keys(newColorsData.colors).length > 0) {
		combinedObject = {
			...combinedObject,
			...newColorsData,
		};
	}

	console.log(combinedObject);

	setDoc(configDocRef, combinedObject, { merge: true });
}

export async function testingFirebaseMerge() {
	if (!user) return;

	console.log("testingFirebaseMerge");

	const taskDocRef = doc(firestore, `users/${user.uid}/data`, "test");
	await setDoc(
		taskDocRef,
		{
			map: {
				"1": {
					"2": {
						"3": "hello",
					},
				},
			},
			map2: {
				meow: "meow",
			},
			map3: {
				hey: "hey",
			},
		},
		{ merge: true }
	);

	await setDoc(
		taskDocRef,
		{
			map: {
				"1": {
					"2": {
						"4": "hello",
					},
				},
			},
			map2: {
				rawr: "rawr",
			},
			map3: {
				"what a wonderful": "kind of day",
			},
		},
		{ merge: true }
	);
}
