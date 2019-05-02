define([
  'dojo/text!./templates/Identify.html',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/on',
  'dojo/dom',
  'dojo/dom-construct',
  'dojo/query',
  'dojo/Deferred',
  'dojo/topic',
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
  'esri/domUtils',
  'esri/request',
  'jimu/PanelManager',
  'dojo/aspect',
  'esri/layers/ImageParameters',
  './S57ServiceLayer'

], function(
  template,
  declare,
  lang, on, dom, domConstruct, query, Deferred, topic, array,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  GraphicsLayer, Color, Graphic, SimpleLineSymbol,
  SimpleMarkerSymbol, SimpleFillSymbol, Draw, //jsonUtils,
  IdentifyParameters,
  IdentifyTask, InfoTemplate,
  Polygon, Polyline, Point,
  domUtils, esriRequest, PanelManager, aspect,
  ImageParameters, S57ServiceLayer
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
    s57Layer: null,
    s57LayerTitle: null,
    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
    aisServiceUrl: null,
    pointGraphic: null,
    simpleMarkerSymbol: null,
    identifyTask: null,
    identifyParams: null,
    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
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
      /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
      if(this.aisServiceUrl != null){
        this.createAISQueryTask(this.aisServiceUrl);
        on(this.map.infoWindow.domNode, 'click', lang.hitch(this, function(e){
          if(e.target.id === 'safetyContourLink')
            this.setSafetyContour();
        }));
      }
      
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
        this.own(
          //this.clickListener = on.pausable(this.map, 'click', lang.hitch(this, this.mapClickHandler))
        );
      }
    },

    mapClickHandler: function(evt) {

      if (this.map._params.showInfoWindowOnClick === true) {
        var mp = evt.mapPoint;
        this.map.infoWindow.clearFeatures();
        if (this.pointGraphic) {
          this.map.graphics.remove(this.pointGraphic);
        }
        this.pointGraphic = new Graphic(mp, this.pointSymbol);
        this.map.graphics.add(this.pointGraphic);
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
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

    injectDisplayParameters: function() {

      s57CustomLayer = null;
      for (var j = 0; j < this.map.layerIds.length; j++) {
        var layer = this.map.getLayer(this.map.layerIds[j]);
        if(layer.isInstanceOf && layer.isInstanceOf(S57ServiceLayer) && layer.displayParameters)  // S57ServiceLayer is already initialized by display setting widget. 
        {
          s57CustomLayer = layer;
          esriRequest.setRequestPreCallback(preCallback);
          break;
        }
      }

      // If a user opens identify widget before the display setting widget the S57ServiceLayer needs to be initialized here.
      if(!s57CustomLayer) 
      {
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

        s57CustomLayer.setVisibleLayers(this.s57Layer.visibleLayers);

        on(s57CustomLayer, 'parametersLoaded', function() {
          esriRequest.setRequestPreCallback(preCallback);
        });

        on.once(s57CustomLayer, 'update-end', lang.hitch(this, function() {
            this.map.removeLayer(this.s57Layer);
        }));

        this.map.addLayer(s57CustomLayer, this.s57LayerIndex);
      }

      function preCallback(ioArgs){
        if(ioArgs.url && ioArgs.url.indexOf("/exts/MaritimeChartService/MapServer/identify") > 0){
          ioArgs.content.display_params = JSON.stringify(s57CustomLayer.displayParameters);
        }
        return ioArgs;
      }
    },

    setDrawBox: function(newDrawBox) {

      var _this = this;
      this.drawBox = newDrawBox;
      this.drawBox.setMap(this.map);
      this.drawBox.geoTypes = ['POINT', 'EXTENT'];
      this.drawBox._initTypes();


      // Initialize reference to the widgetManager
      
      if (PanelManager.getInstance() && PanelManager.getInstance().activePanel.widgetManager) {
        this.widgetManager = PanelManager.getInstance().activePanel.widgetManager;
        // Interact with other widgets.
        if(this.widgetManager) {
          // If the widgets are not loded yet, listen to widget created event from widget manager.
          this.own(on(this.widgetManager, 'widget-created', function(widget) {
            if (typeof(widget) === "undefined") return;
            if(widget.name == 'MaritimeIdentify') {
              _this.widgetid = widget.id;
              // If the widget is configured to open at start, make it sticky (The widget will reactivate after Select and Measurement widgets are deactivated).
              if(widget.openAtStart) {
                _this.makeSticky = true;
                // Activate the identify by point by default        
                _this.drawBox.activate('POINT');
                // Close the panel if it was configured to open at start.
                PanelManager.getInstance().closePanel(widget.id + '_panel');
              }
            }
            else if(widget.name === 'Measurement' && widget.measurement) {
              _this._onMeasurementToggle(_this, widget);
            }
            else if(widget.name === 'Select' && widget.selectDijit && widget.selectDijit.drawBox) {
              _this._onSelectToggle(_this, widget);
            }
          }));

          // If the widgets are already loaded (example both Identify, and Measurement/Select widgets are configured to open at startup).
          var measurementWidget = this.widgetManager.getWidgetsByName('Measurement')[0];
          if(measurementWidget) {
            _this._onMeasurementToggle(_this, measurementWidget);
          }
          var selectWidget = this.widgetManager.getWidgetsByName('Select')[0];
          if(selectWidget) {
            _this._onSelectToggle(_this, selectWidget);
          }
        }
      }

      this.own(on(this.drawBox, 'icon-selected', function (graphic, geotype, commontype) {
        _this.selectedTool = geotype;
        _this.drawBox.drawToolBar._toggleTooltip(false); // hide the tool tip.
        
        // Activating the drawBox sets ShowInfoWindowOnClick to false.
        // Enable to allow mashup of maritime identify tool with the default info window.
        // _this.map.setInfoWindowOnClick(true);
      }));

      this.own(on(this.drawBox, 'DrawEnd', function(graphic, geotype, commontype) {
        _this._onDrawEnd(graphic, geotype, commontype);
      }));
      this.drawBox.placeAt(this.drawBoxNode);
      this.drawBox.startup();
    },

    // Toggle MaritimeIdentify tool 'on' when the Measurement tool is toggled 'off' and vice versa
    // Deactivate the Maritime Identify before the setTool function of measurement tool, so that the
    // deactivate function does not interfare the mouse click handlers of the Measurement tool.
    _onMeasurementToggle: function(_this, measurementWidget) {
      aspect.before(measurementWidget.measurement, 'setTool', function() {
        _this.drawBox.deactivate(); 
      });
      
      aspect.after(measurementWidget.measurement, 'setTool', function() {
        if(_this.makeSticky && !measurementWidget.measurement.activeTool && _this.selectedTool) {
          _this.drawBox.activate(_this.selectedTool);
        }
      });
    },

    // Toggle MaritimeIdentify tool 'on' when the Select tool is toggled 'off' and vice versa
    _onSelectToggle: function(_this, selectWidget) {
        _this.own(on(selectWidget.selectDijit.drawBox, 'draw-activate', function() {
          if(_this.makeSticky) {
            _this.drawBox.deactivate();
            _this.isDeactivateFromActivateCall = false;
            //_this.map.setInfoWindowOnClick(false);
          }
        }));
        _this.own(on(selectWidget.selectDijit.drawBox, 'draw-deactivate', function() {
          if(_this.makeSticky) {
            if(!_this.isDeactivateFromActivateCall && _this.selectedTool) {
              // activate calls deactivate on other drawbox instances, which fires the draw-deactivate again, so do not listen to subsequent deactivate
              _this.isDeactivateFromActivateCall = true;
              _this.drawBox.activate(_this.selectedTool);
            }
          }
        }));
    },

    _onDrawEnd:function(graphic, geotype, commontype){

        this.drawBox.clear();

        this.map.infoWindow.clearFeatures();
        
        //this.graphicsLayer.clear();
        //this.graphicsLayer.add(graphic);
        
        this.identifyGeom = graphic.geometry;
        if(geotype === 'EXTENT') 
        {
          this.identifyGeom = graphic.geometry.getExtent();
        }
        /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
        this.executeAISQueryTask(this.identifyGeom);
      },

    createQueryTask: function(in_layer) {
      this.identifyTask = new IdentifyTask(in_layer);
      this.identifyParams = new IdentifyParameters();
      this.identifyParams.tolerance = 10;
      this.identifyParams.returnGeometry = true;
      this.identifyParams.dpi = 96;
    },

    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
    createAISQueryTask: function(in_layer) {
      this.identifyAISTask = new IdentifyTask(in_layer);
      this.identifyAISParams = new IdentifyParameters();
      this.identifyAISParams.tolerance = 10;
      this.identifyAISParams.returnGeometry = true;
      this.identifyAISParams.dpi = 96;
    },

    executeQueryTask: function(geom) {

      identifyGeom = geom;

      this.identifyParams.geometry = identifyGeom;
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
              if (feature.attributes.cellName.indexOf("AML") ==0) {
                feature.attributes.usage = "AML 3.0";
              }
              else {
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
                  case 'B':
                    feature.attributes.usage = "Bathymetric ENC";
                    break;
                  case 'M':
                    feature.attributes.usage = "MFF (Maritime Foundation and Facilities)";
                    break;
                  case 'E':
                    feature.attributes.usage = "ESB (Environment, Seabed and Beach)";
                    break;
                  case 'R':
                    feature.attributes.usage = "RAL (Routes Areas and Limits)";
                    break;
                  case 'L':
                    feature.attributes.usage = "LBO (Large Bottom Objects)";
                    break;
                  case 'S':
                    feature.attributes.usage = "SBO (Small Bottom Objects)";
                    break;
                  case 'C':
                    feature.attributes.usage = "CLB (Contour Line Bathymetry)";
                    break;
                  case 'I':
                    feature.attributes.usage = "IWC (Integrated Water Column)";
                    break;
                  case 'N':
                    feature.attributes.usage = "NMB (Network Model Bathymetry)";
                    break;
                }
              }

              feature.attributes.moreInfo = "";

              var template = new InfoTemplate("Identify Results", _this.generateInfoContent(feature));
              feature.setInfoTemplate(template);
            }

            return feature;
          });
        this.map.infoWindow.setFeatures(features);
        this.showInfoWindow(identifyGeom);
      }));
    },

    generateInfoContent: function(feature) {

      var blacklist = ["cellName", "compilationScale", "geometryType", "objectType", "objectTypeDescription", "rcid", "moreInfo", "usage", "txtdsc_token", "layerName"];
      var content = "<table><tr><td><b>${cellName}</b></td></tr></table>";
      content += "<p style='border: 2px inset; margin: 5px 0px ;'></p>";
      content += "<table><tr><td>Feature:</td><td style='padding-left: 1em;'>${objectType:formatFeatureName}</td></tr><tr><td>Description:</td><td style='padding-left: 1em;'>${objectTypeDescription}</td></tr><tr><td>Geometry:</td><td style='padding-left:1em;'>${geometryType}</td></tr><tr><td>Usage:</td><td style='padding-left:1em;'>${usage}</td></tr><tr><td>Compilation Scale:</td><td style='padding-left:1em;'>${compilationScale}</td></tr></table>";
      content += "<div id='moreInfoDiv' style='display: none;'>";
      content += "<p style='border: 2px inset; margin: 5px 0px ;'></p>";
      content += " <div style='height: 100px; overflow: auto;'><table>";

      for (var key in feature.attributes) {
        if (!(blacklist.indexOf(key) >= 0)) {
          content += "<tr><td>" + key + ":" + "</td><td style='padding-left: 1em;'>" + feature.attributes[key] + "</td></tr>";
        }
      }

      content += "</table></div></div>";
      return content;

    },

    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
    executeAISQueryTask: function(geom) {

      if (this.aisServiceUrl == null)
        this.executeQueryTask(geom);
      else {
        identifyGeom = geom;
        this.identifyAISParams.geometry = identifyGeom;
        this.identifyAISParams.mapExtent = this.map.extent;
        this.identifyAISParams.width = this.map.width;
        this.identifyAISParams.height = this.map.height;

        this.identifyAISTask.execute(this.identifyAISParams, function(response) {
          var deferred = new Deferred();
          deferred.resolve(response);
        }).then(lang.hitch(this, function(response) {
          if (response.length <= 0) {
            this.executeQueryTask(geom);
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

            this.showInfoWindow(identifyGeom);
            //query(".safetyContourLink", this.map.infoWindow.domNode).onclick(this.setSafetyContour());
          }
        }));
      }
    },

    /* This AIS Service code is for Esri demo purposes only and does not impact your deployment of this widget. This widget does not depend on an AIS Service being available. */
    generateAISInfoContent: function(feature) {
      var content = "<table><tr><td><b>${cellName}</b></td>";
      content += "</tr></table>";

      content += "<p style='border: 2px inset; margin: 5px 0px ;'></p>";
      content += "<table><tr><td  style='white-space: nowrap'>Ship name:</td><td style='padding-left: 1em;'>${shipName}</td></tr>";
      if (feature.attributes["draught"] != "not available") {
        content += "<tr><td>Draught:</td><td style='padding-left: 1em;'><a class='safetyContourLink' id='safetyContourLink' href='#'>${draught}</a></td></tr>";
      } else {
        content += "<tr><td>Draught:</td><td style='padding-left: 1em;'>${draught}</td></tr>";
      }
      content += "<tr><td>COG:</td><td style='padding-left:1em;'>${cog}</td></tr><tr><td>SOG:</td><td style='padding-left:1em;'>${sog}</td></tr><tr><td>Position:</td><td style='padding-left:1em;'>${position}</td></tr></table>";
      content += "<div id='moreInfoDiv' style='display: none;'>";
      content += "<p style='border: 2px inset; margin: 5px 0px ;'></p>";
      content += " <div style='height: 100px; overflow: auto;'><table>";

      for (var key in feature.attributes) {
        if (key[0] >= 'A' && key[0] <= 'Z') {
          content += "<tr><td>" + key + ":" + "</td><td style='padding-left: 1em;'>" + feature.attributes[key] + "</td></tr>";
        }
      }

      content += "</table></div></div>";
      return content;
    },

    setSafetyContour: function() {
      var feature = this.map.infoWindow.getSelectedFeature();
      if (feature.attributes["draught"] != "not available") {
        topic.publish('mcs/setSafetyContour', [feature.attributes["draught"]]);
      }
    },

    showInfoWindow: function(identifyGeom) {
      if (identifyGeom.type != 'point')
        identifyPoint = identifyGeom.getCenter();
      else
        identifyPoint = identifyGeom;
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