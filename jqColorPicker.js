;(function($, Colors, undefined){
	'use strict';

	var $document = $(document),
		_instance,
		_colorPicker,
		_color,
		_options,
		_selector = '',

		_$element,
		_$UI, _$xy_slider, _$xy_cursor, _$z_cursor , _$alpha , _$alpha_cursor,

		_pointermove = 'touchmove mousemove pointermove',
		_pointerup = 'touchend mouseup pointerup',
		_GPU = false,
		_animate = window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame || function(cb){cb()},
		_html = '<div class="cp-color-picker"><div class="cp-z-slider"><div c' +
			'lass="cp-z-cursor"></div></div><div class="cp-xy-slider"><div cl' +
			'ass="cp-white"></div><div class="cp-xy-cursor"></div></div><div ' +
			'class="cp-alpha"><div class="cp-alpha-cursor"></div></div></div>',
			// 'grunt-contrib-uglify' puts all this back to one single string...
		_css = '.cp-color-picker{position:absolute;overflow:hidden;padding:6p' +
			'x 6px 0;background-color:#444;color:#bbb;font-family:Arial,Helve' +
			'tica,sans-serif;font-size:12px;font-weight:400;cursor:default;bo' +
			'rder-radius:5px}.cp-color-picker>div{position:relative;overflow:' +
			'hidden}.cp-xy-slider{float:left;height:128px;width:128px;margin-' +
			'bottom:6px;background:linear-gradient(to right,rgba(255,255,255,' +
			'1)0,rgba(255,255,255,0)100%)}.cp-white{height:100%;width:100%;ba' +
			'ckground:linear-gradient(to bottom,rgba(0,0,0,0)0,rgba(0,0,0,1)1' +
			'00%)}.cp-xy-cursor{position:absolute;top:0;width:10px;height:10p' +
			'x;margin:-5px;border:1px solid #fff;border-radius:100%;box-sizin' +
			'g:border-box}.cp-z-slider{float:right;margin-left:6px;height:128' +
			'px;width:20px;background:linear-gradient(to bottom,red 0,#f0f 17' +
			'%,#00f 33%,#0ff 50%,#0f0 67%,#ff0 83%,red 100%)}.cp-z-cursor{pos' +
			'ition:absolute;margin-top:-4px;width:100%;border:4px solid #fff;' +
			'border-color:transparent #fff;box-sizing:border-box}.cp-alpha{cl' +
			'ear:both;width:100%;height:16px;margin:6px 0;background:linear-g' +
			'radient(to right,rgba(68,68,68,1)0,rgba(0,0,0,0)100%)}.cp-alpha-' +
			'cursor{position:absolute;margin-left:-4px;height:100%;border:4px' +
			' solid #fff;border-color:#fff transparent;box-sizing:border-box}',

		ColorPicker = function(options) {
			_color = this.color = new Colors(options);
			_options = _color.options;
		};

	ColorPicker.prototype.render = render;
	ColorPicker.prototype.toggle = toggle;

	function extractValue(elm) {
		return elm.value || elm.getAttribute('value') ||
			$(elm).css('background-color') || '#fff';
	}

	function resolveEventType(event) {
		return event.originalEvent.touches ?
			event.originalEvent.touches[0] : event;
	}

	function findElement($elm) {
		return $($elm.find(_options.doRender)[0] || $elm[0]);
	}

	function toggle(event) {
		var $this = $(this),
			position;

		if (event) {
			position = $this.offset();
			_$element = findElement($this);

			(_$UI || build()).css({
				'left': position.left, // check for space...
				'top': position.top + $this.outerHeight(true)
			}).show(_options.animationSpeed, function() {
				_$alpha._width = _$alpha.width();
				_$xy_slider._width = _$xy_slider.width();
				_$xy_slider._height = _$xy_slider.height();
				_color.setColor(extractValue(_$element[0]));
				render(true);
			});
		} else {
			$(_$UI).hide(_options.animationSpeed, function() {
				_$element.blur();
				render(false);
			});
		}
	};

	function build() {
		$('head').append('<style type="text/css">' +
			(_options.css || _css) + (_options.cssAddon || '') + '</style>');

		return _$UI = $(_html).css({'margin': _options.margin}).
			show(0, function() {
				_GPU = _options.GPU && $(this).css('perspective') === '';
				_options.buidCallback.call(_colorPicker, $(this));
				_$xy_slider = $('.cp-xy-slider', this);
				_$xy_cursor = $('.cp-xy-cursor', this);
				_$z_cursor = $('.cp-z-cursor', this);
				_$alpha = $('.cp-alpha', this).toggle(!!_options.opacity);
				_$alpha_cursor = $('.cp-alpha-cursor', this);
			}).hide().
			on('touchstart mousedown pointerdown',
				'.cp-xy-slider,.cp-z-slider,.cp-alpha', pointerdown).
			appendTo(document.body);
	}

	function pointerdown(e) {
		var action = this.className.replace('cp-', '').replace('-', '_');

		e.preventDefault();

		_$element.origin = $(this).offset();
		(action = action === 'xy_slider' ? xy_slider :
			action === 'z_slider' ? z_slider : alpha)(e);

		$document.on(_pointerup, pointerup).on(_pointermove, action);
	}

	function pointerup(e) {
		$document.off(_pointermove).off(_pointerup);
	}

	function xy_slider(event) {
		var e = resolveEventType(event),
			x = e.pageX - _$element.origin.left,
			y = e.pageY - _$element.origin.top;

		_color.setColor({
			s: x / _$xy_slider._width * 100,
			v: 100 - (y / _$xy_slider._height * 100)
		}, 'hsv');
		_animate(render);
	}

	function z_slider(event) {
		var z = resolveEventType(event).pageY - _$element.origin.top,
			hsv = _color.colors.hsv;

		_color.setColor({h: 360 - (z / _$xy_slider._height * 360)}, 'hsv');
		_animate(render);
	}

	function alpha(event) {
		var x = resolveEventType(event).pageX - _$element.origin.left,
			alpha = x / _$alpha._width;

		_color.setColor({}, 'rgb', alpha > 1 ? 1 : alpha < 0 ? 0 : alpha);
		_animate(render);
	}

	function render(toggled) {
		var colors = _color.colors,
			hueRGB = colors.hueRGB,
			RGB = colors.RND.rgb,
			HSL = colors.RND.hsl,
			dark = '#222',
			light = '#ddd',
			colorMode = _$element.data('colorMode'),
			isAlpha = colors.alpha !== 1,
			alpha = Math.round(colors.alpha * 100) / 100,
			RGBInnerText = RGB.r + ', ' + RGB.g + ', ' + RGB.b,
			text = (colorMode === 'HEX' && !isAlpha ? '#' + colors.HEX :
				colorMode === 'rgb' || (colorMode === 'HEX' && isAlpha) ?
				(!isAlpha ? 'rgb(' + RGBInnerText + ')' :
					'rgba(' + RGBInnerText + ', ' + alpha + ')') :
				('hsl' + (isAlpha ? 'a(' : '(') + HSL.h + ', ' + HSL.s + '%, ' +
					HSL.l + '%' + (isAlpha ? ', ' + alpha : '') + ')')),
			HUEContrast = colors.HUELuminance > 0.22 ? dark : light,
			alphaContrast = colors.rgbaMixBlack.luminance > 0.22 ? dark : light,
			h = (1 - colors.hsv.h) * _$xy_slider._height,
			s = colors.hsv.s * _$xy_slider._width,
			v = (1 - colors.hsv.v) * _$xy_slider._height,
			a = alpha * _$alpha._width,
			t3d = _GPU ? 'translate3d' : '';

		_$xy_slider.css({
			backgroundColor: 'rgb(' +
				hueRGB.r + ',' + hueRGB.g + ',' + hueRGB.b + ')'});
		_$xy_cursor.css({
			transform: t3d + '(' + s + 'px, ' + v + 'px, 0)',
			left: !_GPU ? s : '',
			top: !_GPU ? v : '',
			borderColor : colors.RGBLuminance > 0.22 ? dark : light
		});
		_$z_cursor.css({
			transform: t3d + '(0, ' + h + 'px, 0)',
			top: !_GPU ? h : '',
			borderColor : 'transparent ' + HUEContrast,
		});
		_$alpha.css({backgroundColor: 'rgb(' + RGBInnerText + ')'});
		_$alpha_cursor.css({
			transform: t3d + '(' + a + 'px, 0, 0)',
			left: !_GPU ? a : '',
			borderColor : alphaContrast + ' transparent'
		});
		_options.doRender && _$element.css({
			backgroundColor : text,
			color: colors.rgbaMixBGMixCustom.luminance > 0.22 ? dark : light
		});

		_$element.val() !== text && _$element.val(text);

		_options.renderCallback.call(
			_colorPicker,
			_$element,
			typeof toggled === 'boolean' ? toggled : undefined
		);
	}

	$.fn.colorPicker = function(options) {
		var noop = function(){};

 		options = $.extend({
			animationSpeed: 150,
			GPU: true,
			doRender: true,
			customBG: '#FFF',
			opacity: true,
			renderCallback: noop,
			buidCallback: noop,
			body: document.body
			// css: '',
			// cssAddon: '',
			// margin: '',
			// preventFocus: false
		}, options);

		_instance = _instance ? _instance.add(this) : this;
		_selector += (_selector ? ', ' : '') + this.selector;
		_instance.colorPicker = _colorPicker ||
			(_colorPicker = new ColorPicker(options));

 		$(options.body).off('.a').
 		on('touchstart.a mousedown.a pointerdown.a', function(e) {
			var $target = $(e.target);

			if ($.inArray($target.closest(_selector)[0],
				_instance) === -1 &&
			!$target.closest(_$UI).length) {
				toggle();
			}
		}).
		on('focus.a click.a', _selector, toggle).
		on('change.a', _selector, function() {
			_color.setColor(this.value);
			_instance.colorPicker.render();
		});

		return this.each(function() {
			var value = extractValue(this),
				mode = value.split('('),
				$elm = findElement($(this));

			$elm.data('colorMode', mode[1] ? mode[0].substr(0, 3) : 'HEX').
			attr('readonly', _options.preventFocus);
			options.doRender && $elm.
			css({'background-color': value,
				'color': function() {
					return _color.setColor(value).
						rgbaMixBGMixCustom.luminance > 0.22 ? '#222' : '#ddd'
				}
			});
		});
	};
})(window.jQuery, Colors);