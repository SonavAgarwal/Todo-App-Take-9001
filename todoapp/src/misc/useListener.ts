import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useReducer } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, firestore } from "../firebase";
import { FBListener, listenerCache, taskListCache } from "./cache";
import { TaskList } from "./types";

export function useListener(docId: string) {
	const [_, forceUpdate] = useReducer((x) => x + 1, 0);

	const [user] = useAuthState(auth);

	useEffect(() => {
		if (!user) return;
		if (!docId) return;

		if (listenerCache.has(docId)) {
			// If the listener already exists, subscribe to it

			const listener = listenerCache.get(docId);
			if (!listener) return; // should never happen

			listener.subscribeListener(forceUpdate);
			return () => {
				listener.unsubscribeListener(forceUpdate);
			};
		} else {
			// Create the listener
			function handleSnapshot(doc: any) {
				if (doc.exists()) {
					taskListCache.set(docId, doc.data() as TaskList);
				}
			}
			function handleError(err: any) {
				console.log(err);
			}
			const unsubscribe = onSnapshot(
				doc(firestore, `users/${user.uid}/data/${docId}`),
				handleSnapshot,
				handleError
			);
			const listener = new FBListener(docId, unsubscribe);
			listenerCache.set(docId, listener);

			// Subscribe to the listener
			listener.subscribeListener(forceUpdate);
			return () => {
				listener.unsubscribeListener(forceUpdate);
			};
		}
	}, [docId, user]);
}
