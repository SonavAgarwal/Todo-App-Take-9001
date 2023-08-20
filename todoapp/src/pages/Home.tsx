import { signOut } from "firebase/auth";
import { createContext, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { BiLogOut, BiPlus } from "react-icons/bi";
import PlayButton from "../components/HomeComponents/PlayButton.tsx";
import { SortByButton } from "../components/HomeComponents/SortButton.tsx";
import TaskListSelect from "../components/HomeComponents/TaskListSelect.tsx";
import TaskList from "../components/TaskList";
import {
	auth,
	createTask,
	reorganizeConfig,
	reorganizeTaskLists,
} from "../firebase.ts";
import { MAIN_TASK_LIST_NAME } from "../misc/options.ts";
import { TaskField } from "../misc/types.ts";
import { usePinnedLists } from "../misc/usePinnedLists.ts";
import { useUserConfig } from "../misc/useUserConfig.ts";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

export const NewTaskInputFocusContext = createContext(function () {});
export const UserConfigContext = createContext({});

function Home() {
	const navigate = useNavigate();
	const [user, userLoading, userError] = useAuthState(auth);
	useEffect(
		function () {
			if (userLoading) return;
			if (userError) return;
			if (!user) {
				navigate("/auth");
			}
		},
		[user, userLoading, userError]
	);

	const { userConfig } = useUserConfig();

	const [sortBy, setSortBy] = useState<TaskField>(TaskField.none);

	const { pinnedLists } = usePinnedLists();
	const [selectedList, setSelectedList] = useState<string>(MAIN_TASK_LIST_NAME);

	const newTaskRef = useRef<HTMLDivElement | null>(null);

	function focusNewTask() {
		setFocus("text");
	}

	const { register, handleSubmit, reset, setFocus } = useForm();
	function onSubmit(data: any) {
		createTask(selectedList, data.text);
		reset();
		setTimeout(() => {
			newTaskRef.current?.scrollIntoView();
		}, 500);
	}

	if (userConfig && !userConfig.versionNumber) {
		// TODO: add check for no config file
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
								<PlayButton taskListID={selectedList} />
								<div></div>
								{<SortByButton sortBy={sortBy} setSortBy={setSortBy} />}
							</div>
						</div>

						<TaskListSelect
							selectedTaskListID={selectedList}
							setSelectedTaskListID={setSelectedList}
							pinnedListIDs={pinnedLists}
						/>

						<div className="HomePageContentContainer">
							<TaskList
								showLoading={true}
								taskListID={selectedList}
								sortBy={sortBy}
								isMain={true}
							></TaskList>

							<div
								className="CreateTaskContainer CreateTaskContainerMain"
								ref={newTaskRef}
							>
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
				</div>
			</NewTaskInputFocusContext.Provider>
		</UserConfigContext.Provider>
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
