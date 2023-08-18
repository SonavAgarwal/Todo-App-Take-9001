import {
	BiCalendarAlt,
	BiCategoryAlt,
	BiCheckSquare,
	BiMenu,
	BiPointer,
	BiTime,
} from "react-icons/bi";
import { TaskField } from "../../misc/types";

const sortIcons = [
	{ sortBy: TaskField.none, icon: <BiPointer /> },
	{ sortBy: TaskField.plate, icon: <BiCheckSquare /> },
	{ sortBy: TaskField.date, icon: <BiCalendarAlt /> },
	{ sortBy: TaskField.length, icon: <BiTime /> },
	{ sortBy: TaskField.tag, icon: <BiCategoryAlt /> },
	{ sortBy: TaskField.type, icon: <BiMenu /> },
	// { sortBy: TaskField.text, icon: <BiFontFamily /> },
];

export function SortByButton({
	sortBy,
	setSortBy,
}: {
	sortBy: TaskField;
	setSortBy: any;
}) {
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

	if (!currentSortBy) {
		return <div></div>;
	}

	return (
		<button
			onClick={function () {
				setSortBy(nextSortBy);
			}}
			tabIndex={-1}
		>
			{currentSortBy.icon}
		</button>
	);
}
