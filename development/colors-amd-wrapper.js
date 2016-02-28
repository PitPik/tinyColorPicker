(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define([], function () {
			return factory(window);
		});
	} else {
		window.Colors = factory(window);
	}
}(
	// paste colors.js without self invoking part:
	// beginning: drop 'window.Colors = ('
	// end: drop ')(window);'
));