namespace Item {
	export interface Item {
		id: number;
		type: "item" | "weapon" | "event";

		name: string;
		description: string;
		events: ItemEvent[];
		extra: WeaponExtra;
	}

	interface ItemEvent {
		event: "get" | "use" | "beforeDrop" | "drop" | "attack";
		callback (rpghelper: RPGHelper);
	}

	interface WeaponExtra {
		type: "sword" | "axe" | "bow" | "gun";
		parameters?: {
			ATK?: number | null;
			DEF?: number | null;
			MAG?: number | null;
			SPD?: number | null;
			LUK?: number | null;
		}
	}
}