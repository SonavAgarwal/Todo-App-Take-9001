import { dataCache } from "./cache";
import { TaskList } from "./types";
import { useListener } from "./useListener";

export function useTaskList(taskListID: string): {
	taskList: TaskList | undefined;
	loading: boolean;
	error: any;
} {
	const { loading, error } = useListener(taskListID);

	const taskList = dataCache.get(taskListID);

	return { taskList, loading, error };
}
