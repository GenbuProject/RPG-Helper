/*/
 *###########################################################################
 * RPG Helper v2.0
 * Copyright (C) Genbu Project 2016-2019  All Rights Reserved.
 *###########################################################################
/*/
const RPGHelper = (() => {
	class RPGHelper {
		/**
		 * RPG Helperを構築します
		 * @param {string} projectFile
		 */
		constructor (projectFile) {
			this.rootDir = Utilizes.getRootDir(projectFile);
			this.audioManager = new AudioManager();

			this.data = {
				userField: null,
				projectField: null
			};

			if (projectFile) this.init(projectFile);
		}

		get canvas () { return document.getElementById("RPGHelper-Main") }
		get initialized () { return this.data.projectField ? true : false }

		/**
		 * プロジェクトデータの読込を行います
		 * 
		 * @param {string} path
		 * @return {Promise}
		 */
		init (path) {
			return fetch(path, {
				headers: { "Content-Type": "application/json" }
			}).then(resp => {
				if (resp.status !== 200) throw RPGHelper.ERRORS["LOAD_FILE-FAILURE--PROJECT"];
				return resp.json();
			}).then(data => this.data.projectField = data);
		}

		/**
		 * イベントを登録します
		 * 
		 * @param {string} eventType
		 * @param { (RPGHelper) => {} } [callback]
		 * 
		 * @return {Promise<RPGHelper>}
		 */
		on (eventType, callback) {
			let detector;

			switch (eventType) {
				default:
					break;
				case RPGHelper.EVENTTYPE.INITIALIZED:
					return new Promise(resolve => {
						detector = setInterval(() => {
							if (this.initialized) {
								clearInterval(detector);

								if (callback) callback(this);
								resolve(this);
							}
						});
					});
			}
		}

		applyStyleVariables () {

		}
	}

	class Utilizes {
		/**
		 * プロジェクトのルートディレクトリURLを取得します
		 * 
		 * @param {string} projectPath プロジェクトファイルのパス
		 * @return {string}
		 */
		static getRootDir (projectPath) {
			let docUrl = location.href;
			if (!docUrl.match(/[a-zA-Z:/.-_]+\/$/)) docUrl += "/";

			return new URL(docUrl + projectPath.split("/").slice(0, -1).join("/")).href;
		}
	}

	class AudioManager {
		constructor () {
			this.buffers = [];
		}

		load (type, path) {
			switch (type) {
				case RPGHelper.LOADTYPE.BGM:
					break;
				case RPGHelper.LOADTYPE.SE:
					break;
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
	RPGHelper.EVENTTYPE = { INITIALIZED: "initialized" };
	RPGHelper.LOADTYPE = { PROJECT: "PROJECT", BGM: "BGM", SE: "SE" };

	RPGHelper.ERRORS = {
		"GENERAL_NOT_INITIALIZED": new RPGHelperError("プロジェクトデータが読み込まれていません"),
		"LOAD_FILE-FAILURE": new RPGHelperError("ファイルの読込に失敗しました"),
		"LOAD_FILE-FAILURE--PROJECT": new RPGHelperError("プロジェクトデータの読込に失敗しました")
	};

	Object.defineProperties(RPGHelper, {
		VERSION: { configurable: false, writable: false },
		EVENTTYPE: { configurable: false, writable: false },
		LOADTYPE: { configurable: false, writable: false },
		ERRORS: { configurable: false, writable: false }
	});



	return RPGHelper;
})();