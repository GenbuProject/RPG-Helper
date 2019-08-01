/*/
 *###########################################################################
 * RPG Helper v2.0
 * Copyright (C) Genbu Project 2016-2019  All Rights Reserved.
 *###########################################################################
/*/
const RPGHelper = (() => {
	const ERRORS = {
		GENERAL: {
			"NOT_INITIALIZED": "プロジェクトデータが読み込まれていません",

			/**
			 * @param {string} param
			 * @param {string | string[]} acceptableType
			 * 
			 * @return {string}
			 */
			"UNACCEPTED-PARAM": (param, acceptableType) => `'${param}' は ${Array.isArray(acceptableType) ? acceptableType.join(", ") : acceptableType} です`
		},

		LOAD: {
			"NOT_FOUND": "ファイルが存在しません",
			"FAILURE": "ファイルの読込に失敗しました",
			"FAILURE-PROJECT": "プロジェクトデータの読込に失敗しました",
			"DUPLICATED": "既に存在するファイルです",
			"DUPLICATED-AUDIO": "既に読込済みの音源です"
		},

		PROJECT: {
			"FAILURE-COMPILE": "無効なプロジェクトデータです"
		},
		
		AUDIO: {
			"NOT_LOADED": "音源が読み込まれていません",
			"UNACCEPTED_TYPE": "音源の種類が無効です",
			"FAILURE-COMPILE": "無効な音源ファイルです"
		}
	};


	
	class RPGHelper {
		/**
		 * RPG Helperを構築します
		 * @param {string} [projectFile]
		 */
		constructor (projectFile) {
			/** 音源関連の操作を扱うフィールド */
			this.audio = new AudioManager(this);

			this.data = {
				userField: null,

				/**
				 * プロジェクトデータの格納フィールド
				 * @type {Project}
				 */
				projectField: null
			};

			if (projectFile) this.init(projectFile);
		}

		get canvas () { return document.getElementById("RPGHelper-Main") }
		get initialized () { return (this.data.projectField && Project.isValid(this.data.projectField)) ? true : false }

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
				if (resp.status !== 200) throw new RPGHelperError(ERRORS.LOAD["FAILURE-PROJECT"]);
				return resp.json();
			}).then(data => {
				if (!Project.isValid(data)) throw new RPGHelperError(ERRORS.PROJECT["FAILURE-COMPILE"]);
				this.data.projectField = data;

				/** プロジェクトのルートディレクトリ */
				this.rootDir = Utilizes.getRootDir(projectFile);
			});
		}

		/**
		 * 指定されたイベントを登録します
		 * 
		 * @param {EventType} eventType
		 * @param { (rpghelper: RPGHelper) => {} } [callback]
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
			if (!this.initialized) throw new RPGHelperError(ERRORS.GENERAL["NOT_INITIALIZED"]);
		}

		_applyStyleVariables () {

		}
	}

	/** RPG Helperのバージョン */
	RPGHelper.VERSION = "v2.0";
	/** @typedef {"initialized"} EventType */
	RPGHelper.EVENTTYPE = { INITIALIZED: "initialized" };
	/** @typedef {"BGM" | "SE"} AudioType */
	RPGHelper.AUDIOTYPE = { BGM: "BGM", SE: "SE" };

	Object.defineProperties(RPGHelper, {
		VERSION: { configurable: false, writable: false },
		EVENTTYPE: { configurable: false, writable: false },
		AUDIOTYPE: { configurable: false, writable: false }
	});



	const AudioManager = (() => {
		/** BGM・SE等の音源を管理するクラス */
		class AudioManager {
			/** AudioBufferSourceNodeオプションの初期値 */
			static get defaultOptions () {
				return {
					[RPGHelper.AUDIOTYPE.BGM]: { loop: true },
					[RPGHelper.AUDIOTYPE.SE]: {  }
				};
			}



			/** @param {RPGHelper} rpghelper */
			constructor (rpghelper) {
				this.rpghelper = rpghelper;
				this.ctx = new AudioContext();
				
				/** @type {{ [audioType: string]: WeakMap<AudioObject, AudioBuffer> }} */
				this.buffers = {
					[RPGHelper.AUDIOTYPE.BGM]: new WeakMap(),
					[RPGHelper.AUDIOTYPE.SE]: new WeakMap()
				};

				/** @type {{ [audioType: string]: WeakMap<AudioObject, AudioBufferSourceNode> }} */
				this.ques = {
					[RPGHelper.AUDIOTYPE.BGM]: new WeakMap(),
					[RPGHelper.AUDIOTYPE.SE]: new WeakMap()
				};
			}

			/**
			 * 指定された音源を読み込みます
			 * 
			 * @param {AudioType} audioType
			 * @param {AudioObject} audio
			 * 
			 * @return {Promise<AudioBuffer>}
			 */
			load (audioType, audio) {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				if (!AudioObject.isValid(audio)) throw new RPGHelperError(ERRORS.GENERAL["UNACCEPTED-PARAM"]("audio", "AudioObject"));

				const url = this._getFileUrl(audioType, audio.file);

				if (this._hasBuffer(audioType, audio)) {
					console.warn(new RPGHelperError(ERRORS.LOAD["DUPLICATED-AUDIO"]));
					return Promise.resolve(this._getBuffer(audioType, audio));
				}

				return fetch(url).then(resp => {
					if (!resp.ok) throw new RPGHelperError(ERRORS.LOAD.NOT_FOUND);
					return resp.arrayBuffer();
				}).then(buffer => this.ctx.decodeAudioData(buffer)).catch(error => {
					if (error.constructor == RPGHelperError) throw error;
					throw new RPGHelperError(ERRORS.AUDIO["FAILURE-COMPILE"]);
				}).then(decodedBuffer => {
					this.buffers[audioType].set(audio, decodedBuffer);
					return decodedBuffer;
				});
			}

			/**
			 * プロジェクトに紐付けられた全ての音源を読み込みます
			 * @return {Promise<AudioBuffer[]>}
			 */
			loadAll () {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				const loading_ques = [];

				for (const audioType of [RPGHelper.AUDIOTYPE.BGM, RPGHelper.AUDIOTYPE.SE]) {
					const audios = rpghelper.data.projectField.resources.sounds[audioType.toLowerCase()];
					for (const audio of audios) loading_ques.push(this.load(audioType, audio));
				}

				return Promise.all(loading_ques);
			}

			/**
			 * 指定された音源を再生します
			 * 
			 * @param {AudioType} audioType
			 * @param {AudioObject | number} audioOrAudioId
			 */
			play (audioType, audioOrAudioId) {
				const { rpghelper, ctx } = this;
				rpghelper._checkInitialized();

				const buffer = this._getBuffer(audioType, audioOrAudioId);
				if (!buffer) throw new RPGHelperError(ERRORS.AUDIO.NOT_LOADED);

				if (typeof audioOrAudioId === "number") audioOrAudioId = this._getAudioById(audioType, audioOrAudioId);

				const defaultOptions = AudioManager.defaultOptions[audioType];

				const source = ctx.createBufferSource();
				source.buffer = buffer;

				for (const option in defaultOptions) source[option] = defaultOptions[option];
				for (const option in audioOrAudioId.options) source[option] = audioOrAudioId.options[option];
				
				switch (audioType) {
					case RPGHelper.AUDIOTYPE.BGM:
						this.stop(audioType, audioOrAudioId);
						break;
					case RPGHelper.AUDIOTYPE.SE:
						source.addEventListener("ended", () => this.ques[audioType].delete(audioOrAudioId));
						break;
				}

				this.ques[audioType].set(audioOrAudioId, source);

				source.connect(ctx.destination);
				source.start(0);
			}

			/**
			 * 指定された音源を停止します
			 * 
			 * @param {AudioType} audioType
			 * @param {AudioObject | number} audioOrAudioId
			 */
			stop (audioType, audioOrAudioId) {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				if (!this._hasQue(audioType, audioOrAudioId)) return;
				if (typeof audioOrAudioId === "number") audioOrAudioId = this._getAudioById(audioType, audioOrAudioId);

				this._getQue(audioType, audioOrAudioId).stop(0);
				this.ques[audioType].delete(audioOrAudioId);
			}
			
			/**
			 * @param {AudioType} audioType
			 * @param {AudioObject | number} audioOrAudioId
			 * 
			 * @return {boolean}
			 */
			_hasBuffer (audioType, audioOrAudioId) {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				if (typeof audioOrAudioId === "number") audioOrAudioId = this._getAudioById(audioType, audioOrAudioId);
				else if (!AudioObject.isValid(audioOrAudioId)) throw new RPGHelperError(ERRORS.GENERAL["UNACCEPTED-PARAM"]("audioOrAudioId", ["AudioObject", "Number"]));

				return audioOrAudioId === undefined ? false : this.buffers[audioType].has(audioOrAudioId);
			}

			/**
			 * @param {AudioType} audioType
			 * @param {AudioObject | number} audioOrAudioId
			 * 
			 * @return {null | AudioBuffer}
			 */
			_getBuffer (audioType, audioOrAudioId) {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				if (typeof audioOrAudioId === "number") audioOrAudioId = this._getAudioById(audioType, audioOrAudioId);
				else if (!AudioObject.isValid(audioOrAudioId)) throw new RPGHelperError(ERRORS.GENERAL["UNACCEPTED-PARAM"]("audioOrAudioId", ["AudioObject", "Number"]));

				return audioOrAudioId === undefined ? null : (this.buffers[audioType].get(audioOrAudioId) || null);
			}

			/**
			 * @param {AudioType} audioType
			 * @param {AudioObject | number} audioOrAudioId
			 * 
			 * @return {boolean}
			 */
			_hasQue (audioType, audioOrAudioId) {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				if (typeof audioOrAudioId === "number") audioOrAudioId = this._getAudioById(audioType, audioOrAudioId);
				else if (!AudioObject.isValid(audioOrAudioId)) throw new RPGHelperError(ERRORS.GENERAL["UNACCEPTED-PARAM"]("audioOrAudioId", ["AudioObject", "Number"]));

				return audioOrAudioId === undefined ? false : this.ques[audioType].has(audioOrAudioId);
			}

			/**
			 * @param {AudioType} audioType
			 * @param {AudioObject | number} audioOrAudioId
			 * 
			 * @return {null | AudioBufferSourceNode}
			 */
			_getQue (audioType, audioOrAudioId) {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				if (typeof audioOrAudioId === "number") audioOrAudioId = this._getAudioById(audioType, audioOrAudioId);
				else if (!AudioObject.isValid(audioOrAudioId)) throw new RPGHelperError(ERRORS.GENERAL["UNACCEPTED-PARAM"]("audioOrAudioId", ["AudioObject", "Number"]));

				return audioOrAudioId === undefined ? null : (this.ques[audioType].get(audioOrAudioId) || null);
			}

			/**
			 * @param {AudioType} audioType
			 * @param {number} id
			 * 
			 * @return {null | AudioObject}
			 */
			_getAudioById (audioType, id) {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				if (!(audioType in this.buffers)) throw new RPGHelperError(ERRORS.AUDIO["UNACCEPTED_TYPE"]);
				if (typeof id !== "number") throw new RPGHelperError(ERRORS.GENERAL["UNACCEPTED-PARAM"]("id", "Number"));

				return rpghelper.data.projectField.resources.sounds[audioType.toLowerCase()].find(audio => audio.id === id) || null;
			}

			/**
			 * @param {AudioType} audioType
			 * @param {string} file
			 * 
			 * @return {string}
			 */
			_getFileUrl (audioType, file) {
				const { rpghelper } = this;
				rpghelper._checkInitialized();

				if (!(audioType in this.buffers)) throw new RPGHelperError(ERRORS.AUDIO["UNACCEPTED_TYPE"]);

				const { directories } = rpghelper.data.projectField;

				try {
					new URL(file); // fileが絶対パスかどうか判定
				} catch (error) {
					switch (audioType) {
						case RPGHelper.AUDIOTYPE.BGM:
							file = rpghelper.getAbsoluteUrl(`/${directories.bgm}/${file}`);
							break;
						case RPGHelper.AUDIOTYPE.SE:
							file = rpghelper.getAbsoluteUrl(`/${directories.se}/${file}`);
							break;
					}
				}

				return file;
			}
		}

		return AudioManager;
	})();

	const GamedataManager = (() => {
		/** ゲームデータを管理するクラス */
		class GamedataManager {
			constructor (rpghelper) {
				this.rpghelper = rpghelper;
			}

			save (gamedataType, filename) {
				// ToDo: 書き出しタイプの実装(プレーンJson, バイナリデータ)
				return new Promise();
			}

			load (extensions) {
				return new Promise();
			}
		}

		return GamedataManager;
	})();

	class RPGHelperError extends Error {
		constructor (message = "") {
			super(`<RPG Helper ${RPGHelper.VERSION}> ${message}`);
		}

		get name () { return "RPGHelperError" }
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

		/**
		 * 指定されたオブジェクトの型を返します
		 * 
		 * @param {any} obj
		 * @return {string}
		 */
		static getClass (obj) { return Object.prototype.toString.call(obj).slice(8, -1) }
	}



	/**
	 * @typedef {object} Project
	 * 
	 * @prop {string} title
	 * @prop {string | number} version
	 * @prop {string} [author]
	 * 
	 * @prop {object} directories
	 * @prop {string} directories.bgm
	 * @prop {string} directories.se
	 * @prop {object} directories.world
	 * @prop {string} directories.world.maps
	 * @prop {string} directories.world.tiles
	 * 
	 * @prop {object} resources
	 * @prop {{ [imageName: string]: ImageObject }} resources.images
	 * @prop {object} resources.sounds
	 * @prop {AudioObject[]} resources.sounds.bgm
	 * @prop {AudioObject[]} resources.sounds.se
	 * @prop {Array} resources.videos
	 * 
	 * @prop {object} system
	 * @prop {object} system.world
	 * @prop {MapObject[]} system.world.maps
	 * @prop {TileObject[]} system.world.tiles
	 * @prop {object} [system.monster]
	 * @prop {string[]} system.monster.monsters
	 * @prop {string[]} system.monster.groups
	 * @prop {string[]} [system.items]
	 * @prop {string[]} [system.magics]
	 */
	class Project {
		/**
		 * @param {any} obj
		 * @return {boolean}
		 */
		static isValid (obj) {
			if (Utilizes.getClass(obj) !== "Object") return false;

			// {:Project}.*
			for (const _1stField of ["title", "version", "directories", "resources", "system"]) if (!(_1stField in obj)) return false;
			
			// {:Project}.directories.*
			for (const _2ndField of ["bgm", "se", "world"]) if (!(_2ndField in obj.directories)) return false;
			for (const _3ndField of ["maps", "tiles"]) if (!(_3ndField in obj.directories.world)) return false;

			// {:Project}.resources.*
			for (const _2ndField of ["images", "sounds", "videos"]) if (!(_2ndField in obj.resources)) return false;
			for (const _3ndField of ["bgm", "se"]) if (!(_3ndField in obj.resources.sounds)) return false;

			// {:Project}.system.*
			for (const _2ndField of ["world"]) if (!(_2ndField in obj.system)) return false;

			return true;
		}
	}

	/**
	 * @typedef {object} ImageObject
	 * @prop {string} name
	 * @prop {string} file
	 */
	class ImageObject {}

	/**
	 * @typedef {object} AudioObject
	 * 
	 * @prop {number} id
	 * @prop {string} file
	 * 
	 * @prop {object} [options]
	 * @prop {boolean} [options.loop]
	 * @prop {number} [options.loopStart]
	 * @prop {number} [options.loopEnd]
	 * @prop {number} [options.playbackRate]
	 */
	class AudioObject {
		/**
		 * @param {any} obj
		 * @return {boolean}
		 */
		static isValid (obj) { return Utilizes.getClass(obj) === "Object" && ["id", "file", "volume"].every(param => param in obj) }
	}

	/**
	 * @typedef {object} MapObject
	 * @prop {string} name
	 * @prop {string} file
	 * @prop {number} tileId
	 */
	class MapObject {}

	/**
	 * @typedef {object} TileObject
	 * @prop {string} name
	 * @prop {string} file
	 */
	class TileObject {}



	return RPGHelper;
})();