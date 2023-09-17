import { useMemo } from "react";
import { deleteTasksBulk } from "../firebase";
import { dataCache } from "./cache";
import { TaskList } from "./types";
import { useListener } from "./useListener";

export function useTaskList(taskListID: string): {
	taskList: TaskList | undefined;
	loading: boolean;
	error: any;
	loadedTaskListID: string;
} {
	const { loading, error } = useListener(taskListID);
	const emptyTaskList: TaskList = useMemo(
		() => ({
			order: [],
			tasks: {},
		}),
		[]
	);

	let taskList: TaskList = dataCache.get(taskListID);
	if (!taskList) {
		taskList = emptyTaskList;
	}

	if (!taskList.tasks) taskList.tasks = emptyTaskList.tasks;
	if (!taskList.order) taskList.order = emptyTaskList.order;

	console.log("useTaskList", taskListID, taskList);

	// add any keys that are in taskList.tasks but not in taskList.order to taskList.order
	// this is to ensure that the order array is always up to date
	const taskKeys = Object.keys(taskList.tasks);
	const orderKeys = taskList.order;
	const missingKeys = taskKeys.filter((key) => !orderKeys.includes(key));
	if (missingKeys.length > 0) {
		taskList.order = [...taskList.order, ...missingKeys];
	}
	// should eventually save to firebase once user makes a change

	// for all the keys in taskList.order, if the key in taskList.tasks is missing the attribute type, remove it from taskList.order and remove it from taskList.tasks
	// call delete task on each of the missing types
	const missingTypes = taskList.order.filter(
		(key) => !taskList.tasks[key].type
	);
	if (missingTypes.length > 0) {
		taskList.order = taskList.order.filter(
			(key) => !missingTypes.includes(key)
		);
		missingTypes.forEach((key) => {
			delete taskList.tasks[key];
			// console.log("deleting task", key, "from taskList", taskListID);
			// deleteTask(taskListID, key);
		});
		deleteTasksBulk(taskListID, missingTypes);
	}

	return { taskList, loading, error, loadedTaskListID: taskListID };
}
