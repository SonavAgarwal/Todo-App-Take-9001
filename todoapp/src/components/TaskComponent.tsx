import {
	ForwardedRef,
	forwardRef,
	useContext,
	useEffect,
	useId,
	useState,
} from "react";
import AnimateHeight from "react-animate-height";
import {
	BiCheckSquare,
	BiDownArrow,
	BiGridVertical,
	BiSquare,
	BiUpArrow,
} from "react-icons/bi";
import { useSwipeable } from "react-swipeable";
import { useDebouncedCallback } from "use-debounce";
import { deleteTask, updateTask } from "../firebase.ts";
import { LENGTH_COUNTED_TAGS, TAG_TYPES } from "../misc/options.ts";
import { Task, TaskField } from "../misc/types.ts";
import { useTask } from "../misc/useTask.ts";
import { NewTaskInputFocusContext } from "../pages/Home.tsx";
import SubTaskList from "./SubTaskList.tsx";
import TaskTag from "./TaskTag.tsx";

interface Props {
	id: string;
	taskID: string;
	taskListID: string;
	dragging: boolean;
	sortBy: TaskField;

	dragHandleAttributes?: any;
	dragHandleListeners?: any;
	style?: any;
}

const TaskComponent = forwardRef(
	(
		{
			taskListID,
			taskID,
			dragHandleAttributes,
			dragHandleListeners,
			style,
			sortBy,
			...props
		}: Props,
		ref: ForwardedRef<HTMLDivElement>
	) => {
		const focusNewTaskInputRef = useContext(NewTaskInputFocusContext);
		const plateSwipeHandlers = useSwipeable({
			onSwipedRight: function () {
				setIsClosing(true);
				setTimeout(() => {
					deleteTask(taskListID, taskID);
				}, 500);
			},
			trackMouse: true,
			trackTouch: true,
		});
		const listSwipeHandlers = useSwipeable({
			onSwipedUp: function () {
				setIsClosing(true);
				setTimeout(() => {
					updateTask(taskListID, taskID, { pinned: true });
				}, 500);
			},
			trackMouse: true,
			trackTouch: true,
		});

		const { task } = useTask(taskListID, taskID);
		const [isClosing, setIsClosing] = useState(false);

		const [taskText, setTaskText] = useState("");
		const [plate, setPlate] = useState(false);
		const [open, setOpen] = useState(false);

		useEffect(
			function () {
				if (!task) return;
				setTaskText(task.text);
				setPlate(task.plate);
				if (typeof task.open === "boolean") setOpen(task.open);
				else setOpen(true);
			},
			[task]
		);

		const handleTextEdit = useDebouncedCallback((changedText: string) => {
			if (isClosing) return;
			if (changedText === task?.text) return;
			updateTask(taskListID, taskID, { text: changedText });
		}, 1000);

		const handlePlateEdit = useDebouncedCallback((newPlate: boolean) => {
			if (isClosing) return;
			if (task?.plate === newPlate) return;
			updateTask(taskListID, taskID, { plate: newPlate });
		}, 500);

		const handleOpenEdit = useDebouncedCallback((newOpen: boolean) => {
			if (isClosing) return;
			if (task?.open === newOpen) return;
			updateTask(taskListID, taskID, { open: newOpen });
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

		if (task?.pinned) return null;

		return (
			<div style={style} ref={ref}>
				<AnimateHeight duration={500} height={isClosing ? 0 : "auto"}>
					<div
						className="ListTaskContainer"
						style={{
							opacity:
								task?.length === 0 && LENGTH_COUNTED_TAGS.includes(task?.type)
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
											focusNewTaskInputRef();
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
									{...listSwipeHandlers}
								>
									{open ? <BiDownArrow /> : <BiUpArrow />}
								</button>
							)}

							<button
								onClick={function () {
									setPlate(!plate);
								}}
								className="ListTaskButton safariButton"
								{...plateSwipeHandlers}
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
							<OrderedTags
								taskListID={taskListID}
								taskID={taskID}
								sortBy={sortBy}
								dragging={props.dragging}
							/>
						</div>
						{task?.type === "list" && (
							<SubTaskList taskListID={taskID} open={open}></SubTaskList>
						)}
					</div>
				</AnimateHeight>
			</div>
		);
	}
);

function OrderedTags({
	taskListID,
	taskID,
	sortBy,
	dragging,
}: {
	taskListID: string;
	taskID: string;
	sortBy: TaskField;
	dragging: boolean;
}) {
	const id = useId();
	const { task } = useTask(taskListID, taskID);

	let renderedTags: JSX.Element[] = [];

	if (!task) return renderedTags;

	if (sortBy !== TaskField.text) {
		if (
			task[sortBy as keyof Task] || // has tag
			(sortBy === "length" && task[sortBy] === 0) // length is 0
		) {
			renderedTags.push(
				<TaskTag
					taskListID={taskListID}
					taskID={taskID}
					tagType={sortBy}
					dragging={dragging}
					key={id + sortBy}
				/>
			);
		}
	}

	for (let tagType of TAG_TYPES) {
		if (task[tagType as keyof Task] === undefined) continue;
		if (tagType === sortBy) continue;

		renderedTags.push(
			<TaskTag
				taskListID={taskListID}
				taskID={taskID}
				tagType={tagType}
				dragging={dragging}
				key={id + tagType}
			/>
		);
	}

	return renderedTags;
}

export default TaskComponent;
