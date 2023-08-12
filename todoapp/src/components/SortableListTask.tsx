import React from "react";
import ListTask from "./ListTask";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { SortMethod } from "../misc/types";

interface Props {
	id: string;
	taskId: string;
	taskListId: string;
	dragging: boolean;
	sortBy: SortMethod;
}
export function SortableListTask(props: Props) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: props.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: props.dragging ? 0.0 : 1,
	};

	return (
		<ListTask
			ref={setNodeRef}
			style={style}
			attributes={attributes}
			listeners={listeners}
			{...props}
		></ListTask>
	);
}
