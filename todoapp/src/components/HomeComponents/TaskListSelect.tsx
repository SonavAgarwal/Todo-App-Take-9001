import AnimateHeight from "react-animate-height";
import { useSwipeable } from "react-swipeable";
import { updateTask } from "../../firebase";
import { MAIN_TASK_LIST_NAME } from "../../misc/options";
import { useTask } from "../../misc/useTask";

interface Props {
	selectedTaskListID: string;
	setSelectedTaskListID: (taskListID: string) => void;
	pinnedListIDs: string[];
}

const TaskListSelect = ({
	selectedTaskListID,
	setSelectedTaskListID,
	pinnedListIDs,
}: Props) => {
	return (
		<AnimateHeight
			duration={500}
			height={pinnedListIDs.length > 0 ? "auto" : 0}
		>
			<div className="PinnedTaskListsContainer">
				<MainTaskListOption
					selectedTaskListID={selectedTaskListID}
					setSelectedTaskListID={setSelectedTaskListID}
				/>

				{pinnedListIDs.map((taskListID) => {
					return (
						<TaskListOption
							key={taskListID}
							taskListID={taskListID}
							selectedTaskListID={selectedTaskListID}
							setSelectedTaskListID={setSelectedTaskListID}
						/>
					);
				})}
			</div>
		</AnimateHeight>
	);
};

function MainTaskListOption({
	selectedTaskListID,
	setSelectedTaskListID,
}: {
	selectedTaskListID: string;
	setSelectedTaskListID: (taskListID: string) => void;
}) {
	return (
		<div
			className={`TaskListOption ${
				MAIN_TASK_LIST_NAME === selectedTaskListID
					? "TaskListOptionSelected"
					: ""
			}`}
			onClick={function () {
				setSelectedTaskListID(MAIN_TASK_LIST_NAME);
			}}
		>
			All Tasks
		</div>
	);
}

function TaskListOption({
	taskListID,
	selectedTaskListID,
	setSelectedTaskListID,
}: {
	taskListID: string;
	selectedTaskListID: string;
	setSelectedTaskListID: (taskListID: string) => void;
}) {
	const { task } = useTask(MAIN_TASK_LIST_NAME, taskListID);

	const swipeHandlers = useSwipeable({
		onSwipedDown: () => {
			setSelectedTaskListID(MAIN_TASK_LIST_NAME);
			updateTask(MAIN_TASK_LIST_NAME, taskListID, { pinned: false });
		},
		trackMouse: true,
		trackTouch: true,
	});

	if (!task) return null;

	return (
		<div
			className={`TaskListOption ${
				taskListID === selectedTaskListID ? "TaskListOptionSelected" : ""
			}`}
			onClick={function () {
				setSelectedTaskListID(taskListID);
			}}
			{...swipeHandlers}
		>
			{task?.text}
		</div>
	);
}

export default TaskListSelect;
