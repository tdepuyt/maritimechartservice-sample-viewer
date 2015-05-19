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

                for (var j = 0; j < this.map.layerIds.length; j++) {
                    var layer = this.map.getLayer(this.map.layerIds[j]);
                    if (layer.url.indexOf("/exts/Maritime Chart Service/AISServer") > 0)
                        this.aisLayer = layer;
                    else if (layer.url.indexOf("/exts/Maritime Chart Service/MapServer") > 0)
                        this.s57Layer = layer;
                }

                if (this.s57Layer == null) {
                    this.displaySettingsNode.innerHTML = "This map has no Maritime Chart Service Layer";

                } else {
                    this.displaySettings = new DisplaySettings({
                        map: this.map,
                        s57Layer: this.s57Layer,
                        aisLayer: this.aisLayer
                    }, this.displaySettingsNode);
                }

            },

            startup: function() {

               this.inherited(arguments);

               console.log('MCSDisplayProperties::startup');
               if (this.displaySettings != null)
                this.displaySettings.startup();
            }

            // onOpen: function(){
            //   console.log('MCSDisplayProperties::onOpen');
            // },

            // onClose: function(){
            //   console.log('MCSDisplayProperties::onClose');
            // },

            // onMinimize: function(){
            //   console.log('MCSDisplayProperties::onMinimize');
            // },

            // onMaximize: function(){
            //   console.log('MCSDisplayProperties::onMaximize');
            // },

            // onSignIn: function(credential){
            //   console.log('MCSDisplayProperties::onSignIn', credential);
            // },

            // onSignOut: function(){
            //   console.log('MCSDisplayProperties::onSignOut');
            // }

            // onPositionChange: function(){
            //   console.log('MCSDisplayProperties::onPositionChange');
            // },

            // resize: function(){
            //   console.log('MCSDisplayProperties::resize');
            // }

            //methods to communication between widgets:

        });

    });