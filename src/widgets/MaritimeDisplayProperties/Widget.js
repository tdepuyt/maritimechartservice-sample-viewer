define(['dojo/_base/declare', 'jimu/BaseWidget', 'libs/mcs-widgets/DisplaySettings'],
    function(declare, BaseWidget, DisplaySettings) {
        //To create a widget, you need to derive from BaseWidget.
        return declare([BaseWidget], {

            // Custom widget code goes here

            baseClass: 'mcs-display-properties',
            // this property is set by the framework when widget is loaded.
            // name: 'MCSDisplayProperties',
            // add additional properties here

            //methods to communication with app container:
            postCreate: function() {
                this.inherited(arguments);
                console.log('MaritimeDisplayProperties::postCreate');
            
                var flagHasS57Layer = false;
                var MCSLayersConfig = {};
                var flagFirstS57Layer = true;
                for (var i = 0; i < this.map.layerIds.length; i++) {
                    var layer = this.map.getLayer(this.map.layerIds[i]);
                    var indexMCSStr1 = layer.url.toLowerCase().indexOf("/exts/MaritimeChartService/MapServer".toLowerCase()); 
                    var indexMCSStr2 = layer.url.toLowerCase().indexOf("/exts/Maritime Chart Server/MapServer".toLowerCase());
                    var indexMCSStr3 = layer.url.toLowerCase().indexOf("/exts/Maritime%20Chart%20Service/MapServer".toLowerCase());
                    // in the MCS URL, "exts" and "mapserver" could be lower case or upper case
                    if ((indexMCSStr1 > 0 && layer.url.substring(indexMCSStr1+6, indexMCSStr1+26)=="MaritimeChartService")
                      || (indexMCSStr2 > 0 && layer.url.substring(indexMCSStr2+6, indexMCSStr2+27)=="Maritime Chart Server")
                      || (indexMCSStr3 > 0 && layer.url.substring(indexMCSStr3+6, indexMCSStr3+32)=="Maritime%20Chart%20Service")) {
                        flagHasS57Layer = true;
                        // Only pass the information of the MCS layers showed in the setting page to DisplaySettings.js
                        if(layer.id in this.config.mcsLayers) {
                            console.log(layer.id + ": " + this.config.mcsLayers[layer.id].selectedControls)
                            MCSLayersConfig[layer.id] = {
                                id: layer.id,
                                controls: this.config.mcsLayers[layer.id].selectedControls,
                                parametersContent: this.config.mcsLayers[layer.id].mcsParametersContent,
                                s57Layer: layer,
                                s57LayerIndex: i,
                                selected: flagFirstS57Layer
                            };
                        }
                    }
                }
                
                if (!flagHasS57Layer) {
                    this.displaySettingsNode.innerHTML = "This map has no Maritime Chart Service Layer";
                } else {
                    this.displaySettings = new DisplaySettings({
                        map: this.map,
                        includeParameters: this.config.includeParameters,
                        includeParameterGroups: this.config.includeParameterGroups,
                        MCSLayersConfig: MCSLayersConfig
                    }, this.displaySettingsNode);
                }
            },

            startup: function() {

               this.inherited(arguments);

               console.log('MCSDisplayProperties::startup');
               if (this.displaySettings != null)
                this.displaySettings.startup();
            }
        });

    });