import { debounce } from "debounce";
import React, {
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

const ListTask = forwardRef(
	(
		{
			taskListId,
			taskId,
			task,
			attributes,
			listeners,
			style,
			sortBy,
			...props
		},
		ref
	) => {
		const [taskText, setTaskText] = useState(task?.text);

		const focusNewTaskRef = useContext(NewTaskContext);

		const [plate, setPlate] = useState(task?.plate);
		const [open, setOpen] = useState(task?.open);

		const [deleted, setDeleted] = useState(false);
		const editSwipeHandlers = useSwipeable({
			onSwipedRight: function () {
				setDeleted(true);
				setTimeout(() => {
					deleteTask(taskListId, taskId, task?.wasList);
				}, 500);
			},
			trackMouse: true,
		});

		useEffect(
			function () {
				if (task && task.text) {
					// prevents value from becoming undefined and creating uncontrolled component
					setTaskText(task.text);
				} else {
					setTaskText("");
				}
				setPlate(task?.plate);
			},
			[task]
		);

		function handleTextEdit(changedText) {
			if (changedText === task?.text) return;
			if (!changedText) return;

			let updateObject = parseNewTextToUpdateObject(changedText);
			// prevent deep nested tasks
			if (taskListId !== "tasks" && task.type && updateObject.type === "list") {
				// if this is a subtask and the task type is not undefined and the type is list
				updateObject.type = task.type;
				updateObject.wasList = false; // todo wastes storage space
			}

			updateTask(taskListId, taskId, updateObject);
		}

		function handlePlateEdit(newPlate) {
			if (deleted) return;
			if (task?.plate === newPlate) return;
			updateTask(taskListId, taskId, { plate: newPlate });
		}

		function handleOpenEdit(newOpen) {
			if (deleted) return;
			if (task?.open === newOpen) return;
			updateTask(taskListId, taskId, { open: newOpen });
		}

		// eslint-disable-next-line
		const handleTextEditDebounced = useCallback(
			debounce(handleTextEdit, 1000),
			[taskId, task]
		);

		// eslint-disable-next-line
		const handlePlateDebounced = useCallback(debounce(handlePlateEdit, 500), [
			taskId,
			deleted,
			task,
		]);

		// eslint-disable-next-line
		const handleOpenDebounced = useCallback(debounce(handleOpenEdit, 500), [
			taskId,
			deleted,
			task,
		]);

		useEffect(
			function () {
				handleTextEditDebounced(taskText);
			},
			[taskText, handleTextEditDebounced]
		);

		useEffect(
			function () {
				handlePlateDebounced(plate);
			},
			[plate, handlePlateDebounced]
		);

		useEffect(
			function () {
				handleOpenDebounced(open);
			},
			[open, handleOpenDebounced]
		);

		function TagsOrdered() {
			let renderedTags = [];
			let key = 1;
			if (!task) return renderedTags;
			if (sortBy !== "text") {
				if (task[sortBy] || (sortBy === "length" && task[sortBy] === 0)) {
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
								{...attributes}
								{...listeners}
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
