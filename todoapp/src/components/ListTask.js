import { debounce } from "debounce";
import React, {
	forwardRef,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { deleteTask, updateConfigColors, updateTask } from "../firebase";
import {
	lengthCountedTags,
	lengthStep,
	parseNewTextToUpdateObject,
	preferredTagOrder,
	typeOptionsDisplay,
} from "../misc/options";
import {
	BiCheck,
	BiCheckSquare,
	BiDownArrow,
	BiGridVertical,
	BiSquare,
	BiUpArrow,
	BiX,
} from "react-icons/bi";
import { NewTaskContext, UserConfigContext } from "../pages/Home";
import { useSwipeable } from "react-swipeable";
import AnimateHeight from "react-animate-height";
import chroma from "chroma-js";
import { HexColorPicker } from "react-colorful";
import { useLongPress } from "use-long-press";
import SubTaskList from "./SubTaskList";

const dueDateScale = chroma
	.scale(["ff3838", "ff3838", "f9ff69", "7eff74"])
	.domain([0, 0.1, 0.8, 1]);

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
			console.log("meow");
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

function ListTaskTag({ taskListId, task, property, dragging, taskId }) {
	const userData = useContext(UserConfigContext);
	const [color, setColor] = useState(determineColor());
	const [pickingColor, setPickingColor] = useState(false);

	const [time, setTime] = useState(task?.length);
	const [pickingTime, setPickingTime] = useState(false);

	const tagLongPressHandlers = useLongPress(function () {
		setPickingColor(true);
	});

	function handleMultipleTimeClicks(event) {
		if (event.detail === 2) {
			setTime(30);
		} else if (event.detail === 3) {
			setTime(60);
		} else if (event.detail === 4) {
			setTime(90);
		}
	}

	useEffect(
		function () {
			if (dragging) {
				setPickingColor(false);
				setPickingTime(false);
			}
		},
		[dragging]
	);

	function saveTagColor() {
		updateConfigColors(task[property].toLowerCase(), color);
	}

	function saveTime() {
		if (time === task.length) return;
		updateTask(taskListId, taskId, { length: time });
	}

	function restoreDefaultColor() {
		if (!userData) return;
		if (userData[task[property].toLowerCase()]) {
			setColor(userData[task[property].toLowerCase()]);
		} else {
			setColor("white");
		}
	}

	function restoreDefaultTime() {
		if (task[property]) {
			setTime(task[property]);
		} else {
			setTime(30);
		}
	}

	function determineColor() {
		if (property === "tag") return determineTagColor();
		if (property === "date") return determineDateColor();
		return "white";
	}

	function determineTagColor() {
		if (!userData) return;
		if (userData[task[property].toLowerCase()]) {
			return userData[task[property].toLowerCase()];
		} else return "white";
	}

	function determineDateColor() {
		let colorPercent = (task[property].toDate() - new Date()) / (86400000 * 3);
		if (colorPercent < 0) colorPercent = 0;
		else if (colorPercent > 1) colorPercent = 1;
		let newColor = dueDateScale(colorPercent);
		return newColor;
	}

	if (property === "tag") {
		return (
			<>
				<div
					className="ListTaskTag"
					style={{ backgroundColor: color }}
					{...tagLongPressHandlers()}
				>
					{task[property]}
				</div>
				{pickingColor && (
					<div className="TaskEditFooterContainerContainer">
						<div className="TaskEditFooterContainer">
							<HexColorPicker
								color={color}
								onChange={setColor}
							></HexColorPicker>
							<div className="TaskEditFooterContainerButtons">
								<button
									className="ListTaskButton"
									onClick={function () {
										setPickingColor(false);
										restoreDefaultColor();
									}}
									tabIndex={-1}
								>
									<BiX />
								</button>
								<button
									className="ListTaskButton"
									onClick={function () {
										setPickingColor(false);
										saveTagColor();
									}}
									tabIndex={-1}
								>
									<BiCheck />
								</button>
							</div>
						</div>
					</div>
				)}
			</>
		);
	}

	if (property === "date") {
		return (
			<div className="ListTaskTag DateTag" style={{ backgroundColor: color }}>
				{task[property].toDate().toLocaleDateString("en-US", {
					day: "numeric",
					month: "2-digit",
					year: "2-digit",
				})}
			</div>
		);
	}

	if (property === "type" && task[property] in typeOptionsDisplay) {
		return (
			<div className="ListTaskTag TypeTag">
				{typeOptionsDisplay[task[property]]}
			</div>
		);
	}

	if (property === "link") {
		return (
			<a
				href={task[property]}
				target="_blank"
				rel="noopener noreferrer"
				tabIndex={-1}
			>
				<div className="ListTaskTag">🔗</div>
			</a>
		);
	}

	if (property === "length" && ["long", "email"].includes(task?.type)) {
		return (
			<>
				<div
					className="ListTaskTag TimeTag"
					onClick={function () {
						setPickingTime(true);
					}}
					onTouchEndCapture={function () {
						setPickingTime(true);
					}}
				>
					{time + " "}
				</div>
				{pickingTime && (
					<div className="TaskEditFooterContainerContainer">
						<div className="TaskEditFooterContainer">
							<div>
								<p>{time}</p>
							</div>
							<input
								size={1}
								type={"range"}
								min={lengthStep}
								max={120}
								step={lengthStep}
								value={time}
								onClick={handleMultipleTimeClicks}
								onChange={function (event) {
									setTime(parseInt(event.target.value));
								}}
								className="ListTaskText TimeRangeInput"
								tabIndex={-1}
							></input>
							<div className="TaskEditFooterContainerButtons">
								<button
									className="ListTaskButton"
									onClick={function () {
										setPickingTime(false);
										restoreDefaultTime();
									}}
									tabIndex={-1}
								>
									<BiX />
								</button>
								<button
									className="ListTaskButton"
									onClick={function () {
										setPickingTime(false);
										saveTime();
									}}
									tabIndex={-1}
								>
									<BiCheck />
								</button>
							</div>
						</div>
					</div>
				)}
			</>
		);
	}

	return null;
}

export default ListTask;
