namespace Magic {
	export interface Magic {
		id: number;

		name: string;
		type: "fire" | "other";

		basicPower: number;
		range: -1 | 0 | number;
		cost: number | { hp?: number, mp?: number };
	}
}