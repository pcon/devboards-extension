/*jslint browser: true, regexp: true, nomen: true */
/*global jQuery, config, Firebase, _, chrome, console */

var firebase = new Firebase(config.FIREBASE_URL);

if (localStorage.tab_map === undefined) {
	localStorage.tab_map = '{}';
}

function getParameterByName(name, search) {
	'use strict';

	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function addToFirebase(tab_info) {
	'use strict';

	var childRef = firebase.child(tab_info.post_id + '/' + tab_info.user_id);

	childRef.set(tab_info);
}

function removeFromFirebase(tab_info) {
	'use strict';

	var childRef = firebase.child(tab_info.post_id + '/' + tab_info.user_id);

	childRef.remove();
}

var onRemoved = function (tabId, removeInfo) {
	'use strict';

	var tab_map = JSON.parse(localStorage.tab_map),
		tab_info = _.get(tab_map, tabId.toString());

	removeFromFirebase(tab_info);

	tab_map = _.omit(tab_map, tabId.toString());
	localStorage.tab_map = JSON.stringify(tab_map);
};

var onCompleted = function (details) {
	'use strict';

	var tab_info, message, tab_map;

	tab_info = {
		tab_id: details.tabId,
		post_id: getParameterByName('id', details.url),
		user_status: 'active',
		timestamp: details.timeStamp
	};

	message = {
		action: 'onCompleted'
	};

	if (tab_info.post_id !== undefined && tab_info.post_id.trim() !== '') {
		chrome.tabs.sendMessage(details.tabId, message, function (response) {
			tab_info.user_name = response.user_name;
			tab_info.user_id = response.user_id;

			addToFirebase(tab_info);

			tab_map = JSON.parse(localStorage.tab_map);
			tab_map[tab_info.tab_id] = tab_info;
			localStorage.tab_map = JSON.stringify(tab_map);
		});
	}
};

var listener_filter = {
	url: [
		{
			hostSuffix: 'developer.salesforce.com'
		}
	]
};

chrome.webNavigation.onCompleted.addListener(onCompleted, listener_filter);
chrome.tabs.onRemoved.addListener(onRemoved);