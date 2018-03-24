## Functions

<dl>
<dt><a href="#JSONparse">JSONparse(s)</a> ⇒ <code>object</code></dt>
<dd><p>Wrapper for the JSON.parse() call</p>
</dd>
<dt><a href="#JSONstringify">JSONstringify(o)</a> ⇒ <code>string</code></dt>
<dd><p>Wrapper for the JSON.stringify() call</p>
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
<dt><a href="#arrayToNodeset">arrayToNodeset(ECMA)</a> ⇒ <code>nodeset</code></dt>
<dd><p>Returns a nodeset with the contents of the provided ECMA array serialized into strings.</p>
</dd>
<dt><a href="#instanceXMLtoJSON">instanceXMLtoJSON(instnodeset, [returntype])</a> ⇒ <code>string</code> | <code>object</code></dt>
<dd><p>Parse a nodeset with an <instance> query result and returns 1 level JSON with the attribute names as object properties
and the attribute value as their values. Multi-valued attributes will result in an array of values assigned to the JSON property.
This iteration does not handle structured attributes</p>
</dd>
</dl>

<a name="JSONparse"></a>

## JSONparse(s) ⇒ <code>object</code>
Wrapper for the JSON.parse() call

**Kind**: global function  
**Returns**: <code>object</code> - ECMA Object generated from the JSON string  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| s | <code>string</code> | String with valid JSON syntax |

<a name="JSONstringify"></a>

## JSONstringify(o) ⇒ <code>string</code>
Wrapper for the JSON.stringify() call

**Kind**: global function  
**Returns**: <code>string</code> - Serialized ECMA object in JSON format  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| o | <code>object</code> | ECMA object to convert to JSON |

<a name="stringToCharArray"></a>

## stringToCharArray(str) ⇒ <code>Array.&lt;string&gt;</code>
Unicode-safe split of a string to a character Array.

**Kind**: global function  
**Returns**: <code>Array.&lt;string&gt;</code> - Unicode-safe character array  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>string</code> | String input. Any other input will be coerced to string using String() and probably won't behave as expected |

<a name="charArrToPropertyNames"></a>

## charArrToPropertyNames(str) ⇒ <code>Array.&lt;(string\|number)&gt;</code>
JSON path parser. Iterates through a character array and returns an array with property names.

**Kind**: global function  
**Returns**: <code>Array.&lt;(string\|number)&gt;</code> - property names array  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>Array.&lt;string&gt;</code> | Character string. Assumes each entry in the array is a single Unicode character |

<a name="JSONget"></a>

## JSONget(inputJSON, whattoget, [returntype]) ⇒ <code>string</code> \| <code>number</code> \| <code>boolean</code> \| <code>object</code>
Retrieves a property of an ECMA object (or its subordinate object) and returns it in the specified type.

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
Verify if an ECMA object has the selected location.

**Kind**: global function  
**Returns**: <code>boolean</code> - true if the path is found, false otherwise  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| inputJSON | <code>object</code> \| <code>string</code> | Input JSON (ECMA object). If a string-serialized JSON is provided it will be converted to a JSON object internally |
| whattotest | <code>string</code> | Dot-separated list of properties as if you are accessing them via ECMAscript |

<a name="arrayToNodeset"></a>

## arrayToNodeset(ECMA) ⇒ <code>nodeset</code>
Returns a nodeset with the contents of the provided ECMA array serialized into strings.

**Kind**: global function  
**Returns**: <code>nodeset</code> - xml nodeset with the data provided in the array. The nodeset structure will be:
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| ECMA | <code>array</code> | array |

<a name="instanceXMLtoJSON"></a>

## instanceXMLtoJSON(instnodeset, [returntype]) ⇒ <code>string</code> \| <code>object</code>
Parse a nodeset with an <instance> query result and returns 1 level JSON with the attribute names as object properties

**Kind**: global function  
**Returns**: <code>string</code> \| <code>object</code> - Serialized JSON string | ECMA Object  
**Since**: 1.0.0  
**Version**: 1.0.0  

| Param | Type | Description |
| --- | --- | --- |
| instnodeset | <code>nodeset</code> | Nodeset local variable from DirXML Policy |
| [returntype] | <code>string</code> | (optional) return type - ECMA object 'object' or Serialized JSON object 'serialized'                                   If ommited will default to 'serialized' |
