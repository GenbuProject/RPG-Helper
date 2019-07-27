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
			this.audioManager = new AudioManager(this);

			this.data = {
				userField: null,
				projectField: null
			};

			if (projectFile) this.init(projectFile);
		}

		get canvas () { return document.getElementById("RPGHelper-Main") }
		get initialized () { return this.data.projectField ? true : false }

		/**
		 * プロジェクトデータを読み込みます
		 * 
		 * @param {string} projectFile
		 * @return {Promise<void>}
		 */
		init (projectFile) {
			return fetch(projectFile, {
				headers: { "Content-Type": "application/json" }
			}).then(resp => {
				if (resp.status !== 200) throw RPGHelper.ERRORS["LOAD_FAILURE--PROJECT"];
				return resp.json();
			}).then(data => this.data.projectField = data);
		}

		/**
		 * 指定されたイベントを登録します
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

		/**
		 * 相対パスを絶対パスに変換します
		 * 
		 * @param {string} path
		 * @return {string}
		 */
		getAbsoluteUrl (path) {
			return new URL(this.rootDir + path).href;
		}

		applyStyleVariables () {

		}
	}

	/** BGM・SE等の音源を管理するクラス */
	class AudioManager {
		/** @param {RPGHelper} rpghelper */
		constructor (rpghelper) {
			this.rpghelper = rpghelper;

			this.buffers = {
				[RPGHelper.LOADTYPE.BGM]: [],
				[RPGHelper.LOADTYPE.SE]: []
			};
		}

		/**
		 * 音源を読み込みます
		 * 
		 * @param {string} audioType
		 * @param {string} file
		 */
		load (audioType, file) {
			const { rpghelper } = this;
			if (!rpghelper.initialized) throw RPGHelper.ERRORS["GENERAL_NOT-INITIALIZED"];

			const { directories } = rpghelper.data.projectField;

			switch (audioType) {
				default: throw RPGHelper.ERRORS["AUDIO_UNACCEPTED-TYPE"];
				
				case RPGHelper.LOADTYPE.BGM:
				case RPGHelper.LOADTYPE.SE:
					break;
			}

			try {
				new URL(file); // fileが絶対パスかどうか判定
			} catch (error) {
				switch (audioType) {
					case RPGHelper.LOADTYPE.BGM:
						file = rpghelper.getAbsoluteUrl(`/${directories.bgm}/${file}`);
						break;
					case RPGHelper.LOADTYPE.SE:
						file = rpghelper.getAbsoluteUrl(`/${directories.se}/${file}`);
						break;
				}
			}

			fetch(file).then(resp => {
				if (resp.status !== 200) throw RPGHelper.ERRORS.LOAD_FAILURE;
				return resp.arrayBuffer();
			}).then(buffer => {
				buffer; // ToDo: Arrayベース、要素検索メソッドを持つクラス実装する
			});

			console.log(file);
		}
	}

	/** 小規模関数群 */
	class Utilizes {
		/**
		 * プロジェクトのルートディレクトリURLを取得します
		 * 
		 * @param {string} [projectPath] プロジェクトファイルのパス
		 * @return {string}
		 */
		static getRootDir (projectPath = "") {
			let docUrl = location.href;
			if (!docUrl.match(/[a-zA-Z:/.-_]+\/$/)) docUrl += "/";

			return new URL(docUrl + projectPath.split("/").slice(0, -1).join("/")).href;
		}
	}

	class RPGHelperError extends Error {
		constructor (message = "") {
			super(`<RPG Helper ${RPGHelper.VERSION}> ${message}`);
		}

		get name () { return "RPGHelperError" }
	}



	/** RPG Helperのバージョン */
	RPGHelper.VERSION = "v2.0";
	RPGHelper.EVENTTYPE = { INITIALIZED: "initialized" };
	RPGHelper.LOADTYPE = { PROJECT: "PROJECT", BGM: "BGM", SE: "SE" };

	RPGHelper.ERRORS = {
		"GENERAL_NOT-INITIALIZED": new RPGHelperError("プロジェクトデータが読み込まれていません"),
		"LOAD_FAILURE": new RPGHelperError("ファイルの読込に失敗しました"),
		"LOAD_FAILURE--PROJECT": new RPGHelperError("プロジェクトデータの読込に失敗しました"),
		"AUDIO_UNACCEPTED-TYPE": new RPGHelperError("音源の種類が無効です")
	};

	Object.defineProperties(RPGHelper, {
		VERSION: { configurable: false, writable: false },
		EVENTTYPE: { configurable: false, writable: false },
		LOADTYPE: { configurable: false, writable: false },
		ERRORS: { configurable: false, writable: false }
	});



	return RPGHelper;
})();