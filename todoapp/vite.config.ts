import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		VitePWA({
			registerType: "autoUpdate",
			devOptions: {
				enabled: true,
			},
			manifest: {
				short_name: "Todo",
				name: "Sisyphean Todo",
				start_url: ".",
				display: "standalone",
				theme_color: "#000000",
				background_color: "#ffffff",
				icons: [
					{
						src: "/icons/manifest-icon-192.maskable.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/icons/manifest-icon-192.maskable.png",
						sizes: "192x192",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/icons/manifest-icon-512.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any",
					},
					{
						src: "/icons/manifest-icon-512.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable",
					},
					{
						src: "/icons/manifest-icon-512-monochrome.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "any monochrome",
					},
					{
						src: "/icons/manifest-icon-512-monochrome.maskable.png",
						sizes: "512x512",
						type: "image/png",
						purpose: "maskable monochrome",
					},
				],
			},
		}),
	],
});
