import React, { useCallback, useEffect, useState } from "react";
import { closestCenter, DndContext, DragOverlay, KeyboardSensor, MouseSensor, TouchSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";
import ListTask from "./ListTask";
import { SortableListTask } from "./SortableListTask";
import { Item } from "./Item";
import { updateTaskOrder } from "../firebase";
import { debounce } from "debounce";
import { typeOptions } from "../misc/options";

function TaskList({ tasks, order, sortBy }) {
    const [activeId, setActiveId] = useState(null);
    const [listOrder, setListOrder] = useState(order);
    const sensors = useSensors(
        // useSensor(KeyboardSensor, {
        //     coordinateGetter: sortableKeyboardCoordinates,
        // }),
        useSensor(MouseSensor),
        useSensor(TouchSensor)
    );

    useEffect(
        function () {
            setListOrder(order);
        },
        [order]
    );

    function saveOrder(newOrder) {
        // console.log(order);
        // console.log(newOrder);
        if (!newOrder) {
            console.log("returning 1");
            return;
        }
        if (
            isIterable(order) &&
            order.every(function (val, idx) {
                return val === newOrder[idx];
            })
        ) {
            console.log("returning");
            return;
        }
        console.log("save order");
        updateTaskOrder(newOrder);
    }

    // eslint-disable-next-line
    const saveOrderDebounced = useCallback(debounce(saveOrder, 2000), [order]);

    useEffect(
        function () {
            saveOrderDebounced(listOrder);
        },
        [listOrder]
    );

    function sortByDate() {
        let workingListOrder = [...listOrder];
        workingListOrder.sort(function (a, b) {
            let aDate = tasks[a]?.date?.toDate();
            let bDate = tasks[b]?.date?.toDate();
            if (!aDate) aDate = new Date(8640000000000000);
            if (!bDate) bDate = new Date(8640000000000000);
            return aDate - bDate;
        });
        setListOrder(workingListOrder);
    }

    function sortByLength() {
        let workingListOrder = [...listOrder];
        workingListOrder.sort(function (a, b) {
            return (tasks[a]?.length - tasks[b]?.length) * -1; // show longer tasks first
        });
        setListOrder(workingListOrder);
    }

    function sortByType() {
        let workingListOrder = [...listOrder];
        workingListOrder.sort(function (a, b) {
            let aInd = typeOptions.indexOf(tasks[a].type);
            let bInd = typeOptions.indexOf(tasks[b].type);
            return aInd - bInd;
        });
        setListOrder(workingListOrder);
    }

    function sortByAlphabetical(property) {
        let workingListOrder = [...listOrder];
        workingListOrder.sort(function (a, b) {
            let aProp = tasks[a][property];
            let bProp = tasks[b][property];
            if (!aProp) aProp = "π";
            if (!bProp) bProp = "π";
            return "".localeCompare.call(aProp, bProp);
            // return aProp.toString().localCompare(bProp.toString());
        });
        setListOrder(workingListOrder);
    }

    useEffect(
        function () {
            switch (sortBy) {
                case "none":
                    return;
                case "date":
                    sortByDate();
                    break;
                case "length":
                    sortByLength();
                    break;

                case "type":
                    sortByType();
                    break;
                default:
                    sortByAlphabetical(sortBy);
                    break;
            }
        },
        [sortBy]
    );

    function isIterable(input) {
        if (input === null || input === undefined) {
            return false;
        }

        return typeof input[Symbol.iterator] === "function";
    }

    if (!isIterable(listOrder)) return null;

    return (
        <div className='TaskList'>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={handleDragCancel}>
                <SortableContext items={listOrder} strategy={verticalListSortingStrategy}>
                    {listOrder?.map(function (taskId) {
                        return (
                            <SortableListTask task={tasks[taskId]} taskId={taskId} key={taskId} id={taskId} dragging={activeId === taskId} sortBy={sortBy} />
                        );
                    })}
                </SortableContext>
                <DragOverlay>{activeId ? <ListTask id={activeId} task={tasks[activeId]} taskId={activeId} sortBy={sortBy} /> : null}</DragOverlay>
                {/* todo add sorting */}
            </DndContext>
        </div>
    );

    function handleDragStart(event) {
        const { active } = event;

        setActiveId(active.id);
    }

    function handleDragEnd(event) {
        console.log(event);
        const { active, over } = event;

        if (active.id !== over.id) {
            setListOrder((listOrder) => {
                const oldIndex = listOrder.indexOf(active.id);
                const newIndex = listOrder.indexOf(over.id);

                return arrayMove(listOrder, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    }

    function handleDragCancel(event) {
        setActiveId(null); // todo open issue on github
    }
}

export default TaskList;
