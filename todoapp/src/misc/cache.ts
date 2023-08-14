export const dataCache = new Map<string, any>();
export const configCache = new Map<string, any>();
export const listenerCache = new Map<string, FBListener>();

export type RequestStatus = {
	status: "loading" | "error" | "success";
	errorMessage?: any;
	updateNumber?: number;
};

type FBListenerCallback = (arg?: any) => any;

export class FBListener {
	key: string;
	unsubscribe: () => void;
	subscribers: Set<FBListenerCallback>;
	updateNumber: number;
	requestStatus: RequestStatus;

	constructor(key: string, unsubscribe: () => void) {
		this.unsubscribe = unsubscribe;
		this.key = key;
		this.subscribers = new Set();
		this.updateNumber = 0;
		this.requestStatus = { status: "loading" };
	}

	subscribeListener(callback: FBListenerCallback) {
		this.subscribers.add(callback);
	}
	unsubscribeListener(callback: FBListenerCallback) {
		this.subscribers.delete(callback);

		// If there are no more subscribers, unsubscribe from the listener and delete it from the cache
		if (this.subscribers.size === 0) {
			this.unsubscribe();
			listenerCache.delete(this.key);
		}
	}

	updateSubscribers(requestStatus: RequestStatus) {
		this.requestStatus = requestStatus;
		this.subscribers.forEach((callback) => callback());
	}
}
