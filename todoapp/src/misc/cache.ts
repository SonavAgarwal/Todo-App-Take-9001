import { TaskList } from "./types";

export const taskListCache = new Map<string, TaskList>();
export const configCache = new Map<string, any>();
export const listenerCache = new Map<string, FBListener>();

export class FBListener {
	key: string;
	unsubscribe: () => void;
	subscribers: Set<() => any>;

	constructor(key: string, unsubscribe: () => void) {
		this.unsubscribe = unsubscribe;
		this.key = key;
		this.subscribers = new Set();
	}

	subscribeListener(callback: () => any) {
		this.subscribers.add(callback);
	}
	unsubscribeListener(callback: () => any) {
		this.subscribers.delete(callback);

		// If there are no more subscribers, unsubscribe from the listener and delete it from the cache
		if (this.subscribers.size === 0) {
			this.unsubscribe();
			listenerCache.delete(this.key);
		}
	}

	updateSubscribers() {
		this.subscribers.forEach((callback) => callback());
	}
}
