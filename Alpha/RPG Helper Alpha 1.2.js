/*/
 *######################################################################
 *#RPG Helper Alpha 1.2 [Last Updated: 2016/08/05]
 *#Copyright (C) Genbu Project & Genbu Hase 2016 All Rights Reversed.
 *######################################################################
/*/
var RPGHelper = function () {
	this.Canvas = document.getElementById("RPGHelper-Main");
		this.Canvas.style.width = this.Canvas.attributes["width"].value + "px";
		this.Canvas.style.height = this.Canvas.attributes["height"].value + "px";
		this.Canvas.style.position = "Relative";
		
	this.BGM = new Audio();
		this.BGM.loop = true;
		
	this.SE = new Audio();
		this.SE.loop = false;
		
	/*/
	 *##################################################
	 *#>>R<<
	 *#レイアウトシステム定数
	 *##################################################
	/*/
	this.R = {
		SPEED: {
			SLOW: 100,
			NORMAL: 80,
			FAST: 50
		},
		
		POS: {
			TOP: 0x0001,
			BOTTOM: 0x0002,
			CENTER: 0x0003
		}
	}
	
	/*/
	 *##################################################
	 *#>>Resource<<
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
		
		UserData: {}
	}
	
	/*/
	 *##################################################
	 *#>>Sound<<
	 *#音源の操作を行うクラス
	 *##################################################
	/*/
	this.Sound = {
		BGM: this.BGM,
		SE: this.SE,
		
		Load: function () {
			for (var Key in Resource.SystemData.Audio.BGM) {
				this.PlaySE(Key, 0);
			}
			
			for (var Key in Resource.SystemData.Audio.SE) {
				this.PlaySE(Key, 0);
			}
		},
		
		PlayBGM: function (ID) {
			if (!this.BGM.paused) {
				this.BGM.pause();
				this.BGM.currentTime = 0;
				this.BGM.src = "";
			}
			
			for (var Key in Resource.SystemData.Audio.BGM) {
				if (Resource.SystemData.Audio.BGM[Key].ID == ID) {
					this.BGM.src = "Audio/" + Key;
					this.BGM.volume = Resource.SystemData.Audio.BGM[Key].Volume;
					
					this.BGM.play();
				}
			}
		},
		
		StopBGM: function () {
			this.BGM.pause();
			this.BGM.currentTime = 0;
			this.BGM.src = "";
		},
		
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
	 *#>>Save<<
	 *#RPGのセーブデータを保存する
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
	 *#>>Load<<
	 *#RPGのセーブデータを読み込む
	 *#Resource.UserData内に格納される
	 *#
	 *#>>引数<<
	 *#LoadFuc : Function型
	 *##################################################
	/*/
	this.Load = function (LoadFuc) {
		var Reader = new FileReader();
		
		var Filer = document.createElement("Input");
			Filer.type = "File";
			
			Filer.addEventListener("change", function (Event) {
				Reader.readAsText(Event.target.files[0]);
				
				Reader.onloadend = function () {
					Resource.UserData = JSON.parse(Reader.result);
					LoadFuc();
				}
			});
			
			Filer.click();
	}
	
	/*/
	 *##################################################
	 *#>>SystemLoad<<
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
	
	this.Effect = {
		Canvas: this.Canvas,
		
		BlackOut: function (Sec, Delay) {
			var Style = document.createElement("Style");
				Style.id = "RPGHelper-Effect";
				Style.innerHTML = "@keyframes BlackOut {0% {BackGround: Transparent;} 100% {BackGround: Black;}}";
				
				document.head.appendChild(Style);
				
			var Effecter = document.createElement("Canvas");
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
		
		WhiteOut: function (Sec, Delay) {
			var Style = document.createElement("Style");
				Style.id = "RPGHelper-Effect";
				Style.innerHTML = "@keyframes WhiteOut {0% {BackGround: Transparent;} 100% {BackGround: White;}}";
				
				document.head.appendChild(Style);
				
			var Effecter = document.createElement("Canvas");
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
		
		ColorOut: function (Sec, Delay, Color) {
			var Style = document.createElement("Style");
				Style.id = "RPGHelper-Effect";
				Style.innerHTML = "@keyframes BlackOut {0% {BackGround: " + Color + ";} 100% {BackGround: Transparent;}}";
				
				document.head.appendChild(Style);
				
			var Effecter = document.createElement("Canvas");
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
	
	this.Map = {
		Canvas: this.Canvas,
		
		Warp: function (ID, Position) {
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
				MapCanvas.style.width = this.Canvas.style.width;
				MapCanvas.style.height = this.Canvas.style.height;
				MapCanvas.style.position = "Absolute";
				MapCanvas.style.display = "None";
				
				this.Canvas.appendChild(MapCanvas);
				
			TipImg.onload = function () {
				var Ctx = MapCanvas.getContext("2d");
				
				for (var y = 0; y < MapData[0].length; y++) {
 					for (var x = 0; x < MapData[0][y].length; x++) {
 						if (typeof MapData[0][y][x] != "^" && typeof MapData[0][y][x] == "number") {
 							Ctx.drawImage(TipImg, 16 * (MapData[0][y][x] % 8), 16 * (Math.floor(MapData[0][y][x] / 8)), 16, 16, 16 * x, 8 * y, 16, 8);
 						}
 					}
 				}
 				
				for (var y = 0; y < MapData[1].length; y++) {
					for (var x = 0; x < MapData[1][y].length; x++) {
						if (typeof MapData[1][y][x] != "^" && typeof MapData[1][y][x] == "number") {
							Ctx.drawImage(TipImg, 16 * (MapData[1][y][x] % 8), 16 * (Math.floor(MapData[1][y][x] / 8)), 16, 16, 16 * x, 8 * y, 16, 8);
						}
					}
				}
				
				for (var y = 0; y < MapData[2].length; y++) {
					for (var x = 0; x < MapData[2][y].length; x++) {
						if (typeof MapData[2][y][x] != "^" && typeof MapData[2][y][x] == "number") {
							Ctx.drawImage(TipImg, 16 * (MapData[2][y][x] % 8), 16 * (Math.floor(MapData[2][y][x] / 8)), 16, 16, 16 * x, 8 * y, 16, 8);
						}
					}
				}
				
				MapCanvas.style.display = "";
				
				return MapCanvas;
			}
		}
	}
	
	/*/
	 *##################################################
	 *#>>MsgBox<<
	 *#メッセージダイアログを表示
	 *#
	 *#>>引数<<
	 *#Pos : R.POS型
	 *#Content : String型
	 *#Speed : R.SPEED型
	 *##################################################
	/*/
	this.MsgBox = function (Pos, Speed, Content, ClickFuc) {
		var Dialog = document.createElement("RPGHelper-MsgBox");
			Dialog.style.position = "Absolute";
			Dialog.style.width = (this.Canvas.attributes["width"].value - 10) + "px";
			Dialog.Clicked = false;
			
			this.Canvas.appendChild(Dialog);
			
		switch (Pos) {
			case 0x0001:
				Dialog.style.top = "0px";
				Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 4 - 5) + "px"; //【縦横500pxの時】500px / 4 - 5px[ボーダー幅] = 120px
				break;
				
			case 0x0002:
				Dialog.style.top = (this.Canvas.style.height.split("px")[0] - (this.Canvas.style.height.split("px")[0] / 4)) + "px"; //【縦横500pxの時】500px - (500px / 4) = 500px - 125px = 375px
				Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 4 - 10) + "px"; //【縦横500pxの時】500px / 4 - 10px[ボーダー幅 * 2] = 115px
				break;
				
			case 0x0003:
				Dialog.style.top = ((this.Canvas.style.height.split("px")[0] / 2) - (this.Canvas.style.height.split("px")[0] / 4)) + "px"; //【縦横500pxの時】(500px / 2) - (500px - 2) = 250px - 125px = 125px
				Dialog.style.height = (this.Canvas.style.height.split("px")[0] / 2 - 5) + "px"; //【縦横500pxの時】500px / 2 - 5 = 245px
				break;
		}
		
		if (typeof Content == "string") {
			var Counter = 0;
			
			var Timer = setInterval(function () {
				if (Counter <= Content.length) {
					Dialog.textContent = Content.substr(0, Counter);
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
		 *#>>MenuPanel<<
		 *#メニュー画面を表示
		 *#
		 *#>>引数<<
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
		 *#>>MenuItem<<
		 *#メニュー画面のアイテムを表示
		 *#
		 *#>>引数<<
		 *#ParentPanel : Element型
		 *#Size : Array型
		 *#|=> [0] : int型(00 ～ 99, ^^)
		 *#|=> [1] : int型(00 ～ 99, ^^)
		 *#
		 *#|=> [0] : String型(00 ～ 99, ^^)
		 *#|=> [1] : String型(00 ～ 99, ^^)
		 *##################################################
		/*/
		MenuItem: function (ParentPanel, Size, Content, ClickFuc) {
			var Dialog = document.createElement("RPGHelper-Menu-MenuItem");
				Dialog.style.position = "Absolute";
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
		 *#>>MenuMsgBox<<
		 *#メニュー画面のテキストを表示
		 *#
		 *#>>引数<<
		 *#ParentPanel : Element型
		 *#Size : Array型
		 *#|=> [0] : String型(00 ～ 99, ^^)
		 *#|=> [1] : String型(00 ～ 99, ^^)
		 *#
		 *#Content : String型
		 *##################################################
		/*/
		MenuMsgBox: function (ParentPanel, Size, Content) {
			var Dialog = document.createElement("RPGHelper-Menu-MenuMsgBox");
				Dialog.style.position = "Absolute";
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
		
		MenuTextArea: function (ParentPanel, Size, HintMsg, IsRequired) {
			var Dialog = document.createElement("TextArea");
				Dialog.setAttribute("Class", "RPGHelper-Menu-MenuTextArea");
				Dialog.style.position = "Absolute";
				
				Dialog.setAttribute("PlaceHolder", HintMsg);
				if (IsRequired) Dialog.setAttribute("Required", "Required");
				
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
}
