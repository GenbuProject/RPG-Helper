var WorkID = {
	Load: 0
}

onmessage = function (Event) {
	switch (Event.data.WorkID) {
		case WorkID.Load:
			var Reader = new FileReaderSync();
				Reader.readAsText(Event.data.Data);
				
			postMessage({
				WorkID: WorkID.Load,
				Data: JSON.parse(Reader.result)
			});
			
			break;
	}
}
