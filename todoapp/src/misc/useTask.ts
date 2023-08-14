import { dataCache } from "./cache";
import { Task } from "./types";
import { useListener } from "./useListener";

export function useTask(
	taskListID: string,
	taskID: string
): {
	task: Task | undefined;
	loading: boolean;
	error: any;
} {
	const { loading, error } = useListener(taskListID);

	const taskList = dataCache.get(taskListID);
	const task = taskList?.tasks?.[taskID];

	return { task, loading, error };
}
