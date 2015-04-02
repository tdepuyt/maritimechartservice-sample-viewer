define(['dojo/_base/declare', 'jimu/BaseWidget', '../maritime/Identify'],
function(declare, BaseWidget, MaritimeIdentify) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'maritime-identify',
    // this property is set by the framework when widget is loaded.
    // name: 'MaritimeIdentify',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('MaritimeIdentify::postCreate');
    }

    // startup: function() {
    //   this.inherited(arguments);
    //   console.log('MaritimeIdentify::startup');
    // },

    // onOpen: function(){
    //   console.log('MaritimeIdentify::onOpen');
    // },

    // onClose: function(){
    //   console.log('MaritimeIdentify::onClose');
    // },

    // onMinimize: function(){
    //   console.log('MaritimeIdentify::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('MaritimeIdentify::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('MaritimeIdentify::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('MaritimeIdentify::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('MaritimeIdentify::onPositionChange');
    // },

    // resize: function(){
    //   console.log('MaritimeIdentify::resize');
    // }

//methods to communication between widgets:

  });

});
