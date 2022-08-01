import React from "react";
import ListTask from "./ListTask";
import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { Item } from "./Item";

export function SortableListTask(props) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: props.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: props.dragging ? 0.0 : 1,
    };

    // return (
    //     <Item ref={setNodeRef} style={style} {...attributes} {...listeners} {...props}>
    //         {props.id}
    //     </Item>
    // );

    // {...attributes} {...listeners}
    return <ListTask ref={setNodeRef} style={style} attributes={attributes} listeners={listeners} {...props}></ListTask>;
}
