define(['dojo/_base/declare', 'jimu/BaseWidget', '../maritime/DisplaySettings'],
    function(declare, BaseWidget, DisplaySettings) {
        //To create a widget, you need to derive from BaseWidget.
        return declare([BaseWidget, DisplaySettings], {

            // Custom widget code goes here

            baseClass: 'mcs-display-properties',
            // this property is set by the framework when widget is loaded.
            // name: 'MCSDisplayProperties',
            // add additional properties here

            //methods to communication with app container:
            postCreate: function() {
                this.inherited(arguments);
                console.log('MaritimeDisplayProperties::postCreate');

                this.displaySettings = new DisplaySettings({
                    //config: this.config.floodModeler,
                    nls: this.nls,
                    map: this.map
                }, this.displaySettingsNode);
            }

            // startup: function() {
            //   this.inherited(arguments);
            //   console.log('MCSDisplayProperties::startup');
            // },

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