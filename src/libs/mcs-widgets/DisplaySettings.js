//var testsUrl = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/')) + '/';

define([
  'dojo/on', 'dojo/topic', 'dojo/query',
  'dojo/text!./templates/DisplaySettings.html',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'dijit/form/CheckBox',
  'dijit/form/NumberSpinner',
  'dijit/form/DateTextBox',
  'esri/layers/ImageParameters',
  './S57ServiceLayer',
  /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
  './AISServiceLayer',
  //testsUrl + '../S57ServiceLayer.js',
  //testsUrl + '../AISServiceLayer.js',
  'bootstrap/Tab',
  'dijit/form/Button'
], function(
  on, topic, query,
  template,
  declare, lang, array,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  Checkbox,
  NumberSpinner,
  DateTextBox,
  ImageParameters,
  S57ServiceLayer,
  /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
  AISServiceLayer
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // description:
    //    Maritime

    templateString: template,
    baseClass: 'display-settings',
    widgetsInTemplate: true,
    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
    aisLayer: null,
    s57Layer: null,
    s57LayerTitle: null,
    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
    aisLayerTitle: null,
    s57CustomLayer: null,
    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
    aisCustomLayer: null,
    map: null,
    includeParameters: null, /* set of parameters to include form config.json . This is different from selected control from Setting.js */

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
        "opacity": this.s57Layer.opacity,
        "visible": this.s57Layer.visible,
        "imageParameters": imageParameters,
        "refreshInterval": this.s57Layer.refreshInterval,
        "maxScale": this.s57Layer.maxScale,
        "minScale": this.s57Layer.minScale,
        "id": this.s57LayerTitle || this.s57Layer.id,
        "description": this.s57Layer.description
      });
