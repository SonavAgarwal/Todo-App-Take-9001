import { Timestamp, deleteField } from "firebase/firestore";
import isUrl from "is-url";
import { Task, TaskField, TaskType, TaskUpdateObject } from "./types";

export const VERSION_NUMBER = "2.0.11";
export const MAIN_TASK_LIST_NAME = "tasks";

export const TYPE_OPTIONS = [
	TaskType.long,
	TaskType.short,
	TaskType.email,
	TaskType.list,
	TaskType.thought,
]; // order controls sorted order
export const TYPE_OPTIONS_TO_ICON: {
	[key: string]: string;
} = { thought: "💡", email: "📧" };
export const PREFERRED_TAG_ORDER = ["length", "tag", "date", "type", "link"];

export const TAG_TYPES = [
	TaskField.length,
	TaskField.tag,
	TaskField.date,
	TaskField.type,
	TaskField.link,
];

export const LENGTH_COUNTED_TAGS = [TaskType.long, TaskType.email];

export const LENGTH_STEP = 1;

export const DAYS_OF_WEEK = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];

export const DEFAULT_TASK: Task = {
	type: TaskType.long,
	length: 30,
	done: false,
	plate: false,
	text: "",
	open: true, // only used for lists, should be removed (causes extra update from list task on first load)
};

export function parseNewTextToUpdateObject(changedText: string) {
	let updateObject: TaskUpdateObject = {};

	let newText = changedText;
	let textSplit = newText.split(" ");

	textSplit = textSplit.filter(function (word) {
		if (word.charAt(0) === "!") {
			let tag = word.substring(1);

			// Determine what type of tag was added

			if (TYPE_OPTIONS.includes(tag.toLowerCase() as TaskType)) {
				updateObject.type = tag.toLowerCase();
				if (tag.toLowerCase() === TaskType.list) {
					updateObject.wasList = true;
					updateObject.open = true;
				}
				if (tag.toLowerCase() === TaskType.email) {
					updateObject.length = 5;
				}
				if (
					tag.toLowerCase() === TaskType.short ||
					tag.toLowerCase() === TaskType.thought
				) {
					updateObject.length = 0;
				} // Todo make not hardcoded
			} else if (!isNaN(Date.parse(tag))) {
				let dueDate = new Date(Date.parse(tag));
				dueDate.setFullYear(new Date().getFullYear());

				// today at 12am
				const today12AM = new Date();
				today12AM.setHours(0, 0, 0, 0);

				if (dueDate < today12AM) {
					dueDate.setFullYear(new Date().getFullYear() + 1);
				}

				updateObject.date = Timestamp.fromDate(dueDate);
			} else if (DAYS_OF_WEEK.includes(tag.toLowerCase())) {
				let todayDay = DAYS_OF_WEEK[new Date().getDay()];
				let dayDifference =
					DAYS_OF_WEEK.indexOf(tag.toLowerCase()) -
					DAYS_OF_WEEK.indexOf(todayDay);
				if (dayDifference < 0) {
					dayDifference += 7;
				}
				let dueDate = new Date();
				dueDate.setHours(0, 0, 0, 0);
				dueDate.setDate(dueDate.getDate() + dayDifference);
				updateObject.date = Timestamp.fromDate(dueDate);
			} else if (tag.toLowerCase() === "tomorrow") {
				let dueDate = new Date();
				dueDate.setHours(0, 0, 0, 0);
				dueDate.setDate(dueDate.getDate() + 1);
				updateObject.date = Timestamp.fromDate(dueDate);
			} else if (tag === "/") {
				updateObject.date = deleteField();
			} else if (tag.toLowerCase() === "check") {
				updateObject.plate = true;
			} else if (tag.toLowerCase() === "uncheck") {
				updateObject.plate = false;
			} else if (
				tag.charAt(0).toLowerCase() == "t" &&
				!isNaN(Number(tag.substring(1)))
			) {
				updateObject.length = parseInt(tag.substring(1));
			} else if (isUrl(tag)) {
				updateObject.link = tag;
			} else {
				updateObject.tag = tag;
			}

			return false;
		} else {
			return true;
		}
	});

	newText = textSplit.join(" ");
	updateObject.text = newText;
	return updateObject;
}

export function typeToSymbol(type: string) {
	if (TYPE_OPTIONS_TO_ICON[type]) {
		return TYPE_OPTIONS_TO_ICON[type];
	} else {
		return null;
	}
}

export function typeTimeMatters(type: TaskType) {
	if (type === TaskType.long) {
		return true;
	}
	if (type === TaskType.email) {
		return true;
	}

	return false;
}
