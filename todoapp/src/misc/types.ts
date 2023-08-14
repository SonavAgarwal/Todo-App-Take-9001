import { FieldValue, Timestamp } from "firebase/firestore";

export interface Task {
	done: boolean;
	length: number;
	open?: boolean;
	plate: boolean;
	text: string;
	tag?: string;
	type: TaskType;
	wasList?: boolean;
	date?: Timestamp;
	link?: string;
}

export enum TaskType {
	long = "long",
	short = "short",
	email = "email",
	thought = "thought",
	list = "list",
}

export interface TaskUpdateObject {
	done?: boolean;
	length?: number | FieldValue;
	open?: boolean;
	plate?: boolean;
	text?: string;
	tag?: string;
	type?: string;
	wasList?: boolean;
	date?: Timestamp | FieldValue;
	link?: string;
}

export interface TaskList {
	order: string[];
	tasks: {
		[key: string]: Task;
	};
}

export enum TaskField {
	none = "none",
	plate = "plate",
	tag = "tag",
	type = "type",
	length = "length",
	date = "date",
	text = "text",
	link = "link",
}

export interface UserConfigType {
	versionNumber: string;
	colors: {
		[key: string]: any;
	};
}
