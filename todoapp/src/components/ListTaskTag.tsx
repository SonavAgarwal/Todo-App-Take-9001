import chroma from "chroma-js";
import React, { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { BiCheck, BiX } from "react-icons/bi";
import { useLongPress } from "use-long-press";
import { updateConfigColors, updateTask } from "../firebase.ts";
import { lengthStep, typeToSymbol } from "../misc/options";
import { Task } from "../misc/types.ts";
import { useUserConfig } from "../misc/useUserConfig.ts";
import TimeTag from "./TimeTag";

const dueDateScale = chroma
	.scale(["ff3838", "ff3838", "f9ff69", "7eff74"])
	.domain([0, 0.1, 0.8, 1]);

interface Props {
	taskListId: string;
	task: Task;
	property: string;
	dragging: boolean;
	taskId: string;
}

function ListTaskTag({ taskListId, task, property, dragging, taskId }: Props) {
	const { userConfig } = useUserConfig();
	const [color, setColor] = useState(determineColor());
	const [pickingColor, setPickingColor] = useState(false);

	const [time, setTime] = useState(task?.length);
	const [pickingTime, setPickingTime] = useState(false);

	const tagLongPressHandlers = useLongPress(function () {
		setPickingColor(true);
	});

	function handleMultipleTimeClicks(event: React.MouseEvent<HTMLInputElement>) {
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

	function saveTime(newTime) {
		if (newTime === task.length) return;
		updateTask(taskListId, taskId, { length: newTime });
	}

	function restoreDefaultColor() {
		if (!userConfig) return;
		let val =
			userConfig[
				(task[property as keyof Task] as string)?.toLowerCase() as string
			];
		if (val) {
			setColor(val);
		} else {
			setColor("white");
		}
	}

	function restoreDefaultTime() {
		if (task.length) {
			setTime(task.length);
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
		if (!userConfig) return;
		let ret =
			userConfig[
				(task[property as keyof Task] as string)?.toLowerCase() as string
			];
		if (ret) return ret;
		else return "white";
	}

	function determineDateColor() {
		if (!task.date) return "white";
		let colorPercent =
			(task.date?.toDate().getTime() - new Date().getTime()) / (86400000 * 3);
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
					{task.tag}
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
				{task.date?.toDate().toLocaleDateString("en-US", {
					day: "numeric",
					month: "2-digit",
					year: "2-digit",
				})}
			</div>
		);
	}

	if (property === "type" && typeToSymbol(task.type)) {
		return <div className="ListTaskTag TypeTag">{typeToSymbol(task.type)}</div>;
	}

	if (property === "link") {
		return (
			<a
				href={task.link}
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
				<TimeTag
					onClick={function () {
						setPickingTime(true);
					}}
					onTouchEndCapture={function () {
						setPickingTime(true);
					}}
					time={time}
					saveTime={saveTime}
				></TimeTag>
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
										saveTime(time);
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

export default ListTaskTag;
