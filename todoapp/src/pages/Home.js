import { signOut } from "firebase/auth";
import { addDoc, collection, doc, increment } from "firebase/firestore";
import React, { createContext, useEffect, useRef, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection, useCollectionData, useDocumentData } from "react-firebase-hooks/firestore";
import { auth, createTask, firestore, updateTask } from "../firebase";
import { useForm } from "react-hook-form";
import ListTask from "../components/ListTask";
import TaskList from "../components/TaskList";
import {
    BiCalendar,
    BiCalendarAlt,
    BiCategoryAlt,
    BiCheckSquare,
    BiFontFamily,
    BiLogOut,
    BiMenu,
    BiPause,
    BiPlay,
    BiPlus,
    BiPointer,
    BiTime,
} from "react-icons/bi";
import { lengthCountedTags, lengthStep } from "../misc/options";

export const NewTaskContext = createContext();
export const UserConfigContext = createContext();

const sortIcons = [
    { sortBy: "none", icon: <BiPointer /> },
    { sortBy: "plate", icon: <BiCheckSquare /> },
    { sortBy: "tag", icon: <BiCategoryAlt /> },
    { sortBy: "type", icon: <BiMenu /> },
    { sortBy: "length", icon: <BiTime /> },
    { sortBy: "date", icon: <BiCalendarAlt /> },
    { sortBy: "text", icon: <BiFontFamily /> },
];

function Home(props) {
    const [user, userLoading, userError] = useAuthState(auth);
    const [tasks, tasksLoading, tasksError] = useDocumentData(doc(firestore, `users/${user?.uid}/data/tasks`));
    const [userConfig, userDataLoading, userDataError] = useDocumentData(doc(firestore, `users/${user?.uid}/data/config`));

    const [listOrder, setListOrder] = useState(tasks?.order);
    useEffect(
        function () {
            setListOrder(tasks?.order);
        },
        [tasks]
    );
    // console.log("listOrder");
    // console.log(listOrder);

    const [sortBy, setSortBy] = useState("none");

    const newTaskRef = useRef();

    function focusNewTask() {
        setFocus("text");
    }

    const {
        register,
        handleSubmit,
        reset,
        setFocus,

        formState: { errors },
    } = useForm();
    // const onSubmit = (data) => console.log(data);

    function onSubmit(data) {
        createTask(data.text);
        reset();
        setTimeout(() => {
            newTaskRef.current.scrollIntoView();
        }, 500);
    }

    // console.log(user?.uid);

    // if (!!tasks) {
    //     console.log("tasks");
    //     console.log(tasks);
    // }

    const [plateLength, setPlateLength] = useState(0);
    const [plateColon, setPlateColon] = useState(true);
    const [platePlaying, setPlatePlaying] = useState(false);

    useEffect(
        function () {
            console.log("Tasks: ", tasks);

            if (tasks) {
                let plateLengthTotal = 0;
                for (let taskId of tasks.order) {
                    if (tasks[taskId].plate && lengthCountedTags.includes(tasks[taskId].type)) {
                        plateLengthTotal += parseInt(tasks[taskId].length);
                    }
                }
                setPlateLength(plateLengthTotal);
            }
        },
        [tasks]
    );

    // useEffect(
    //     function () {
    //         setPlateColon(true);
    //     },
    //     [platePlaying]
    // );

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
            if (platePlaying) {
                let interval = setInterval(() => {
                    let nextTaskId = tasks.order.find(function (taskId) {
                        let task = tasks[taskId];
                        return parseInt(task.length) >= lengthStep && task.plate;
                    });
                    if (!nextTaskId) {
                        setPlatePlaying(false);
                    }
                    let nextTask = tasks[nextTaskId];

                    console.log("nextTask", nextTask);

                    updateTask(nextTaskId, { length: increment(-1 * lengthStep) });
                }, lengthStep * 60 * 1000);

                return function () {
                    clearInterval(interval);
                };
            }
        },
        [platePlaying, tasks]
    );

    return (
        <UserConfigContext.Provider value={userConfig}>
            <NewTaskContext.Provider value={focusNewTask}>
                <div className='HomePage'>
                    <div className='HomePageScrollContainer'>
                        <div className='HomePageHeaderContainer'>
                            <div className='HomePageHeader'>
                                <button
                                    onClick={function () {
                                        signOut(auth);
                                    }}>
                                    <BiLogOut />
                                </button>
                                <div></div>
                                <button
                                    onClick={function () {
                                        setPlatePlaying(!platePlaying);
                                    }}>
                                    {<BiPlay className={`PlayPlateIcon ${platePlaying ? "PlayPlateIconPlaying" : ""}`} />}
                                    <p className={`HeaderPlateLength ${platePlaying ? "PlatePlaying" : ""}`}>
                                        {Math.floor(plateLength / 60)}
                                        {plateColon ? ":" : " "}
                                        {plateLength % 60 < 10 ? "0" : ""}
                                        {plateLength % 60}
                                    </p>
                                </button>

                                <div></div>
                                {<SortByButton sortBy={sortBy} setSortBy={setSortBy} />}
                            </div>
                        </div>
                        {!tasksLoading && <TaskList tasks={tasks} order={listOrder} sortBy={sortBy}></TaskList>}
                        <div className='CreateTaskContainer' ref={newTaskRef}>
                            <form className='CreateTask' onSubmit={handleSubmit(onSubmit)}>
                                <div className='CreateTaskInputContainer'>
                                    <input
                                        className='CreateTaskInput'
                                        placeholder='new task...'
                                        onFocus={function (event) {
                                            event.target.scrollIntoView();
                                        }}
                                        {...register("text")}
                                    />
                                </div>
                                <button className='CreateTaskButton' type='submit'>
                                    <BiPlus />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </NewTaskContext.Provider>
        </UserConfigContext.Provider>
    );
}

function SortByButton({ sortBy, setSortBy }) {
    let currentSortBy = sortIcons.find(function (item) {
        return item.sortBy === sortBy;
    });

    let nextIndex =
        (1 +
            sortIcons.findIndex(function (icon) {
                return sortBy === icon.sortBy;
            })) %
        sortIcons.length;

    let nextSortBy = sortIcons[nextIndex].sortBy;

    return (
        <button
            onClick={function () {
                setSortBy(nextSortBy);
            }}>
            {currentSortBy.icon}
        </button>
    );
}

export default Home;
