//region {variables and functions}
var consoleGreeting = "Hello World! - from event_script.js";
var responseMessage = {"data":"Test message Y"};
//end-region



//region {calls}
console.log(consoleGreeting);
//Show Page-Action using the onMessage event
chrome.runtime.onMessage.addListener(function(requestMessage,sender,sendResponse) {
	chrome.pageAction.show(sender.tab.id);
	console.log("requestMessage: " + requestMessage.data);
	sendResponse(responseMessage);
});
//end-region