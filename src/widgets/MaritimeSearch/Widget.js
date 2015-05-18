define(['dojo/_base/declare', 'jimu/BaseWidget', 'libs/maritime/Search'],
function(declare, BaseWidget, MaritimeSearch) {
  //To create a widget, you need to derive from BaseWidget.
  return declare([BaseWidget], {

    // Custom widget code goes here

    baseClass: 'maritime-search',
    // this property is set by the framework when widget is loaded.
    // name: 'MaritimeSearch',
    // add additional properties here

    //methods to communication with app container:
    postCreate: function() {
      this.inherited(arguments);
      console.log('MaritimeSearch::postCreate');
    }

    // startup: function() {
    //   this.inherited(arguments);
    //   console.log('MaritimeSearch::startup');
    // },

    // onOpen: function(){
    //   console.log('MaritimeSearch::onOpen');
    // },

    // onClose: function(){
    //   console.log('MaritimeSearch::onClose');
    // },

    // onMinimize: function(){
    //   console.log('MaritimeSearch::onMinimize');
    // },

    // onMaximize: function(){
    //   console.log('MaritimeSearch::onMaximize');
    // },

    // onSignIn: function(credential){
    //   console.log('MaritimeSearch::onSignIn', credential);
    // },

    // onSignOut: function(){
    //   console.log('MaritimeSearch::onSignOut');
    // }

    // onPositionChange: function(){
    //   console.log('MaritimeSearch::onPositionChange');
    // },

    // resize: function(){
    //   console.log('MaritimeSearch::resize');
    // }

//methods to communication between widgets:

  });

});
