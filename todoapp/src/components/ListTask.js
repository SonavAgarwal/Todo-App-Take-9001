import { debounce } from "debounce";
import React, { forwardRef, useCallback, useContext, useEffect, useState } from "react";
import { deleteTask, updateConfigColors, updateTask } from "../firebase";
import { lengthStep, parseNewTextToUpdateObject, preferredTagOrder, typeOptionsDisplay } from "../misc/options";
import { BiCheck, BiCheckSquare, BiGridVertical, BiSquare, BiX } from "react-icons/bi";
import { NewTaskContext, UserConfigContext } from "../pages/Home";
import { useSwipeable } from "react-swipeable";
import AnimateHeight from "react-animate-height";
import chroma from "chroma-js";
import { HexColorPicker } from "react-colorful";
import { useLongPress } from "use-long-press";

const dueDateScale = chroma.scale(["ff3838", "ff3838", "f9ff69", "7eff74"]).domain([0, 0.1, 0.8, 1]);

const ListTask = forwardRef(({ taskId, task, attributes, listeners, style, sortBy, ...props }, ref) => {
    const [taskText, setTaskText] = useState(task?.text);

    const focusNewTaskRef = useContext(NewTaskContext);

    const [plate, setPlate] = useState(task?.plate);

    const [deleted, setDeleted] = useState(false);
    const editSwipeHandlers = useSwipeable({
        onSwipedRight: function () {
            setDeleted(true);
            setTimeout(() => {
                deleteTask(taskId);
            }, 500);
        },
        trackMouse: true,
    });

    useEffect(
        function () {
            if (task && task.text) {
                // prevents value from becoming undefined and creating uncontrolled component
                setTaskText(task.text);
            } else {
                setTaskText("");
            }
            setPlate(task?.plate);
        },
        [task]
    );

    function handleTextEdit(changedText) {
        if (changedText === task?.text) return;
        if (!changedText) return;

        let updateObject = parseNewTextToUpdateObject(changedText);

        updateTask(taskId, updateObject);
    }

    function handlePlateEdit(newPlate) {
        if (deleted) return;
        if (task.plate === newPlate) return;
        updateTask(taskId, { plate: newPlate });
    }

    // eslint-disable-next-line
    const handleTextEditDebounced = useCallback(debounce(handleTextEdit, 1000), [taskId, task]);

    // eslint-disable-next-line
    const handlePlateDebounced = useCallback(debounce(handlePlateEdit, 500), [taskId, deleted, task]);

    useEffect(
        function () {
            handleTextEditDebounced(taskText);
        },
        [taskText, handleTextEditDebounced]
    );

    useEffect(
        function () {
            handlePlateDebounced(plate);
        },
        [plate, handlePlateDebounced]
    );

    function TagsOrdered() {
        let renderedTags = [];
        let key = 1;
        if (!task) return renderedTags;
        if (sortBy !== "text") {
            if (task[sortBy] || (sortBy === "length" && task[sortBy] === 0)) {
                renderedTags.push(<ListTaskTag key={key} task={task} taskId={taskId} property={sortBy} dragging={props.dragging} />);
                key++;
            }
        }
        for (let taskProperty of preferredTagOrder) {
            if (taskProperty !== sortBy && (task[taskProperty] || (taskProperty === "length" && task[taskProperty] === 0))) {
                renderedTags.push(<ListTaskTag key={key} task={task} taskId={taskId} property={taskProperty} dragging={props.dragging} />);
                key++;
            }
        }
        return renderedTags;
    }

    return (
        <div style={style} ref={ref}>
            <AnimateHeight duration={500} height={deleted ? 0 : "auto"}>
                <div className='ListTaskContainer'>
                    <div className='ListTask'>
                        <div className='ListTaskTextContainer'>
                            <input
                                size={1}
                                className='ListTaskText'
                                value={taskText}
                                onChange={function (event) {
                                    setTaskText(event.target.value);
                                }}
                                onKeyUp={function (event) {
                                    if (event.key === "Enter") {
                                        focusNewTaskRef();
                                    }
                                }}></input>
                            {/* <div className={`TimeRangeInputContainer ${editMode ? "TimeRangeInputContainerVisible" : ""}`}>
                                <input
                                    size={1}
                                    type={"range"}
                                    min={5}
                                    max={120}
                                    value={timeSliderValue}
                                    onClick={handleMultipleTimeClicks}
                                    onChange={function (event) {
                                        setTimeSliderValue(event.target.value);
                                    }}
                                    className='ListTaskText TimeRangeInput'></input>
                                <p className='TimeRangeInputText' onClick={handleMultipleTimeClicks}>
                                    {timeSliderValue}{" "}
                                </p>
                            </div> */}
                        </div>
                        <button
                            onClick={function () {
                                setPlate(!plate);
                            }}
                            className='ListTaskButton'
                            {...editSwipeHandlers}>
                            {plate ? <BiCheckSquare /> : <BiSquare />}
                        </button>
                        <div className='ListTaskButton' {...attributes} {...listeners}>
                            <BiGridVertical />
                        </div>
                    </div>
                    <div className='ListTaskTagsContainer'>
                        <TagsOrdered />

                        {/* {task?.length && <ListTaskTag task={task} property={"length"} dragging={props.dragging} taskId={taskId} />}
                        {task?.tag && <ListTaskTag task={task} property={"tag"} dragging={props.dragging} taskId={taskId} />}
                        {task?.date && <ListTaskTag task={task} property={"date"} dragging={props.dragging} taskId={taskId} />}
                        {task?.type && <ListTaskTag task={task} property={"type"} dragging={props.dragging} taskId={taskId} />} */}
                    </div>
                </div>
            </AnimateHeight>
        </div>
    );
});

