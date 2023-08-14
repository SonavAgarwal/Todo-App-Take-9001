import { useEffect, useState } from "react";
import { useTask } from "../../misc/useTask";
// @ts-ignore
import chroma from "chroma-js";

const dueDateScale = chroma
	.scale(["ff3838", "ff3838", "f9ff69", "7eff74"])
	.domain([0, 0.1, 0.8, 1]);

interface Props {
	taskListID: string;
	taskID: string;
}

const DateTag = ({ taskListID, taskID }: Props) => {
	const { task } = useTask(taskListID, taskID);

	const [color, setColor] = useState<string>("white");

	function determineDateColor() {
		if (!task) return "white";
		if (!task.date) return "white";

		let colorPercent =
			(task.date?.toDate().getTime() - new Date().getTime()) / (86400000 * 3);

		if (colorPercent < 0) colorPercent = 0;
		else if (colorPercent > 1) colorPercent = 1;

		let newColor = dueDateScale(colorPercent);
		return newColor.css();
	}

	useEffect(() => {
		setColor(determineDateColor());
	}, [task]);

	if (!task) return null;

	return (
		<div className="ListTaskTag DateTag" style={{ backgroundColor: color }}>
			{task.date?.toDate().toLocaleDateString("en-US", {
				day: "numeric",
				month: "2-digit",
				year: "2-digit",
			})}
		</div>
	);
};

export default DateTag;
