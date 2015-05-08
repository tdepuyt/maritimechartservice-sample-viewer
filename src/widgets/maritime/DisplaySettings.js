var testsUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/';

define([
  'dojo/on',
  'dojo/text!./templates/DisplaySettings.html',

  'dojo/_base/declare',

  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'esri/layers/ImageParameters',
  './S57ServiceLayer',
  './AISServiceLayer',
  //testsUrl + '../S57ServiceLayer.js',
  //testsUrl + '../AISServiceLayer.js',
  'dijit/form/Button'
], function(
  on,
  template,

  declare,

  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  ImageParameters,
  S57ServiceLayer,
  AISServiceLayer
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // description:
    //    Maritime

    templateString: template,
    baseClass: 'display-settings',
    widgetsInTemplate: true,
    aisLayer: null,
    s57Layer: null,
    s57CustomLayer: null,
    aisCustomLayer: null,
    map: null,

    // Properties to be sent into constructor

    postCreate: function() {
      // summary:
      //    Overrides method of same name in dijit._Widget.
      // tags:
      //    private
      console.log('maritime.DisplaySettings::postCreate', arguments);

      this.setupConnections();

      this.inherited(arguments);

      //this.s57Layer = this.map.getLayer("Maritime Chart Service_4144");
      //this.aisLayer = this.map.getLayer("Maritime Chart Service_4534");
      var imageParameters = new ImageParameters();
      imageParameters.format = "jpeg";
      s57CustomLayer = new S57ServiceLayer(this.s57Layer.url, {
        "opacity": 1,
        "imageParameters": imageParameters
      });
      
      aisCustomLayer = new AISServiceLayer(this.aisLayer.url, {
        "opacity": 1,
        "imageParameters": imageParameters
      });

      aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;

      this.map.removeLayer(this.s57Layer);
      this.map.addLayer(s57CustomLayer);
      //s57CustomLayer.on('load', this.setupDisplaySettings());
      this.map.removeLayer(this.aisLayer);
      this.map.addLayer(aisCustomLayer);
      this._initEventHandlers();

    },
    setupConnections: function() {
      // summary:
      //    wire events, and such
      //
      console.log('maritime.DisplaySettings::setupConnections', arguments);

    },
    setupDisplaySettings: function(){
      //TODO: Set display parameters in form to match that of the service in case that differs. [Before event handling!]
      var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
      this.colorschemeSelect.value = this.findParameter(parametersArray, 'ColorScheme').value.toString();
      this.depthunitsSelect.value = this.findParameter(parametersArray, 'ColorScheme').value.toString();
      


    },
    _initEventHandlers: function() {
      var _this = this;
      this.own(on(this.colorschemeSelect, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "ColorScheme")].value = parseInt(_this.colorschemeSelect.value, 10);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
        aisCustomLayer.refresh();

      }));
      this.own(on(this.depthunitsSelect, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplayDepthUnits")].value = parseInt(_this.depthunitsSelect.value, 10);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.depthshadesSelect, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "TwoDepthShades")].value = parseInt(_this.depthshadesSelect.value, 10);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.shallowpatternsSelect, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "ShallowDepthPattern")].value = parseInt(_this.shallowpatternsSelect.value, 10);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.pointsymbolizationSelect, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.StaticParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "PointSymbolizationType")].value = parseInt(_this.pointsymbolizationSelect.value, 10);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.areasymbolizationSelect, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.StaticParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "AreaSymbolizationType")].value = parseInt(_this.areasymbolizationSelect.value, 10);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.framesonSelect, 'change', function() {
        s57CustomLayer.framesOn = (_this.framesonSelect.value ===2);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.scaminSelect, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "HonorScamin")].value = parseInt(_this.scaminSelect.value, 10);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.nobjnmSelect, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplayNOBJNM")].value = parseInt(_this.nobjnmSelect.value, 10);
        s57CustomLayer.refresh();
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
    },
    _onApplyClick: function( /*e*/ ) {
      var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
      parametersArray[this.findParameter(parametersArray, "ShallowContour")].value = parseInt(this.input_shallow.value, 10);
      parametersArray[this.findParameter(parametersArray, "SafetyContour")].value = parseInt(this.input_safety.value, 10);
      parametersArray[this.findParameter(parametersArray, "DeepContour")].value = parseInt(this.input_deep.value, 10);
      s57CustomLayer.refresh();
      aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
    },
    findParameter: function(parametersArray, name) {
       for (i = 0; i < parametersArray.length; i++) {
        if (parametersArray[i].name == name) {
          return (i);
        }
      }
      return (-1);
    }
  });
});