/*/
 *######################################################################
 *#RPG Helper Alpha 1.3 [Last Updated: 2016/08/10]
 *#Copyright (C) Genbu Project & Genbu Hase 2016 All Rights Reversed.
 *######################################################################
/*/
var RPGHelper = function () {
	this.Canvas = document.getElementById("RPGHelper-Main");
		this.Canvas.style.width = this.Canvas.attributes["width"].value + "px";
		this.Canvas.style.height = this.Canvas.attributes["height"].value + "px";
		this.Canvas.style.position = "Relative";
		
	this.BGM = new Audio();
		this.BGM.type = "audio/*";
		this.BGM.loop = true;
		
	this.SE = new Audio();
		this.SE.type = "audio/*";
		this.SE.loop = false;
		
	/*/
	 *##################################################
	 *#【R】
	 *#レイアウトシステム定数
	 *##################################################
	/*/
	this.R = {
		COLOR: {
			BLACK: "Black",
			BLUE: "Blue",
			CYAN: "Cyan",
			GLAY: "Glay",
			GREEN: "Green",
			MAGENTA: "Magenta",
			ORANGE: "Orange",
			RED: "Red",
			WHITE: "White"
		},
		
		POS: {
			TOP: 0x0001,
			BOTTOM: 0x0002,
			CENTER: 0x0003
		},
		
		SPEED: {
			SLOW: 100,
			NORMAL: 80,
			FAST: 50
		},
		
		DIRECTION: {
			E: "East",
			W: "West",
			S: "South",
			N: "North"
		}
	}
	
	/*/
	 *##################################################
	 *#【Resource】
	 *#RPGのセーブデータの情報
	 *##################################################
	/*/
	Resource = {
		SystemData: {
			Audio: {
				BGM: {},
				SE: {},
				Util: {}
			}
		},
		
		UserData: {
			Character: []
		}
	}
	
	/*/
	 *##################################################
	 *#【Sound】
	 *#音源の操作を行うクラス
	 *##################################################
	/*/
	this.Sound = {
		BGM: this.BGM,
		SE: this.SE,
		
		/*/
		 *##################################################
		 *#【Load】
		 *#使用する音源を一斉読み込みする
		 *##################################################
		/*/
		Load: function () {
			for (var Key in Resource.SystemData.Audio.BGM) {
				this.PlaySE(Key, 0);
			}
			
			for (var Key in Resource.SystemData.Audio.SE) {
				this.PlaySE(Key, 0);
			}
		},
		
		/*/
		 *##################################################
		 *#【PlayBGM】
		 *#指定されたIDの音源をBGMとして鳴らす
		 *#
		 *#≪引数≫
		 *#ID : int型
		 *##################################################
		/*/
		PlayBGM: function (ID) {
			if (!this.BGM.paused) {
				try {
					this.BGM.pause();
					this.BGM.src = "Audio/null.wav";
				} catch (Error) {
					console.log(Error);
				}
			}
			
			for (var Key in Resource.SystemData.Audio.BGM) {
				if (Resource.SystemData.Audio.BGM[Key].ID == ID) {
					this.BGM.src = "Audio/" + Key;
					this.BGM.volume = Resource.SystemData.Audio.BGM[Key].Volume;
					
					this.BGM.play();
				}
			}
		},
		
		/*/
		 *##################################################
		 *#【StopBGM】
		 *#BGMを停止する
		 *##################################################
		/*/
		StopBGM: function () {
			try {
				this.BGM.pause();
				this.BGM.src = "Audio/null.wav";
			} catch (Error) {
				console.log(Error);
			}
		},
		
		/*/
		 *##################################################
		 *#【PlaySE】
		 *#指定されたIDの音源をSEとして鳴らす
		 *#
		 *#≪引数≫
		 *#ID : int型
		 *##################################################
		/*/
		PlaySE: function (ID) {
			if (typeof arguments[0] == "number") {
				for (var Key in Resource.SystemData.Audio.SE) {
					if (Resource.SystemData.Audio.SE[Key].ID == ID) {
						this.SE.src = "Audio/" + Key;
						this.SE.volume = Resource.SystemData.Audio.SE[Key].Volume;
						
						this.SE.play();
					}
				}
			} else if (typeof arguments[0] == "string") {
				this.SE.src = "Audio/" + ID;
				this.SE.volume = typeof arguments[1] == "number" ? arguments[1] : 1;
				
				this.SE.play();
			}
		}
	}
	
	/*/
	 *##################################################
	 *#【Save】
	 *#RPGのセーブデータを保存する
	 *#
	 *#≪引数≫
	 *#FileName : String型
	 *##################################################
	/*/
	this.Save = function (FileName) {
		var Data = new Blob([JSON.stringify(Resource.UserData, null, "\t")], {
			type: "Text/Plain"
		});
		
		if (window.navigator.msSaveBlob) {
			window.navigator.msSaveBlob(Data, FileName);
		} else {
			Link = document.createElement("A");
			Link.href = URL.createObjectURL(Data);
			Link.download = FileName;
			Link.target = "_blank";
			
			var Click = document.createEvent("MouseEvents");
				Click.initEvent("click", false, true);
				
			Link.dispatchEvent(Click);
			
			URL.revokeObjectURL(Data);
		}
	}
	
	/*/
	 *##################################################
	 *#【Load】
	 *#RPGのセーブデータを読み込む
	 *#Resource.UserData内に格納される
	 *#
	 *#≪引数≫
	 *#Extention : String型
	 *#LoadFuc : Function型
	 *##################################################
	/*/
	this.Load = function (Extention, LoadFuc) {
		var Reader = new FileReader();
		
		var Filer = document.createElement("Input");
			Filer.type = "File";
			Filer.accept = Extention;
			
			Filer.addEventListener("change", function (Event) {
				Reader.readAsText(Event.target.files[0]);
				
				Reader.onloadend = function () {
					Resource.UserData = JSON.parse(Reader.result);
					LoadFuc();
				}
			});
			
			var Click = document.createEvent("MouseEvents");
				Click.initEvent("click", false, true);
				
			Filer.dispatchEvent(Click);
	}
	
	/*/
	 *##################################################
	 *#【SystemLoad】
	 *#RPGのシステムデータを読み込む
	 *#Resource.SystemData内に格納される
	 *##################################################
	/*/
	this.SystemLoad = function () {
		var Loader = new XMLHttpRequest();
			Loader.open("GET", "SystemData.Json", false);
			Loader.send(null);
			
			Resource.SystemData = JSON.parse(Loader.responseText);
	}
	
	var CharaPos = [null, null];
	
	/*/
	 *##################################################
	 *#【Effect】
	 *#エフェクトの描画を行うクラス
	 *##################################################
	/*/
	this.Effect = {
		Canvas: this.Canvas,
		
		/*/
		 *##################################################
		 *#【BlackOut】
		 *#黒色へフェーズインする
		 *#
		 *#≪引数≫
		 *#Sec : int型
		 *#Delay : int型
		 *##################################################
		/*/
		BlackOut: function (Sec, Delay) {
			var Style = document.createElement("Style");
				Style.id = "RPGHelper-Effect";
				Style.innerHTML = "@keyframes BlackOut {0% {BackGround: Transparent;} 100% {BackGround: Black;}}";
				
				document.head.appendChild(Style);
				
			var Effecter = document.createElement("Canvas");
				Effecter.style.position = "Absolute";
				Effecter.style.width = this.Canvas.style.width;
				Effecter.style.height = this.Canvas.style.height;
				Effecter.style.animation = "BlackOut " + Sec + "s Ease " + Delay + "s 1 Normal";
				
				this.Canvas.appendChild(Effecter);
				
			setTimeout(function () {
				Effecter.parentElement.removeChild(Effecter);
				document.head.removeChild(Style);
			}, (Sec + Delay) * 1000);
			
			return Effecter;
		},
		
		/*/
		 *##################################################
		 *#【BlackOut】
		 *#黒色へフェーズインする
		 *#
		 *#≪引数≫
		 *#Sec : int型
		 *#Delay : int型
		 *##################################################
		/*/
		WhiteOut: function (Sec, Delay) {
			var Style = document.createElement("Style");
				Style.id = "RPGHelper-Effect";
				Style.innerHTML = "@keyframes WhiteOut {0% {BackGround: Transparent;} 100% {BackGround: White;}}";
				
				document.head.appendChild(Style);
				
			var Effecter = document.createElement("Canvas");
				Effecter.style.position = "Absolute";
				Effecter.style.width = this.Canvas.style.width;
				Effecter.style.height = this.Canvas.style.height;
				Effecter.style.animation = "WhiteOut " + Sec + "s Ease " + Delay + "s 1 Normal";
				
				this.Canvas.appendChild(Effecter);
				
			setTimeout(function () {
				Effecter.parentElement.removeChild(Effecter);
				document.head.removeChild(Style);
			}, (Sec + Delay) * 1000);
			
			return Effecter;
		},
		
		/*/
		 *##################################################
		 *#【BlackOut】
		 *#黒色へフェーズインする
		 *#
		 *#≪引数≫
		 *#Sec : int型
		 *#Delay : int型
		 *#Color : R.COLOR型 || String型
		 *##################################################
		/*/
		ColorOut: function (Sec, Delay, Color) {
			var Style = document.createElement("Style");
				Style.id = "RPGHelper-Effect";
				Style.innerHTML = "@keyframes BlackOut {0% {BackGround: " + Color + ";} 100% {BackGround: Transparent;}}";
				
				document.head.appendChild(Style);
				
			var Effecter = document.createElement("Canvas");
				Effecter.style.position = "Absolute";
				Effecter.style.width = this.Canvas.style.width;
				Effecter.style.height = this.Canvas.style.height;
				Effecter.style.animation = "BlackOut " + Sec + "s Ease " + Delay + "s 1 Normal";
				
				this.Canvas.appendChild(Effecter);
				
			setTimeout(function () {
				Effecter.parentElement.removeChild(Effecter);
				document.head.removeChild(Style);
			}, (Sec + Delay) * 1000);
			
			return Effecter;
		}
	}
	
	/*/
	 *##################################################
	 *#【Map】
	 *#マップ操作を行うクラス
	 *##################################################
	/*/
	this.Map = {
		Canvas: this.Canvas,
		
		/*/
		 *##################################################
		 *#【Show】
		 *#指定したIDのマップを表示する
		 *#
		 *#≪引数≫
		 *#ID : int型
		 *##################################################
		/*/
		Show: function (ID) {
			if (document.getElementById("Map")) {
				document.getElementById("Map").parentElement.removeChild(document.getElementById("Map"));
			}
			
			var TipData = null;
			var MapData = null;
			var TipImg = new Image();
			
			var TipLoader = new XMLHttpRequest();
				TipLoader.open("GET", "Tile/" + Resource.SystemData.Tile[Resource.SystemData.Map[ID].TileID], true);
				TipLoader.responseType = "arraybuffer";
				
				TipLoader.onload = function () {
					TipData = URL.createObjectURL(
						new Blob(
							[TipLoader.response],
							{type: "image/png"}
						)
					);
					
					TipImg.src = TipData;
				}
				
				TipLoader.send(null);
					
			var MapLoader = new XMLHttpRequest();
				MapLoader.open("GET", "Map/" + Resource.SystemData.Map[ID].MapFile, false);
				
				MapLoader.onload = function () {
					MapData = JSON.parse(MapLoader.responseText);
				}
				
				MapLoader.send(null);
				
			var MapCanvas = document.createElement("Canvas");
				MapCanvas.id = "Map";
				MapCanvas.width = this.Canvas.style.width.split("px")[0];
				MapCanvas.height = this.Canvas.style.height.split("px")[0];
				MapCanvas.style.position = "Absolute";
				
				this.Canvas.appendChild(MapCanvas);
				
			TipImg.onload = function () {
				var Ctx = MapCanvas.getContext("2d");
				
				for (var y = 0; y < MapData[0].length; y++) {
 					for (var x = 0; x < MapData[0][y].length; x++) {
 						if (MapData[0][y][x] != -1 && typeof MapData[0][y][x] == "number") {
 							Ctx.drawImage(TipImg, 16 * (MapData[0][y][x] % 8), 16 * (Math.floor(MapData[0][y][x] / 8)), 16, 16, 16 * x, 16 * y, 16, 16);
 						}
 					}
 				}
 				
				for (var y = 0; y < MapData[1].length; y++) {
					for (var x = 0; x < MapData[1][y].length; x++) {
						if (MapData[1][y][x] != -1 && typeof MapData[1][y][x] == "number") {
							Ctx.drawImage(TipImg, 16 * (MapData[1][y][x] % 8), 16 * (Math.floor(MapData[1][y][x] / 8)), 16, 16, 16 * x, 16 * y, 16, 16);
						}
					}
				}
				
				for (var y = 0; y < MapData[2].length; y++) {
					for (var x = 0; x < MapData[2][y].length; x++) {
						if (MapData[2][y][x] != -1 && typeof MapData[2][y][x] == "number") {
							Ctx.drawImage(TipImg, 16 * (MapData[2][y][x] % 8), 16 * (Math.floor(MapData[2][y][x] / 8)), 16, 16, 16 * x, 16 * y, 16, 16);
						}
					}
				}
				
				for (var EventID = 0; EventID < MapData[3].length; EventID++) {
					Ctx.drawImage(TipImg, 16 * (MapData[3][EventID]["TipID"] % 8), 16 * (Math.floor(MapData[3][EventID]["TipID"] / 8)), 16, 16, 16 * MapData[3][EventID]["Position"][0], 16 * MapData[3][EventID]["Position"][1], 16, 16);
				}
			}
			
			return MapCanvas;
		},
		
		/*/
		 *##################################################
		 *#【Hide】
		 *#マップを非表示にする
		 *##################################################
		/*/
		Hide: function () {
			if (document.getElementById("Map")) {
				document.getElementById("Map").parentElement.removeChild(document.getElementById("Map"));
			}
		}
	}
	
	/*/
	 *##################################################
	 *#【Sound】
	 *#キャラクターチップの操作を行うクラス
	 *##################################################
	/*/
	this.Character = {
		Canvas: this.Canvas,
		R: this.R,
		
		/*/
		 *##################################################
		 *#【Warp】
		 *#指定したIDのキャラクターを表示する
		 *#
		 *#≪引数≫
		 *#CharacterID : int型
		 *#Direction : R.DIRECTION型
		 *#Position : Array型
		 *#|=> [0] : int型
		 *#|=> [1] : int型
		 *##################################################
		/*/
		Warp: function (CharacterID, Direction, Position) {
			if (document.getElementById("Character")) {
				document.getElementById("Character").parentElement.removeChild(document.getElementById("Character"));
			}
			
			var CharaImg = new Image();
			
			var CharaLoader = new XMLHttpRequest();
				CharaLoader.open("GET", "CharacterTip/" + Resource.UserData.Character[CharacterID].CharacterTip, true);
				CharaLoader.responseType = "arraybuffer";
				
				CharaLoader.onload = function () {
					var Link = URL.createObjectURL(
						new Blob(
							[CharaLoader.response], 
							{"type": "image/png"}
						)
					);
					
					CharaImg.src = Link;
				}
				
				CharaLoader.send(null);
				
			var CharaCanvas = document.createElement("Canvas");
				CharaCanvas.id = "Character";
				CharaCanvas.width = this.Canvas.style.width.split("px")[0];
				CharaCanvas.height = this.Canvas.style.height.split("px")[0];
				CharaCanvas.style.position = "Absolute";
				
				this.Canvas.appendChild(CharaCanvas);
				
			CharaImg.onload = (function (R) {
				return function () {
					var Ctx = CharaCanvas.getContext("2d");
						Ctx.drawImage(CharaImg, 32, Direction == R.DIRECTION.E ? 96 : Direction == R.DIRECTION.W ? 48 : Direction == R.DIRECTION.S ? 0 : Direction == R.DIRECTION.N ? 144 : 0, 32, 48, 16 * Position[0], 16 * Position[1], 16, 32);
				}
			})(this.R);
			
			CharaPos = [Position[0], Position[1]];
		},
		
		/*/
		 *##################################################
		 *#【Hide】
		 *#キャラクターを非表示にする
		 *##################################################
		/*/
		Hide: function () {
			if (document.getElementById("Character")) {
				document.getElementById("Character").parentElement.removeChild(document.getElementById("Character"));
			}
		}
	}
	
	this.GamePad = {
		R: this.R,
		
		KeyboardType: function () {
			if (!sessionStorage.getItem("GamePad")) {
				document.removeEventListener("keydown", GamePad, false);
			}
			
			document.addEventListener("keydown", (function (Event, R) {
				return function GamePad() {
					switch (Event.keyCode) {
						case 38:
							Event.preventDefault();
							
							CharaPos[1]--;
							Character.Warp(0, R.DIRECTION.N, [CharaPos[0], CharaPos[1]]);
							
							break;
							
						case 40:
							Event.preventDefault();
							
							CharaPos[1]++;
							Character.Warp(0, R.DIRECTION.S, [CharaPos[0], CharaPos[1]]);
							
							break;
							
						case 37:
							Event.preventDefault();
							
							CharaPos[0]--;
							Character.Warp(0, R.DIRECTION.W, [CharaPos[0], CharaPos[1]]);
							
							break;
							
						case 39:
							Event.preventDefault();
							
							CharaPos[0]++;
							Character.Warp(0, R.DIRECTION.E, [CharaPos[0], CharaPos[1]]);
							
							break;
					}
				}
			})(this, this.R));
			
			sessionStorage.setItem("GamePad", "Keyboard");
		},
		
		Disable: function () {
			if (!sessionStorage.getItem("GamePad")) {
				document.removeEventListener("keydown", GamePad, false);
				sessionStorage.removeItem("GamePad");
			}
		}
	}
	
	/*/
	 *##################################################
	 *#【MsgBox】
	 *#メッセージダイアログを表示
	 *#
	 *#≪引数≫
	 *#Pos : R.POS型
	 *#Speed : R.SPEED型
	 *#Color : R.COLOR型
	 *#Content : String型
	 *#ClickFuc : Function型
	 *##################################################
	/*/
	this.MsgBox = function (Pos, Speed, Color, Content, ClickFuc) {
		var Dialog = document.createElement("RPGHelper-MsgBox");
			Dialog.style.position = "Absolute";
			Dialog.style.width = (this.Canvas.attributes["width"].value - 10) + "px";
			Dialog.style.color = Color;
			Dialog.Clicked = false;
			
			this.Canvas.appendChild(Dialog);
			
		switch (Pos) {
			case this.R.POS.TOP:
				Dialog.style.top = "0px";
				Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 4 - 5) + "px"; //【縦横500pxの時】500px / 4 - 5px[ボーダー幅] = 120px
				break;
				
			case this.R.POS.BOTTOM:
				Dialog.style.top = (this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 4)) + "px"; //【縦横500pxの時】500px - (500px / 4) = 500px - 125px = 375px
				Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 4 - 10) + "px"; //【縦横500pxの時】500px / 4 - 10px[ボーダー幅 * 2] = 115px
				break;
				
			case this.R.POS.CENTER:
				Dialog.style.top = ((this.Canvas.style.height.split("px")[0] / 2) - (this.Canvas.style.height.split("px")[0] / 4)) + "px"; //【縦横500pxの時】(500px / 2) - (500px - 2) = 250px - 125px = 125px
				Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 2 - 5) + "px"; //【縦横500pxの時】500px / 2 - 5 = 245px
				break;
		}
		
		if (typeof Content == "string") {
			var Counter = 0;
			
			Content = Content.replace(/\n/g, "<Br>");
			
			var Timer = setInterval(function () {
				if (Counter <= Content.length) {
					Dialog.innerHTML = Content.substr(0, Counter);
					Counter++;
				} else {
					clearInterval(Timer);
				}
			}, Speed);
		}
		
		Dialog.onclick = (function (Canvas, Sound) {
			return function () {
				this.Clicked = true;
				Canvas.removeChild(Dialog);
				
				Sound.PlaySE(Resource.SystemData.Audio.Util.Click, 1);
				ClickFuc();
			}
		})(this.Canvas, this.Sound);
		
		return Dialog;
	}
	
	this.Menu = {
		Canvas: this.Canvas,
		Sound: this.Sound,
		
		/*/
		 *##################################################
		 *#【MenuPanel】
		 *#メニュー画面を表示
		 *#
		 *#≪引数≫
		 *#Size : Array型
		 *#|=> [0] : String型(00 ～ 99, ^^)
		 *#|=> [1] : String型(00 ～ 99, ^^)
		 *##################################################
		/*/
		MenuPanel: function (Size) {
			var Dialog = document.createElement("RPGHelper-Menu-MenuPanel");
				Dialog.style.position = "Absolute";
				
				if (Size[0].substr(0, 1) != "^" && Size[1].substr(0, 1) != "^" && Size[0].substr(1, 1) != "^" && Size[1].substr(1, 1) != "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (Math.max(Size[0].substr(0, 1), Size[1].substr(0, 1)) - Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) - 5 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (Math.max(Size[0].substr(1, 1), Size[1].substr(1, 1)) - Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) - 5 + "px";
					Dialog.style.top = (this.Canvas.style.height.split("px")[0] / 10) * (Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) + "px";
					Dialog.style.left = (this.Canvas.style.width.split("px")[0] / 10) * (Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) + "px";
				} else if (Size[1].substr(0, 1) != "^" && Size[1].substr(1, 1) == "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (Math.max(Size[0].substr(0, 1), Size[1].substr(0, 1)) - Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) - 5 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) - 10 + "px";
					Dialog.style.top = this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) + "px";
					Dialog.style.left = (this.Canvas.style.width.split("px")[0] / 10) * (Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) + "px";
				} else if (Size[1].substr(0, 1) == "^" && Size[1].substr(1, 1) != "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) - 10 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (Math.max(Size[0].substr(1, 1), Size[1].substr(1, 1)) - Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) - 5 + "px";
					Dialog.style.top = (this.Canvas.style.height.split("px")[0] / 10) * (Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) + "px";
					Dialog.style.left = this.Canvas.style.width.split("px")[0] - (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) + "px";
				} else if (Size[1].substr(0, 1) == "^" && Size[1].substr(1, 1) == "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) - 10 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) - 10 + "px";
					Dialog.style.top = this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) + "px";
					Dialog.style.left = this.Canvas.style.width.split("px")[0] - (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) + "px";
				}
				
			this.Canvas.appendChild(Dialog);
			return Dialog;
		},
		
		/*/
		 *##################################################
		 *#【MenuItem】
		 *#メニュー画面用アイテムを表示
		 *#
		 *#≪引数≫
		 *#ParentPanel : Element型
		 *#Size : Array型
		 *#|=> [0] : String型(00 ～ 99, ^^)
		 *#|=> [1] : String型(00 ～ 99, ^^)
		 *#
		 *#Color : R.COLOR型
		 *#Content : String型
		 *#ClickFuc : Function型
		 *##################################################
		/*/
		MenuItem: function (ParentPanel, Size, Color, Content, ClickFuc) {
			var Dialog = document.createElement("RPGHelper-Menu-MenuItem");
				Dialog.style.position = "Absolute";
				Dialog.style.color = Color;
				Dialog.textContent = Content;
				
				if (Size[0].substr(0, 1) != "^" && Size[1].substr(0, 1) != "^" && Size[0].substr(1, 1) != "^" && Size[1].substr(1, 1) != "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (Math.max(Size[0].substr(0, 1), Size[1].substr(0, 1)) - Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) - 5 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (Math.max(Size[0].substr(1, 1), Size[1].substr(1, 1)) - Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) - 5 + "px";
					Dialog.style.top = (this.Canvas.style.height.split("px")[0] / 10) * (Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) + "px";
					Dialog.style.left = (this.Canvas.style.width.split("px")[0] / 10) * (Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) + "px";
				} else if (Size[1].substr(0, 1) != "^" && Size[1].substr(1, 1) == "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (Math.max(Size[0].substr(0, 1), Size[1].substr(0, 1)) - Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) - 5 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) - 10 + "px";
					Dialog.style.top = this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) + "px";
					Dialog.style.left = (this.Canvas.style.width.split("px")[0] / 10) * (Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) + "px";
				} else if (Size[1].substr(0, 1) == "^" && Size[1].substr(1, 1) != "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) - 10 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (Math.max(Size[0].substr(1, 1), Size[1].substr(1, 1)) - Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) - 5 + "px";
					Dialog.style.top = (this.Canvas.style.height.split("px")[0] / 10) * (Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) + "px";
					Dialog.style.left = this.Canvas.style.width.split("px")[0] - (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) + "px";
				} else if (Size[1].substr(0, 1) == "^" && Size[1].substr(1, 1) == "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) - 10 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) - 10 + "px";
					Dialog.style.top = this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) + "px";
					Dialog.style.left = this.Canvas.style.width.split("px")[0] - (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) + "px";
				}
				
				Dialog.onclick = (function (Sound) {
					return function () {
						Sound.PlaySE(Resource.SystemData.Audio.Util.Click, 1);
						ClickFuc();
					}
				})(this.Sound);
				
			ParentPanel.appendChild(Dialog);
			
			if (parseInt(Dialog.style.width.split("px")[0]) + parseInt(Dialog.parentElement.style.left.split("px")[0]) < parseInt(this.Canvas.style.width.split("px")[0] - 5)) {
			} else {
				Dialog.style.width = parseInt(Dialog.style.width.split("px")[0]) - 5 + "px";
			}
			
			return Dialog;
		},
		
		/*/
		 *##################################################
		 *#【MenuMsgBox】
		 *#メニュー画面用テキスト欄を表示
		 *#
		 *#≪引数≫
		 *#ParentPanel : Element型
		 *#Size : Array型
		 *#|=> [0] : String型(00 ～ 99, ^^)
		 *#|=> [1] : String型(00 ～ 99, ^^)
		 *#
		 *#Color : R.COLOR型
		 *#Content : String型
		 *##################################################
		/*/
		MenuMsgBox: function (ParentPanel, Size, Color, Content) {
			var Dialog = document.createElement("RPGHelper-Menu-MenuMsgBox");
				Dialog.style.position = "Absolute";
				Dialog.style.color = Color;
				Dialog.textContent = Content;
				
				if (Size[0].substr(0, 1) != "^" && Size[1].substr(0, 1) != "^" && Size[0].substr(1, 1) != "^" && Size[1].substr(1, 1) != "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (Math.max(Size[0].substr(0, 1), Size[1].substr(0, 1)) - Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) - 5 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (Math.max(Size[0].substr(1, 1), Size[1].substr(1, 1)) - Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) - 5 + "px";
					Dialog.style.top = (this.Canvas.style.height.split("px")[0] / 10) * (Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) + "px";
					Dialog.style.left = (this.Canvas.style.width.split("px")[0] / 10) * (Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) + "px";
				} else if (Size[1].substr(0, 1) != "^" && Size[1].substr(1, 1) == "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (Math.max(Size[0].substr(0, 1), Size[1].substr(0, 1)) - Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) - 5 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) - 10 + "px";
					Dialog.style.top = this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) + "px";
					Dialog.style.left = (this.Canvas.style.width.split("px")[0] / 10) * (Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) + "px";
				} else if (Size[1].substr(0, 1) == "^" && Size[1].substr(1, 1) != "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) - 10 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (Math.max(Size[0].substr(1, 1), Size[1].substr(1, 1)) - Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) - 5 + "px";
					Dialog.style.top = (this.Canvas.style.height.split("px")[0] / 10) * (Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) + "px";
					Dialog.style.left = this.Canvas.style.width.split("px")[0] - (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) + "px";
				} else if (Size[1].substr(0, 1) == "^" && Size[1].substr(1, 1) == "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) - 10 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) - 10 + "px";
					Dialog.style.top = this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) + "px";
					Dialog.style.left = this.Canvas.style.width.split("px")[0] - (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) + "px";
				}
				
			ParentPanel.appendChild(Dialog);
			
			if (parseInt(Dialog.style.width.split("px")[0]) + parseInt(Dialog.parentElement.style.left.split("px")[0]) < parseInt(this.Canvas.style.width.split("px")[0] - 5)) {
			} else {
				Dialog.style.width = parseInt(Dialog.style.width.split("px")[0]) - 5 + "px";
			}
			
			return Dialog;
		},
		
		/*/
		 *##################################################
		 *#【MenuTextArea】
		 *#メニュー画面用入力欄を表示
		 *#
		 *#≪引数≫
		 *#ParentPanel : Element型
		 *#Size : Array型
		 *#|=> [0] : String型(00 ～ 99, ^^)
		 *#|=> [1] : String型(00 ～ 99, ^^)
		 *#
		 *#Color : R.COLOR型
		 *#HintMsg : String型
		 *##################################################
		/*/
		MenuTextArea: function (ParentPanel, Size, Color, HintMsg) {
			var Dialog = document.createElement("TextArea");
				Dialog.setAttribute("Class", "RPGHelper-Menu-MenuTextArea");
				Dialog.style.position = "Absolute";
				Dialog.style.color = Color;
				
				Dialog.setAttribute("PlaceHolder", HintMsg);
				
				if (Size[0].substr(0, 1) != "^" && Size[1].substr(0, 1) != "^" && Size[0].substr(1, 1) != "^" && Size[1].substr(1, 1) != "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (Math.max(Size[0].substr(0, 1), Size[1].substr(0, 1)) - Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) - 7 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (Math.max(Size[0].substr(1, 1), Size[1].substr(1, 1)) - Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) - 5 + "px";
					Dialog.style.top = (this.Canvas.style.height.split("px")[0] / 10) * (Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) + "px";
					Dialog.style.left = (this.Canvas.style.width.split("px")[0] / 10) * (Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) + "px";
				} else if (Size[1].substr(0, 1) != "^" && Size[1].substr(1, 1) == "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (Math.max(Size[0].substr(0, 1), Size[1].substr(0, 1)) - Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) - 7 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) - 10 + "px";
					Dialog.style.top = this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) + "px";
					Dialog.style.left = (this.Canvas.style.width.split("px")[0] / 10) * (Math.min(Size[0].substr(0, 1), Size[1].substr(0, 1))) + "px";
				} else if (Size[1].substr(0, 1) == "^" && Size[1].substr(1, 1) != "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) - 12 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (Math.max(Size[0].substr(1, 1), Size[1].substr(1, 1)) - Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) - 5 + "px";
					Dialog.style.top = (this.Canvas.style.height.split("px")[0] / 10) * (Math.min(Size[0].substr(1, 1), Size[1].substr(1, 1))) + "px";
					Dialog.style.left = this.Canvas.style.width.split("px")[0] - (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) + "px";
				} else if (Size[1].substr(0, 1) == "^" && Size[1].substr(1, 1) == "^") {
					Dialog.style.width = (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) - 12 + "px";
					Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) - 10 + "px";
					Dialog.style.top = this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 10) * (10 - Size[0].substr(1, 1)) + "px";
					Dialog.style.left = this.Canvas.style.width.split("px")[0] - (this.Canvas.style.width.split("px")[0] / 10) * (10 - Size[0].substr(0, 1)) + "px";
				}
				
				if (navigator.userAgent.toLowerCase().indexOf("chrome") != -1) {
					Dialog.style.width = (Dialog.style.width.split("px")[0] - 2) + "px";
					Dialog.style.height = (Dialog.style.height.split("px")[0] - 4) + "px";
				}
				
				Dialog.style.maxWidth = Dialog.style.width;
				Dialog.style.minWidth = Dialog.style.width;
				Dialog.style.maxHeight = Dialog.style.height;
				Dialog.style.minHeight = Dialog.style.height;
				
			ParentPanel.appendChild(Dialog);
			
			if (parseInt(Dialog.style.width.split("px")[0]) + parseInt(Dialog.parentElement.style.left.split("px")[0]) < parseInt(this.Canvas.style.width.split("px")[0] - 5)) {
			} else {
				Dialog.style.width = parseInt(Dialog.style.width.split("px")[0]) - 5 + "px";
			}
			
			return Dialog;
		}
	}
	
	this.SystemLoad();
	this.Canvas.style.background = "URL('Image/" + Resource.SystemData.BackGround.Title + "')";
	
	if (Resource.SystemData.BackGround.Dialog != "" && !document.getElementById("RPGHelper-BackStyle")) {
		var BackStyle = document.createElement("Style");
			BackStyle.id = "RPGHelper-BackStyle";
			BackStyle.textContent = 'RPGHelper-MsgBox, RPGHelper-Menu-MenuPanel {\n\tBackGround: URL("Image/' + Resource.SystemData.BackGround.Dialog + '");\n}';
			
			document.head.appendChild(BackStyle);
	}
}
