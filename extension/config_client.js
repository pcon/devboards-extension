/*jslint browser: true, regexp: true, nomen: true */
/*global _ */

var config = {
	FIREBASE_URL: 'https://HOST.firebaseio.com',
	TEMPLATES: {
		JOINED: _.template('<%= user_name %> joined'),
		PARTED: _.template('<%= user_name %> left'),
		USERTRAY: _.template('<div id="userTray"><ul></ul></div>'),
		USERLIST: _.template('<% _.forEach(users, function (user) { %><li class="<%= user.user_status %>"><span class="fa fa-certificate"></span> <%= user.user_name %><% }); %>')
	}
};