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
		},

		SAVEDATA: {
			"UNACCEPTED_TYPE": "セーブデータの保存形式が無効です",
			"FAILURE-COMPILE": "セーブデータの読込に失敗しました。セーブデータが破損している可能性があります。",
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
			/** セーブデータの操作を扱うフィールド */
			this.savedata = new SavedataManager(this);

			this.data = {
				/** ゲームの進捗状況などの格納フィールド */
				userField: {},

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
	/** @typedef {"BINARY" | "JSON"} SavedataType */
	RPGHelper.SAVEDATA_TYPE = { BINARY: "BINARY", JSON: "JSON" };

	Object.defineProperties(RPGHelper, {
		VERSION: { configurable: false, writable: false },
		EVENTTYPE: { configurable: false, writable: false },
		AUDIOTYPE: { configurable: false, writable: false },
		SAVEDATA_TYPE: { configurable: false, writable: false }
	});



	const AudioManager = (() => {
		/** BGM・SE等の音源を管理するクラス */
		class AudioManager {
			/** @param {RPGHelper} rpghelper */
			constructor (rpghelper) {
				this._rpghelper = rpghelper;
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
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

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
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

				const loading_ques = [];

				for (const audioType of [RPGHelper.AUDIOTYPE.BGM, RPGHelper.AUDIOTYPE.SE]) {
					const audios = _rpghelper.data.projectField.resources.sounds[audioType.toLowerCase()];
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
				const { _rpghelper, ctx } = this;
				_rpghelper._checkInitialized();

				const buffer = this._getBuffer(audioType, audioOrAudioId);
				if (!buffer) throw new RPGHelperError(ERRORS.AUDIO.NOT_LOADED);

				if (typeof audioOrAudioId === "number") audioOrAudioId = this._getAudioById(audioType, audioOrAudioId);

				const defaultOptions = AudioManager.DEFAULT_OPTIONS[audioType];

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
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

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
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

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
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

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
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

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
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

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
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

				if (!(audioType in this.buffers)) throw new RPGHelperError(ERRORS.AUDIO["UNACCEPTED_TYPE"]);
				if (typeof id !== "number") throw new RPGHelperError(ERRORS.GENERAL["UNACCEPTED-PARAM"]("id", "Number"));

				return _rpghelper.data.projectField.resources.sounds[audioType.toLowerCase()].find(audio => audio.id === id) || null;
			}

			/**
			 * @param {AudioType} audioType
			 * @param {string} file
			 * 
			 * @return {string}
			 */
			_getFileUrl (audioType, file) {
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

				if (!(audioType in this.buffers)) throw new RPGHelperError(ERRORS.AUDIO["UNACCEPTED_TYPE"]);

				const { directories } = _rpghelper.data.projectField;

				try {
					new URL(file); // fileが絶対パスかどうか判定
				} catch (error) {
					switch (audioType) {
						case RPGHelper.AUDIOTYPE.BGM:
							file = _rpghelper.getAbsoluteUrl(`/${directories.bgm}/${file}`);
							break;
						case RPGHelper.AUDIOTYPE.SE:
							file = _rpghelper.getAbsoluteUrl(`/${directories.se}/${file}`);
							break;
					}
				}

				return file;
			}
		}

		/** AudioBufferSourceNodeオプションの初期値 */
		AudioManager.DEFAULT_OPTIONS = {
			[RPGHelper.AUDIOTYPE.BGM]: { loop: true },
			[RPGHelper.AUDIOTYPE.SE]: {  }
		};

		Object.defineProperties(AudioManager, {
			DEFAULT_OPTIONS: { configurable: false, writable: false }
		});



		return AudioManager;
	})();

	const SavedataManager = (() => {
		/** セーブデータを管理するクラス */
		class SavedataManager {
			/** @param {RPGHelper} rpghelper */
			constructor (rpghelper) {
				this._rpghelper = rpghelper;
			}

			get storageIdPrefix () {
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

				return `${_rpghelper.data.projectField.id}_gamedata`;
			}

			get defaultFilename () {
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

				return `${_rpghelper.data.projectField.id}_${new DateFormatter("YYYYMMDD-hhmmss").format(new Date())}.sav`;
			}

			get defaultFileExtensions () { return [".sav"] }

			/**
			 * ゲームの進捗状況をLocalStorage内に保存します
			 * @param {number} [slotId]
			 */
			save (slotId) {
				const { _rpghelper } = this;
				localStorage.setItem(this._getStorageId(slotId), JSON.stringify(_rpghelper.data.userField ? _rpghelper.data.userField : {}));
			}

			/**
			 * ゲームの進捗状況をLocalStorageから読み込みます
			 * 
			 * @param {number} [slotId]
			 * @return {object}
			 */
			load (slotId) {
				const rawGamedata = localStorage.getItem(this._getStorageId(slotId));

				try {
					return rawGamedata ? JSON.parse(rawGamedata) : {};
				} catch (error) {
					throw new RPGHelperError(ERRORS.SAVEDATA["FAILURE-COMPILE"]);
				}
			}

			/**
			 * LocalStorage内のセーブデータを消去します
			 * @param {number} [slotId]
			 */
			delete (slotId) { localStorage.removeItem(this._getStorageId(slotId)) }

			/**
			 * ゲームの進捗状況をファイルに書き出します
			 * 
			 * @param {SavedataType} savedataType
			 * @param {string} [filename]
			 */
			export (savedataType, filename = this.defaultFilename) {
				// ToDo: 書き出しタイプの実装(プレーンJson, バイナリデータ)
				const { _rpghelper } = this;
				_rpghelper._checkInitialized();

				let blob = null;
				switch (savedataType) {
					default:
						throw new RPGHelperError(ERRORS.SAVEDATA.UNACCEPTED_TYPE);
					case RPGHelper.SAVEDATA_TYPE.JSON:
						blob = new Blob(
							[ JSON.stringify(_rpghelper.data.userField ? _rpghelper.data.userField : {}) ],
							{ type: "application/json" }
						);

						break;
					case RPGHelper.SAVEDATA_TYPE.BINARY:
						break;
				}

				const dispatcher = document.createEvent("MouseEvent");
				dispatcher.initEvent("click", false, true);

				const link = document.createElement("a");
				link.href = URL.createObjectURL(blob),
				link.download = filename,
				link.target = "_blank";
				
				link.dispatchEvent(dispatcher);
				URL.revokeObjectURL(link.href);
			}

			/**
			 * ゲームの進捗状況をファイルから読み込みます
			 * @param {string[]} extensions
			 */
			import (extensions = this.defaultFileExtensions) {
				const dispatcher = document.createEvent("MouseEvent");
				dispatcher.initEvent("click", false, true);

				const filePicker = document.createElement("input");
				filePicker.type = "file";
				filePicker.accept = extensions.join(",");

				filePicker.addEventListener("change", e => {
					new Promise(resolve => {
						const reader = new FileReader();
						reader.addEventListener("load", () => resolve(reader.result));
						
						reader.readAsArrayBuffer(e.target.files[0]);
					}).then(
						/** @param {ArrayBuffer} buffer */
						buffer => {
							const bufferArray = new Int8Array(buffer);
							
							let text = "";
							for (const buf of bufferArray) text += String.fromCharCode(buf);

							console.log(bufferArray);
							console.log(text);
						}
					);
				});

				filePicker.dispatchEvent(dispatcher);
			}



			/**
			 * @param {number} [slotId]
			 * @return {string}
			 */
			_getStorageId (slotId) {
				let storageId = this.storageIdPrefix;

				if (slotId != undefined) {
					if (typeof slotId !== "number") throw new RPGHelper(ERRORS.GENERAL["UNACCEPTED-PARAM"]("slotId", "Number"));
					storageId += `-${slotId}`;
				}

				return storageId;
			}
		}

		return SavedataManager;
	})();

	class RPGHelperError extends Error {
		constructor (message = "") {
			super(`<RPG Helper ${RPGHelper.VERSION}> ${message}`);
		}

		get name () { return "RPGHelperError" }
	}

	/** 日付フォーマットを扱うクラス */
	class DateFormatter {
		/** @param {string} dateFormat */
		constructor (dateFormat) {
			/**
			 * 日付の書式
			 * - 書式例 … `YYYY/MM/DD hh:mm:ss`
			 * - 利用可能な定数(日付例: `2019/07/30 13:05:00`)
			 *   - **年(Year)** = `YYYY` | `YY`
			 *     - ex: 2019(`YYYY`) | 19(`YY`)
			 *   - **月(Month)** = `MM` | `M`
			 *     - ex: 07(`MM`) | 7(`M`)
			 *   - **日(Day)** = `DD` | `D`
			 *     - ex: 30(`DD` | `D`)
			 *   - **時(Hours)** = `hh` | `h`
			 *     - ex: 13(`hh` | `h`)
			 *   - **分(Minutes)** = `mm` | `m`
			 *     - ex: 05(`mm`) | 5(`m`)
			 *   - **秒(Seconds)** = `ss` | `s`
			 *     - ex: 00(`ss`) | 0(`s`)
			 * 
			 * @type {string}
			 */
			this.dateFormat = dateFormat;
		}

		/**
		 * 指定されたDateオブジェクトをフォーマットします
		 * 
		 * @param {Date} date
		 * @return {string}
		 */
		format (date) {
			const [ year, month, day, hours, minutes, seconds ] = [ date.getFullYear(), date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds() ];
			
			const SYMBOLS = {
				"YYYY": year, "YY": year.toString().slice(-2),
				"MM": `0${month}`.slice(-2), "M": month,
				"DD": `0${day}`.slice(-2), "D": day,
				"hh": `0${hours}`.slice(-2), "h": hours,
				"mm": `0${minutes}`.slice(-2), "m": minutes,
				"ss": `0${seconds}`.slice(-2), "s": seconds
			};

			return this.dateFormat.replace(new RegExp(`(${Object.keys(SYMBOLS).join("|")})`, "g"), expression => SYMBOLS[expression]);
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
	 * @prop {string} id
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
		 * @param {Project} obj
		 * @return {boolean}
		 */
		static isValid (obj) {
			if (Utilizes.getClass(obj) !== "Object") return false;

			// {:Project}.*
			for (const _1stField of ["id", "title", "version", "directories", "resources", "system"]) if (!(_1stField in obj)) return false;

			// {:Project}.directories.*
			for (const _2ndField of ["bgm", "se", "world"]) if (!(_2ndField in obj.directories)) return false;
			for (const _3ndField of ["maps", "tiles"]) if (!(_3ndField in obj.directories.world)) return false;

			// {:Project}.resources.*
			for (const _2ndField of ["images", "sounds", "videos"]) if (!(_2ndField in obj.resources)) return false;
			for (const _3ndField of ["bgm", "se"]) if (!(_3ndField in obj.resources.sounds)) return false;

			// {:Project}.system.*
			for (const _2ndField of ["world"]) if (!(_2ndField in obj.system)) return false;

			if (obj.id.match(/[^a-zA-Z0-9-]/g)) return false;

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
		 * @param {AudioObject} obj
		 * @return {boolean}
		 */
		static isValid (obj) { return Utilizes.getClass(obj) === "Object" && ["id", "file"].every(param => param in obj) }
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