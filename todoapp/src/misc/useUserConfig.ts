import { configCache, taskListCache } from "./cache";
import { UserConfigType } from "./types";
import { useListener } from "./useListener";

export function useUserConfig(): {
	userConfig: UserConfigType;
} {
	useListener("config");

	const userConfig = configCache.get("config");

	return { userConfig };
}
