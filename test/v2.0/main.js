/* global RPGHelper */
const rpg = new RPGHelper("../v1.4/SystemData.Json");
rpg.on("initialized").then(() => {
	console.log(rpg.data);
});