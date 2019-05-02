define(['dojo/_base/declare', 'jimu/BaseWidget', 'jimu/dijit/DrawBox', 'libs/mcs-widgets/Identify'],
    function(declare, BaseWidget, DrawBox, Identify) {
        //To create a widget, you need to derive from BaseWidget.
        var clazz = declare([BaseWidget], {

            // Custom widget code goes here
            /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
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
                    var layer = this.map.getLayer(this.map.layerIds[j]);
                    var layerUrl = layer.url;
                    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
                    if ((layerUrl.indexOf("/exts/MaritimeChartService/AISServer") > 0) || (layerUrl.indexOf("/exts/Maritime Chart Server/AISServer") > 0) || (layer.url.indexOf("/exts/Maritime%20Chart%20Service/AISServer") > 0)) {
                        this.s57Layer = layer;
                        this.aisServiceUrl = layerUrl;
                    }
                    else if ((layerUrl.indexOf("/exts/MaritimeChartService/MapServer") > 0) || (layerUrl.indexOf("/exts/Maritime Chart Server/MapServer") > 0) || (layer.url.indexOf("/exts/Maritime%20Chart%20Service/MapServer") > 0)) {
                        this.s57Layer = layer;
                        this.s57ServiceUrl = layerUrl;
                        this.s57LayerIndex = j;
                    }
                    // console.log("s57ServiceUrl is " + this.s57ServiceUrl);       
                }

                var operLayers = this.map.webMapResponse.itemInfo.itemData.operationalLayers;
                for (j = 0; j < operLayers.length; j++) {
                    if((this.s57Layer) && (this.s57Layer.id == operLayers[j].id)) {
                        this.s57LayerTitle = operLayers[j].title;
                        break;
                    } 
                }

                if (this.s57ServiceUrl == null) {
                    console.log("This map has no Maritime Chart Service Layer");
                } else {
                    this.Identify = new Identify({
                        map: this.map,
                        nls: this.nls,
                       /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
                        aisServiceUrl: this.aisServiceUrl,
                        s57ServiceUrl: this.s57ServiceUrl,
                        s57Layer: this.s57Layer,
                        s57LayerIndex: this.s57LayerIndex,
                        identifySymbol: this.config.identifySymbol,
                        s57LayerTitle: this.s57LayerTitle,
                    }, this.identifyNode);
                    this.Identify.setDrawBox(new DrawBox({
                        geoTypes: ['point', 'extent'],
                        deactivateAfterDrawing: false,
                        showClear: false
                    }));
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
                    this.Identify.injectDisplayParameters();
                }
            },

            onClose: function() {
                // summary:
                //      Overrides method of same name in jimu._BaseWidget.
                console.log('Identify::onClose', arguments);
                /*if (this.Identify) {
                    this.Identify.pauseClickListener();
                }*/
            }

        });
        return clazz;

    });