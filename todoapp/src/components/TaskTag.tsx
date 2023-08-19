import { typeTimeMatters, typeToSymbol } from "../misc/options.ts";
import { TaskField } from "../misc/types.ts";
import { useTask } from "../misc/useTask.ts";
import DateTag from "./TagComponents/DateTag.tsx";
import TextTag from "./TagComponents/TextTag.tsx";
import TimeTag from "./TagComponents/TimeTag.tsx";

interface Props {
	taskListID: string;
	taskID: string;
	tagType: TaskField;
	dragging: boolean;
}

function TaskTag({ taskListID, taskID, tagType, dragging }: Props) {
	const { task } = useTask(taskListID, taskID);

	if (!task) return null;

	if (tagType === TaskField.tag) {
		return (
			<TextTag
				taskListID={taskListID}
				taskID={taskID}
				dragging={dragging}
			></TextTag>
		);
	}

	if (tagType === TaskField.date && task.date) {
		return <DateTag taskListID={taskListID} taskID={taskID}></DateTag>;
	}

	if (tagType === TaskField.type && typeToSymbol(task.type)) {
		return <div className="ListTaskTag TypeTag">{typeToSymbol(task.type)}</div>;
	}

	if (tagType === TaskField.link && task.link) {
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

	if (tagType === TaskField.length && typeTimeMatters(task.type)) {
		return (
			<TimeTag
				taskListID={taskListID}
				taskID={taskID}
				shouldClose={dragging}
			></TimeTag>
		);
	}

	return null;
}

export default TaskTag;
