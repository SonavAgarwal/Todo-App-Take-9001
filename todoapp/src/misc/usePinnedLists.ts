import { dataCache } from "./cache";
import { MAIN_TASK_LIST_NAME } from "./options";
import { useListener } from "./useListener";

export function usePinnedLists(): {
	pinnedLists: string[];
	pinnedCount: number;
	loading: boolean;
	error: any;
} {
	const { loading, error } = useListener(MAIN_TASK_LIST_NAME);

	const taskList = dataCache.get(MAIN_TASK_LIST_NAME);

	let pinnedLists = [];
	if (taskList) {
		for (let taskId of taskList.order) {
			if (taskList.tasks[taskId].pinned) {
				pinnedLists.push(taskId);
			}
		}
	}

	return {
		pinnedLists,
		pinnedCount: pinnedLists.length,
		loading,
		error,
	};
}
