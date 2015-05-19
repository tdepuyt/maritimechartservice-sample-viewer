define([
  'dojo/text!./templates/Search.html',
  'dojo/on', 'dojo/dom',
  'dojo/_base/declare',
  'dojo/_base/lang',
  'dojo/_base/array',
  'dijit/_WidgetBase',
  'dijit/_TemplatedMixin',
  'dijit/_WidgetsInTemplateMixin',
  'esri/tasks/FindTask',
  'esri/tasks/FindParameters',
  'esri/Color',
  'esri/symbols/SimpleFillSymbol',
  'esri/symbols/SimpleLineSymbol'
], function(
  template,
  on, dom,
  declare,
  lang, array,
  _WidgetBase,
  _TemplatedMixin,
  _WidgetsInTemplateMixin,
  FindTask, FindParameters,
  Color, SimpleFillSymbol, SimpleLineSymbol
) {
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
    // description:
    //    Custom Maritime Search

    templateString: template,
    baseClass: 'search',
    widgetsInTemplate: true,
    map: null,
    s57ServiceUrl: null,
    symbol: null,
    searchType: null,

    // Properties to be sent into constructor

    postCreate: function() {
      // summary:
      //    Overrides method of same name in dijit._Widget.
      // tags:
      //    private
      console.log('maritime.Search::postCreate', arguments);
      this.setupConnections();
      this.inherited(arguments);
      if (this.resultSymbol) {
        this.symbol = new SimpleFillSymbol(this.resultSymbol);
      } else {
        this.symbol = new SimpleFillSymbol(
          SimpleFillSymbol.STYLE_SOLID,
          10,
          new SimpleLineSymbol(
            SimpleLineSymbol.STYLE_SOLID,
            new Color([98, 194, 204]), 2),
          new Color([98, 194, 204, 0.5])
        );
      }
      if (this.map) {
        this.setMap(this.map);
      }
      s57ServiceUrl = "http://nsdemo.esri.com/arcgis/rest/services/SampleWorldCities/MapServer/exts/Maritime%20Chart%20Service/MapServer";
    },
    setupConnections: function() {
      // summary:
      //    wire events, and such
      //
      console.log('maritime.Search::setupConnections', arguments);

      this.own(on(this.searchtypeSelect, 'change', lang.hitch(this, function() {
        var obj = document.getElementById("container_search_default_text");
        var type = this.searchtypeSelect.value;
        if (type == "cell") {
          obj.innerHTML = "Use the above search box to search for cells based on their Dataset Name (DSNM).";
        } else {
          obj.innerHTML = "Use the above search box to search for features based on their Object Name (OBJNAM) attribute.";
        }
      })));
    },
    setMap: function(map) {
      if (map) {
        this.map = map;
      }
    },
    _onSearchClick: function( /*e*/ ) {

      map.graphics.clear();
      //Create Find Task using the URL of the map service to search
      findTask = new FindTask(s57ServiceUrl);

      //Create the find parameters
      findParams = new FindParameters();
      findParams.returnGeometry = true;
      findParams.layerIds = [0];
      findParams.outSpatialReference = map.spatialReference;

      //Set the search text to the value in the box
      findParams.searchText = dom.byId("input_search").value;
      esri.config.defaults.io.timeout = 300000; // 5 minutes?
      searchType = this.searchtypeSelect.value;
      if (searchType == "cell") {
        findParams.searchFields = ["DSNM"];
      } else {
        findParams.searchFields = ["OBJNAM"];

      }

      findTask.execute(findParams, this.showFindTaskResults, this.findErrorFindTaskResults);

    },
    showFindTaskResults: function(in_results) {
      var results = in_results; //.results;
      //console.log("TEST - in_results: "+ in_results.length);
      //console.log("TEST - results: "+ results.length);

      if (results.length > 0) {
        //This function works with an array of FindResult that the task returns
        //map.graphics.clear();
       

        //create array of attributes
        var items = array.map(results, function(result) {
          var graphic = result.feature;
          graphic.setSymbol(this.symbol);
          this.map.graphics.add(graphic);
          result.feature.attributes["resultID"] = result.feature.attributes.rcid + result.feature.attributes.cellName;
          return result.feature.attributes;
        });

      } 
      /*try {
        jQuery.fn.esriNautical.setSearchResults(in_results, "default");
      } catch (e) {
        try {
          jQuery(document).ready(function(e) {
            //console.log("TEST - esriNautical.loadingModal");
            //jQuery.fn.esriNautical.loadingModal(false, "","");
            jQuery.fn.esriNautical.setSearchResults(in_results, "default");
          });
        } catch (e) {
          alert("Error Displaying Results");
        }
      }*/
    },

    findErrorFindTaskResults:function(error) {
      try {
        jQuery.fn.esriNautical.loadingModal(false, "", "");
        jQuery.fn.esriNautical.errorModal("Search", "Unable to complete search (" + error + ")");
      } catch (e) {
        jQuery(document).ready(function(e) {
          jQuery.fn.esriNautical.loadingModal(false, "", "");
          jQuery.fn.esriNautical.errorModal("Search", "Unable to complete search (" + error + ")");
        });
      }
    }



  });
});