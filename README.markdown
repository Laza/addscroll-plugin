<h1>jQuery addScroll Plugin</h1>
<p>This plugin adds a vertical scrollbar to a layer which has content deeper than its container parent. It will watch if the window has resized, and adjusts itself. The content can be scrolled on devices with touch interface too.</p>
<h2>Syntax</h2>
<pre><code>$(layer).addScroll({ options });</code></pre>
<h5>options</h5>
<ul>
	<li><code>enableKeyboard</code> Enable PgUp and PgDn keys (default = true)</li>
	<li><code>enableMouseWheel</code> Enable the mouse wheel (default = true)</li>
	<li><code>enableDrag</code> Enable dragging the content with the mouse or touch (default = true) Please note, this functionality disables selecting text content within the layer.</li>
	<li><code>dragMinSize</code> the minimum size of the scroll handle (default = 10px)</li>
	<li><code>speed</code> the speed of the scrolling (default = 250ms)</li>
	<li><code>effect</code> the scrolling animation effect (default = 'easeOutBack') Other options: 'swing' and 'linear'</li>
	<li><code>disabledOpacity</code> the disabled elements opacity (default = 0.3) (e.g. scroll up button when at the top)</li>
	<li><code>wheelIncr</code> the pixels to scroll on one mousewheel (default = 50)</li>
	<li><code>rounding</code> rounding radius of the scrollbar (default = 10px)</li>
	<li><code>shadows</code> CSS3 shadow effects (default = true)</li>
	<li><code>gap</code> the horizontal gap between the content and the scrollbar (default = 3px)</li>
</ul>
<h2>Demo</h2>
<p><a href="http://lazaworx.com/static/addscroll-plugin/sample.html">http://lazaworx.com/static/addscroll-plugin/sample.html</a></p>
<h2>Usage</h2>
<pre><code><script src="addscroll.js"></script>
<script>
	// Simply calling it with the defaults
	$(document).ready(function() {
		$('#content').addScroll();
	});
</script>
</code></pre>
<h2>Requirements</h2>
<p><a href="http://docs.jquery.com/Downloading_jQuery">jQuery 1.7 or higher</a></p>
<h2>License</h2>
<p>Available for use in all personal or commercial projects under both <a href="MIT-LICENSE.txt">MIT</a> and <a href="GPL-LICENSE.txt">GPL licenses</a>.</p>
<p>Copyright (c) 2012 <a href="http://lazaworx.com">Molnar Laszlo</a></p>
