import React from "react";
import { motion } from "framer-motion";

const animationProperties = {
	initial: {
		pathLength: 0,
		// pathOffset: 1,
	},
	animate: {
		pathLength: 1,
		// pathOffset: 0,
	},
	transition: {
		duration: 2,
	},
};

function NoTasksSvg() {
	return (
		<motion.svg
			xmlns="http://www.w3.org/2000/svg"
			xmlSpace="preserve"
			style={{
				fillRule: "evenodd",
				clipRule: "evenodd",
				strokeLinecap: "round",
				strokeLinejoin: "round",
				strokeMiterlimit: 1.5,
			}}
			// viewBox="0 0 1200 1200"
			width={300}
			height={300}
		>
			<motion.path
				{...animationProperties}
				d="m135.998 114.84 54.995 8.508-6.215 13.392-72.177-11.166 13.026-28.069 17.183 2.658-6.812 14.677Z"
				style={{
					fill: "none",
					stroke: "#231f20",
					strokeWidth: "4.17px",
				}}
			/>
			<motion.path
				{...animationProperties}
				d="M188.619 49.444c-8.885-5.13-22.346-5.688-30.04-1.245L19.707 128.376c-7.695 4.443-6.728 12.214 2.157 17.344l89.517 51.683c8.885 5.13 22.346 5.688 30.04 1.245l138.872-80.177c7.695-4.443 6.728-12.214-2.157-17.344l-89.517-51.683Z"
				style={{
					fill: "none",
					stroke: "#231f20",
					strokeWidth: "4.17px",
				}}
			/>
			<motion.path
				{...animationProperties}
				d="M21.124 145.276c.24.15.487.298.74.444l89.517 51.683c8.885 5.13 22.346 5.688 30.04 1.245l137.455-79.359c8.193 5.125 8.893 12.583 1.417 16.899l-138.872 80.178c-7.694 4.442-21.155 3.884-30.04-1.245l-89.517-51.683c-8.885-5.13-9.852-12.901-2.157-17.344l1.417-.818Z"
				style={{
					fill: "none",
					stroke: "#231f20",
					strokeWidth: "4.17px",
				}}
			/>
			<motion.path
				{...animationProperties}
				d="M21.124 162.993c.24.151.487.299.74.445l89.517 51.683c8.885 5.129 22.346 5.687 30.04 1.245l137.455-79.359c8.193 5.125 8.893 12.583 1.417 16.899l-138.872 80.177c-7.694 4.443-21.155 3.885-30.04-1.245l-89.517-51.682c-8.885-5.13-9.852-12.902-2.157-17.344l1.417-.819Z"
				style={{
					fill: "none",
					stroke: "#231f20",
					strokeWidth: "4.17px",
				}}
			/>
			<motion.path
				{...animationProperties}
				d="M21.124 180.711c.24.15.487.299.74.445l89.517 51.682c8.885 5.13 22.346 5.688 30.04 1.245l137.455-79.359c8.193 5.125 8.893 12.584 1.417 16.9l-138.872 80.177c-7.694 4.443-21.155 3.885-30.04-1.245l-89.517-51.683c-8.885-5.13-9.852-12.901-2.157-17.344l1.417-.818Z"
				style={{
					fill: "none",
					stroke: "#231f20",
					strokeWidth: "4.17px",
				}}
			/>
		</motion.svg>
	);
}

export default NoTasksSvg;
