/*/
 *###########################################################################
 * RPG Helper v2.0
 * Copyright (C) Genbu Project 2016-2019  All Rights Reserved.
 *###########################################################################
/*/
const RPGHelper = (() => {
	class RPGHelper {
		constructor (projectFile) {
			this.data = {};

			if (projectFile) this.load(RPGHelper.LOADTYPE.PROJECT, projectFile);
		}

		get canvas () { return document.getElementById("RPGHelper-Main") }
		get loaded () { return; }

		on (eventType, callback) {
			let detector;

			switch (eventType) {
				default:
					break;
				case RPGHelper.EVENTTYPE.LOADED:
					return new Promise(resolve => {
						detector = setInterval(() => {
							if (this.loaded) {
								clearInterval(detector);

								if (callback) callback(this);
								resolve(this);
							}
						});
					});
			}
		}

		load (type, path) {
			switch (type) {
				case RPGHelper.LOADTYPE.PROJECT:
					return fetch(path, { headers: { "Content-Type": "application/json" } }).then(resp => {
						if (resp.status !== 200) throw RPGHelper.ERRORS["LOAD_FILE-FAILURE--PROJECT"];
						return resp.json();
					}).then(data => this.data.projectData = data);
					
				case RPGHelper.LOADTYPE.BGM:
					return;
				case RPGHelper.LOADTYPE.SE:
					return;
			}
		}
	}

	class RPGHelperError extends Error {
		constructor (message = "") {
			super(`<RPG Helper ${RPGHelper.VERSION}> ${message}`);
		}

		get name () { return "RPGHelperError" }
	}



	RPGHelper.VERSION = "v2.0";
	RPGHelper.EVENTTYPE = { LOADED: "loaded" };
	RPGHelper.LOADTYPE = { PROJECT: "PROJECT", BGM: "BGM", SE: "SE" };

	RPGHelper.ERRORS = {
		"LOAD_FILE-FAILURE": new RPGHelperError("ファイルの読込に失敗しました"),
		"LOAD_FILE-FAILURE--PROJECT": new RPGHelperError("プロジェクトデータの読込に失敗しました")
	};

	Object.defineProperties(RPGHelper, {
		VERSION: { configurable: false, writable: false },
		EVENTTYPE: { configurable: false, writable: false },
		LOADTYPE: { configurable: false, writable: false }
	});


	return RPGHelper;
})();