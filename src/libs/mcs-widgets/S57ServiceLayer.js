define([
		'dojo/_base/declare',
		'dojo/_base/lang',
		'dojo/Evented',
		'dojo/io-query',
		'esri/layers/ArcGISDynamicMapServiceLayer',
		'esri/request'
	],
	function(
		declare, lang, Evented, ioQuery,
		ArcGISDynamicMapServiceLayer,
		esriRequest
	) {

		return declare([Evented, ArcGISDynamicMapServiceLayer], {
			constructor: function(args, arg2, arg3) {
				this.internalLoaded = false;
				this.serviceError = lang.hitch(this, this.serviceError);
				this.parameterSuccess = lang.hitch(this, this.parameterSuccess);
				var parameterUrl = this.url + "/parameters?f=json";
				var parameterRequest = new esriRequest({
					'url': parameterUrl,
					handleAs: "json",
					callbackParamName: 'callback'
				});
				parameterRequest.then(this.parameterSuccess, this.serviceError);
			},

			parameterSuccess: function(parameters) {
				this.displayParameters = parameters.DisplayParameters;
				this.serverDefaultVisibility = parameters.ServerParameters.defaultVisibility;
				this.framesOn = parameters.ServerParameters.framesOn;
				this.emit('parametersLoaded', {});
			},

			serviceError: function(err) {
				console.log('Service request error: ' + err.message);
				this.onError(this);
			},
	
			// override get image url to send parameters to service
			getImageUrl: function(extent, width, height, callback) {
				console.log(arguments);
				var visiLayers = "";
				if (typeof this.visibleLayers !== 'undefined') {
					for (var i = 0; i < this.visibleLayers.length; i++) {
						if (i == this.visibleLayers.length - 1)
							visiLayers = visiLayers + this.visibleLayers[i];
						else
							visiLayers = visiLayers + this.visibleLayers[i] + ",";
					}
				}
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
					display_params: JSON.stringify(this.displayParameters)
				};

				if (typeof this.visibleLayers !== 'undefined') {
					params.layers = "show:" + visiLayers;
				}
				callback(this._url.path + "/export?" + ioQuery.objectToQuery(params));
			}
		});
	});