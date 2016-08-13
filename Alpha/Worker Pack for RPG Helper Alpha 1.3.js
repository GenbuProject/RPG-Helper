var WorkID = {
	Load: 0,
	ServiceForLoad: 100
}

onmessage = function (Event) {
	switch (Event.data.WorkID) {
		case WorkID.Load:
			var Reader = new FileReaderSync();
				Reader.readAsText(Event.data.Data.target.files[0]);
				
			postMessage({
				WorkID: WorkID.Load,
				Data: JSON.parse(Reader.result)
			});
			
			break;
			
		case WorkID.ServiceForLoad:
			postMessage({
				WorkID: WorkID.ServiceForLoad,
				Data: Event.data.Data
			});
			
			break;
	}
}