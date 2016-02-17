$(function(){
	'use strict';

	var options = {
		customBG: '#222', // bg of page is dark, so if opcity close to 0 -> dark shines through
		doRender: 'div div', // tell it where to render bg-color if no input
		colorNames: { // get more colors in the other demo... will be displayed next to color patch
			'808080': 'grey',
			'00FFFF': 'cyan',
			'000000': 'black',
			'0000FF': 'blue',
			'FF00FF': 'magenta',
			'008000': 'green',
			'FF0000': 'red',
			'C0C0C0': 'silver',
			'FFFFFF': 'white',
			'FFFF00': 'yellow'
		},
		buildCallback: function($elm) { // called the first time colorPicker gets triggered
			var that = this; // for callback function
			var currentRGB = ''; // either r, g or b
			var $currentSlider = $(); // the clicked rgb slider
			var currentOffset = {}; // of slider
			var $window = $(window);
			var mouseMove = function(e) { // don't render sliders here. Just setColor;
				var color = {}; // new calculated color

				color[currentRGB] = (e.pageX - currentOffset.left) / that.currentWidth * 255;
				that.color.setColor(color, 'rgb'); // set calculated value
				that.render(); // tell colorPicker to render
			};

			$elm.append( // render extra sliders and patch
				'<div class="cp-rgb-r"><div class="cp-rgb-r-cursor"></div></div>' +
				'<div class="cp-rgb-g"><div class="cp-rgb-g-cursor"></div></div>' +
				'<div class="cp-rgb-b"><div class="cp-rgb-b-cursor"></div></div>' +
				'<div class="cp-patch"><div></div></div><div class="cp-disp"></div>');

			this.cursorRStyle = $elm.find('.cp-rgb-r-cursor')[0].style; // caching for faster render renderCallback
			this.cursorGStyle = $elm.find('.cp-rgb-g-cursor')[0].style;
			this.cursorBStyle = $elm.find('.cp-rgb-b-cursor')[0].style;

			this.patchStyle = $('.cp-patch div')[0].style;
			this.$display = $('.cp-disp');

			$elm.on('mousedown', '.cp-rgb-r, .cp-rgb-g, .cp-rgb-b', function(e) { // event delegation
				$currentSlider = $(this); // well ;o)
				currentRGB = this.className.replace(/cp-rgb-(\D){1}/, "$1"); // cp-rgb-r -> r
				currentOffset = $currentSlider.offset(); // for later calculations
				that.currentWidth = $currentSlider.width(); // ... also here
				$window.on('mousemove.rgb', mouseMove); // install mousemove listener
				e.preventDefault && e.preventDefault(); // prevent selecting text
				mouseMove(e); // render color picker the first time
				return false; // for IE
			});

			$window.on('mouseup', function(e) {
				$window.off('mousemove.rgb'); // turn off mousemove event handler
			});

			// append css after just generated / use cssAddon instead if you want
			$('#colorPickerMod').appendTo('head');
		},
		renderCallback: function($elm, toggled) {
			var colors = this.color.colors; // the whole color object
			var rgb = colors.RND.rgb; // the RGB color in 0-255

			// the following 6 lines are not necessary if you don't have the trigger icons with the arrows...
			// if (toggled === true) { // just showing (only on show)
			// 	$('.trigger').removeClass('active'); // turns arrow of color triggers
			// 	$elm.closest('.trigger').addClass('active');
			// } else if (toggled === false) { // just hiding (only on hide)
			// 	$elm.closest('.trigger').removeClass('active');
			// }

			this.patchStyle.backgroundColor = $elm[0].style.backgroundColor; // set patch color...
			this.$display.text(this.color.options.colorNames[colors.HEX] || $elm.val()); // ...and text aside

			this.currentWidth = this.currentWidth || this.$UI.find('.cp-rgb-r')[0].clientWidth; // first time
			this.cursorRStyle.left = (rgb.r / 255 * this.currentWidth) + 'px'; // render sliders
			this.cursorGStyle.left = (rgb.g / 255 * this.currentWidth) + 'px'; // faster than with $().css
			this.cursorBStyle.left = (rgb.b / 255 * this.currentWidth) + 'px';
		}
	};

	window.myColorPicker =
	$('.color').colorPicker(options);
	$('.trigger').colorPicker();
});