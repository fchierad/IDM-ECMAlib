## Functions

<dl>
<dt><a href="#JSONparse">JSONparse(s, [reviver])</a> ⇒ <code>object</code></dt>
<dd><p>Wrapper for the JSON.parse() call
See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse">https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse</a></p>
</dd>
<dt><a href="#JSONstringify">JSONstringify(o, [replacer], [space])</a> ⇒ <code>string</code></dt>
<dd><p>Wrapper for the JSON.stringify() call
See <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify">https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify</a></p>
</dd>
<dt><a href="#stringToCharArray">stringToCharArray(str)</a> ⇒ <code>Array.&lt;string&gt;</code></dt>
<dd><p>Unicode-safe split of a string to a character Array.</p>
<p>Since IDM 4.5/IDM 4.6 does not have access to ES6 - therefore no spread ... operator - this function is needed.
Once IDM supports the spread operator use that instead</p>
</dd>
<dt><a href="#charArrToPropertyNames">charArrToPropertyNames(str)</a> ⇒ <code>Array.&lt;(string|number)&gt;</code></dt>
<dd><p>JSON path parser. Iterates through a character array and returns an array with property names.
Array indexes are purely numeric property names and will be returned as numbers, not strings.
Character Array should have been split from the original ECMA object path that we want to parse</p>
</dd>
<dt><a href="#JSONget">JSONget(inputJSON, whattoget, [returntype])</a> ⇒ <code>string</code> | <code>number</code> | <code>boolean</code> | <code>object</code></dt>
<dd><p>Retrieves a property of an ECMA object (or its subordinate object) and returns it in the specified type.
Note: To reference properties with a dot in their name use the format [&quot;property.name&quot;]</p>
</dd>
<dt><a href="#JSONtest">JSONtest(inputJSON, whattotest)</a> ⇒ <code>boolean</code></dt>
<dd><p>Verify if an ECMA object has the selected location.
Note: To reference properties with a dot in their name use the format [&quot;property.name&quot;]</p>
</dd>
<dt><a href="#arrayToNodeset">arrayToNodeset(arr)</a> ⇒ <code>nodeset</code></dt>
<dd><p>Returns a nodeset with the contents of the provided ECMA array serialized into strings.</p>
</dd>
<dt><a href="#instanceXMLtoJSON">instanceXMLtoJSON(instnodeset, [returntype], [buildstructure], [inserttype])</a> ⇒ <code>string</code> | <code>object</code></dt>
<dd><p>Parse a nodeset with an <instance> query result and returns 1 level JSON with the attribute names as object properties
and the attribute value as their values. Multi-valued attributes will result in an array of values assigned to the JSON property.
This iteration does not handle structured attributes</p>
</dd>
</dl>

<a name="JSONparse"></a>

## JSONparse(s, [reviver]) ⇒ <code>object</code>
Wrapper for the JSON.parse() callSee https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse

**Kind**: global function  
**Returns**: <code>object</code> - ECMA Object generated from the JSON string  
**Since**: 1.0.0  
**Version**: 1.0.1  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | String with valid JSON syntax |
| [reviver] | <code>function</code> | (Optional) If a function, this prescribes how the value originally produced by parsing is transformed, before being returned. |

<a name="JSONstringify"></a>

## JSONstringify(o, [replacer], [space]) ⇒ <code>string</code>
Wrapper for the JSON.stringify() callSee https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify

**Kind**: global function  
**Returns**: <code>string</code> - Serialized ECMA object in JSON format  
**Since**: 1.0.0  
**Version**: 1.0.1  

| Param | Type | Description |
| --- | --- | --- |
| o | <code>object</code> | ECMA object to convert to JSON |
| [replacer] | <code>function</code> \| <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;number&gt;</code> | (Optional) A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string. If this value is null or not provided, all properties of the object are included in the resulting JSON string |
| [space] | <code>string</code> \| <code>number</code> | (Optional) A String or Number object that's used to insert white space into the output JSON string for readability purposes. If this is a Number, it indicates the number of space characters to use as white space; this number is capped at 10 (if it is greater, the value is just 10). Values less than 1 indicate that no space should be used. If this is a String, the string (or the first 10 characters of the string, if it's longer than that) is used as white space. If this parameter is not provided (or is null), no white space is used. |

<a name="stringToCharArray"></a>

