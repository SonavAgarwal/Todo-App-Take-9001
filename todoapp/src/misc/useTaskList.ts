import { taskListCache } from "./cache";
import { TaskList } from "./types";
import { useListener } from "./useListener";

export function useTaskList(taskListID: string): {
	taskList: TaskList | undefined;
} {
	useListener(taskListID);

	const taskList = taskListCache.get(taskListID);

	return { taskList };
}
