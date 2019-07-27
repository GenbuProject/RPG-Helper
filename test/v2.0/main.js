/* global RPGHelper */
const rpg = new RPGHelper("./system/project.json");
rpg.on("initialized").then(() => {
	console.log(rpg);
});