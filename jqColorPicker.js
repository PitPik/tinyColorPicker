;(function($, Colors, undefined){
	'use strict';

	var $document = $(document),
		_colorPicker,
		_color,
		_options,
		_cache = {},
		_$UI,
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
			'ear:left;width:100%;height:16px;margin:6px 0;background:linear-g' +
			'radient(to right,rgba(68,68,68,1)0,rgba(0,0,0,0)100%)}.cp-alpha-' +
			'cursor{position:absolute;margin-left:-4px;height:100%;border:4px' +
			' solid #fff;border-color:#fff transparent;box-sizing:border-box}',

		ColorPicker = function(options) {
			_color = this.color = new Colors(options);
			_options = _color.options;
		};

	ColorPicker.prototype.render = render;

	function extractValue(elm) {
		return elm.value || $(elm).css('background-color') || '#fff';
	}

	function resolveEventType(event) {
		return event.originalEvent.touches ?
			event.originalEvent.touches[0] : event;
	}

	function toggle(event) {
		var $this = $(this),
			position;

		if (event) {
			position = $this.offset();
			_cache.$element = $this;
			_options.preventFocus && event.preventDefault();

			(_$UI || build()).css({
				'left': position.left, // check for space...
				'top': position.top + $this.outerHeight(true)
			}).show(_options.animationSpeed, function() {
				_cache.alphaWidth = $('.cp-alpha', _$UI).width();
				_cache.sliderWidth = $('.cp-xy-slider', _$UI).width();
				_color.setColor(extractValue($this[0]));
				_animate(function(){render(true)});
			});
		} else {
			$(_$UI).hide(_options.animationSpeed, function() {
				_cache.$element.blur();
			});
		}
	};

	function build() {
		// CSS
		$('head').append('<style type="text/css">' +
			(_options.css || _css) + (_options.cssAddon || '') + '</style>');
		// HTML
		return _$UI = $(_html).css({'margin': _options.margin}).
			find('.cp-alpha').toggle(!!_options.opacity).
			parent(). // back to $(_html)
			show(0, function() {
				_GPU = _options.GPU && $(this).css('transform') === '';
				_options.buidCallback.call(_colorPicker, $(this));
			}).hide().
			on('touchstart mousedown pointerdown',
				'.cp-xy-slider,.cp-z-slider,.cp-alpha', pointerdown).
			appendTo(document.body);
	}

	function pointerdown(e) {
		var action = this.className.replace('cp-', '').replace('-', '_');

		e.preventDefault();

		_cache.elementOrigin = $(this).offset();
		(action = action === 'xy_slider' ? xy_slider :
			action === 'z_slider' ? z_slider : alpha)(e);

		$document.on(_pointerup, pointerup).on(_pointermove, action);
	}

	function pointerup(e) {
		$document.off(_pointermove).off(_pointerup);
	}

	function xy_slider(event) {
		var e = resolveEventType(event),
			x = e.pageX - _cache.elementOrigin.left,
			y = e.pageY - _cache.elementOrigin.top;

		_color.setColor({
			s: x / _cache.sliderWidth * 100,
			v: 100 - (y / _cache.sliderWidth * 100)
		}, 'hsv');
		_animate(render);
	}

	function z_slider(event) {
		var z = resolveEventType(event).pageY - _cache.elementOrigin.top,
			hsv = _color.colors.hsv;

		_color.setColor({h: 360 - (z / _cache.sliderWidth * 360)}, 'hsv');
		_animate(render);
	}

	function alpha(event) {
		var x = resolveEventType(event).pageX - _cache.elementOrigin.left,
			alpha = x / _cache.alphaWidth;

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
			colorMode = _cache.$element.data('colorMode'),
			isAlpha = colors.alpha !== 1,
			alpha = Math.round(colors.alpha * 100) / 100,
			RGBInnerText = RGB.r + ', ' + RGB.g + ', ' + RGB.b,
			RGBAText = 'rgba(' + RGBInnerText + ', ' + alpha + ')',
			text = (colorMode === 'HEX' && !isAlpha ? '#' + colors.HEX :
				colorMode === 'rgb' || (colorMode === 'HEX' && isAlpha) ?
				(!isAlpha ? 'rgb(' + RGBInnerText + ')' : RGBAText) :
				('hsl' + (isAlpha ? 'a(' : '(') + HSL.h + ', ' + HSL.s + '%, ' +
					HSL.l + '%' + (isAlpha ? ', ' + alpha : '') + ')')),
			HUEContrast = colors.HUELuminance > 0.22 ? dark : light,
			alphaContrast = colors.rgbaMixBlack.luminance > 0.22 ? dark : light,
			h = (1 - colors.hsv.h) * _cache.sliderWidth,
			s = colors.hsv.s * _cache.sliderWidth,
			v = (1 - colors.hsv.v) * _cache.sliderWidth,
			a = alpha * _cache.alphaWidth,
			t3d = _GPU ? 'translate3d' : '';

		$('.cp-xy-slider').css({
			backgroundColor: 'rgb(' +
				hueRGB.r + ',' + hueRGB.g + ',' + hueRGB.b + ')'});
		$('.cp-xy-cursor').css({
			transform: t3d + '(' + s + 'px, ' + v + 'px, 0)',
			left: !_GPU ? s : '',
			top: !_GPU ? v : '',
			borderColor : colors.RGBLuminance > 0.22 ? dark : light
		});
		$('.cp-z-cursor').css({
			transform: t3d + '(0, ' + h + 'px, 0)',
			top: !_GPU ? h : '',
			borderLeftColor : HUEContrast,
			borderRightColor : HUEContrast
		});
		$('.cp-alpha').css({backgroundColor: 'rgb(' + RGBInnerText + ')'});
		$('.cp-alpha-cursor').css({
			transform: t3d + '(' + a + 'px, 0, 0)',
			left: !_GPU ? a : '',
			borderTopColor : alphaContrast,
			borderBottomColor : alphaContrast
		});
		_options.doRender && _cache.$element.css({
			backgroundColor : RGBAText,
			color: colors.rgbaMixBGMixCustom.luminance > 0.22 ? dark : light
		});
		_cache.$element.val(text);

		_options.renderCallback.call(
			_colorPicker, _cache.$element, toggled === true);
	}

	// export as plugin to jQuery
	$.fn.colorPicker = function(options) {
		var $that = this,
			noop = function(){};

 		options = $.extend({
			animationSpeed: 150,
			GPU: true,
			doRender: true,
			customBG: '#FFF',
			opacity: true,
			renderCallback: noop,
			buidCallback: noop
			// css: '',
			// cssAddon: '',
			// margin: '',
			// preventFocus: false
		}, options);
 
		if (!_colorPicker) { // we only want one single instance...
			_colorPicker = new ColorPicker(options);

			$document.on('touchstart mousedown pointerdown', function(e) {
				if ($.inArray(e.target, $that) === -1 &&
				!$(e.target).closest(_$UI).length) {
					toggle();
				}
			}).on('focus', this.selector, toggle);
		}

		this.colorPicker = _colorPicker;

		return this.each(function() {
			var value = extractValue(this),
				mode = value.split('(');
			// save initial color mode and set color and bgColor
			$(this).data('colorMode', mode[1] ? mode[0].substr(0, 3) : 'HEX');
			options.doRender && $(this).css({'background-color': value,
				'color': function() {
					return _color.setColor(value).
						rgbaMixBGMixCustom.luminance > 0.22 ? '#222' : '#ddd'
				}
			});
		});
	};
})(window.jQuery, Colors);