function ListTaskTag({ task, property, dragging, taskId }) {
    const userData = useContext(UserConfigContext);
    const [color, setColor] = useState(determineColor());
    const [pickingColor, setPickingColor] = useState(false);

    const [time, setTime] = useState(task?.length);
    const [pickingTime, setPickingTime] = useState(false);

    const tagLongPressHandlers = useLongPress(function () {
        setPickingColor(true);
    });

    function handleMultipleTimeClicks(event) {
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

    function saveTime() {
        if (time === task.length) return;
        updateTask(taskId, { length: time });
    }

    function restoreDefaultColor() {
        if (!userData) return;
        if (userData[task[property].toLowerCase()]) {
            setColor(userData[task[property].toLowerCase()]);
        } else {
            setColor("white");
        }
    }

    function restoreDefaultTime() {
        if (task[property]) {
            setTime(task[property]);
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
        if (!userData) return;
        if (userData[task[property].toLowerCase()]) {
            return userData[task[property].toLowerCase()];
        } else return "white";
    }

    function determineDateColor() {
        let colorPercent = (task[property].toDate() - new Date()) / (86400000 * 3);
        if (colorPercent < 0) colorPercent = 0;
        else if (colorPercent > 1) colorPercent = 1;
        let newColor = dueDateScale(colorPercent);
        return newColor;
    }

    if (property === "tag") {
        return (
            <>
                <div className='ListTaskTag' style={{ backgroundColor: color }} {...tagLongPressHandlers()}>
                    {task[property]}
                </div>
                {pickingColor && (
                    <div className='TaskEditFooterContainerContainer'>
                        <div className='TaskEditFooterContainer'>
                            <HexColorPicker color={color} onChange={setColor}></HexColorPicker>
                            <div>
                                <button
                                    className='ListTaskButton'
                                    onClick={function () {
                                        setPickingColor(false);
                                        restoreDefaultColor();
                                    }}>
                                    <BiX />
                                </button>
                                <button
                                    className='ListTaskButton'
                                    onClick={function () {
                                        setPickingColor(false);
                                        saveTagColor();
                                    }}>
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
            <div className='ListTaskTag DateTag' style={{ backgroundColor: color }}>
                {task[property].toDate().toLocaleDateString("en-US", { day: "numeric", month: "2-digit", year: "2-digit" })}
            </div>
        );
    }

    if (property === "type" && task[property] in typeOptionsDisplay) {
        return <div className='ListTaskTag TypeTag'>{typeOptionsDisplay[task[property]]}</div>;
    }

    if (property === "link") {
        return (
            <a href={task[property]} target='_blank' rel='noopener noreferrer'>
                <div className='ListTaskTag'>🔗</div>
            </a>
        );
    }

    if (property === "length" && ["long", "email"].includes(task?.type)) {
        return (
            <>
                <div
                    className='ListTaskTag TimeTag'
                    onClick={function () {
                        setPickingTime(true);
                    }}
                    onTouchEndCapture={function () {
                        setPickingTime(true);
                    }}>
                    {time + " "}
                </div>
                {pickingTime && (
                    <div className='TaskEditFooterContainerContainer'>
                        <div className='TaskEditFooterContainer'>
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
                                className='ListTaskText TimeRangeInput'></input>
                            <div>
                                <button
                                    className='ListTaskButton'
                                    onClick={function () {
                                        setPickingTime(false);
                                        restoreDefaultTime();
                                    }}>
                                    <BiX />
                                </button>
                                <button
                                    className='ListTaskButton'
                                    onClick={function () {
                                        setPickingTime(false);
                                        saveTime();
                                    }}>
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

export default ListTask;
