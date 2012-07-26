# Introduction
jsTrac is library providing a Javascript interface to Trac, through its XML-RPC plugin.As such, it can be integrated to any website and allow developers and/or users to directly submit ticket to it.

Moreoever, jsAnnotate is provided with jsTrac. jsAnnotate is based on [jsfeedback](http://hertzen.com/experiments/jsfeedback/) allows the user to draw frame, mask, arrows and note on the webpage, then take a screenshot with the help of [html2canvas](http://html2canvas.hertzen.com).

Both script are designed to be independant of each other so that you may switch one of them if needed or use only one of them.


#Compatiblity

jsTrac and jsAnnotate should be compatible with most standard compliant browser.
For the screenshot part ( not annotation! ), check [html2canvas](http://html2canvas.hertzen.com) compatiblity.

**Browsers fully compatible**

* Firefox 14 ( need to be tested with older version )
* Chrome 19 ( need to be tested with older version )
* Safari 6
* Safari 5+ ( Compatibity mode in jsAnnotate )
* Opera 12.00 ( Compatibity mode in jsAnnotate )

**Browser with severe limitation**

* Internet Explorer 9

In the case of Internet Explorer, you won't be able to use jsTrac if your website is on another domain due to Microsoft lack of CORS implementation for xmlHttpRequest in IE9. XDomainRequest won't work either for 2 reasons:

* XDomainRequest doesn't allow credential meaning you won't be able to log on Trac
* The content-type is limited to 2 values, neither are accepted by the Trac XML-RPC plugin

IE 10 might solve these issues considering that full CORS support has been added to the xmlHttpRequest object.

jsTrac may work on the same domain as the trac server, but this need more testing.

#Dependencies

These 2 scripts have several dependencies. Some of them could certainly be removed over time, but for now, here they are:

 
* Common lib
 * jQuery 1.7.2
 * Bootstrap 2.0.4 ( Alert, Modal, Button, Tab )
* jsAnnotate lib
 * html2canvas 0.34
 * jQuery UI 1.8.22 ( Draggable )
 * canvg 1.2
  * rgbcolor
 * Mousetrap
 * Raphaël 2.1
* jsTrac lib
 * Mimic 2.2 ( Warning! This one is modified to allow credential )
 * jQuery Validation
 
The package provides these libraries in separate folders but do check for newer version.

#How to use

Check the provided example. At the moment, we can't provide a server for testing jsTrac feature, but the example will run a sample configuration and connect on your Trac. Here is the bare minimum for the complete workflow with images.

~~

		$(document).ready(function() {
			var optsAnnotate={
					'onRendered': function(img){
						var optsTrac= { 'img' : img };
						jsTrac.initTracForm($('#url_to_trac').val(),optsTrac);
						}
			}
			$('#reportbug').annotate(optsAnnotate);
		});
			
~~
 
#Changelog

v1.0
* Initial release