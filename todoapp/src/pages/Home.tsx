import { signOut } from "firebase/auth";
import { createContext, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
	BiCalendarAlt,
	BiCategoryAlt,
	BiCheckSquare,
	BiLogOut,
	BiMenu,
	BiPlus,
	BiPointer,
	BiTime,
} from "react-icons/bi";
import PlayButton from "../components/PlayButton.tsx";
import TaskList from "../components/TaskList";
import {
	auth,
	createTask,
	reorganizeConfig,
	reorganizeTaskLists,
} from "../firebase.ts";
import { MAIN_TASK_LIST_NAME } from "../misc/options.ts";
import { TaskField } from "../misc/types.ts";
import { useUserConfig } from "../misc/useUserConfig.ts";

export const NewTaskInputFocusContext = createContext(function () {});
export const UserConfigContext = createContext({});

const sortIcons = [
	{ sortBy: TaskField.none, icon: <BiPointer /> },
	{ sortBy: TaskField.plate, icon: <BiCheckSquare /> },
	{ sortBy: TaskField.date, icon: <BiCalendarAlt /> },
	{ sortBy: TaskField.length, icon: <BiTime /> },
	{ sortBy: TaskField.tag, icon: <BiCategoryAlt /> },
	{ sortBy: TaskField.type, icon: <BiMenu /> },
	// { sortBy: TaskField.text, icon: <BiFontFamily /> },
];

function Home() {
	const { userConfig } = useUserConfig();

	const [sortBy, setSortBy] = useState<TaskField>(TaskField.none);

	const newTaskRef = useRef<HTMLDivElement | null>(null);

	function focusNewTask() {
		setFocus("text");
	}

	const { register, handleSubmit, reset, setFocus } = useForm();
	function onSubmit(data: any) {
		createTask(MAIN_TASK_LIST_NAME, data.text);
		reset();
		setTimeout(() => {
			newTaskRef.current?.scrollIntoView();
		}, 500);
	}

	if (userConfig && !userConfig.versionNumber) {
		reorganizeTaskLists();
		reorganizeConfig();
		return <div>Reorganizing...</div>;
	}

	return (
		<UserConfigContext.Provider value={userConfig || {}}>
			<NewTaskInputFocusContext.Provider value={focusNewTask}>
				<div className="HomePage">
					<div className="HomePageScrollContainer">
						<div className="HomePageHeaderContainer">
							<div className="HomePageHeader">
								<button
									onClick={function () {
										signOut(auth);
									}}
									tabIndex={-1}
								>
									<BiLogOut />
								</button>
								<div></div>
								<PlayButton />
								<div></div>
								{<SortByButton sortBy={sortBy} setSortBy={setSortBy} />}
							</div>
						</div>

						<TaskList
							showLoading={true}
							taskListID={MAIN_TASK_LIST_NAME}
							sortBy={sortBy}
						></TaskList>

						<div className="CreateTaskContainer" ref={newTaskRef}>
							<form className="CreateTask" onSubmit={handleSubmit(onSubmit)}>
								<div className="CreateTaskInputContainer">
									<input
										className="CreateTaskInput"
										placeholder="new task..."
										autoComplete="off"
										onFocus={function (event) {
											event.target.scrollIntoView();
										}}
										{...register("text")}
									/>
								</div>
								<button
									className="CreateTaskButton"
									type="submit"
									tabIndex={-1}
								>
									<BiPlus />
								</button>
							</form>
						</div>
					</div>
				</div>
			</NewTaskInputFocusContext.Provider>
		</UserConfigContext.Provider>
	);
}

function SortByButton({
	sortBy,
	setSortBy,
}: {
	sortBy: TaskField;
	setSortBy: any;
}) {
	let currentSortBy = sortIcons.find(function (item) {
		return item.sortBy === sortBy;
	});

	let nextIndex =
		(1 +
			sortIcons.findIndex(function (icon) {
				return sortBy === icon.sortBy;
			})) %
		sortIcons.length;

	let nextSortBy = sortIcons[nextIndex].sortBy;

	if (!currentSortBy) {
		return <div></div>;
	}

	return (
		<button
			onClick={function () {
				setSortBy(nextSortBy);
			}}
			tabIndex={-1}
		>
			{currentSortBy.icon}
		</button>
	);
}

// const [plateLength, setPlateLength] = useState(0);
// const [plateColon, setPlateColon] = useState(true);
// const [platePlaying, setPlatePlaying] = useState(false);

// useEffect(
// 	function () {
// 		console.log("Tasks: ", tasks);

// 		if (tasks) {
// 			let plateLengthTotal = 0;
// 			for (let taskId of tasks.order) {
// 				if (
// 					tasks[taskId]?.plate &&
// 					lengthCountedTags.includes(tasks[taskId].type)
// 				) {
// 					plateLengthTotal += parseInt(tasks[taskId].length);
// 				}
// 			}
// 			setPlateLength(plateLengthTotal);
// 		}
// 	},
// 	[tasks]
// );

// useEffect(
// 	function () {
// 		if (platePlaying) {
// 			let interval = setInterval(() => {
// 				setPlateColon(false);
// 				setTimeout(() => {
// 					setPlateColon(true);
// 				}, 500);
// 			}, 1000);

// 			return function () {
// 				clearInterval(interval);
// 			};
// 		}
// 	},
// 	[platePlaying]
// );

// useEffect(
// 	function () {
// 		if (platePlaying) {
// 			function findNextTaskId() {
// 				let nextTaskId = tasks?.order.find(function (taskId) {
// 					let task = tasks[taskId];
// 					return task.plate && parseInt(task.length) >= lengthStep;
// 				});
// 				// let nextTask = tasks[nextTaskId];
// 				return nextTaskId;
// 			}

// 			console.log(findNextTaskId());

// 			if (!findNextTaskId()) {
// 				setPlatePlaying(false);
// 				return;
// 			}

// 			let interval = setInterval(() => {
// 				let nextTaskId = findNextTaskId();

// 				if (!nextTaskId) {
// 					setPlatePlaying(false);
// 					return;
// 				}

// 				updateTask("tasks", nextTaskId, {
// 					length: increment(-1 * lengthStep),
// 				});
// 			}, lengthStep * 60 * 1000);

// 			return function () {
// 				clearInterval(interval);
// 			};
// 		}
// 	},
// 	[platePlaying, tasks]
// );

export default Home;
