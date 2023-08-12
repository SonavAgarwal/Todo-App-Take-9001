import { doc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useDocumentData } from "react-firebase-hooks/firestore";
import { BiPlus } from "react-icons/bi";
import { auth, createTask, firestore } from "../firebase";
import { useForm } from "react-hook-form";
import TaskList from "./TaskList";
import AnimateHeight from "react-animate-height";

function SubTaskList({ subTaskListId, open }) {
	const [user] = useAuthState(auth); // todo pass down uid in case it makes a difference in performance / failed reads etc
	const [tasks] = useDocumentData(
		doc(firestore, `users/${user?.uid}/data/${subTaskListId}`)
	);

	const [listOrder, setListOrder] = useState(tasks?.order);
	useEffect(
		function () {
			setListOrder(tasks?.order);
		},
		[tasks]
	);

	const newTaskRef = useRef();
	const { register, handleSubmit, reset } = useForm();

	function onSubmit(data) {
		createTask(subTaskListId, data.text);
		reset();
		setTimeout(() => {
			// newTaskRef.current.scrollIntoView();
		}, 500);
	}

	return (
		<AnimateHeight duration={500} height={open ? "auto" : 0}>
			<div className="SubTaskListContainer">
				<TaskList
					taskListId={subTaskListId}
					tasks={tasks}
					order={listOrder}
					sortBy={"none"}
				></TaskList>
				<div className="CreateTaskContainer" ref={newTaskRef}>
					<form className="CreateTask" onSubmit={handleSubmit(onSubmit)}>
						<div className="CreateTaskInputContainer">
							<input
								className="CreateTaskInput"
								size={1}
								placeholder="new subtask..."
								autoComplete="off"
								onFocus={function (event) {
									// event.target.scrollIntoView();
								}}
								{...register("text")}
							/>
						</div>
						<button className="CreateTaskButton" type="submit" tabIndex={-1}>
							<BiPlus />
						</button>
					</form>
				</div>
			</div>
		</AnimateHeight>
	);
}

export default SubTaskList;
