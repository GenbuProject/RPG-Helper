var WorkID = {
	Load: 0,
	ServiceForLoad: 100
}

port.onmessage = function (Event) {
	switch (Event.data.WorkID) {
		case WorkID.Load:
			var Reader = new FileReaderSync();
				Reader.readAsText(Event.data.Data.target.files[0]);
				
			port.postMessage({
				WorkID: WorkID.Load,
				Data: JSON.parse(Reader.result)
			});
			
			break;
			
		case WorkID.ServiceForLoad:
			port.postMessage({
				WorkID: WorkID.ServiceForLoad,
				Data: Event.data.Data
			});
			
			break;
	}
}
