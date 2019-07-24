return {
	"id": 120,
	"type": "weapon",

	"name": "ヒーリングソード",
	"description": "持っているだけで癒される、不思議な効果を持った剣。",

	"events": [
		{
			event: "use",
			callback: () => {

			}
		}
	],

	"extra": {
		"type": "sword",
		"parameters": {
			"ATK": +15,
			"DEF": +2,
			"MAG": 0,
			"SPD": 0,
			"LUK": 0
		}
	}
}