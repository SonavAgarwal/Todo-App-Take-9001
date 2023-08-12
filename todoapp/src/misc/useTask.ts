import { taskListCache } from "./cache";
import { Task } from "./types";
import { useListener } from "./useListener";

export function useTask(
	taskListID: string,
	taskID: string
): {
	task: Task | undefined;
} {
	useListener(taskListID);

	const taskList = taskListCache.get(taskListID);
	const task = taskList?.tasks[taskID];

	return { task };
}
