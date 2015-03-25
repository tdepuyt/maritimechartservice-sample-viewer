define([
  'dojo/text!./templates/DisplaySettings.html',

  'dojo/_base/declare',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin'
], function(
  template,

  declare,

  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // description:
    //    Maritime

    templateString: template,
    baseClass: 'display-settings',
    widgetsInTemplate: true,

    // Properties to be sent into constructor

    postCreate: function() {
      // summary:
      //    Overrides method of same name in dijit._Widget.
      // tags:
      //    private
      console.log('maritime.DisplaySettings::postCreate', arguments);

      this.setupConnections();

      this.inherited(arguments);
    },
    setupConnections: function() {
      // summary:
      //    wire events, and such
      //
      console.log('maritime.DisplaySettings::setupConnections', arguments);

    }
  });
});