## stringToCharArray(str) ⇒ <code>Array.&lt;string&gt;</code>
Unicode-safe split of a string to a character Array.Since IDM 4.5/IDM 4.6 does not have access to ES6 - therefore no spread ... operator - this function is needed.Once IDM supports the spread operator use that instead

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Unicode-safe character array  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String input. Any other input will be coerced to string using String() and probably won't behave as expected |

<a name="charArrToPropertyNames"></a>

## charArrToPropertyNames(str) ⇒ <code>Array.&lt;(string\|number)&gt;</code>
JSON path parser. Iterates through a character array and returns an array with property names.Array indexes are purely numeric property names and will be returned as numbers, not strings.Character Array should have been split from the original ECMA object path that we want to parse

**Kind**: global function  
**Returns**: <code>Array.&lt;(string\|number)&gt;</code> - property names array  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>Array.&lt;string&gt;</code> | Character string. Assumes each entry in the array is a single Unicode character |

<a name="JSONget"></a>

## JSONget(inputJSON, whattoget, [returntype]) ⇒ <code>string</code> \| <code>number</code> \| <code>boolean</code> \| <code>object</code>
Retrieves a property of an ECMA object (or its subordinate object) and returns it in the specified type.Note: To reference properties with a dot in their name use the format ["property.name"]

**Kind**: global function  
**Returns**: <code>string</code> \| <code>number</code> \| <code>boolean</code> \| <code>object</code> - Selected property's value in the selected format. If parsing of the object fails returns an empty string  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| inputJSON | <code>object</code> \| <code>string</code> | Input JSON (ECMA object). If a string-serialized JSON is provided it will be converted to a JSON object internally |
| whattoget | <code>string</code> | Dot-separated list of properties as if you are accessing them via ECMAscript |
| [returntype] | <code>string</code> | (Optional) Desired return type. Valid values are: string, number, raw. Defaults to raw in case whatever is provided is not one of the 3 valid options |

<a name="JSONtest"></a>

## JSONtest(inputJSON, whattotest) ⇒ <code>boolean</code>
Verify if an ECMA object has the selected location.Note: To reference properties with a dot in their name use the format ["property.name"]

**Kind**: global function  
**Returns**: <code>boolean</code> - true if the path is found, false otherwise  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| inputJSON | <code>object</code> \| <code>string</code> | Input JSON (ECMA object). If a string-serialized JSON is provided it will be converted to a JSON object internally |
| whattotest | <code>string</code> | Dot-separated list of properties as if you are accessing them via ECMAscript |

<a name="arrayToNodeset"></a>

## arrayToNodeset(arr) ⇒ <code>nodeset</code>
Returns a nodeset with the contents of the provided ECMA array serialized into strings.

**Kind**: global function  
**Returns**: <code>nodeset</code> - xml nodeset with the data provided in the array.                  The nodeset root node will be 'array', with zero or more child 'element' nodes.                  Each element node will have a child text node with a string representation of the array element.                  Whenever the array element being parsed is an object or other arrays their representation will be built                  by using JSON.stringify() on the element.  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| arr | <code>array</code> | ECMA array |

<a name="instanceXMLtoJSON"></a>

## instanceXMLtoJSON(instnodeset, [returntype], [buildstructure], [inserttype]) ⇒ <code>string</code> \| <code>object</code>
Parse a nodeset with an <instance> query result and returns 1 level JSON with the attribute names as object propertiesand the attribute value as their values. Multi-valued attributes will result in an array of values assigned to the JSON property.This iteration does not handle structured attributes

**Kind**: global function  
**Returns**: <code>string</code> \| <code>object</code> - Serialized JSON string | ECMA Object  
**Since**: 1.0.0  
**Version**: 1.0.1  

| Param | Type | Description |
| --- | --- | --- |
| instnodeset | <code>nodeset</code> | Nodeset local variable from DirXML Policy |
| [returntype] | <code>string</code> | (Optional) return type - ECMA object 'object' or Serialized JSON object 'serialized'. If omitted will default to 'serialized' |
| [buildstructure] | <code>string</code> | (Optional) Dot-separated list of properties to be created as part of the returned object.                                      The object will be added as a property of the last location provided.                                      If omitted the object will be returned by itself. Current iteration does not build arrays from [0]. |
| [inserttype] | <code>string</code> | (Optional) 'value' or 'list'. Defaults to 'value' if omitted. 'list' wraps the object generated from the instance XML document in an array. |

