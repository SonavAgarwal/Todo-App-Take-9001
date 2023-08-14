import { MouseEvent, useEffect, useRef, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { updateTask } from "../../firebase";
import { LENGTH_STEP } from "../../misc/options";
import { useTask } from "../../misc/useTask";

interface Props {
	taskListID: string;
	taskID: string;
}

const TimeTag = ({ taskListID, taskID }: Props) => {
	const { task } = useTask(taskListID, taskID);

	const dragStartXRef = useRef(0);
	const mouseDelta = useRef(0);
	const [dragging, setDragging] = useState(false);

	const [length, setLength] = useState<number>(0);

	useEffect(() => {
		if (!task) return;
		setLength(task.length);
	}, [task]);

	const saveLengthDebounced = useDebouncedCallback(function (
		newLength: number
	) {
		updateTask(taskListID, taskID, { length: newLength });
	},
	100);

	useEffect(() => {
		if (!dragging) saveLengthDebounced(length);
	}, [dragging, saveLengthDebounced, length]);

	const handleMouseDown = (event: MouseEvent<HTMLDivElement>): void => {
		dragStartXRef.current = event.clientX;
		mouseDelta.current = 0;
		setDragging(true);
		// next line is insanely problematic with typescripts
		document.addEventListener("mousemove", handleMouseMove as any);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("pointerlockchange", handlePointerLockChange);
		document.body.requestPointerLock();
	};

	const handleMouseMove = (event: MouseEvent): void => {
		const dragDistance = event.movementX;
		mouseDelta.current = mouseDelta.current + dragDistance;

		// Adjust the increment value as desired

		let increment = 0;

		if (mouseDelta.current > 0)
			increment = Math.floor(mouseDelta.current / 20) * LENGTH_STEP;
		else if (mouseDelta.current < 0)
			increment = Math.ceil(mouseDelta.current / 20) * LENGTH_STEP;

		mouseDelta.current = mouseDelta.current % 20;

		setLength((prevNumber) => {
			if (prevNumber + increment < 0) return 0;
			else if (prevNumber + increment > 120) return 120;
			return prevNumber + increment;
		});
	};

	const handleMouseUp = () => {
		document.removeEventListener("mousemove", handleMouseMove as any);
		document.removeEventListener("mouseup", handleMouseUp);
		document.removeEventListener("pointerlockchange", handlePointerLockChange);
		document.exitPointerLock();

		// setLength(length);
		setDragging(false);
	};

	const handlePointerLockChange = () => {
		if (!document.pointerLockElement) {
			document.removeEventListener("mousemove", handleMouseMove as any);
			document.removeEventListener("mouseup", handleMouseUp);
		}
	};

	return (
		<div className="ListTaskTag TimeTag" onMouseDown={handleMouseDown}>
			{length}
		</div>
	);
};

export default TimeTag;
