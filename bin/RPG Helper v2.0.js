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
		 * @param {string} [projectFile]
		 */
		constructor (projectFile) {
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
		 * 指定されたプロジェクトデータを読み込みます
		 * 
		 * @param {string} projectFile
		 * @return {Promise<void>}
		 */
		init (projectFile) {
			return fetch(projectFile, {
				headers: { "Content-Type": "application/json" }
			}).then(resp => {
				if (resp.status !== 200) throw new RPGHelperError(RPGHelper.ERRORS.LOAD["FAILURE-PROJECT"]);
				return resp.json();
			}).then(data => {
				this.data.projectField = data;

				/** プロジェクトのルートディレクトリ */
				this.rootDir = Utilizes.getRootDir(projectFile);
			});
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
		 * 指定された相対パスを絶対パスに変換します
		 * 
		 * @param {string} path
		 * @return {string}
		 */
		getAbsoluteUrl (path) {
			return new URL(this.rootDir + path).href;
		}

		_checkInitialized () {
			if (!this.initialized) throw new RPGHelperError(RPGHelper.ERRORS.GENERAL["NOT_INITIALIZED"]);
		}

		_applyStyleVariables () {

		}
	}

	/** BGM・SE等の音源を管理するクラス */
	class AudioManager {
		/** @param {RPGHelper} rpghelper */
		constructor (rpghelper) {
			this.rpghelper = rpghelper;
			this.ctx = new AudioContext();
			
			/** @type { { [audioType: string]: Map<string, AudioBuffer> } } */
			this.buffers = {
				[RPGHelper.LOADTYPE.BGM]: new Map(),
				[RPGHelper.LOADTYPE.SE]: new Map()
			};
		}

		/**
		 * 指定された音源のバッファを取得します
		 * 
		 * @param {string} audioType
		 * @param {string} file
		 * 
		 * @return {undefined | AudioBuffer}
		 */
		get (audioType, file) {
			const { rpghelper } = this;
			rpghelper._checkInitialized();

			return this.buffers[audioType].get(this._getFileUrl(audioType, file));
		}

		/**
		 * 指定された音源を読み込みます
		 * 
		 * @param {string} audioType
		 * @param {string} file
		 * 
		 * @return {Promise<AudioBuffer>}
		 */
		load (audioType, file) {
			const { rpghelper } = this;
			rpghelper._checkInitialized();

			file = this._getFileUrl(audioType, file);

			if (this.buffers[audioType].has(file)) {
				console.warn(new RPGHelperError(RPGHelper.ERRORS.LOAD["DUPLICATED-AUDIO"]));
				return Promise.resolve(this.buffers[audioType].get(file));
			}

			return fetch(file).then(resp => {
				if (resp.status !== 200) throw new RPGHelperError(RPGHelper.ERRORS.LOAD.NOT_FOUND);
				return resp.arrayBuffer();
			}).then(buffer => this.ctx.decodeAudioData(buffer)).catch(error => {
				if (error.constructor == RPGHelperError) throw error;
				throw new RPGHelperError(RPGHelper.ERRORS.AUDIO["FAILURE-COMPILE"]);
			}).then(decodedBuffer => {
				this.buffers[audioType].set(file, decodedBuffer);
				return decodedBuffer;
			});
		}

		/**
		 * 指定された音源を再生します
		 * 
		 * @param {string} audioType
		 * @param {string} file
		 */
		play (audioType, file) {
			const { rpghelper, ctx } = this;
			rpghelper._checkInitialized();

			const buffer = this.get(audioType, file);
			if (!buffer) throw new RPGHelperError(RPGHelper.ERRORS.AUDIO.NOT_LOADED);

			const source = ctx.createBufferSource();
			source.buffer = buffer;
			source; // ToDo: オプションと紐付けるために引数を全部変更

			source.connect(ctx.destination);
			source.start(0);
		}

		/**
		 * @param {string} audioType
		 * @param {string} file
		 * 
		 * @return {string}
		 */
		_getFileUrl (audioType, file) {
			const { rpghelper } = this;
			rpghelper._checkInitialized();

			if (!(audioType in this.buffers)) throw new RPGHelperError(RPGHelper.ERRORS.AUDIO["UNACCEPTED_TYPE"]);

			const { directories } = rpghelper.data.projectField;

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

			return file;
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
		GENERAL: {
			"NOT_INITIALIZED": "プロジェクトデータが読み込まれていません"
		},

		LOAD: {
			"NOT_FOUND": "ファイルが存在しません",
			"FAILURE": "ファイルの読込に失敗しました",
			"FAILURE-PROJECT": "プロジェクトデータの読込に失敗しました",
			"DUPLICATED": "既に存在するファイルです",
			"DUPLICATED-AUDIO": "既に読込済みの音源です"
		},
		
		AUDIO: {
			"NOT_LOADED": "音源が読み込まれていません",
			"UNACCEPTED_TYPE": "音源の種類が無効です",
			"FAILURE-COMPILE": "無効な音源ファイルです"
		}
	};

	Object.defineProperties(RPGHelper, {
		VERSION: { configurable: false, writable: false },
		EVENTTYPE: { configurable: false, writable: false },
		LOADTYPE: { configurable: false, writable: false },
		ERRORS: { configurable: false, writable: false }
	});



	return RPGHelper;
})();