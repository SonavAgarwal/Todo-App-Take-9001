import {
	DndContext,
	DragCancelEvent,
	DragEndEvent,
	DragOverlay,
	DragStartEvent,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	arrayMove,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import NoTasksSvg from "../assets/NoTasks";
import { updateTaskOrder } from "../firebase.ts";
import { SortMethod } from "../misc/types.ts";
import { useTaskList } from "../misc/useTaskList.ts";
import ListTask from "./ListTask";
import { SortableListTask } from "./SortableListTask";
import classNames from "classnames";

function TaskList({
	taskListID,
	sortBy,
}: {
	taskListID: string;
	sortBy: SortMethod;
}) {
	const isMain = taskListID === "tasks";

	const [activeId, setActiveId] = useState<string | null>(null);
	const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

	const { taskList } = useTaskList(taskListID);

	const [listOrder, setListOrder] = useState<string[]>([]);
	useEffect(
		function () {
			if (!taskList) return;
			setListOrder(taskList.order);
		},
		[taskList?.order]
	);

	// ===================
	// Save the order of the tasks to the database
	// ===================
	const saveOrder = useDebouncedCallback((newOrder: string[]) => {
		if (!newOrder) return;
		const changed = taskList?.order?.some((val, idx) => val !== newOrder[idx]);
		if (!changed) return;
		updateTaskOrder(taskListID, newOrder);
	}, 2000);

	useEffect(
		function () {
			if (!taskList) return;
			if (taskList.order.length === 0) return;
			if (listOrder.length === 0) return;
			saveOrder(listOrder);
		},
		[listOrder]
	);

	// useEffect(
	// 	function () {
	// 		function sortByDate() {
	// 			let workingListOrder = [...order];
	// 			workingListOrder.sort(function (a, b) {
	// 				let aDate = tasks[a]?.date?.toDate();
	// 				let bDate = tasks[b]?.date?.toDate();
	// 				if (!aDate) aDate = new Date(8640000000000000);
	// 				if (!bDate) bDate = new Date(8640000000000000);
	// 				return aDate - bDate;
	// 			});
	// 			setListOrder(workingListOrder);
	// 		}

	// 		function sortByLength() {
	// 			let workingListOrder = [...order];
	// 			workingListOrder.sort(function (a, b) {
	// 				return (tasks[a]?.length - tasks[b]?.length) * -1; // show longer tasks first
	// 			});
	// 			setListOrder(workingListOrder);
	// 		}

	// 		function sortByType() {
	// 			let workingListOrder = [...order];
	// 			workingListOrder.sort(function (a, b) {
	// 				let aInd = typeOptions.indexOf(tasks[a].type);
	// 				let bInd = typeOptions.indexOf(tasks[b].type);
	// 				return aInd - bInd;
	// 			});
	// 			setListOrder(workingListOrder);
	// 		}

	// 		function sortByAlphabetical(property) {
	// 			let workingListOrder = [...order];
	// 			workingListOrder.sort(function (a, b) {
	// 				let aProp = tasks[a][property];
	// 				let bProp = tasks[b][property];
	// 				if (!aProp) aProp = "π";
	// 				if (!bProp) bProp = "π";
	// 				return "".localeCompare.call(aProp, bProp);
	// 			});
	// 			setListOrder(workingListOrder);
	// 		}
	// 		switch (sortBy) {
	// 			case "none":
	// 				return;
	// 			case "date":
	// 				sortByDate();
	// 				break;
	// 			case "length":
	// 				sortByLength();
	// 				break;
	// 			case "type":
	// 				sortByType();
	// 				break;
	// 			default:
	// 				sortByAlphabetical(sortBy);
	// 				break;
	// 		}
	// 	},
	// 	[sortBy, order, tasks]
	// );

	if (!taskList) return null;

	return (
		<div className={classNames("TaskList", isMain && "TaskListMain")}>
			{listOrder.length === 0 && isMain && (
				<div className="TaskListEmpty">
					<NoTasksSvg />
				</div>
			)}

			<DndContext
				sensors={sensors}
				collisionDetection={closestCenter}
				onDragStart={handleDragStart}
				onDragEnd={handleDragEnd}
				onDragCancel={handleDragCancel}
			>
				<SortableContext
					items={listOrder}
					strategy={verticalListSortingStrategy}
				>
					{listOrder?.map(function (taskId) {
						return (
							<SortableListTask
								taskListId={taskListID}
								taskId={taskId}
								key={taskId}
								id={taskId}
								dragging={activeId === taskId}
								sortBy={sortBy}
							/>
						);
					})}
				</SortableContext>
				<DragOverlay>
					{activeId ? (
						<ListTask
							taskListId={taskListId}
							id={activeId}
							task={tasks[activeId]}
							taskId={activeId}
							sortBy={sortBy}
						/>
					) : null}
				</DragOverlay>
			</DndContext>
		</div>
	);

	function handleDragStart(event: DragStartEvent) {
		const { active } = event;
		if (!active) return;
		setActiveId(active.id);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!active || !over) return;

		if (active.id !== over.id) {
			setListOrder((listOrder) => {
				const oldIndex = listOrder.indexOf(active.id);
				const newIndex = listOrder.indexOf(over.id);

				return arrayMove(listOrder, oldIndex, newIndex);
			});
		}

		setActiveId(null);
	}

	function handleDragCancel(event: DragCancelEvent) {
		setActiveId(null); // todo open issue on github
	}
}

export default TaskList;
