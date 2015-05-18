define([
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dojo/io-query',
		'esri/layers/ArcGISDynamicMapServiceLayer',
		'esri/request'
	],
	function(
		declare, lang, ioQuery,
		ArcGISDynamicMapServiceLayer,
		esriRequest
	) {
		return declare([ArcGISDynamicMapServiceLayer], {
			displayParameters: null,
			// override get image url to send parameters to service
			getImageUrl: function(extent, width, height, callback) {
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
				callback(this._url.path + "/export?" + ioQuery.objectToQuery(params));
			}
		});
	});