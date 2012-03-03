// addScroll :: adding custom vertical scrollbar to layer
// http://lazaworx.com/addscroll-plugin/

(function($) {

	$.extend( $.support, {
		touch: "ontouchend" in document
	});
	
	var version = parseFloat($.browser.version);
		vendor = $.browser.msie && version < 9 && '-ms-' || 
		$.browser.webkit && version < 6 && '-webkit-' || 
		$.browser.mozilla && version < 4  && '-moz-' || 
		$.browser.opera && version < 10.5 && '-o-' || '';
		
	Math.minMax = function(a, b, c) {
		return ($.isNumeric(b))? ((b < a)? a : ((b > c)? c : b)) : a; 
	};
	
	$.fn.getBackground = function() {
		var bg;
		$(this).each(function() {
			if ( (bg = $(this).css('background-color')) !== 'transparent' ) {
				return false;
			}
		});
		return bg || 'transparent';
	};
	
	// Easing function by George Smith
	
	$.extend( jQuery.easing, {
		easeOutBack: function (x,t,b,c,d,s) { 
			if (s == null) s = 1.70158;
			return c*((t=t/d-1)*t*((s+1)*t+s)+1)+b;
		}
	});
	
	// Mousewheel: Copyright (c) 2010 Brandon Aaron (http://brandonaaron.net)
	
	var mousewheelTypes = ['DOMMouseScroll', 'mousewheel'];

	if ($.event.fixHooks) {
		for ( var i = mousewheelTypes.length; i; ) {
			$.event.fixHooks[ mousewheelTypes[--i] ] = $.event.mouseHooks;
		}
	}
	
	$.event.special.mousewheel = {
		
		setup: function(){
			if ( this.addEventListener ) {
				for ( var i = mousewheelTypes.length; i; ) {
					this.addEventListener( mousewheelTypes[--i], mousewheelHandler, false );
				}
			} else { 
				this.onmousewheel = mousewheelHandler;
			}
		},
		
		teardown: function() {
			if ( this.removeEventListener ) {
				for ( var i = mousewheelTypes.length; i; ) {
					this.removeEventListener( mousewheelTypes[--i], mousewheelHandler, false );
				}
			} else { 
				this.onmousewheel = null;
			}
		}
	};

	$.fn.extend({
			
		mousewheel: function( fn ){
			return fn? this.bind( 'mousewheel', fn ) : this.trigger('mousewheel');
		},
		
		unmousewheel: function( fn ){
			return this.unbind( 'mousewheel', fn );
		}
	});
	
	var mousewheelHandler = function( event ) {
		var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
		event = $.event.fix( orgEvent );
		event.type = 'mousewheel';
		
		// old school
		if ( orgEvent.wheelDelta ) { 
			delta = orgEvent.wheelDelta / 120; 
		} else if ( orgEvent.detail ) { 
			delta = -orgEvent.detail / 3; 
		}
		
		// new school (touchpad)
		deltaY = delta;
		
		// Gecko
		if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
			deltaY = 0;
			deltaX = -1 * delta;
		}
		
		// Webkit
		if ( orgEvent.wheelDeltaY !== undefined ) { 
			deltaY = orgEvent.wheelDeltaY / 120; 
		}
		if ( orgEvent.wheelDeltaX !== undefined ) { 
			deltaX = -1 * orgEvent.wheelDeltaX / 120; 
		}
		args.unshift( event, delta, deltaX, deltaY );
		
		return ($.event.dispatch || $.event.handle).apply( this, args );
	};

	// The actual plugin starts here
			
	$.fn.addScroll = function( settings ) {
		
		settings = $.extend( {}, $.fn.addScroll.defaults, settings );
		
		css = $.fn.addScroll.css;
		
		return this.each(function() {
			var to, 				// timeout 
				cont = $(this),		// content 
				wrap = $(this).parent(), // container
				sup, 				// up button
				sdn, 				// down button
				sbar, 				// scrollbar
				shan, 				// scrollbar handle
				ctrls, 				// all controls container
				cheight, 			// content height
				wheight, 			// wrap height
				scroll,				// auto scroll timeout handle
				ey = 0, y0, tY, ltT, tY1, speed, dist, min, max;
			
			// Initializing
			
			wrap.css({
				position: 'relative'
			});
			cont.css({
				position: 'absolute',
				width: wrap.width() - 20 - settings.gap
			});
			
			// Adding controls
			
			ctrls = $('<div>').css(css.ctrls).appendTo(wrap);
			sup = $('<div>').css(css.sup).appendTo(ctrls);
			sdn = $('<div>').css(css.sdn).appendTo(ctrls);
			sbar = $('<div>').css(css.sbar).appendTo(ctrls);
			shan = $('<div>').css(css.shan).appendTo(sbar);
			
			if ( settings.rounding ) {
				ctrls.add(shan).css(vendor + 'border-radius', settings.rounding + 'px');
			}
			
			if ( settings.shadows ) {
				ctrls.css(vendor + 'box-shadow', 'inset 1px 2px 5px rgba(0,0,0,0.5)');
				shan.css(vendor + 'box-shadow', '1px 2px 4px rgba(0,0,0,0.5)');
			}
			
			shan.css('background-color', wrap.parents().getBackground());
			
			sup.add(sdn).hover(function(){
				$(this).css({
					backgroundPosition: '-20px 0'
				});
			}, function(){
				$(this).css({
					backgroundPosition: '0 0'
				});
			});
			
			// Utility functions
			
			var getHeights = function() {
				cheight = cont.height();
				wheight = wrap.height();
			};
			
			var getTop = function() { 
				return cont.position().top; 
			};
			
			var getSt = function(t) { 
				return Math.round( (sbar.height() - 6) * (-((t == null)? getTop() : t)) / cheight ) + 3; 
			};
			
			var getSh = function() { 
				return Math.max( Math.round( (sbar.height() - 6) * wheight / cheight ), settings.dragMinSize ); 
			};
			
			var setCtrl = function(t) {
				if ( t == null ) {
					t = getTop();
				}
				sup.css({opacity: (t? 1 : settings.disabledOpacity)});
				sdn.css({opacity: (t === wheight - cheight)? settings.disabledOpacity : 1});
			};
			
			var noSelect = function() {
				return false;
			};
			
			// Matching the scrollbar to the content
			
			var matchScr = function() {
				cont.css({
					width: wrap.width() - 20 - settings.gap
				});
				getHeights(); 
				if ( cheight <= wheight ) { 
					cont.css({top: 0}).off('selectstart', noSelect); 
					ctrls.hide();
					return;
				}
				if ( cont.position().top < (wheight - cheight) ) {
					cont.css({top: wheight - cheight});
				}
				shan.css({top: getSt(), height: getSh()});
				if (settings.enableDrag) {
					cont.on('selectstart', noSelect);
				}
				ctrls.show();
				setCtrl();			
			};
			
			// Matching the content to the scrollbar
			
			var matchCnt = function() { 
				cont.css({top: Math.minMax(wheight - cheight, -Math.round((shan.position().top - 3) * cheight / (sbar.height() - 6)), 0)}); 
				setCtrl(); 
			};
			
			// Animating the content and the scrollbar
			
			var animateTo = function(t) {
				clearInterval(scroll);
				if ( wheight >= cheight ) {
					return;
				}
				t = Math.minMax(wheight - cheight, t, 0);
				shan.stop(true,true).animate({top: getSt(t)}, settings.speed, settings.effect);
				cont.stop(true,true).animate({top: t}, settings.speed, settings.effect, function() {
					setCtrl(t);
				});
			};
			
			// Up and down button events
			
			sup.click(function() { 
				animateTo(getTop() + wheight); 
				return false; 
			});
			
			sdn.click(function() { 
				animateTo(getTop() - wheight); 
				return false; 
			});
			
			sbar.click(function(e) {
				if (e.pageY < shan.offset().top) {
					animateTo(getTop() + wheight);
				} else if (e.pageY > (shan.offset().top + shan.height())) {
					animateTo(getTop() - wheight);
				}
				return false;
			});
			
			// Dragging the scroll handle
			
			var dragSh = function(e) {
				shan.css({top: Math.minMax(2, Math.round(e.pageY - shan.data('my')), sbar.height() - shan.height() - 2)}); 
				matchCnt();
				return false;
			};
			
			var dragShStop = function(e) {
				$(document).off('mousemove', dragSh).off('mouseup', dragShStop);
				return false;
			};
			
			shan.on('mousedown', function(e) { 
				$(this).data('my', Math.round(e.pageY) - $(this).position().top);
				$(document).on({
					'mousemove': dragSh,
					'mouseup': dragShStop
				});
				return false;
			});
			
			// Handling mousewheel events
			
			if ( settings.enableMouseWheel ) {
				cont.mousewheel(function(e, d) {
					if (d) {
						animateTo(getTop() + settings.wheelIncr * ((d < 0)? -1 : 1));
					}
					return false;
				});
			}
			
			// Dragging the content
			
			var getY = function(e) {
				return ey = ( e.touches && e.touches.length > 0 )? e.touches[0].clientY : ( e.clientY ? e.clientY : ey );
			};
			
			var dragExtra = function() {
				dist += Math.round(speed / 20);
				var nY = tY1 + dist;
				if (nY > 0 || nY < min) {
					clearInterval(scroll);
					return;
				}
				cont.css({top: nY});
				shan.css({top:getSt(), height:getSh()});
				speed *= .8;
				if (Math.abs(speed) < 10) {
					speed = 0;
					clearInterval(scroll);
				}
			};
			
			var dragMove = function(e) {
				if ( tY ) {
					var dY = getY(e) - tY;
					if ( dY ) {
						cont.data('dragOn', true);
						cont.css({top: Math.minMax(min, y0 + dY, 0)});
						shan.css({top: getSt(), height: getSh()});
					}
				} else {
					tY = getY(e);
				}
				return false;
			};
			
			var dragStop = function(e) {
				tY1 = getTop();
				var dY = getY(e) - tY;
				var dT = new Date().getTime() - tT;
				speed = 1000 * dY / dT;
				scroll = setInterval(dragExtra, 50);
				if ($.support.touch) {
					this.ontouchmove = null;
					this.ontouchend = null;
				} else {
					$(document).off({
						mousemove: dragMove,
						mouseup: dragStop
					});
				}
				setTimeout(function() {
					cont.data('dragOn', false);
				}, 20 );
				return (Math.abs(dY) < 4) && (dT < 300);
			};
			
			var dragStart = function(e) { // idea from quirsksmode.org
				if ( wheight >= cheight ||
					((e.type === 'touchstart' || e.type === 'touchmove') && 
					(!e.touches || e.touches.length > 1 || cont.is(':animated'))) ) {
					return true;
				}
				clearInterval(scroll);
				te = e;
				y0 = getTop();
				tY = getY(e);
				tT = new Date().getTime();
				dist = 0;
				min = wheight - cheight;
				if ($.support.touch) {
					$(e.target).closest('a').focus();
					this.ontouchmove = dragMove;
					this.ontouchend = dragStop;
					return true;
				} else {
					$(document).on({
						'mousemove': dragMove,
						'mouseup': dragStop
					});
					return false;
				}
			};
			
			if (settings.enableDrag) {
				ctrls.on('selectstart', noSelect); 
				if ( $.support.touch ) {
					cont[0].ontouchstart = dragStart;
				} else {
					cont.on('mousedown', dragStart);
				}
			}
			
			// Resize event handling
			
			$(window).resize(function() { 
				clearTimeout(to); 
				to = setTimeout(matchScr, 50);
			});
			
			to = setTimeout(matchScr, 10);
			
			cont.attr('role', 'scroll').data('dragOn', false).on('adjust', matchScr);
			
			// Keyboard handling
			
			if ( $.isFunction(settings.enableKeyboard) || settings.enableKeyboard ) {
				$(document).keydown(function(e) {
					if (document.activeElement && document.activeElement.nodeName === 'INPUT') {
						return true;
					}
					var k = e? e.keyCode : window.event.keyCode;
					switch(k) {
						case 33: 
							animateTo( getTop() + wheight ); 
							return false;
						case 34: 
							animateTo( getTop() - wheight ); 
							return false;
					}
					return true;
				});
			}
		});
	};
	
	// Control element styles
	
	$.fn.addScroll.css = {
		ctrls: {
			position: 'absolute',
			right: 0,
			top: 0,
			bottom: 0,
			width: '20px',
			backgroundColor: 'rgba(0,0,0,0.25)'
		},
		sup: {
			position: 'absolute',
			top: 0,
			height: '20px',
			width: '100%',
			backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAMAAADImI+JAAAAA3NCSVQICAjb4U/gAAAA21BMVEX////z8/Px8fHv7+/r6+vj4+Ph4eHd3d3V1dXT09PMzMz////39/fz8/Ph4eHf39/R0dHMzMz29vbr6+vj4+Pf39/V1dXR0dHMzMz7+/v4+Pjn5+fh4eHT09P////7+/v39/fz8/Px8fHv7+/n5+fl5eXb29vV1dXT09PPz8/z8/Pv7+/t7e3n5+fh4eHd3d3b29vX19fV1dXPz8/V1dXX19fz8/Px8fHr6+vf39/V1dXR0dH////7+/v4+Pj29vbz8/Px8fHv7+/r6+vl5eXh4eHf39/b29vZ2dkZVI+xAAAASXRSTlMAERERERERERERESIiIiIiIiIzMzMzMzMzRERERERVVVVVVVVVVVVVVVVmZmZmZmZmZmZmiJm7u7u7u7vMzMzMzMzMzMzMzMzMnYvVbwAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMjcvMTKZQM39AAAAsElEQVQokd3PVw6CQBCA4bGBgl0RUVnE3lGxyyp2738igYTgDjdgXib58+0mAxDFEcajDG7186kWcuZy3uOxez8OEnbGTNO6PHI3SvcSdsSZf+k5y2Kk58Rs25Gc30quUxoXRxaCxyvHAeQnhFT8Zn7uVAFo2hadBj8auujuvE5ifpNfV8XdLZuWmXNSqiowgU8Ct92kgUuwd8vrRRXQDL/PPm4gDDpx3IrHXS4EozA/q10U2ZOLzHEAAAAASUVORK5CYII=)',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '0 0'
		},
		sdn: {
			position: 'absolute',
			bottom: 0,
			height: '20px',
			width: '100%',
			backgroundImage: 'url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACgAAAAUCAMAAADImI+JAAAAA3NCSVQICAjb4U/gAAAAyVBMVEX////////x8fHt7e3h4eHPz8/MzMzHx8f19fXz8/Pd3d3b29vY2NjV1dXPz8/MzMz7+/vp6enl5eXh4eHd3d3b29vV1dXMzMz////7+/vz8/Pv7+/p6enb29vT09PR0dHPz8/MzMz39/f19fXx8fHt7e3p6enn5+fl5eXh4eHd3d3V1dXT09PR0dHPz8/MzMzz8/Pf39/7+/vx8fHV1dXT09PPz8/////7+/v39/f19fXx8fHv7+/r6+vp6enl5eXh4eHb29vV1dUeyeDsAAAAQ3RSTlMAERERERERESIiIiIiIiIiMzMzMzMzMzNVVVVVVVVVVVVVZmZmZmZmZmZmZmZmZmaqqru7u7u7zMzMzMzMzMzMzMzM6wrcmgAAAAlwSFlzAAALEgAACxIB0t1+/AAAABx0RVh0U29mdHdhcmUAQWRvYmUgRmlyZXdvcmtzIENTNXG14zYAAAAWdEVYdENyZWF0aW9uIFRpbWUAMDIvMjcvMTKZQM39AAAAuElEQVQokd2OVw6CQBBABxULCpZVXMSCiigodmVxLeD9DyWQSFluwPxM8vIybwCKOLWDzbOsfb+KOXG43XRZpvnvcU7kJ6Myy6TTsZEB1fksSgjaNM4HWTncg1sqH2TXAoC4s4zen+399wsByF/vZSQXraWiCpJt6UopznoPQlHgUVJP2q0Vxqpp6phLWP9JCP18KOmkv6yoGC8WaQ8AUUJcN+sBNAMz60Wm4zBeaCocy9DlnPMKMT+D4hKAU0ohVAAAAABJRU5ErkJggg==)',
			backgroundRepeat: 'no-repeat',
			backgroundPosition: '0 0'
		},
		sbar: {
			position: 'absolute',
			top: '20px',
			bottom: '20px',
			width: '100%'
		},
		shan: {
			position: 'absolute',
			top: '3px',
			left: '3px',
			right: '3px',
			height: '10px',
			backgroundColor: 'rgba(255,255,255,0.3)'
		}	
	};
	
	// Defaults
	
	$.fn.addScroll.defaults = {
		enableKeyboard: true,
		enableMouseWheel: true,
		enableDrag: true,
		dragMinSize: 10,
		speed: 250,
		effect: 'easeOutBack',
		disabledOpacity: 0.3,
		wheelIncr: 50,
		rounding: 10,
		gap: 3,
		shadows: true
	};

})(jQuery);
