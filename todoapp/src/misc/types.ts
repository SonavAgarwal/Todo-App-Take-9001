import { Timestamp } from "firebase/firestore";

export interface Task {
	done: boolean;
	length: number;
	open?: boolean;
	plate: boolean;
	text: string;
	tag?: string;
	type: string;
	wasList?: boolean;
	date?: Timestamp;
	link?: string;
}

export interface TaskList {
	order: string[];
	tasks: {
		[key: string]: Task;
	};
}

export enum SortMethod {
	none = "none",
	plate = "plate",
	tag = "tag",
	type = "type",
	length = "length",
	date = "date",
	text = "text",
}

export interface UserConfigType {
	[key: string]: any;
}
