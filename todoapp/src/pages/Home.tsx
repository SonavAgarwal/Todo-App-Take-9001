import { signOut } from "firebase/auth";
import { doc, increment } from "firebase/firestore";
import { createContext, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { useForm } from "react-hook-form";
import {
	BiCalendarAlt,
	BiCategoryAlt,
	BiCheckSquare,
	BiFontFamily,
	BiLogOut,
	BiMenu,
	BiPlay,
	BiPlus,
	BiPointer,
	BiTime,
} from "react-icons/bi";
import { Oval } from "react-loader-spinner";
import TaskList from "../components/TaskList";
import { auth, createTask, firestore, updateTask } from "../firebase.ts";
import { lengthCountedTags, lengthStep } from "../misc/options";
import { useMediaQuery } from "../misc/useMediaQuery";
import { useTaskList } from "../misc/useTaskList.ts";
import { SortMethod } from "../misc/types.ts";

export const NewTaskContext = createContext(function () {});
export const UserConfigContext = createContext({});

const sortIcons = [
	{ sortBy: SortMethod.none, icon: <BiPointer /> },
	{ sortBy: SortMethod.plate, icon: <BiCheckSquare /> },
	{ sortBy: SortMethod.tag, icon: <BiCategoryAlt /> },
	{ sortBy: SortMethod.type, icon: <BiMenu /> },
	{ sortBy: SortMethod.length, icon: <BiTime /> },
	{ sortBy: SortMethod.date, icon: <BiCalendarAlt /> },
	{ sortBy: SortMethod.text, icon: <BiFontFamily /> },
];

function Home() {
	// const isMobile = useMediaQuery("(max-aspect-ratio: 1/1)");

	const [user, userLoading] = useAuthState(auth);
	// const [tasks, tasksLoading] = useDocumentData(
	// 	doc(firestore, `users/${user?.uid}/data/tasks`)
	// );

	const { taskList } = useTaskList("tasks");

	const [userConfig] = useDocumentData(
		doc(firestore, `users/${user?.uid}/data/config`)
	);

	const [sortBy, setSortBy] = useState("none");

	const newTaskRef = useRef<HTMLDivElement | null>(null);

	function focusNewTask() {
		setFocus("text");
	}

	const { register, handleSubmit, reset, setFocus } = useForm();
	function onSubmit(data: any) {
		createTask("tasks", data.text);
		reset();
		setTimeout(() => {
			newTaskRef.current?.scrollIntoView();
		}, 500);
	}

	return (
		<UserConfigContext.Provider value={userConfig || {}}>
			<NewTaskContext.Provider value={focusNewTask}>
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
								<button
									onClick={function () {
										// if (!platePlaying && plateLength < lengthStep) return;
										// setPlatePlaying(!platePlaying);
									}}
									tabIndex={-1}
								>
									{
										<BiPlay
										// className={`PlayPlateIcon ${
										// 	platePlaying ? "PlayPlateIconPlaying" : ""
										// }`}
										/>
									}
									<p
									// className={`HeaderPlateLength ${
									// 	platePlaying ? "PlatePlaying" : ""
									// }`}
									>
										{/* {Math.floor(plateLength / 60)}
										{plateColon ? ":" : " "}
										{plateLength % 60 < 10 ? "0" : ""}
										{plateLength % 60} */}
									</p>
								</button>
								<div></div>
								{<SortByButton sortBy={sortBy} setSortBy={setSortBy} />}
							</div>
						</div>

						{!taskList && (
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
						)}

						{taskList && (
							<TaskList
								main={true}
								taskListId={"tasks"}
								tasks={tasks}
								order={listOrder}
								sortBy={sortBy}
							></TaskList>
						)}

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
			</NewTaskContext.Provider>
		</UserConfigContext.Provider>
	);
}

function SortByButton({ sortBy, setSortBy }) {
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
