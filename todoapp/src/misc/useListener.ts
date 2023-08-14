import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useReducer } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase";
import { FBListener, dataCache, listenerCache } from "./cache";
import { TaskList } from "./types";

export function useListener(docId: string): {
	loading: boolean;
	error: any;
} {
	const [_, handleUpdate] = useReducer((x) => x + 1, 0);

	const [user] = useAuthState(auth);

	useEffect(() => {
		if (!user) return;
		if (!docId) return;

		if (listenerCache.has(docId)) {
			// If the listener already exists, subscribe to it

			const listener = listenerCache.get(docId);
			if (!listener) return; // should never happen

			listener.subscribeListener(handleUpdate);
			return () => {
				listener.unsubscribeListener(handleUpdate);
			};
		} else {
			// Create the listener
			function handleSnapshot(doc: any) {
				if (doc.exists()) {
					console.log("Document data:", doc.data(), "for docId", docId);
					dataCache.set(docId, doc.data() as TaskList);
					// broadcast to all listeners
					const listener = listenerCache.get(docId);
					if (!listener) return; // should never happen
					listener.updateSubscribers({ status: "success" });
				} else {
					listener.updateSubscribers({
						status: "success",
						errorMessage: "Document does not exist",
					});
				}
			}
			function handleError(err: any) {
				console.log(err);
				const listener = listenerCache.get(docId);
				if (!listener) return; // should never happen
				listener.updateSubscribers({
					status: "error",
					errorMessage: err,
				});
			}
			const unsubscribe = onSnapshot(
				doc(firestore, `users/${user.uid}/data/${docId}`),
				handleSnapshot,
				handleError
			);
			const listener = new FBListener(docId, unsubscribe);
			listenerCache.set(docId, listener);

			// Subscribe to the listener
			listener.subscribeListener(handleUpdate);
			return () => {
				listener.unsubscribeListener(handleUpdate);
			};
		}
	}, [docId, user]);

	const requestStatus = listenerCache.get(docId)?.requestStatus || {
		status: "loading",
	};

	return {
		loading: requestStatus.status === "loading",
		error:
			requestStatus.status === "error" ? requestStatus.errorMessage : undefined,
	};
}
