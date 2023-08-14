import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskField } from "../misc/types";
import TaskComponent from "./TaskComponent";

interface Props {
	id: string;
	taskID: string;
	taskListID: string;
	dragging: boolean;
	sortBy: TaskField;
}
export function SortableTaskComponent(props: Props) {
	const { attributes, listeners, setNodeRef, transform, transition } =
		useSortable({ id: props.id });

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: props.dragging ? 0.0 : 1,
	};

	return (
		<TaskComponent
			ref={setNodeRef}
			style={style}
			dragHandleAttributes={attributes}
			dragHandleListeners={listeners}
			{...props}
		></TaskComponent>
	);
}
