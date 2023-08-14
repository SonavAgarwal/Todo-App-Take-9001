import {
	DndContext,
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
import classNames from "classnames";
import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { Oval } from "react-loader-spinner";
// @ts-ignore
import NoTasksSvg from "../assets/NoTasks";
import { updateTaskOrder } from "../firebase.ts";
import { MAIN_TASK_LIST_NAME, TYPE_OPTIONS } from "../misc/options.ts";
import { TaskField } from "../misc/types.ts";
import { useTaskList } from "../misc/useTaskList.ts";
import { SortableTaskComponent } from "./SortableTaskComponent.tsx";
import TaskComponent from "./TaskComponent.tsx";
import AnimateHeight from "react-animate-height";

function TaskList({
	taskListID,
	sortBy,
	showLoading = false,
	open = true,
}: {
	taskListID: string;
	sortBy: TaskField;
	showLoading?: boolean;
	open?: boolean;
}) {
	const isMain = taskListID === MAIN_TASK_LIST_NAME;

	const [activeId, setActiveId] = useState<string | null>(null);
	const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

	const { taskList, loading } = useTaskList(taskListID);

	const [listOrder, setListOrder] = useState<string[] | undefined>();
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
			if (!listOrder) return;
			if (taskList.order.length === 0) return;
			if (listOrder.length === 0) return;
			saveOrder(listOrder);
		},
		[listOrder]
	);

	useEffect(
		function () {
			if (!taskList) return;

			function sortByPlate() {
				if (!taskList) return;
				let workingListOrder = [...taskList.order];
				workingListOrder.sort(function (a, b) {
					let aPlate = taskList.tasks[a].plate;
					let bPlate = taskList.tasks[b].plate;
					if (!aPlate) aPlate = false;
					if (!bPlate) bPlate = false;
					return aPlate === bPlate ? 0 : aPlate ? -1 : 1;
				});
				setListOrder(workingListOrder);
			}

			function sortByDate() {
				if (!taskList) return;

				let workingListOrder = [...taskList.order];
				workingListOrder.sort(function (a, b) {
					let aDate = taskList.tasks[a]?.date?.toDate();
					let bDate = taskList.tasks[b]?.date?.toDate();
					if (!aDate) aDate = new Date(8640000000000000);
					if (!bDate) bDate = new Date(8640000000000000);
					return aDate.getTime() - bDate.getTime();
				});
				setListOrder(workingListOrder);
			}

			function sortByLength() {
				if (!taskList) return;
				let workingListOrder = [...taskList.order];
				workingListOrder.sort(function (a, b) {
					return (taskList.tasks[a]?.length - taskList.tasks[b]?.length) * -1; // show longer tasks first
				});
				setListOrder(workingListOrder);
			}

			function sortByType() {
				if (!taskList) return;
				let workingListOrder = [...taskList.order];
				workingListOrder.sort(function (a, b) {
					let aInd = TYPE_OPTIONS.indexOf(taskList.tasks[a].type);
					let bInd = TYPE_OPTIONS.indexOf(taskList.tasks[b].type);
					return aInd - bInd;
				});
				setListOrder(workingListOrder);
			}

			function sortByAlphabetical() {
				if (!taskList) return;
				let workingListOrder = [...taskList.order];
				workingListOrder.sort(function (a, b) {
					let aProp = taskList.tasks[a].tag;
					let bProp = taskList.tasks[b].tag;
					if (!aProp) aProp = "π";
					if (!bProp) bProp = "π";
					return "".localeCompare.call(aProp, bProp);
				});
				setListOrder(workingListOrder);
			}
			switch (sortBy) {
				case TaskField.none:
					return;
				case TaskField.plate:
					sortByPlate();
					break;
				case TaskField.date:
					sortByDate();
					break;
				case TaskField.length:
					sortByLength();
					break;
				case TaskField.type:
					sortByType();
					break;
				default:
					sortByAlphabetical();
					break;
			}
		},
		[sortBy, taskList]
	);

	if (loading) {
		if (showLoading)
			return (
				<div className="Loading">
					<Oval
						height={50}
						width={50}
						color="var(--black)"
						wrapperStyle={{}}
						wrapperClass=""
						visible={true}
						ariaLabel="oval-loading"
						secondaryColor="var(--gray)"
						strokeWidth={0}
						strokeWidthSecondary={2}
					/>
				</div>
			);

		return null;
	}

	function calculateHeight() {
		if (!taskList) return 0;
		if (!listOrder) return 0;
		if (listOrder.length === 0) return 0;

		if (isMain) {
			return "auto";
		}

		if (open) {
			return "auto";
		} else {
			return 0;
		}
	}

	return (
		<AnimateHeight duration={500} height={calculateHeight()}>
			<div className={classNames("TaskList", isMain && "TaskListMain")}>
				{listOrder?.length === 0 && isMain && (
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
						items={listOrder || []}
						strategy={verticalListSortingStrategy}
					>
						{listOrder?.map(function (taskId) {
							return (
								<SortableTaskComponent
									taskListID={taskListID}
									taskID={taskId}
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
							<TaskComponent
								taskListID={taskListID}
								id={activeId}
								dragging={true}
								taskID={activeId}
								sortBy={sortBy}
							/>
						) : null}
					</DragOverlay>
				</DndContext>
			</div>
		</AnimateHeight>
	);

	function handleDragStart(event: DragStartEvent) {
		const { active } = event;
		if (!active) return;
		setActiveId(active.id as string);
	}

	function handleDragEnd(event: DragEndEvent) {
		const { active, over } = event;
		if (!active || !over) return;

		if (active.id !== over.id) {
			setListOrder((listOrder) => {
				if (!listOrder) return;

				const oldIndex = listOrder.indexOf(active.id as string);
				const newIndex = listOrder.indexOf(over.id as string);

				return arrayMove(listOrder, oldIndex, newIndex);
			});
		}

		setActiveId(null);
	}

	function handleDragCancel() {
		setActiveId(null); // todo open issue on github
	}
}

export default TaskList;
