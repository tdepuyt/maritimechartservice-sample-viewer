# mcs-widgets
ArcGIS for Maritime: Server widgets is a set of widgets and dojo classes for use within the Web AppBuilder for ArcGIS and also in web applications that are not built using the Web AppBuilder. These widgets adress specialized workflow created and managed by the Esri Server for Maritime team. These widgets are a component of the applications created by the MCS team.

Important Note: There has been some testing with Web AppBuilder for ArcGIS 1.1 but there are still some minor issues which are being captured as part of this repository.

## Sections

* [Features](#features)
* [Requirements](#requirements)
* [Instructions](#instructions)
* [Resources](#resources)
* [Issues](#issues)
* [Contributing](#contributing)
* [Licensing](#licensing)

## Features
The Widget Repository currently includes:

###Maritime Chart Service Library

This is a [library](./src/libs/mcs-widgets/README.md) of custom ESRI widgets and custom layer classes that extend ESRI's JSAPI in order to consume the Maritime Chart Service in apps. 

###Web App Builder Widgets

The following are custom WAB widgets that use the maritime chart service library and are to be used within the web app builder to create custom apps, templates and themes.

* [Maritime Display Properties](./src/widgets/MaritimeDisplayProperties/README.md)
* [Maritime Identify](./src/widgets/MaritimeIdentify/README.md)
* [Maritime Search](./src/widgets/MaritimeSearch/README.md)


## Requirements
Requires Web AppBuilder for ArcGIS 1.1

## Instructions
Deploying Widgets.

To use the widgets with you should copy any of the widgets to the stemapp/widget directory. This is located in %webappbuilder_install%/client directory.

For more resources on developing modifying widgets please visit
[Web AppBuilder for ArcGIS Documentation](http://doc.arcgis.com/en/web-appbuilder/)

### General Help
[New to Github? Get started here.](http://htmlpreview.github.com/?https://github.com/Esri/esri.github.com/blob/master/help/esri-getting-to-know-github.html)


## Resources

* Learn more about Maritime Chart Service [here](http://blogs.esri.com/esri/arcgis/2015/01/21/a-brief-introduction-to-the-maritime-chart-server/).

## Issues

* Find a bug or want to request a new feature?  Please let us know by submitting an issue.

## Contributing

Esri welcomes contributions from anyone and everyone. Please see our [guidelines for contributing](https://github.com/esri/contributing).

If you are using [JS Hint](http://http://www.jshint.com/) there is a .jshintrc file included in the root folder which enforces this style.
We allow for 120 characters per line instead of the highly restrictive 80.

## Licensing

Copyright 2013 Esri

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

