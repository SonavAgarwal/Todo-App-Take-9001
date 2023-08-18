import { useMemo } from "react";
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

	return { taskList, loading, error, loadedTaskListID: taskListID };
}
