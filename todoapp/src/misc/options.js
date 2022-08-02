import { deleteField } from "firebase/firestore";
import isUrl from "is-url";

export const versionNumber = 1.4;

export const typeOptions = ["long", "short", "email", "thought"];
export const typeOptionsDisplay = { thought: "💡", email: "📧", short: "⚡" };
export const preferredTagOrder = ["length", "tag", "date", "type", "link"];
export const lengthCountedTags = ["long", "email"];
export const lengthStep = 5; // TODO deploy

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
            } else if (!isNaN(Date.parse(tag))) {
                let dueDate = new Date(Date.parse(tag));
                dueDate.setFullYear(new Date().getFullYear());

                if (dueDate < new Date()) {
                    dueDate.setFullYear(new Date().getFullYear() + 1);
                }

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
