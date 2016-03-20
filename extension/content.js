/*jslint browser: true, regexp: true, nomen: true */
/*global jQuery, config, Firebase, _, chrome, console, toastr */

function getParameterByName(name, search) {
	'use strict';

	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getParameterFromURL(name) {
	'use strict';

	var param = getParameterByName(name, location.search);

	if (param === null || param === '') {
		param = getParameterByName(name, location.hash.replace(/^#!\//, '?'));
	}

	return param;
}

var current_users = {},
	firebase = new Firebase(config.FIREBASE_URL);

function loadStyles() {
	'use strict';

	var styleSheets = [
		'//cdnjs.cloudflare.com/ajax/libs/toastr.js/latest/css/toastr.min.css',
		'//maxcdn.bootstrapcdn.com/font-awesome/4.4.0/css/font-awesome.min.css'
	];

	_.each(styleSheets, function (sheet) {
		jQuery('head').append('<link rel="stylesheet" href="' + sheet + '" type="text/css" />');
	});

	jQuery('head').append('<style type="text/css">#userTray { position: fixed; top: 160px; left: 0; min-width: 140px; max-width: 140px; overflow: hidden; white-space: nowrap; -webkit-border-top-right-radius: 8px; -webkit-border-bottom-right-radius: 8px; background-color: #333; color: #fff; font-weight: bold; padding: 10px;} #userTray ul, #userTray li {margin: 0px; color: #fff; list-style: none; line-height: 14px} #userTray li { padding: 5px 0px;} #userTray ul li.active span {color: #060;}</style>');
}

function updateUserTray() {
	'use strict';

	if (_.isEmpty(jQuery('#userTray'))) {
		jQuery('body').append(config.TEMPLATES.USERTRAY({}));
	}

	jQuery('#userTray ul').html(config.TEMPLATES.USERLIST({users: _.values(current_users)}));
}

function addUser(user_info) {
	'use strict';

	_.set(current_users, user_info.user_id, user_info);
	updateUserTray();
	toastr.success(config.TEMPLATES.JOINED(user_info));
}

function removeUser(user_info) {
	'use strict';

	current_users = _.omit(current_users, user_info.user_id);
	updateUserTray();
	toastr.error(config.TEMPLATES.PARTED(user_info));
}

function watchFirebase() {
	'use strict';

	var post_id = getParameterFromURL('id'),
		baseref = firebase.child(post_id);

	baseref.on('child_added', function (childSnapshot, prevChildKey) {
		addUser(childSnapshot.val());
	});

	baseref.on('child_removed', function (childSnapshot, prevChildKey) {
		removeUser(childSnapshot.val());
	});
}

var onCompleted = function (request, sender, sendResponse) {
	'use strict';

	var message,
		user_name_link = jQuery('#user_name_link'),
		url = user_name_link.attr('href'),
		user_id = getParameterByName('userId', '?' + url.split('?')[1]),
		user_name = user_name_link.html();

	message = {
		user_id: user_id,
		user_name: user_name
	};

	loadStyles();
	watchFirebase();
	sendResponse(message);
};

var handler_map = {
	'onCompleted': onCompleted
};

var messageHandler = function (request, sender, sendResponse) {
	'use strict';

	if (_.has(handler_map, request.action)) {
		handler_map[request.action](request, sender, sendResponse);
	}
};

chrome.runtime.onMessage.addListener(messageHandler);