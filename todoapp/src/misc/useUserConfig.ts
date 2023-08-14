import { dataCache } from "./cache";
import { UserConfigType } from "./types";
import { useListener } from "./useListener";

export function useUserConfig(): {
	userConfig: UserConfigType;
	loading: boolean;
	error: any;
} {
	const { loading, error } = useListener("config");

	const userConfig = dataCache.get("config");

	return { userConfig, loading, error };
}
