import React, {
	useState,
	useRef,
	useCallback,
	useEffect,
	MouseEvent,
} from "react";
import { lengthStep } from "../misc/options";
import { debounce } from "debounce";

interface Props {
	onClick: () => any;
	onTouchEndCapture: () => any;
	time: number;
	saveTime: (newTime: number) => void;
}

const TimeTag = ({ onClick, onTouchEndCapture, time, saveTime }: Props) => {
	const [number, setNumber] = useState(time);
	const [startingNumber, setStartingNumber] = useState(time);
	const dragStartXRef = useRef(0);
	const mouseDelta = useRef(0);
	const [dragging, setDragging] = useState(false);

	useEffect(() => {
		setNumber(time);
		setStartingNumber(time);
	}, [time]);

	const saveTimeDebounced = useCallback(
		debounce(function () {
			saveTime(number);
		}, 100),
		[number]
	);

	useEffect(() => {
		if (!dragging && number !== time) {
			saveTimeDebounced();
		}
	}, [dragging, saveTimeDebounced, startingNumber]);

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
			increment = Math.floor(mouseDelta.current / 20) * lengthStep;
		else if (mouseDelta.current < 0)
			increment = Math.ceil(mouseDelta.current / 20) * lengthStep;

		mouseDelta.current = mouseDelta.current % 20;

		setNumber((prevNumber) => {
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

		setStartingNumber(number);
		setDragging(false);
	};

	const handlePointerLockChange = () => {
		if (!document.pointerLockElement) {
			document.removeEventListener("mousemove", handleMouseMove as any);
			document.removeEventListener("mouseup", handleMouseUp);
		}
	};

	return (
		<div
			className="ListTaskTag TimeTag"
			onClick={onClick}
			onTouchEndCapture={onTouchEndCapture}
			onMouseDown={handleMouseDown}
		>
			{number}
		</div>
	);
};

export default TimeTag;
