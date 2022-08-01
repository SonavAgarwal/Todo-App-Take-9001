import React, { forwardRef } from "react";

export const Item = forwardRef(({ id, ...props }, ref) => {
    // console.log("here");
    // console.log(props.taskId);
    return (
        <div {...props} ref={ref}>
            {id}
            {props.taskId}
        </div>
    );
});
