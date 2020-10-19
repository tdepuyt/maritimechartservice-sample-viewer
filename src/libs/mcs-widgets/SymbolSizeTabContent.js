/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */

define([
  "dojo/_base/declare",
  'dojo/_base/lang',
  'dojo/text!./templates/SymbolSizeTabContent.html',
  'dojo/dom',
  "dijit/_WidgetBase",
  "dijit/_TemplatedMixin",
  'dijit/_WidgetsInTemplateMixin',
  './MCSWidgetUtilities'

], function (declare, lang, template, dom, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {

  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

    templateString: template,
    baseClass: 'SymbolSizeTabContent',
    widgetsInTemplate: true,

    MCSLayerConfig: null,
    includeParameters: null,

    postCreate: function () {
      MCSWidgetUtilities.setupControls.call(this);
      this.inherited(arguments);
    },
    startup: function () {
      this.inherited(arguments);
      dom.byId("symbolSizeTab_" + this.MCSLayerConfig.id).style.display = this.MCSLayerConfig.selected ? "block" : "none";
    },
    _onPointCheckClick: function (e) {
      e.target.checked ? this["PointSymbolSize"].setAttribute("style", "display:none") : this["PointSymbolSize"].setAttribute("style", "display:block");
      this._onSymbolSizeInputChange();
    },
    _onLineCheckClick: function (e) {
      e.target.checked ? this["LineSymbolSize"].setAttribute("style", "display:none") : this["LineSymbolSize"].setAttribute("style", "display:block")
      this._onSymbolSizeInputChange();
    },
    _onAreaCheckClick: function (e) {
      e.target.checked ? this["AreaSymbolSize"].setAttribute("style", "display:none") : this["AreaSymbolSize"].setAttribute("style", "display:block")
      this._onSymbolSizeInputChange();
    },
    _onTextCheckClick: function (e) {
      e.target.checked ? this["TextSize"].setAttribute("style", "display:none") : this["TextSize"].setAttribute("style", "display:block")
      this._onSymbolSizeInputChange();
    },
    _onDatasetCheckClick: function (e) {
      e.target.checked ? this["DatasetDisplayRange"].setAttribute("style", "display:none") : this["DatasetDisplayRange"].setAttribute("style", "display:block")
      this._onSymbolSizeInputChange();
    },

    _onSymbolSizeInputChange: function (e) {
      var isValid = true;
      ['CommonSymbolSize', 'PointSymbolSize', 'LineSymbolSize', 'AreaSymbolSize', 'TextSize', 'DatasetDisplayRange'].forEach(lang.hitch(this, function (symbolType) {
        if (this[symbolType].style.display !== 'none') {
          isValid &= this["input_minzoom" + symbolType].isValid();
          isValid &= this["input_maxzoom" + symbolType].isValid();

          if (symbolType !== 'DatasetDisplayRange') {
            isValid &= this["input_scalefactor" + symbolType].isValid();
          }
        }
      }));

      if (!isValid) {
        this["SymbolSizesApplyButton"].disabled = true;
      }
      else {
        this["SymbolSizesApplyButton"].disabled = false;
      }
    },

    _onSymboSizesApplyClick: function () {

      var commonMinZoom = parseFloat(this["input_minzoomCommonSymbolSize"].value, 10);
      var commonMaxZoom = parseFloat(this["input_maxzoomCommonSymbolSize"].value, 10);
      var commonScaleFactor = parseFloat(this["input_scalefactorCommonSymbolSize"].value, 10);

      var grpParametersArray = this.MCSLayerConfig.s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.ParameterGroup;
      ['PointSymbolSize', 'LineSymbolSize', 'AreaSymbolSize', 'TextSize', 'DatasetDisplayRange'].forEach(lang.hitch(this, function (symbolType) {
        var parametersArray = grpParametersArray[MCSWidgetUtilities.findParameter(grpParametersArray, symbolType)].Parameter;

        var minzoom = commonMinZoom;
        var maxzoom = commonMaxZoom;
        var scalefactor = commonScaleFactor;

        if (this[symbolType].style.display !== 'none') { // the ctrl is not hidden, override the common value
          minzoom = parseFloat(this["input_minzoom" + symbolType].value, 10);
          maxzoom = parseFloat(this["input_maxzoom" + symbolType].value, 10);

          if (symbolType !== 'DatasetDisplayRange') {
            scalefactor = parseFloat(this["input_scalefactor" + symbolType].value, 10);
          }
        }

        parametersArray[MCSWidgetUtilities.findParameter(parametersArray, "minZoom")].value = minzoom;
        parametersArray[MCSWidgetUtilities.findParameter(parametersArray, "maxZoom")].value = maxzoom;

        if (symbolType !== 'DatasetDisplayRange') {
          parametersArray[MCSWidgetUtilities.findParameter(parametersArray, "scaleFactor")].value = scalefactor;
        }
      }));

      this.MCSLayerConfig.s57CustomLayer.refresh();
    }

  });
});