///////////////////////////////////////////////////////////////////////////
// Copyright © 2014 - 2016 Esri. All Rights Reserved.
//
// Licensed under the Apache License Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
///////////////////////////////////////////////////////////////////////////

define([
  'dojo/on',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'jimu/BaseWidgetSetting',
  'jimu/dijit/CheckBox',
  'jimu/dijit/formSelect',
  'dojo/dom-construct', 
  'dojo/dom',
  'esri/request'
],
function(on, declare, lang, BaseWidgetSetting, CheckBox, Select, domConstruct, dom, esriRequest) {

  return declare([BaseWidgetSetting], {
    baseClass: 'mcs-display-properties',
    displaySettingConfig: {
      mcsLayers: {},
      includeParameters: {},
      includeParameterGroups: {}
    },
    previousSelectedMCSLayer: "",
    MCSLayersSelect: null, 

    postCreate: function(){
      //the config object is passed in
      this.setConfig(this.config);
      this._initEventHandlers();
    },

    setConfig: function(config){
      var layerURLwithParams = "";
      var flagFirstMCSLayer = true;
      this.displaySettingConfig.includeParameters = config.includeParameters;
      this.displaySettingConfig.includeParameterGroups = config.includeParameterGroups;
      var MCSLayerOptions = [];
      for (var j = 0; j < this.map.layerIds.length; j++) {
          var layer = this.map.getLayer(this.map.layerIds[j]);
          var indexMCSStr1 = layer.url.toLowerCase().indexOf("/exts/MaritimeChartService/MapServer".toLowerCase()); 
          var indexMCSStr2 = layer.url.toLowerCase().indexOf("/exts/Maritime Chart Server/MapServer".toLowerCase());
          var indexMCSStr3 = layer.url.toLowerCase().indexOf("/exts/Maritime%20Chart%20Service/MapServer".toLowerCase());
          // in the MCS URL, "exts" and "mapserver" could be lower case or upper case
          if ((indexMCSStr1 > 0 && layer.url.substring(indexMCSStr1+6, indexMCSStr1+26)=="MaritimeChartService")
            || (indexMCSStr2 > 0 && layer.url.substring(indexMCSStr2+6, indexMCSStr2+27)=="Maritime Chart Server")
            || (indexMCSStr3 > 0 && layer.url.substring(indexMCSStr3+6, indexMCSStr3+32)=="Maritime%20Chart%20Service")) {
            if (layer.url.endsWith("/"))
              layerURLwithParams = layer.url + "parameters?f=json&full=true";
            else
              layerURLwithParams = layer.url + "/parameters?f=json&full=true";
            this.displaySettingConfig.mcsLayers[layer.id] = {
              selectedControls: "",
              mcsParametersContent: "",
              mcsLayerDiv: "",
              checkboxes: {}
            };
            this.getParameters(layer.id, layerURLwithParams, flagFirstMCSLayer);
            var layerTitle = this._getLayerTitle(layer);
            if (flagFirstMCSLayer)
            {
              MCSLayerOptions.push({ label: layerTitle, value: layer.id, selected: "selected" });
              this.previousSelectedMCSLayer = layer.id;
            }
            else
            MCSLayerOptions.push({ label: layerTitle, value: layer.id });
            flagFirstMCSLayer = false;
          }
      }
      this.MCSLayersSelect = new Select({
        options: MCSLayerOptions
      }, this.MCSLayersSelectDiv);
    },

    getParameters: function(layerID, layerURLwithParams, flagFirstMCSLayer){
      var requestHandle = esriRequest({
        "url": layerURLwithParams
      });
      requestHandle.then(lang.hitch(this, function(response,io) {
        this.displaySettingConfig.mcsLayers[layerID].mcsParametersContent = JSON.stringify(response.DisplayParameters);
        var divgroup = dom.byId('dynamicParametersDiv');
        // create dynamic parameters div for the MCS layer
        var dynamicParametersDiv_oneLayer = domConstruct.create("div", {
          id: layerID + "Div"
        }, divgroup);
        dynamicParametersDiv_oneLayer.style.display = flagFirstMCSLayer ? "block":'none';
        var dynamicParametersUl_oneLayer = domConstruct.create("ul", {
          style: "list-style-type: none; padding:0"
        }, dynamicParametersDiv_oneLayer);

        var parameters, parameter, li, div, checkbox;
        if (response.DisplayParameters && response.DisplayParameters.ECDISParameters && response.DisplayParameters.ECDISParameters.StaticParameters) {
          parameters = response.DisplayParameters.ECDISParameters.StaticParameters.Parameter;
          for (var i = 0; i< parameters.length; i++) {
            parameter = parameters[i];
            if(this.displaySettingConfig.includeParameters[parameter.name]) {
              li = domConstruct.create("li", {}, dynamicParametersUl_oneLayer);
              div= domConstruct.create("div", {}, li);
              checkbox = new CheckBox({
                label: parameter.Description,
                checked: false
              },div);
              this.displaySettingConfig.mcsLayers[layerID].checkboxes[parameter.name] = checkbox;
            }
          }
        }
        if (response.DisplayParameters && response.DisplayParameters.ECDISParameters && response.DisplayParameters.ECDISParameters.DynamicParameters) {
          parameters = response.DisplayParameters.ECDISParameters.DynamicParameters.Parameter;
          for (var i = 0; i< parameters.length; i++) {
            parameter = parameters[i];
            if(this.displaySettingConfig.includeParameters[parameter.name]) {
              // we need bypass the three text boxes here
              if (parameter.name != 'DeepContour' && parameter.name != 'SafetyContour' && parameter.name != 'SafetyDepth' && parameter.name != 'ShallowContour') {
                li = domConstruct.create("li", {}, dynamicParametersUl_oneLayer);
                div= domConstruct.create("div", {}, li);
                checkbox = new CheckBox({
                  label: parameter.Description,
                  checked: false
                },div);
                this.displaySettingConfig.mcsLayers[layerID].checkboxes[parameter.name] = checkbox;
              }
            }
          }
        }
        if (response.DisplayParameters && response.DisplayParameters.ECDISParameters && response.DisplayParameters.ECDISParameters.DynamicParameters) {
          parameterGroups = response.DisplayParameters.ECDISParameters.DynamicParameters.ParameterGroup;
          for (var i =0; i < parameterGroups.length; i++) {
            paramGroup = parameterGroups[i];
            if(this.displaySettingConfig.includeParameterGroups[paramGroup.name]) {

              // TODO: change the description to paramGroup.Description once the descriptions are exposed for the parameter groups
              description = paramGroup.name;
              if(paramGroup.name == 'TextGroups') {
                description = 'Text groups: As defined by S-52.'; 
              }
              li = domConstruct.create("li", {}, dynamicParametersUl_oneLayer);
              div= domConstruct.create("div", {}, li);
              checkbox = new CheckBox({
                label: description,
                checked: false
              },div);
              this.displaySettingConfig.mcsLayers[layerID].checkboxes[paramGroup.name] = checkbox;
           }
          }
        }
        this.displaySettingConfig.mcsLayers[layerID].mcsLayerDiv = dynamicParametersDiv_oneLayer
      }), lang.hitch(this, function(error, io) {
        console.log('maritime.DisplaySettings::setting', error);
      }));
},
    _getLayerTitle: function(layer) {

      var operLayers = this.map.webMapResponse.itemInfo.itemData.operationalLayers;
      var title = null;
      for (var j = 0; j < operLayers.length; j++) {
        if ((layer) && !(layer.displayParameters) && (layer.id == operLayers[j].id)) {
          title = operLayers[j].title;
        }
      }
      if (title) {
        return title;
      }

      if(layer.title) {
        return layer.title;
      }

      if(lang.getObject("_wabProperties.originalLayerName", false, layer)) {
        return layer.name || layer.id;
      }

      title = layer.label || layer.name || "";
      if (layer.url) {
        var serviceName;
        var index = layer.url.indexOf("/FeatureServer");
        if (index === -1) {
          index = layer.url.indexOf("/MapServer");
        }
        if (index === -1) {
          index = layer.url.indexOf("/service");
        }
        if(index > -1) {
          serviceName = layer.url.substring(0, index);
          serviceName = serviceName.substring(serviceName.lastIndexOf("/") + 1, serviceName.length);
          if (title) {
            title = serviceName + " - " + title;
          } else {
            title = serviceName;
          }
        }

      }
      return title || layer.id;
    },

    _initEventHandlers: function(){
      this.own(on(this.MCSLayersSelect, 'change', lang.hitch(this, function() {
        var selectedControls = "";
        var checkboxes = this.displaySettingConfig.mcsLayers[this.previousSelectedMCSLayer].checkboxes;
        Object.keys(checkboxes).forEach(function(checkboxName) {
          if(checkboxes[checkboxName].checked) {
            selectedControls += checkboxName + ",";
          }
        });

        if (selectedControls.length > 0)
          selectedControls = selectedControls.substring(0, selectedControls.length-1);

        this.displaySettingConfig.mcsLayers[this.previousSelectedMCSLayer].selectedControls = selectedControls;
        this.displaySettingConfig.mcsLayers[this.previousSelectedMCSLayer].mcsLayerDiv.style.display = 'none';
        this.displaySettingConfig.mcsLayers[this.MCSLayersSelect.get("value")].mcsLayerDiv.style.display = 'block';
        this.previousSelectedMCSLayer = this.MCSLayersSelect.get("value");

      })));
    },

    checkAll: function(){
      var checkboxes = this.displaySettingConfig.mcsLayers[this.MCSLayersSelect.get("value")].checkboxes;
      Object.keys(checkboxes).forEach(function(checkboxName) {
        checkboxes[checkboxName].setValue(true);
      });
    },

    unCheckAll: function(){
      var checkboxes = this.displaySettingConfig.mcsLayers[this.MCSLayersSelect.get("value")].checkboxes;
      Object.keys(checkboxes).forEach(function(checkboxName) {
        checkboxes[checkboxName].setValue(false);
      });
    },

    getConfig: function () {
      //WAB will get config object through this method

      // Save the setting for the last selected MCS layer
      var selectedControls = "";
      var checkboxes = this.displaySettingConfig.mcsLayers[this.MCSLayersSelect.get("value")].checkboxes;
      Object.keys(checkboxes).forEach(function (checkboxName) {
        if (checkboxes[checkboxName].checked) {
          selectedControls += checkboxName + ",";
        }
      });
      if (selectedControls.length > 0)
        selectedControls = selectedControls.substring(0, selectedControls.length - 1);
      this.displaySettingConfig.mcsLayers[this.MCSLayersSelect.get("value")].selectedControls = selectedControls;

      for (var key in this.displaySettingConfig.mcsLayers) {
        delete this.displaySettingConfig.mcsLayers[key].mcsLayerDiv;
        delete this.displaySettingConfig.mcsLayers[key].checkboxes;
      }
      return this.displaySettingConfig;
    }
  });
});