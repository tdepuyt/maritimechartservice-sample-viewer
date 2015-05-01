define(['dojo/_base/declare', 'jimu/BaseWidget', '../maritime/Identify'],
    function(declare, BaseWidget, Identify) {
        //To create a widget, you need to derive from BaseWidget.
        var clazz = declare([BaseWidget], {

            // Custom widget code goes here

            baseClass: 'identify',
            // this property is set by the framework when widget is loaded.
            // name: 'Identify',
            // add additional properties here

            //methods to communication with app container:
            postCreate: function() {
                this.inherited(arguments);
                console.log('Identify::postCreate');
                this.Identify = new Identify({
                    map: this.map,
                    nls: this.nls,
                    aisServiceUrl: this.config.aisServiceUrl,
                    s57ServiceUrl: this.config.s57ServiceUrl
                }, this.IdentifyNode);
            },

            startup: function() {
                // summary:
                //      Overrides method of same name in dijit._Widget.
                // tags:
                //      private
                this.inherited(arguments);
                this.Identify.startup();
            },


            onOpen: function() {
                // summary:
                //      Overrides method of same name in jimu._BaseWidget.
                console.log('Identify::onOpen', arguments);
                if (this.Identify) {
                    this.Identify.showPoint();
                    this.Identify.resumeClickListener();
                }
            },

            onClose: function() {
                // summary:
                //      Overrides method of same name in jimu._BaseWidget.
                console.log('Identify::onClose', arguments);
                this.Identify.hidePoint();
                this.Identify.pauseClickListener();
            }

        });
        return clazz;

    });