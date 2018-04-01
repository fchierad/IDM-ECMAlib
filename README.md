# IDM-ECMAlib
Collection of ECMAscript functions created for use inside NetIQ Identity Manager Drivers.

* JSONlib-JS.js: ECMAscript library for use with NetIQ Identity Manager drivers
* JSONlib-tests.xml: Sample IDM policy export with unit tests for the ECMA functions
* JSONlib-JS.md: ECMAscript functions documentation

v1.0.2: Major refactoring of instanceXMLtoJSON(), broken many of its internals in smaller, specialized functions to improve code maintainability and allow for easier future expansion of the same. Some of these functions could potentially be reused in other functions to deal with other XDS document types. Implemented support for structured attributes as well as unit tests for the same. Added additional syntax for generating more complex object structures to place the object resulting from converting the instance XML.
