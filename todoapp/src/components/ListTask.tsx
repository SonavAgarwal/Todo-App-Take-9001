import { debounce } from "debounce";
import React, {
	ForwardedRef,
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { deleteTask, updateTask } from "../firebase.ts";
import {
	lengthCountedTags,
	parseNewTextToUpdateObject,
	preferredTagOrder,
} from "../misc/options";
import {
	BiCheckSquare,
	BiDownArrow,
	BiGridVertical,
	BiSquare,
	BiUpArrow,
} from "react-icons/bi";
import { NewTaskContext } from "../pages/Home";
import { useSwipeable } from "react-swipeable";
import AnimateHeight from "react-animate-height";
import SubTaskList from "./SubTaskList";
import ListTaskTag from "./ListTaskTag";
import { SortMethod, Task } from "../misc/types.ts";
import { useTask } from "../misc/useTask.ts";
import { useDebouncedCallback } from "use-debounce";

interface Props {
	id: string;
	taskId: string;
	taskListId: string;
	dragging: boolean;
	sortBy: SortMethod;

	dragHandleAttributes: any;
	dragHandleListeners: any;
	style: any;
}

const ListTask = forwardRef(
	(
		{
			taskListId,
			taskId,
			dragHandleAttributes,
			dragHandleListeners,
			style,
			sortBy,
			...props
		}: Props,
		ref: ForwardedRef<HTMLDivElement>
	) => {
		const focusNewTaskRef = useContext(NewTaskContext);
		const editSwipeHandlers = useSwipeable({
			onSwipedRight: function () {
				setDeleted(true);
				setTimeout(() => {
					deleteTask(taskListId, taskId);
				}, 500);
			},
			trackMouse: true,
		});

		const { task } = useTask(taskListId, taskId);
		const [deleted, setDeleted] = useState(false);

		const [taskText, setTaskText] = useState("");
		const [plate, setPlate] = useState(false);
		const [open, setOpen] = useState(true);

		useEffect(
			function () {
				if (!task) return;
				setTaskText(task.text);
				setPlate(task.plate);
				setOpen(task.open || true);
			},
			[task]
		);

		const handleTextEdit = useDebouncedCallback((changedText: string) => {
			if (changedText === task?.text) return;
			if (!changedText) return;

			// let updateObject = parseNewTextToUpdateObject(changedText);
			// // prevent deep nested tasks
			// if (taskListId !== "tasks" && task.type && updateObject.type === "list") {
			// 	updateObject.wasList = false; // todo wastes storage space
			// }

			// updateTask(taskListId, taskId, updateObject);
		}, 1000);

		const handlePlateEdit = useDebouncedCallback((newPlate: boolean) => {
			if (deleted) return;
			if (task?.plate === newPlate) return;
			updateTask(taskListId, taskId, { plate: newPlate });
		}, 500);

		const handleOpenEdit = useDebouncedCallback((newOpen: boolean) => {
			if (deleted) return;
			if (task?.open === newOpen) return;
			console.log("meow");
			updateTask(taskListId, taskId, { open: newOpen });
		}, 500);

		useEffect(
			function () {
				handleTextEdit(taskText);
			},
			[taskText]
		);
		useEffect(
			function () {
				handlePlateEdit(plate);
			},
			[plate]
		);
		useEffect(
			function () {
				handleOpenEdit(open);
			},
			[open]
		);

		function TagsOrdered() {
			let renderedTags: React.FC[] = [];
			let key = 1;
			if (!task) return renderedTags;
			if (sortBy !== SortMethod.text) {
				if (
					task[sortBy.toString() as keyof Task] ||
					(sortBy === "length" && task[sortBy] === 0)
				) {
					renderedTags.push(
						<ListTaskTag
							taskListId={taskListId}
							key={key}
							task={task}
							taskId={taskId}
							property={sortBy}
							dragging={props.dragging}
						/>
					);
					key++;
				}
			}
			for (let taskProperty of preferredTagOrder) {
				if (
					taskProperty !== sortBy &&
					(task[taskProperty] ||
						(taskProperty === "length" && task[taskProperty] === 0))
				) {
					renderedTags.push(
						<ListTaskTag
							taskListId={taskListId}
							key={key}
							task={task}
							taskId={taskId}
							property={taskProperty}
							dragging={props.dragging}
						/>
					);
					key++;
				}
			}
			return renderedTags;
		}

		return (
			<div style={style} ref={ref}>
				<AnimateHeight duration={500} height={deleted ? 0 : "auto"}>
					<div
						className="ListTaskContainer"
						style={{
							opacity:
								task?.length === 0 && lengthCountedTags.includes(task?.type)
									? 0.5
									: 1,
						}}
					>
						<div className="ListTask">
							<div className="ListTaskTextContainer">
								<input
									size={1}
									className="ListTaskText"
									value={taskText}
									onChange={function (event) {
										setTaskText(event.target.value);
									}}
									onKeyUp={function (event) {
										if (event.key === "Enter") {
											focusNewTaskRef();
										}
									}}
								></input>
							</div>
							{task?.type === "list" && (
								<button
									onClick={function () {
										setOpen(!open);
									}}
									className="ListTaskButton safariButton"
									tabIndex={-1}
								>
									{open ? <BiDownArrow /> : <BiUpArrow />}
								</button>
							)}
							<button
								onClick={function () {
									setPlate(!plate);
								}}
								className="ListTaskButton safariButton"
								{...editSwipeHandlers}
								tabIndex={-1}
							>
								{plate ? <BiCheckSquare /> : <BiSquare />}
							</button>
							<div
								className="ListTaskButton"
								{...dragHandleAttributes}
								{...dragHandleListeners}
								tabIndex={-1}
							>
								<BiGridVertical />
							</div>
						</div>
						<div className="ListTaskTagsContainer">
							<TagsOrdered />
						</div>
						{task?.type === "list" && (
							<SubTaskList subTaskListId={taskId} open={open}></SubTaskList>
						)}
					</div>
				</AnimateHeight>
			</div>
		);
	}
);

export default ListTask;
