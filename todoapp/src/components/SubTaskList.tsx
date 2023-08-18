import { useContext, useRef } from "react";
import { useForm } from "react-hook-form";
import { BiPlus } from "react-icons/bi";
import TaskList from "../components/TaskList";
import { createTask } from "../firebase.ts";
import { TaskField } from "../misc/types.ts";
import { NewTaskInputFocusContext } from "../pages/Home.tsx";
import AnimateHeight from "react-animate-height";
import classNames from "classnames";

function SubTaskList({
	taskListID,
	open,
}: {
	taskListID: string;
	open: boolean;
}) {
	const { register, handleSubmit, reset } = useForm();

	const newTaskRef = useRef<HTMLDivElement | null>(null);
	const focusNewTaskInputRef = useContext(NewTaskInputFocusContext);

	function onSubmit(data: any) {
		if (!data.text) {
			focusNewTaskInputRef();
			return;
		}

		createTask(taskListID, data.text, true);
		reset();
		setTimeout(() => {
			newTaskRef.current?.scrollIntoView();
		}, 500);
	}

	return (
		<div
			className={classNames(
				"SubTaskListContainer",
				!open && "SubTaskListContainer-NoTopMargin"
			)}
		>
			<TaskList
				taskListID={taskListID}
				sortBy={TaskField.none}
				showLoading={false}
				open={open}
			></TaskList>

			<AnimateHeight duration={500} height={open ? "auto" : 0}>
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
						<button className="CreateTaskButton" type="submit" tabIndex={-1}>
							<BiPlus />
						</button>
					</form>
				</div>
			</AnimateHeight>
		</div>
	);
}

export default SubTaskList;
