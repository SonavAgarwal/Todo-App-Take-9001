import { deleteField } from "firebase/firestore";
import isUrl from "is-url";
import { Task } from "./types";

export const versionNumber = "1.20";
export const mainTaskListName = "tasks";

export const typeOptions = ["long", "short", "email", "list", "thought"]; // order controls sorted order
export const typeOptionsDisplay: {
	[key: string]: string;
} = { thought: "💡", email: "📧" };
export const preferredTagOrder = ["length", "tag", "date", "type", "link"];
export const lengthCountedTags = ["long", "email"];
export const lengthStep = 5;

export const daysOfWeek = [
	"sunday",
	"monday",
	"tuesday",
	"wednesday",
	"thursday",
	"friday",
	"saturday",
];

export const defaultTask: Task = {
	type: "long",
	length: 30,
	done: false,
	plate: false,
	text: "",
};

export function parseNewTextToUpdateObject(changedText: string) {
	let updateObject: {
		[key: string]: any;
	} = {};

	let newText = changedText;
	let textSplit = newText.split(" ");
	textSplit = textSplit.filter(function (word) {
		if (word.charAt(0) === "!") {
			let tag = word.substring(1);

			// Determine what type of tag was added

			if (typeOptions.includes(tag.toLowerCase())) {
				updateObject.type = tag.toLowerCase();
				if (tag.toLowerCase() === "list") {
					updateObject.wasList = true;
					updateObject.open = true;
				}
				if (tag.toLowerCase() === "email") {
					updateObject.length = 5;
				}
				if (tag.toLowerCase() === "short" || tag.toLowerCase() === "thought") {
					updateObject.length = 0;
				} // Todo make not hardcoded
			} else if (!isNaN(Date.parse(tag))) {
				let dueDate = new Date(Date.parse(tag));
				dueDate.setFullYear(new Date().getFullYear());

				if (dueDate < new Date()) {
					dueDate.setFullYear(new Date().getFullYear() + 1);
				}

				updateObject.date = dueDate;
			} else if (daysOfWeek.includes(tag.toLowerCase())) {
				let todayDay = daysOfWeek[new Date().getDay()];
				let dayDifference =
					daysOfWeek.indexOf(tag.toLowerCase()) - daysOfWeek.indexOf(todayDay);
				if (dayDifference < 0) {
					dayDifference += 7;
				}
				let dueDate = new Date();
				dueDate.setHours(0, 0, 0, 0);
				dueDate.setDate(dueDate.getDate() + dayDifference);
				updateObject.date = dueDate;
			} else if (tag === "/") {
				updateObject.date = deleteField();
			} else if (tag.toLowerCase() === "check") {
				updateObject.plate = true;
			} else if (tag.toLowerCase() === "uncheck") {
				updateObject.plate = false;
			} else if (
				tag.charAt(0).toLowerCase() == "t" &&
				!isNaN(tag.substring(1))
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
	if (typeOptionsDisplay[type]) {
		return typeOptionsDisplay[type];
	} else {
		return null;
	}
}
