define([
  'dojo/text!./templates/Identify.html',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/Deferred',
  'dojo/_base/array',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'esri/layers/GraphicsLayer',
  'esri/Color',
  'esri/graphic',
  'esri/symbols/SimpleLineSymbol',
  'esri/symbols/SimpleMarkerSymbol',
  'esri/symbols/SimpleFillSymbol',

  'esri/toolbars/draw',
  //'esri/symbols/jsonUtils',
  'esri/tasks/IdentifyParameters',
  'esri/tasks/IdentifyTask',
  'esri/InfoTemplate',
  'esri/geometry/Polygon',
  'esri/geometry/Polyline',
  'esri/geometry/Point',
  'esri/domUtils'

], function(
  template,
  declare,
  lang, on, dom, domConstruct, query, Deferred, array,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  GraphicsLayer, Color, Graphic, SimpleLineSymbol,
  SimpleMarkerSymbol, SimpleFillSymbol, Draw, //jsonUtils,
  IdentifyParameters,
  IdentifyTask, InfoTemplate,
  Polygon, Polyline, Point,
  domUtils

) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // description:
    //    Custom Identify

    templateString: template,
    baseClass: 'identify',
    widgetsInTemplate: true,
    pointSymbol: null,
    polygonSymbol: null,
    lineSymbol: null,
    map: null,
    drawLayer: null,
    drawLayerId: null,
    drawToolBar: null,
    showClear: false,
    //keepOneGraphic: false,
    s57ServiceUrl: null,
    aisServiceUrl: null,
    pointGraphic: null,
    simpleMarkerSymbol: null,
    identifyTask: null,
    identifyParams: null,
    identifyAISParams: null,
    identifyAISTask: null,

    // Properties to be sent into constructor

    postCreate: function() {
      // summary:
      //    Overrides method of same name in dijit._Widget.
      // tags:
      //    private
      console.log('Identify::postCreate', arguments);

      this.setupConnections();

      this.inherited(arguments);
      if (this.identifySymbol) {
        this.pointSymbol = new SimpleMarkerSymbol(this.identifySymbol);
      } else {
        this.pointSymbol = new SimpleMarkerSymbol(
          SimpleMarkerSymbol.STYLE_CIRCLE,
          10,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([255, 0, 0]), 2),
          new Color([255, 0, 0, 0])
        );
      }

      if (this.map) {
        this.setMap(this.map);
      }

      this.createQueryTask(this.s57ServiceUrl);
      if(this.aisServiceUrl != null)
       this.createAISQueryTask(this.aisServiceUrl);

      var moreInfoLink = domConstruct.create("a", {
        "class": "action",
        "id": "moreInfoLink",
        "innerHTML": "More Info", //text that appears in the popup for the link 
        "href": "javascript: void(0);"
      }, query(".actionList", this.map.infoWindow.domNode)[0]);


      //when the link is clicked register a function that will run 
      on(moreInfoLink, "click", function(e) {
        moreInfoDiv = dom.byId('moreInfoDiv');
        if (moreInfoLink.innerHTML == "More Info") {
          moreInfoLink.innerHTML = "Less Info";
          domUtils.show(moreInfoDiv);
        } else {
          moreInfoLink.innerHTML = "More Info";
          domUtils.hide(moreInfoDiv);
        }
      });

      on(this.map.infoWindow, "selection-change", function() {
        moreInfoDiv = dom.byId('moreInfoDiv');

        if (moreInfoLink.innerHTML == "More Info") {
          domUtils.hide(moreInfoDiv);
        } else {
          domUtils.show(moreInfoDiv);
        }

      });
    },



    setupConnections: function() {
      // summary:
      //    wire events, and such
      //
      console.log('Identify::setupConnections', arguments);

    },

    setMap: function(map) {
      if (map) {
        this.map = map;
        this.graphicsLayer = new GraphicsLayer();
        this.graphicsLayer.name = 'Identify Results';
        this.map.addLayer(this.graphicsLayer);
        this.drawToolBar = new Draw(this.map);
        this.drawToolBar.setMarkerSymbol(this.pointSymbol);
        this.own(
          this.clickListener = on.pausable(this.map, 'click', lang.hitch(this, this.mapClickHandler))
        );
      }
    },

    mapClickHandler: function(evt) {
        if (this.pointGraphic) {
          this.map.graphics.remove(this.pointGraphic);
        }
        this.pointGraphic = new Graphic(mp, this.pointSymbol);
        this.map.graphics.add(this.pointGraphic);
        this.executeAISQueryTask(mp);
      }
    },

    pauseClickListener: function() {
      this.clickListener.pause();
    },

    resumeClickListener: function() {
      this.clickListener.resume();
    },

    destroy: function() {
      if (this.pointGraphic) {
        this.map.graphics.remove(this.pointGraphic);
      }
      this.pointGraphic = null;
      this.map = null;
      this.inherited(arguments);
    },

    setPointSymbol: function(symbol) {
      this.pointSymbol = symbol;
    },

    createQueryTask: function(in_layer) {
      this.identifyTask = new IdentifyTask(in_layer);
      this.identifyParams = new IdentifyParameters();
      this.identifyParams.tolerance = 10;
      this.identifyParams.returnGeometry = true;
      this.identifyParams.dpi = 96;
    },

    createAISQueryTask: function(in_layer) {
      this.identifyAISTask = new IdentifyTask(in_layer);
      this.identifyAISParams = new IdentifyParameters();
      this.identifyAISParams.tolerance = 10;
      this.identifyAISParams.returnGeometry = true;
      this.identifyAISParams.dpi = 96;
    },

    executeQueryTask: function(mp) {

      identifyPoint = mp;

      this.identifyParams.geometry = identifyPoint;
      this.identifyParams.mapExtent = this.map.extent;
      this.identifyParams.width = this.map.width;
      this.identifyParams.height = this.map.height;

      this.identifyTask.execute(this.identifyParams, function(response) {
        var deferred = new Deferred();
        deferred.resolve(response);
      }).then(lang.hitch(this, function(response) {
        _this = this;
        var features =
          array.map(response, function(result) {
            var feature = result.feature;
            feature.attributes.layerName = result.layerName;
            if (result.layerName === 'S57 Cells') {
              if (null != feature.attributes.TXTDSC) {
                feature.attributes.TXTDSC = "<a href='" + _this.s57ServiceUrl + "/notes?f=json&file=" + feature.attributes.txtdsc_token + "' target='_blank'>" + feature.attributes.TXTDSC + "</a>";
              }
              if (null != feature.attributes.NTXTDS) {
                feature.attributes.NTXTDS = "<a href='" + _this.s57ServiceUrl + "/notes?f=json&file=" + feature.attributes.ntxtds_token + "' target='_blank'>" + feature.attributes.NTXTDS + "</a>";
              }
              if (null != feature.attributes.PICREP) {
                feature.attributes.PICREP = "<a href='" + _this.s57ServiceUrl + "/notes?f=json&file=" + feature.attributes.picrep_token + "' target='_blank'>" + feature.attributes.PICREP + "</a>";
              }

              if (null != feature.attributes.cellName) {
                feature.attributes.cellName = feature.attributes.cellName.replace(".000", "");
              }

              switch (feature.geometry.type) {
                case "polygon":
                  feature.attributes.geometryType = "Area";
                  break;
                case "polyline":
                  feature.attributes.geometryType = "Line";
                  break;
                case "point":
                  feature.attributes.geometryType = "Point";
                  break;
              }

              switch (feature.attributes.cellName.charAt(2)) {
                case '1':
                  feature.attributes.usage = "Overview";
                  break;
                case '2':
                  feature.attributes.usage = "General";
                  break;
                case '3':
                  feature.attributes.usage = "Coastal";
                  break;
                case '4':
                  feature.attributes.usage = "Approach";
                  break;
                case '5':
                  feature.attributes.usage = "Harbour";
                  break;
                case '6':
                  feature.attributes.usage = "Berthing";
                  break;
                case '7':
                  feature.attributes.usage = "River";
                  break;
                case '8':
                  feature.attributes.usage = "River harbour";
                  break;
                case '9':
                  feature.attributes.usage = "River berthing";
                  break;
                case 'A':
                  feature.attributes.usage = "Overlay";
                  break;
              }

              feature.attributes.moreInfo = "";

              var template = new InfoTemplate("Identify Results", _this.generateInfoContent(feature));
              feature.setInfoTemplate(template);
            }

            return feature;
          });
        this.map.infoWindow.setFeatures(features);
        this.showInfoWindow(identifyPoint);
      }));
    },

    generateInfoContent: function(feature) {


      var content = "<table><tr><td><b>${cellName}</b></td></tr></table>";
      content += "<hr noshade='noshade'>";
      content += "<table><tr><td>Feature:</td><td style='padding-left: 1em;'>${objectType:formatFeatureName}</td></tr><tr><td>Description:</td><td style='padding-left: 1em;'>${objectTypeDescription}</td></tr><tr><td>Geometry:</td><td style='padding-left:1em;'>${geometryType}</td></tr><tr><td>Usage:</td><td style='padding-left:1em;'>${usage}</td></tr><tr><td>Compilation Scale:</td><td style='padding-left:1em;'>${compilationScale}</td></tr></table>";
      content += "<div id='moreInfoDiv' style='display: none;'>";
      content += "<hr noshade='noshade'>";
      content += " <div style='height: 100px; overflow: auto;'><table>";

      for (var key in feature.attributes) {
        if (key.length == 6) {
          content += "<tr><td>" + key + ":" + "</td><td style='padding-left: 1em;'>" + feature.attributes[key] + "</td></tr>";
        }
      }

      content += "</table></div></div>";
      return content;

    },

    executeAISQueryTask: function(mp) {

      if (this.aisServiceUrl == null)
        this.executeQueryTask(mp);
      else {
        identifyPoint = mp;

        this.identifyAISParams.geometry = identifyPoint;
        this.identifyAISParams.mapExtent = this.map.extent;
        this.identifyAISParams.width = this.map.width;
        this.identifyAISParams.height = this.map.height;

        this.identifyAISTask.execute(this.identifyAISParams, function(response) {
          var deferred = new Deferred();
          deferred.resolve(response);
        }).then(lang.hitch(this, function(response) {
          if (response.length <= 0) {
            this.executeQueryTask(mp);
          } else {
            _this = this;
            var features = array.map(response, function(result) {
              var feature = result.feature;
              feature.attributes.layerName = result.layerName;
              if (result.layerName === 'S57 Cells') {
                feature.attributes.moreInfo = "";
                var template = new InfoTemplate("Identify Results", _this.generateAISInfoContent(feature));
                feature.setInfoTemplate(template);
              }
              return feature;
            });
            this.map.infoWindow.setFeatures(features);

            this.showInfoWindow(identifyPoint);
          }
        }));
      }
    },

    generateAISInfoContent: function(feature) {
      var content = "<table><tr><td><b>${cellName}</b></td>";
      content += "</tr></table>";

      content += "<hr noshade='noshade'>";
      content += "<table><tr><td  style='white-space: nowrap'>Ship name:</td><td style='padding-left: 1em;'>${shipName}</td></tr>";
      if (feature.attributes["draught"] != "not available") {
        content += "<tr><td>Draught:</td><td style='padding-left: 1em;'><a id='safetyContourLink' href='#' onclick='setSafetyContour();'>${draught}</a></td></tr>";
      } else {
        content += "<tr><td>Draught:</td><td style='padding-left: 1em;'>${draught}</td></tr>";
      }
      content += "<tr><td>COG:</td><td style='padding-left:1em;'>${cog}</td></tr><tr><td>SOG:</td><td style='padding-left:1em;'>${sog}</td></tr><tr><td>Position:</td><td style='padding-left:1em;'>${position}</td></tr></table>";
      content += "<div id='moreInfoDiv' style='display: none;'>";
      content += "<hr noshade='noshade'>";
      content += " <div style='height: 100px; overflow: auto;'><table>";

      for (var key in feature.attributes) {
        if (key[0] >= 'A' && key[0] <= 'Z') {
          content += "<tr><td>" + key + ":" + "</td><td style='padding-left: 1em;'>" + feature.attributes[key] + "</td></tr>";
        }
      }

      content += "</table></div></div>";
      return content;
    },

    //TODO: This needs testing and possible clean up. 
    setSafetyContour: function() {
      var dynlayer2 = map1.getLayer("s57ServiceLayer");
      var feature = map1.infoWindow.getSelectedFeature();
      if (feature.attributes["draught"] != "not available") {
        var parametersArray = dynlayer2.displayParameters.ECDISParameters.DynamicParameters.Parameter;
        parametersArray[findParameter(dynlayer2, "SafetyContour")].value = +feature.attributes["draught"];
        dijit.byId("input_safety").set('value', parametersArray[findParameter(dynlayer2, "SafetyContour")].value.toString());
        dynlayer2.refresh();
      }
    },

    showInfoWindow: function(identifyPoint) {
      var isInExtent = this.map.extent.contains(identifyPoint);
      if (isInExtent === true) {
        if (identifyPoint !== null) {
          this.map.infoWindow.show(identifyPoint);
          on(this.map.infoWindow, 'hide', lang.hitch(this, function() {
            this.map.graphics.clear();
          }));
        }
      }
    }

  });

});