//        "id": this.this.s57Layer.arcgisProps || this.s57Layer.id,
//      s57CustomLayer.attr(arcgisProps, this.s57Layer.arcgisProps);

      s57CustomLayer.setVisibleLayers(this.s57Layer.visibleLayers);
      on(s57CustomLayer, 'parametersLoaded', lang.hitch(this, function() {
        this.setupDisplaySettings();
      }));

      on.once(s57CustomLayer, 'update-end', lang.hitch(this, function() {
          this.map.removeLayer(this.s57Layer);
      }));
      this.map.addLayer(s57CustomLayer, this.s57LayerIndex);

      /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
      if (this.aisLayer) {
        aisCustomLayer = new AISServiceLayer(this.aisLayer.url, {
          "opacity": this.aisLayer.opacity,
          "visible": this.aisLayer.visible,
          "imageParameters": imageParameters,
          "refreshInterval": this.aisLayer.refreshInterval,
          "maxScale": this.aisLayer.maxScale,
          "minScale": this.aisLayer.minScale,
          "id": this.aisLayerTitle || this.s57Layer.id,
          "description": this.aisLayer.description
        });

        on.once(aisCustomLayer, 'update-end', lang.hitch(this, function() {
          this.map.removeLayer(this.aisLayer);
        }));

        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
        this.map.addLayer(aisCustomLayer);
      } else aisCustomLayer = null;
    },
    setupConnections: function() {
      // summary:
      //    wire events, and such
      //
      console.log('maritime.DisplaySettings::setupConnections', arguments);

    },

    // initialize the controls
    setupDisplaySettings: function(){
      var dispObj = JSON.parse(this.parametersContent);
      var params = dispObj.ECDISParameters.DynamicParameters.Parameter;
      var dynamicHtml;

      function isGroupParameter(checkparam) {
        return (checkparam === 'AreaSymbolSize'  || checkparam === 'DatasetDisplayRange' || checkparam === 'LineSymbolSize'
         || checkparam === 'PointSymbolSize' || checkparam === 'TextSize' || checkparam === 'TextGroups');
      }

      if(this.controls && this.controls.length > 0) {
        var ctrlArr = this.controls.split(",");
        for (var i=0; i<ctrlArr.length; i++) {
          if(!this[ctrlArr[i]])
            continue;  //bypass all non-supported parameters
          this[ctrlArr[i]].style.display = "block";
          if (!isGroupParameter(ctrlArr[i])) {
            for (var j=0; j<params.length; j++) {
              dynamicHtml = "";
              if (params[j].name === ctrlArr[i]) {
                switch(ctrlArr[i]) {
                  case "AreaSymbolizationType":
                  case "ColorScheme":
                  case "DisplayDepthUnits":
                  case "DisplayFrames":
                  case "PointSymbolizationType":
                  case "AttDesc":
                  case "DisplayFrameText":
                  case "DisplayFrameTextPlacement":
                      for(var k=0; k<params[j].ExpectedInput.length; k++) {
                        if (params[j].value === params[j].ExpectedInput[k].code)
                          dynamicHtml += "<option value='" + params[j].ExpectedInput[k].code + "' selected='selected'>" + params[j].ExpectedInput[k].value + "</option>";
                        else
                          dynamicHtml += "<option value='" + params[j].ExpectedInput[k].code + "'>" + params[j].ExpectedInput[k].value + "</option>";
                      }
                      this[ctrlArr[i] + "Ctrl"].innerHTML = dynamicHtml;
                      break;
                  case "DisplayCategory":
                  case "IntendedUsage":
                  case "DisplayAIOFeatures":
                      var filter = params[j].value;
                      if (filter.substr(0,1)=="0") filter = "0"; // to handle special case for IntendedUsage
                      var selValues = filter.split(',');
                      for(var k=0; k<params[j].ExpectedInput.length; k++) {
                        var curChecked = false;
                        if (array.indexOf(selValues, params[j].ExpectedInput[k].code) >=0)
                          curChecked = true;
                        if (curChecked)
                          dynamicHtml += "<label><input type='checkbox' id='dbox" + (k+1) + "' value='" + params[j].ExpectedInput[k].code + "' checked/>" + params[j].ExpectedInput[k].value + "</label><br/>";
                        else
                          dynamicHtml += "<label><input type='checkbox' id='dbox" + (k+1) + "' value='" + params[j].ExpectedInput[k].code + "'/>" + params[j].ExpectedInput[k].value + "</label><br/>";
                      }
                      this[ctrlArr[i] + "Ctrl"].innerHTML = dynamicHtml;
                      break;
                  case "CompassRose":
                  case "DataQuality":
                  case "DisplayNOBJNM":
                  case "OptionalDeepSoundings":
                  case "IsolatedDangers":
                  case "HonorScamin":
                  case "ShallowDepthPattern":
                  case "LabelContours":
                  case "LabelSafetyContours":
                  case "TwoDepthShades":
                  case "TextHalo":
                  case "RemoveDuplicateText":
                  case "DisplayLightSectors":
                  case "DisplaySafeSoundings":
                  case "DateDependencySymbols":
                    if(params[j].value == "2")
                      this[ctrlArr[i] + "Ctrl"].set("checked", true);
                    break;
                  case "DateDependencyRange":
                    this["DateDependencyRangeFromCtrl"].set("value", new Date());
                    this["DateDependencyRangeToCtrl"].set("value", new Date());
                    break;
                }
                break;
              }
            }
          }
          else {
            var parameterGroupsArray = dispObj.ECDISParameters.DynamicParameters.ParameterGroup;
            var grpParameter = parameterGroupsArray[this.findParameter(parameterGroupsArray, ctrlArr[i])];
            if(grpParameter) {
                nestedParams = grpParameter.Parameter;
                switch(ctrlArr[i]) {
                  case "TextGroups":
                    // text groups or Intended Usage
                    var dynamicHtml = "";
                    for(var j=0; j<nestedParams.length; j++) {
                      if (nestedParams[j].value == "2")
                        dynamicHtml += "<label><input type='checkbox' id='dbox" + nestedParams[j].name + "' value='" + nestedParams[j].name + "' checked/>" + nestedParams[j].Description + "</label><br/>";
                      else
                        dynamicHtml += "<label><input type='checkbox' id='dbox" + nestedParams[j].name + "' value='" + nestedParams[j].name + "'/>" + nestedParams[j].Description + "</label><br/>";
                    }
                    this[ctrlArr[i] + "Ctrl"].innerHTML = dynamicHtml;
                    break;
                  case "DatasetDisplayRange":
                  case "AreaSymbolSize":
                  case "LineSymbolSize":
                  case "PointSymbolSize":
                  case "TextSize":
                    this[ctrlArr[i]].style.display = "none";
                    this["symbol_size_tab_header"].style.display = "block";
                    this["SymbolSizeContainer"].style.display = "block";
                    break;
              }
            }
          }
        }
      }
      if (dispObj.ECDISParameters.StaticParameters) {
        var params = dispObj.ECDISParameters.StaticParameters.Parameter;
        var dynamicHtml;
        if(this.controls && this.controls.length > 0) {
          var ctrlArr = this.controls.split(",");
          for (var i=0; i<ctrlArr.length; i++) {
            this[ctrlArr[i]].style.display = "block";
            if (!isGroupParameter(ctrlArr[i])) {
              for (var j=0; j<params.length; j++) {
                dynamicHtml = "";
                if (params[j].name === ctrlArr[i]) {
                  switch(ctrlArr[i]) {
                    case "AreaSymbolizationType":
                    case "PointSymbolizationType":
                    for(var k=0; k<params[j].ExpectedInput.length; k++) {
                      if (params[j].value === params[j].ExpectedInput[k].code)
                        dynamicHtml += "<option value='" + params[j].ExpectedInput[k].code + "' selected='selected'>" + params[j].ExpectedInput[k].value + "</option>";
                      else
                        dynamicHtml += "<option value='" + params[j].ExpectedInput[k].code + "'>" + params[j].ExpectedInput[k].value + "</option>";
                    }
                    this[ctrlArr[i] + "Ctrl"].innerHTML = dynamicHtml;
                    break;
                  }
                  break;
                }
              }
            }
          }
        }
      }
      var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
      this.input_shallow_contour.value = parametersArray[this.findParameter(parametersArray, 'ShallowContour')].value.toString();
      this.input_safety_contour.value = parametersArray[this.findParameter(parametersArray, 'SafetyContour')].value.toString();

      if(this.includeParameters['SafetyDepth']) // TO make the safety depth parameter backward compatible.  @TODO: make other contour parameters controllable. 
      {
          this.input_safety_depth.value = parametersArray[this.findParameter(parametersArray, 'SafetyDepth')].value.toString();
      }
      else
      {
        this["safety_depth_block"].innerHTML = "";
      }
      this.input_deep_contour.value = parametersArray[this.findParameter(parametersArray, 'DeepContour')].value.toString();

      this._initEventHandlers();
    },
    _initEventHandlers: function() {
      var _this = this;
      this.own(on(this.ColorSchemeCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "ColorScheme")].value = parseInt(_this.ColorSchemeCtrl.value, 10);
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer) {
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
          aisCustomLayer.refresh();
        }
      }));
      this.own(on(this.AttDescCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "AttDesc")].value = parseInt(_this.AttDescCtrl.value, 10);
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer) {
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
          aisCustomLayer.refresh();
        }
      }));
      this.own(on(this.DisplayFrameTextCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplayFrameText")].value = parseInt(_this.DisplayFrameTextCtrl.value, 10);
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer) {
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
          aisCustomLayer.refresh();
        }
      }));
      this.own(on(this.DisplayFrameTextPlacementCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplayFrameTextPlacement")].value = parseInt(_this.DisplayFrameTextPlacementCtrl.value, 10);
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer) {
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
          aisCustomLayer.refresh();
        }
      }));
      this.own(on(this.DisplayDepthUnitsCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplayDepthUnits")].value = parseInt(_this.DisplayDepthUnitsCtrl.value, 10);
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.TwoDepthShadesCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "TwoDepthShades")].value = _this.TwoDepthShadesCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.ShallowDepthPatternCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "ShallowDepthPattern")].value = _this.ShallowDepthPatternCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.PointSymbolizationTypeCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        if (_this.findParameter(parametersArray, "PointSymbolizationType")>-1) {
          parametersArray[_this.findParameter(parametersArray, "PointSymbolizationType")].value = parseInt(_this.PointSymbolizationTypeCtrl.value, 10);
          s57CustomLayer.refresh();
          /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
          if (aisCustomLayer)
            aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
        }
        else {
          var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.StaticParameters.Parameter;
          if (_this.findParameter(parametersArray, "PointSymbolizationType")>-1) {
            parametersArray[_this.findParameter(parametersArray, "PointSymbolizationType")].value = parseInt(_this.PointSymbolizationTypeCtrl.value, 10);
            s57CustomLayer.refresh();
            /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
            if (aisCustomLayer)
              aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
          }
        }
      }));
      this.own(on(this.AreaSymbolizationTypeCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        if (_this.findParameter(parametersArray, "AreaSymbolizationType")>-1) {
          parametersArray[_this.findParameter(parametersArray, "AreaSymbolizationType")].value = parseInt(_this.AreaSymbolizationTypeCtrl.value, 10);
          s57CustomLayer.refresh();
          /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
          if (aisCustomLayer)
            aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
        }
        else {
          var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.StaticParameters.Parameter;
          if (_this.findParameter(parametersArray, "AreaSymbolizationType")>-1) {
            parametersArray[_this.findParameter(parametersArray, "AreaSymbolizationType")].value = parseInt(_this.AreaSymbolizationTypeCtrl.value, 10);
            s57CustomLayer.refresh();
            /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
            if (aisCustomLayer)
              aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
          }
        }
      }));
      this.own(on(this.DisplayFramesCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplayFrames")].value = parseInt(_this.DisplayFramesCtrl.value, 10);
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.HonorScaminCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "HonorScamin")].value = _this.HonorScaminCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(on(this.DisplayLightSectorsCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplayLightSectors")].value = _this.DisplayLightSectorsCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(on(this.DisplaySafeSoundingsCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplaySafeSoundings")].value = _this.DisplaySafeSoundingsCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(on(this.RemoveDuplicateTextCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "RemoveDuplicateText")].value = _this.RemoveDuplicateTextCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.TextHaloCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "TextHalo")].value = _this.TextHaloCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.DisplayNOBJNMCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DisplayNOBJNM")].value = _this.DisplayNOBJNMCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      topic.subscribe("mcs/setSafetyContour", function(){
        _this.input_safety.value = parseFloat(arguments[0][0], 10).toString();
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "SafetyContour")].value = parseFloat(_this.input_safety.value, 10);
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
        });
      this.own(on(this.DataQualityCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DataQuality")].value = _this.DataQualityCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(on(this.DateDependencyRangeFromCtrl, 'change', function() {
        var fromCtrl = _this.DateDependencyRangeFromCtrl;
        var toCtrl = _this.DateDependencyRangeToCtrl;
        toCtrl.constraints.min = fromCtrl.value;
        if(!(fromCtrl.isValid() && toCtrl.isValid())) return;

        var from = fromCtrl.value;
        var yyyy1 = from.getFullYear().toString();
        var mm1 = (from.getMonth() + 1).toString();
        if(mm1.length == 1) mm1 = '0' + mm1;
        var dd1 = from.getDate().toString();
        if(dd1.length == 1) dd1 = '0' + dd1;

        var to = toCtrl.value;
        yyyy2 = to.getFullYear().toString();
        mm2 = (to.getMonth() + 1).toString();
        if(mm2.length == 1) mm2 = '0' + mm2;
        dd2 = to.getDate().toString();
        if(dd2.length == 1) dd2 = '0' + dd2;

        var drange = yyyy1 + mm1 + dd1 + "-" + yyyy2 + mm2 + dd2;

        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DateDependencyRange")].value = drange;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(on(this.DateDependencyRangeToCtrl, 'change', function() {
        var fromCtrl = _this.DateDependencyRangeFromCtrl;
        var toCtrl = _this.DateDependencyRangeToCtrl;
        fromCtrl.constraints.max = toCtrl.value;
        if(!(fromCtrl.isValid() && toCtrl.isValid())) return;

        var from = fromCtrl.value;
        var yyyy1 = from.getFullYear().toString();
        var mm1 = (from.getMonth() + 1).toString();
        if(mm1.length == 1) mm1 = '0' + mm1;
        var dd1 = from.getDate().toString();
        if(dd1.length == 1) dd1 = '0' + dd1;

        var to = toCtrl.value;
        yyyy2 = to.getFullYear().toString();
        mm2 = (to.getMonth() + 1).toString();
        if(mm2.length == 1) mm2 = '0' + mm2;
        dd2 = to.getDate().toString();
        if(dd2.length == 1) dd2 = '0' + dd2;

        var drange = yyyy1 + mm1 + dd1 + "-" + yyyy2 + mm2 + dd2;

        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "DateDependencyRange")].value = drange;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      
      this.own(on(this.CompassRoseCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "CompassRose")].value = _this.CompassRoseCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(on(this.IsolatedDangersCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "IsolatedDangers")].value = _this.IsolatedDangersCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(on(this.LabelContoursCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "LabelContours")].value = _this.LabelContoursCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(on(this.LabelSafetyContoursCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "LabelSafetyContours")].value = _this.LabelSafetyContoursCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(on(this.OptionalDeepSoundingsCtrl, 'change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[_this.findParameter(parametersArray, "OptionalDeepSoundings")].value = _this.OptionalDeepSoundingsCtrl.checked?2:1;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(query("input[type='checkbox']", _this.DisplayAIOFeaturesCtrl).on('change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        var selectedFlags = "";
         query("input[type='checkbox']", _this.DisplayAIOFeaturesCtrl).forEach(function(checkbox) {
          if(checkbox.checked) {
            selectedFlags = selectedFlags + checkbox.value + ",";
          }
        });
        if (selectedFlags.length>1) selectedFlags = selectedFlags.substr(0, selectedFlags.length-1); // remove the last comma
        parametersArray[_this.findParameter(parametersArray, "DisplayAIOFeatures")].value = selectedFlags;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));

      this.own(query("input[type='checkbox']", _this.DisplayCategoryCtrl).on('change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        var selectedvalues = 0;
        query("input[type='checkbox']", _this.DisplayCategoryCtrl).forEach(function(checkbox) {
          if(checkbox.checked) {
            selectedvalues +=　parseInt(checkbox.value);
          }
        });
        var categories;
        switch(selectedvalues) {
          case 1:
            categories = "1";
            break;
          case 2:
            categories = "2";
            break;
          case 3:
            categories = "1,2";
            break;
          case 4:
            categories = "4";
            break;
          case 5:
            categories = "1,4";
            break;
          case 6:
            categories = "2,4";
            break;
          case 7:
            categories = "1,2,4";
            break;
          default:
            categories = "";
        }
        parametersArray[_this.findParameter(parametersArray, "DisplayCategory")].value = categories;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(query("input[type='checkbox']", _this.IntendedUsageCtrl).on('change', function() {
        var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        var selectedUsages = "";
         query("input[type='checkbox']", _this.IntendedUsageCtrl).forEach(function(checkbox) {
          if(checkbox.checked) {
            selectedUsages = selectedUsages + checkbox.value + ",";
          }
        });
        if (selectedUsages.length>1) selectedUsages = selectedUsages.substr(0, selectedUsages.length-1); // remove the last comma
        if (selectedUsages.substr(0,1)=="0") selectedUsages = "0"; // to handle special case for IntendedUsage
        parametersArray[_this.findParameter(parametersArray, "IntendedUsage")].value = selectedUsages;
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
      }));
      this.own(query("input[type='checkbox']", _this.TextGroupsCtrl).on('change', function() {
        var grpParametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.ParameterGroup;
        var parametersArray = grpParametersArray[_this.findParameter(grpParametersArray, "TextGroups")].Parameter;
        query("input[type='checkbox']", _this.TextGroupsCtrl).forEach(function(checkbox) {
          if (checkbox.checked) {
            parametersArray[_this.findParameter(parametersArray, checkbox.value)].value = 2;
          }
          else {
            parametersArray[_this.findParameter(parametersArray, checkbox.value)].value = 1;
          }
        });
        s57CustomLayer.refresh();
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        if (aisCustomLayer)
          aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
     }));
    },
    _onApplyClick: function( /*e*/ ) {
      var parametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
      parametersArray[this.findParameter(parametersArray, "ShallowContour")].value = parseFloat(this.input_shallow_contour.value, 10);
      parametersArray[this.findParameter(parametersArray, "SafetyContour")].value = parseFloat(this.input_safety_contour.value, 10);
      if(this.includeParameters['SafetyDepth'] && this.findParameter(parametersArray, "SafetyDepth") >= 0) // To make SafetyDepth backward compatible. @TODO: make other contour parameters controllable.
      {
          parametersArray[this.findParameter(parametersArray, "SafetyDepth")].value = parseFloat(this.input_safety_depth.value, 10);
      }
      parametersArray[this.findParameter(parametersArray, "DeepContour")].value = parseFloat(this.input_deep_contour.value, 10);
      s57CustomLayer.refresh();
      /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
      if (aisCustomLayer)
        aisCustomLayer.displayParameters = s57CustomLayer.displayParameters;
    },
    _onPointCheckClick: function(e) {
      e.target.checked ? this["PointSymbolSize"].setAttribute("style", "display:none") : this["PointSymbolSize"].setAttribute("style", "display:block");
      this._onSymbolSizeInputChange();
    },
    _onLineCheckClick: function(e) {
      e.target.checked ? this["LineSymbolSize"].setAttribute("style", "display:none") : this["LineSymbolSize"].setAttribute("style", "display:block")
      this._onSymbolSizeInputChange();
    },
    _onAreaCheckClick: function(e) {
      e.target.checked ?  this["AreaSymbolSize"].setAttribute("style", "display:none") : this["AreaSymbolSize"].setAttribute("style", "display:block")
      this._onSymbolSizeInputChange();
    },
    _onTextCheckClick: function(e) {
      e.target.checked ? this["TextSize"].setAttribute("style", "display:none") : this["TextSize"].setAttribute("style", "display:block")
      this._onSymbolSizeInputChange();
    },
    _onDatasetCheckClick: function(e) {
      e.target.checked ? this["DatasetDisplayRange"].setAttribute("style", "display:none") : this["DatasetDisplayRange"].setAttribute("style", "display:block")
      this._onSymbolSizeInputChange();
    },

    _onSymbolSizeInputChange: function(e) {
      var isValid = true;
      ['CommonSymbolSize','PointSymbolSize', 'LineSymbolSize', 'AreaSymbolSize', 'TextSize', 'DatasetDisplayRange'].forEach(lang.hitch(this, function(symbolType) {
        if(this[symbolType].style.display !== 'none') {
          isValid &= this["input_minzoom"+symbolType].isValid();
          isValid &= this["input_maxzoom"+symbolType].isValid();

          if(symbolType !== 'DatasetDisplayRange') {
            isValid &= this["input_scalefactor"+symbolType].isValid();
          }
        }
      }));

      if(!isValid) {
        this["SymbolSizesApplyButton"].disabled = true;
      }
      else
      {
        this["SymbolSizesApplyButton"].disabled = false;
      }
    },

    _onSymboSizesApplyClick: function() {

      var commonMinZoom = parseFloat(this["input_minzoomCommonSymbolSize"].value, 10);
      var commonMaxZoom = parseFloat(this["input_maxzoomCommonSymbolSize"].value, 10);
      var commonScaleFactor = parseFloat(this["input_scalefactorCommonSymbolSize"].value, 10);

      var grpParametersArray = s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.ParameterGroup;
      ['PointSymbolSize', 'LineSymbolSize', 'AreaSymbolSize', 'TextSize', 'DatasetDisplayRange'].forEach(lang.hitch(this, function(symbolType) {
        var parametersArray = grpParametersArray[this.findParameter(grpParametersArray, symbolType)].Parameter;

        var minzoom = commonMinZoom;
        var maxzoom = commonMaxZoom;
        var scalefactor = commonScaleFactor;

        if(this[symbolType].style.display !== 'none') { // the ctrl is not hidden, override the common value
          minzoom = parseFloat(this["input_minzoom"+symbolType].value, 10);
          maxzoom = parseFloat(this["input_maxzoom"+symbolType].value, 10);

          if(symbolType !== 'DatasetDisplayRange') {
            scalefactor = parseFloat(this["input_scalefactor"+symbolType].value, 10);
          }
        }

        parametersArray[this.findParameter(parametersArray, "minZoom")].value = minzoom;
        parametersArray[this.findParameter(parametersArray, "maxZoom")].value = maxzoom;

        if(symbolType!== 'DatasetDisplayRange') {
          parametersArray[this.findParameter(parametersArray, "scaleFactor")].value = scalefactor;
        }
      }));

      s57CustomLayer.refresh();
      /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
      if (aisCustomLayer)
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
