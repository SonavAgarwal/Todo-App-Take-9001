import { deleteField } from "firebase/firestore";
import isUrl from "is-url";

export const versionNumber = 1.5;

export const typeOptions = ["long", "short", "email", "thought"];
export const typeOptionsDisplay = { thought: "💡", email: "📧" };
export const preferredTagOrder = ["length", "tag", "date", "type", "link"];
export const lengthCountedTags = ["long", "email"];
export const lengthStep = 5;

export const daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const defaultTask = {
    type: "long",
    length: 30,
    done: false,
    plate: false,
};

export function parseNewTextToUpdateObject(changedText) {
    let updateObject = {};

    let newText = changedText;
    let textSplit = newText.split(" ");
    textSplit = textSplit.filter(function (word) {
        if (word.charAt(0) === "!") {
            let tag = word.substring(1);

            // Determine what type of tag was added

            if (typeOptions.includes(tag.toLowerCase())) {
                updateObject.type = tag.toLowerCase();
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
                let dayDifference = daysOfWeek.indexOf(tag) - daysOfWeek.indexOf(todayDay);
                if (dayDifference < 0) {
                    dayDifference += 7;
                }
                let dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + dayDifference);
                updateObject.date = dueDate;
            } else if (tag === "/") {
                updateObject.date = deleteField();
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
