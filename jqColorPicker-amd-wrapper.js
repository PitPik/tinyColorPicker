(function (factory) {
	if (typeof define === 'function' && define.amd) {
		define(['jquery', './colors'], function (jQuery, Colors) {
			return factory(window, jQuery, Colors);
		});
	} else {
		factory(window, jQuery, Colors);
	}
}(
	// jqColorPicker without self invoking part:
	// beginning: drop first '('
	// end: drop ')(window, jQuery, Colors);'
));