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
    'dojo/text!./templates/ContourTabContent.html',
    'dojo/dom',
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    'dijit/_WidgetsInTemplateMixin',
    './MCSWidgetUtilities'

], function (declare, template, dom, _WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin) {

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {

        templateString: template,
        baseClass: 'ContourTabContent',
        widgetsInTemplate: true,

        MCSLayerConfig: null,
        includeParameters: null,

        postCreate: function () {
            MCSWidgetUtilities.setupControls.call(this);
            this.inherited(arguments);
        },

        startup: function () {
            this.inherited(arguments);
            dom.byId("contourTab_" + this.MCSLayerConfig.id).style.display = this.MCSLayerConfig.selected ? "block": "none";
        },

        _onApplyClick: function( /*e*/ ) {
            var parametersArray = this.MCSLayerConfig.s57CustomLayer.displayParameters.ECDISParameters.DynamicParameters.Parameter;
            parametersArray[MCSWidgetUtilities.findParameter(parametersArray, "ShallowContour")].value = parseFloat(this.input_shallow_contour.value, 10);
            parametersArray[MCSWidgetUtilities.findParameter(parametersArray, "SafetyContour")].value = parseFloat(this.input_safety_contour.value, 10);
            if(this.includeParameters['SafetyDepth'] && MCSWidgetUtilities.findParameter(parametersArray, "SafetyDepth") >= 0) // To make SafetyDepth backward compatible. @TODO: make other contour parameters controllable.
            {
                parametersArray[MCSWidgetUtilities.findParameter(parametersArray, "SafetyDepth")].value = parseFloat(this.input_safety_depth.value, 10);
            }
            parametersArray[MCSWidgetUtilities.findParameter(parametersArray, "DeepContour")].value = parseFloat(this.input_deep_contour.value, 10);
            this.MCSLayerConfig.s57CustomLayer.refresh();
          }

    });
});