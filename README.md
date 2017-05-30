# Maritime Chart Service sample viewer
## (Web App Builder widgets)



## The clone and download steps are not currently supporting 10.5.  If you require 10.5 widgets please email maritime@esri.com.


The Maritime Chart Service widgets are widgets and dojo classes that illustrate how web applications can consume and interact with the Maritime Chart Service exposed by the ArcGIS for Maritime: Server product.
The widgets can be used directly within Web App Builder for ArcGIS. Alternatively, the source code for these widgets is available here for reuse/modification and to integrate it within custom web apps outside of the Web App Builder for ArcGIS framework.

What's new with this version
* Updated requirements section
* Updated deployment steps
* Search widget is now functional
* Compatible with WAB 2.3 and greater
* Supports JS API 3.19 and greater
* Only supports ArcGIS for Maritime: Server 10.5


![App](maritimechartservice-sample-viewer.png)

## Sections

* [Features](#features)
* [Requirements](#requirements)
* [Deployment](#deployment)
* [Resources](#resources)
* [Issues](#issues)
* [Contributing](#contributing)
* [Licensing](#licensing)

## Features

These Web App Builder widgets illustrates how to build web apps consuming S-57 web services published from ArcGIS for Maritime: Server in a JavaScript web app.
* Allows users to change S-52 display properties
* Enables users to identify on features and view their attribute information.
* Provides the ability to search based on object name and national object name and S-57 dataset names.

The Widget Repository currently includes:

###Maritime Chart Service Library

This is a library of custom Esri widgets and custom layer classes that extend Esri's JSAPI in order to consume the Maritime Chart Service in apps. 

###Web App Builder Widgets

The following are custom Web App Builder widgets that use the maritime chart service library above and are to be used within the Web App Builder to create custom apps, templates and themes.

* Maritime Display Properties
* Maritime Identify
* Maritime Search


## Requirements
* Web App Builder for ArcGIS (Developer Edition) 2.3 or greater for the Web App builder widgets. 
* Maritime Chart Service widgets require JS API 3.19 or greater. 
* ArcGIS for Maritime: Server 10.5 - new widgets will be posted when ArcGIS for Maritime: Server 10.5.1 is released.


## Deployment

Adding Widgets to you Web AppBuilder Environment:

1. If you haven't already, download the latest version of Web AppBuilder for ArcGIS (Developer Edition) and follow the instruction at https://developers.arcgis.com/web-appbuilder/guide/getstarted.htm 
2. ~~Download the Maritime Chart Service widgets by clicking on Download Zip. maritimechartservice-sample-viewer-10.5.0.zip will be downloaded to your machine.~~  **(This step is currently not supported.  Email maritime@esri.com for the maritimechartservice-sample-viewer-10.5.0.zip file).**
3. Unzip maritimechartservice-sample-viewer-10.5.0.zip
4. To use the widgets, copy the ones you want to use to the Web App Builder widget directory.
  * Copy the contents of the `<unzip folder>\src\widgets\` folder to `<webappbuilder folder>\client\stemapp\widgets\`
5. The Web App Builder widgets depend on the modules in the libs folder.
  * Copy the contents of `<unzip folder>\src\libs\` folder to `<webappbuilder folder>\client\stemapp\libs\`
6. Add the following two lines of code in your `<webappbuilder folder>\client\stemapp\init.js` file in two places where dojoConfig.packages are defined. 
```
      {
          name: "bootstrap",
          location: "//rawgit.com/xsokev/Dojo-Bootstrap/master"
      },
```

## Create a Web App using the Maritime Chart Service:
When creating a Web App, you need to chose the Web Map that will be used by the App. In order to use the maritime widgets, make sure that the Web Map you choose contains the Maritime Chart Service layer. This Web Map must first be created and available in your ArcGIS Online account. If you don't have a access to a Web Map that contains the Maritime Chart Service, you can create one in your ArcGIS Online account.

* Log in to your ArcGIS Online account
* Create a new Map
* Click Add -> Add Layer from Web
* Specify a layer containing the Maritime Chart Service

For instance, if you enabled the Maritime Chart Service on the default *SampleWorldCities* layer on a ArcGIS Server instance where the ArcGIS for Maritime: Server is installed, the URL for the layer would look like:

```
	https://[yourmachinename]:6443/arcgis/rest/services/SampleWorldCities/MapServer/exts/MaritimeChartService/MapServer
```
If the machine is in a domain, it is sometimes required to include domain name along with the machine name to get started, like 
```
	https://[yourmachinename].[yourdomain]::6443/arcgis/rest/services/SampleWorldCities/MapServer/exts/MaritimeChartService/MapServer
```
* Save the Web Map

The Web Map is now using the Maritime CHart Service, and can be selected when you create your App in Web AppBuilder


## Additional Deployment steps for the Identify widget:

If you want to resize your Identify widget you will need to add a height and width value to the widget while in the WAB development environment.  

 * Once you have added the Maritime Identify widget to your application and saved that application add the following two lines of code in your <webappbuilder folder>\server\apps\<app number>\config.json.

The following two values are a recommended starting point:
```
       "height": 120,
       "width": 265,
 ```
 
 Sample modifcation:
 ```
 {
        "position": {
          "left": 55,
          "top": 45,
		  "height": 120,
		  "width": 265,
          "relativeTo": "map"
        },
        "placeholderIndex": 1,
        "id": "_5",
        "name": "MaritimeIdentify",
        "label": "Maritime Identify",
        "version": "0.0.1",
        "IsController": false,
        "uri": "widgets/MaritimeIdentify/Widget",
        "config": "configs/MaritimeIdentify/config_Maritime Identify.json"
      },
```

* Refresh your application to see the changes.

### General Help
[New to Github? Get started here.](http://htmlpreview.github.com/?https://github.com/Esri/esri.github.com/blob/master/help/esri-getting-to-know-github.html)

For more resources on developing and modifying widgets please visit
[Web App Builder for ArcGIS (Developer Edition) documentation](https://developers.arcgis.com/web-appbuilder/)

## Resources

* Learn more about Maritime Chart Service, a functionality of the ArcGIS for Maritime: Server product [here](http://server.arcgis.com/en/server/latest/get-started/windows/arcgis-for-maritime-server.htm#).
* [ArcGIS for JavaScript API Resource Center](http://help.arcgis.com/en/webapi/javascript/arcgis/index.html)
* [ArcGIS Blog](http://blogs.esri.com/esri/arcgis/)

## Issues

* Find a bug or want to request a new feature?  Please let us know by submitting an issue or emailing maritime@esri.com 

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

If you are using [JS Hint](http://www.jshint.com/) there is a .jshintrc file included in the root folder which enforces this style.
We allow for 120 characters per line instead of the highly restrictive 80.

## Licensing

Copyright 2017 Esri

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

A copy of the license is available in the repository's
[license.txt](license.txt) file.

[](Esri Tags: maritime maritimechartservice webappbuilder)
[](Esri Language: Javascript)
