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
  'dojo/_base/declare',
  'dojo/_base/lang',
  'jimu/BaseWidgetSetting',
  'dojo/dom-construct', 
  'dojo/dom',
  'dojo/query',
  'esri/request'
],
function(declare, lang, BaseWidgetSetting, domConstruct, dom, query, esriRequest) {

  return declare([BaseWidgetSetting], {
    baseClass: 'mcs-display-properties',

    postCreate: function(){
      //the config object is passed in
      this.setConfig(this.config);
    },

    getParameters: function(){
          var requestHandle = esriRequest({
            "url": this.parametersUrlNode.value
          });
          requestHandle.then(lang.hitch(this, function(response,io) {
            dom.byId('parametersContentNode').value = JSON.stringify(response.DisplayParameters);
            var divgroup = dom.byId('dynamicParametersDiv');
            while (divgroup.hasChildNodes()) {
              divgroup.removeChild(divgroup.lastChild);
            }

            var parameters, content, rec, parameter;
            if (response.DisplayParameters && response.DisplayParameters.ECDISParameters && response.DisplayParameters.ECDISParameters.StaticParameters) {
              parameters = response.DisplayParameters.ECDISParameters.StaticParameters.Parameter;
              for (var i = 0; i< parameters.length; i++) {
                parameter = parameters[i];
                if(this.config.includeParameters[parameter.name]) {
                  content = "<label><input type='checkbox' id='" + parameter.name + "'><b> " + parameter.Description + "</b></label>";
                  rec = domConstruct.create("div", {
                    innerHTML:  content
                  }, divgroup);
                }
              }
//              console.log(response.DisplayParameters.ECDISParameters.StaticParameters);
            }
            if (response.DisplayParameters && response.DisplayParameters.ECDISParameters && response.DisplayParameters.ECDISParameters.DynamicParameters) {
              parameters = response.DisplayParameters.ECDISParameters.DynamicParameters.Parameter;
              for (var i = 0; i< parameters.length; i++) {
                parameter = parameters[i];
                if(this.config.includeParameters[parameter.name]) {
                  // we need bypass the three text boxes here
                  if (parameter.name != 'DeepContour' && parameter.name != 'SafetyContour' && parameter.name != 'SafetyDepth' && parameter.name != 'ShallowContour') {
                    content = "<label><input type='checkbox' id='" + parameter.name + "'><b> " + parameter.Description + "</b></label>";
                    rec = domConstruct.create("div", {
                      innerHTML:  content
                    }, divgroup);
                  }
                }
              }
//              console.log(response.DisplayParameters.ECDISParameters.DynamicParameters);
            }
            if (response.DisplayParameters && response.DisplayParameters.ECDISParameters && response.DisplayParameters.ECDISParameters.DynamicParameters) {
              parameterGroups = response.DisplayParameters.ECDISParameters.DynamicParameters.ParameterGroup;
              for (var i =0; i < parameterGroups.length; i++) {
                paramGroup = parameterGroups[i];
                if(this.config.includeParameterGroups[paramGroup.name]) {

                  // TODO: change the description to paramGroup.Description once the descriptions are exposed for the parameter groups
                  description = paramGroup.name;
                  if(paramGroup.name == 'TextGroups') {
                    description = 'Text groups: As defined by S-52.'; 
                  }

                  content = "<label><input type='checkbox' id='" + paramGroup.name + "'><b> " + description + "</b></label>";
                  rec = domConstruct.create("div", {
                    innerHTML:  content
                  }, divgroup);
               }
    //              console.log(response.DisplayParameters.ECDISParameters.DynamicParameters);
              }
            }
            dom.byId('actionButtonGroup').style.display = "block";
          }), lang.hitch(this, function(error, io) {
            console.log('maritime.DisplaySettings::setting', error);
          }));
    },

    setConfig: function(config){
      var layerFound = false;
      for (var j = 0; j < this.map.layerIds.length; j++) {
          var layer = this.map.getLayer(this.map.layerIds[j]);
          if ((layer.url.indexOf("/exts/MaritimeChartService/MapServer") > 0) || (layer.url.indexOf("/exts/Maritime Chart Server/MapServer") > 0) || (layer.url.indexOf("/exts/Maritime%20Chart%20Service/MapServer") > 0)) {
            layerFound = true;
            if (layer.url.endsWith("/"))
              this.parametersUrlNode.value = layer.url + "parameters?f=json&full=true";
            else
              this.parametersUrlNode.value = layer.url + "/parameters?f=json&full=true";
          }
      }
      // if (!layerFound)
      //   this.parametersUrlNode.value = config.mcsParametersUrl;

      this.includeParameters = config.includeParameters;
      this.includeParameterGroups = config.includeParameterGroups;
    },

    checkAll: function(){
      query("input[type='checkbox']", dom.byId('dynamicParametersDiv')).forEach(function(checkbox) {
        checkbox.checked = true;
      });
    },

    unCheckAll: function(){
      query("input[type='checkbox']", dom.byId('dynamicParametersDiv')).forEach(function(checkbox) {
        checkbox.checked = false;
      });
    },

    getConfig: function(){
      //WAB will get config object through this method
      var selectedControls = "";

      query("input[type='checkbox']", dom.byId('dynamicParametersDiv')).forEach(function(checkbox) {
        if(checkbox.checked) {
          selectedControls += checkbox.id + ",";
          console.log(checkbox.id);
        }
      });
      if (selectedControls.length > 0)
        selectedControls = selectedControls.substring(0, selectedControls.length-1);
      return {
          mcsParametersUrl: this.parametersUrlNode.value,
          selectedControls: selectedControls,
          mcsParametersContent: this.parametersContentNode.value,
          includeParameters: this.includeParameters,
          includeParameterGroups: this.includeParameterGroups
      };
    }
  });
});