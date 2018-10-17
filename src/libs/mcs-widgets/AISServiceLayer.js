/* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
define([
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dojo/io-query',
		'esri/layers/ArcGISDynamicMapServiceLayer',
		'esri/request',
		"esri/IdentityManager"
	],
	function(
		declare, lang, ioQuery,
		ArcGISDynamicMapServiceLayer,
		esriRequest,
		esriId
	) {
		return declare([ArcGISDynamicMapServiceLayer], {
			displayParameters: null,
			// override get image url to send parameters to service

			getImageUrl: function(extent, width, height, callback) {
				var credential = esriId.findCredential(this._url.path);
				console.log(arguments);
				var date = new Date();
				var params = {
					dpi: this.dpi, //96,
					transparent: this.imageTransparency, //true
					format: this.imageFormat, //"png8",
					frames_on: this.framesOn,
					//changing values
					bbox: extent.xmin + "," + extent.ymin + "," + extent.xmax + "," + extent.ymax,
					bboxSR: JSON.stringify(extent.spatialReference.toJson()),
					size: width + "," + height,
					f: "image",
					display_params: JSON.stringify(this.displayParameters),
					request_count: date.getTime()
				};
				if(credential && credential.token) {
					params.token = credential.token;
				}
				callback(this._url.path + "/export?" + ioQuery.objectToQuery(params));
			}
		});
	});