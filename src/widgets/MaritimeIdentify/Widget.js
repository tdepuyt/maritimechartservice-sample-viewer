define(['dojo/_base/declare', 'jimu/BaseWidget', 'libs/mcs-widgets/Identify'],
    function(declare, BaseWidget, Identify) {
        //To create a widget, you need to derive from BaseWidget.
        var clazz = declare([BaseWidget], {

            // Custom widget code goes here

            baseClass: 'identify',
            aisServiceUrl: null,
            s57ServiceUrl: null,
            // this property is set by the framework when widget is loaded.
            // name: 'Identify',
            // add additional properties here

            //methods to communication with app container:
            postCreate: function() {
                this.inherited(arguments);
                console.log('Identify::postCreate');

                for (var j = 0; j < this.map.layerIds.length; j++) {
                    var layerUrl = this.map.getLayer(this.map.layerIds[j]).url;
                    if ((layerUrl.indexOf("/exts/Maritime Chart Service/AISServer") > 0) || (layerUrl.indexOf("/exts/Maritime Chart Server/AISServer") > 0))
                        this.aisServiceUrl = layerUrl;
                    else if ((layerUrl.indexOf("/exts/Maritime Chart Service/MapServer") > 0) || (layerUrl.indexOf("/exts/Maritime Chart Server/MapServer") > 0))
                        this.s57ServiceUrl = layerUrl;
                }

                if (this.s57ServiceUrl == null) {
                    console.log("This map has no Maritime Chart Service Layer");
                } else {
                    this.Identify = new Identify({
                    map: this.map,
                    nls: this.nls,
                    aisServiceUrl: this.aisServiceUrl,
                    s57ServiceUrl: this.s57ServiceUrl,
                    identifySymbol: this.config.identifySymbol
                }, this.IdentifyNode);
            }
        },

            startup: function() {
                // summary:
                //      Overrides method of same name in dijit._Widget.
                // tags:
                //      private
                this.inherited(arguments);
                if (this.Identify) {
                    this.Identify.startup();
                }
            },


            onOpen: function() {
                // summary:
                //      Overrides method of same name in jimu._BaseWidget.
                console.log('Identify::onOpen', arguments);
                if (this.Identify) {
                     this.Identify.resumeClickListener();
                }
            },

            onClose: function() {
                // summary:
                //      Overrides method of same name in jimu._BaseWidget.
                console.log('Identify::onClose', arguments);
                this.Identify.pauseClickListener();
            }

        });
        return clazz;

    });