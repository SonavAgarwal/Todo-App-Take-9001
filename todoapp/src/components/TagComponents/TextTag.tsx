import { useEffect, useState } from "react";
import { HexColorPicker } from "react-colorful";
import { updateConfigColors } from "../../firebase";
import { useTask } from "../../misc/useTask";
import { useUserConfig } from "../../misc/useUserConfig";
import { BiCheck, BiX } from "react-icons/bi";
// @ts-ignore
import { useLongPress } from "use-long-press";

interface Props {
	taskListID: string;
	taskID: string;
	dragging: boolean;
}

const TextTag = ({ taskListID, taskID, dragging }: Props) => {
	const { userConfig } = useUserConfig();
	const { task } = useTask(taskListID, taskID);

	const [color, setColor] = useState<string>("white");
	const [isPickingColor, setIsPickingColor] = useState<boolean>(false);
	const tagLongPressHandlers = useLongPress(function () {
		setIsPickingColor(true);
	});

	function saveTagColor() {
		const word = task?.tag?.toLowerCase();
		if (!word) return;
		updateConfigColors(word, color);
	}

	function getTagColor() {
		if (!userConfig) return;
		if (!task) return;
		if (!task.tag) return;

		let val = userConfig.colors[task.tag.toLowerCase()];
		if (val) return val;

		return "white";
	}

	function restoreInitialColor() {
		setColor(getTagColor());
	}

	useEffect(() => {
		setColor(getTagColor());
	}, [task, userConfig]);

	useEffect(() => {
		if (dragging) setIsPickingColor(false);
	}, [dragging]);

	if (!task) return null;
	if (!task.tag) return null;

	return (
		<>
			<div
				className="ListTaskTag"
				{...tagLongPressHandlers()}
				style={{ backgroundColor: color }}
			>
				{task.tag}
			</div>
			{isPickingColor && (
				<div className="TaskEditFooterContainerContainer">
					<div className="TaskEditFooterContainer">
						<HexColorPicker color={color} onChange={setColor}></HexColorPicker>
						<div className="TaskEditFooterContainerButtons">
							<button
								className="ListTaskButton"
								onClick={function () {
									setIsPickingColor(false);
									restoreInitialColor();
								}}
								tabIndex={-1}
							>
								<BiX />
							</button>
							<button
								className="ListTaskButton"
								onClick={function () {
									setIsPickingColor(false);
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
};

export default TextTag;
