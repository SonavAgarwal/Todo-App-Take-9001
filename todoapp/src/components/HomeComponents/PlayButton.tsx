import { useEffect, useState } from "react";
import { BiPlay } from "react-icons/bi";
import { updateTask } from "../../firebase.ts";
import {
	LENGTH_STEP,
	MAIN_TASK_LIST_NAME,
	typeTimeMatters,
} from "../../misc/options.ts";
import { useTaskList } from "../../misc/useTaskList.ts";
import { increment } from "firebase/firestore";

const PlayButton = () => {
	const { taskList } = useTaskList(MAIN_TASK_LIST_NAME);

	const [plateLengthInSeconds, setPlateLengthInSeconds] = useState(0);
	const [plateColon, setPlateColon] = useState(true);
	const [platePlaying, setPlatePlaying] = useState(false);

	useEffect(
		function () {
			if (platePlaying) {
				let interval = setInterval(() => {
					setPlateColon(false);
					setTimeout(() => {
						setPlateColon(true);
					}, 500);
				}, 1000);

				return function () {
					clearInterval(interval);
				};
			}
		},
		[platePlaying]
	);

	useEffect(
		function () {
			// count down using plateLengthInSeconds
			if (!platePlaying) return;
			if (plateLengthInSeconds <= 0) return;

			let interval = setInterval(() => {
				setPlateLengthInSeconds((pLIS) => {
					return Math.max(pLIS - 1, 0);
				});
			}, 1000);

			return () => clearInterval(interval);
		},
		[platePlaying]
	);

	function findNextTaskId() {
		let nextTaskId = taskList?.order.find(function (taskId: string) {
			let task = taskList.tasks[taskId];
			return task.plate && task.length >= LENGTH_STEP;
		});
		return nextTaskId;
	}

	function calculatePlateLength() {
		if (!taskList) return 0;
		// calculate plate length
		let plateLengthTotal = 0;
		for (let taskId of taskList.order) {
			if (
				taskList.tasks[taskId]?.plate &&
				typeTimeMatters(taskList.tasks[taskId].type)
			) {
				plateLengthTotal += taskList.tasks[taskId].length;
			}
		}
		return plateLengthTotal;
	}

	useEffect(
		function () {
			if (!taskList) return;

			let calculatedPlateLength = calculatePlateLength();

			if (calculatedPlateLength <= 0) {
				setPlatePlaying(false);
			}

			setPlateLengthInSeconds(calculatedPlateLength * 60);
		},
		[taskList, platePlaying]
	);

	useEffect(
		function () {
			if (!taskList) return;
			if (!platePlaying) return;

			if (!findNextTaskId()) {
				setPlatePlaying(false);
				return;
			}

			let interval = setInterval(() => {
				let nextTaskId = findNextTaskId();

				if (!nextTaskId) {
					setPlatePlaying(false);
					return;
				}

				updateTask(MAIN_TASK_LIST_NAME, nextTaskId, {
					length: increment(-1 * LENGTH_STEP),
				});
			}, LENGTH_STEP * 60 * 1000);

			return () => clearInterval(interval);
		},
		[platePlaying, taskList]
	);

	return (
		<button
			onClick={function () {
				if (!platePlaying && plateLengthInSeconds < LENGTH_STEP) return;
				setPlatePlaying(!platePlaying);
			}}
			tabIndex={-1}
		>
			{
				<BiPlay
					className={`PlayPlateIcon ${
						platePlaying ? "PlayPlateIconPlaying" : ""
					}`}
				/>
			}
			<p className={`HeaderPlateLength ${platePlaying ? "PlatePlaying" : ""}`}>
				{toTimeString(plateLengthInSeconds, plateColon)}
			</p>
		</button>
	);
};

function toTimeString(seconds: number, showColon = true) {
	let hours = Math.floor(seconds / 3600);
	let minutes = Math.floor((seconds - hours * 3600) / 60);
	let secondsLeft = seconds - hours * 3600 - minutes * 60;
	return (
		hours +
		(showColon ? ":" : " ") +
		(minutes < 10 ? "0" : "") +
		minutes +
		(showColon ? ":" : " ") +
		(secondsLeft < 10 ? "0" : "") +
		secondsLeft
	);
}

export default PlayButton;
