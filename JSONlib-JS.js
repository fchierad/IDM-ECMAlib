/**
 * @fileoverview Custom ECMA Library contains extension functions for use with Novell Identity Manager drivers.
 * @version 1.0.0
 */

// Object declaration on the global scope to allow all functions in this library to issue driver trace commands with logmsg.trace( message, level );
var logmsg = new Packages.com.novell.nds.dirxml.driver.Trace( 'ECMA debug' );

// Auxiliary functions since es:JSON.parse() and es:JSON.stringify() do not work inside Xpath() token.

/**
 * Wrapper for the JSON.parse() call
 * @version 1.0.0
 * @since 1.0.0
 *
 * @param {string}  s   String with valid JSON syntax
 *
 * @return {object}ECMA Object generated from the JSON string
 */
function JSONparse( s ) {
  var JSONobj = {};
  try {
    JSONobj = JSON.parse( s );
  } catch( e ) {
    logmsg.trace( ' JSONparse(): Failed to parse input string: ' + e.message, 5 );
  }
  return JSONobj;
}

/**
 * Wrapper for the JSON.stringify() call
 * @version 1.0.0
 * @since 1.0.0
 *
 * @param {object}  o   ECMA object to convert to JSON
 *
 * @return {string} Serialized ECMA object in JSON format
 */
function JSONstringify( o ) {
  var str = '';
  try {
    str = JSON.stringify( o );
  } catch( e ) {
    logmsg.trace( ' JSONstringify(): Failed to stringify input object: ' + e.message, 5 );
  }
  return str;
}

/**
 * Unicode-safe split of a string to a character Array.
 *
 * Since IDM 4.5/IDM 4.6 does not have access to ES6 - therefore no spread ... operator - this function is needed.
 * Once IDM supports the spread operator use that instead
 * @version 1.0.0
 * @since 1.0.0
 *
 * @param {string}  str   String input. Any other input will be coerced to string using String() and probably won't behave as expected
 *
 * @return {string[]} Unicode-safe character array
 */
function stringToCharArray( str ) {
  var cArr = [];
  try {
    cArr = String( str ).split( /(?=(?:[\0-\t\x0B\f\x0E-\u2027\u202A-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]))/ );
  } catch( e ) {
    logmsg.trace( ' stringToCharArray(): Failed to split the input string, error: ' + e.message, 5 );
  }
  return cArr;
}

/**
 * JSON path parser. Iterates through a character array and returns an array with property names.
 * Array indexes are purely numeric property names and will be returned as numbers, not strings.
 * Character Array should have been split from the original ECMA object path that we want to parse
 * @version 1.0.0
 * @since 1.0.0
 *
 * @param {string[]}  str   Character string. Assumes each entry in the array is a single Unicode character
 *
 * @return {Array<(string|number)>} property names array
 */
function charArrToPropertyNames( cArr ) {
  var i, currentName, squaremark, re_whitespace, re_number, re_quotes, property = [];
  if ( !( cArr instanceof Array ) ) {
    logmsg.trace( ' charArrToPropertyNames(): Input parameter is not an Array, aborting.', 5 );
    return property;
  }
   // Setup for parsing. Delimiter for property names are either dot or open and close square brackets
   // If the contents inside square brackets are purely numeric then a number is returned
  currentName = '';
  re_number = /^\d+$/;
  re_quotes = /^(['"])(.+)\1$/;
  squaremark = ( cArr[ 0 ] === '[' )? 'first':'end'; //squaremark can be 'first', 'start', 'end'
  // Iterates through the character array parsing elements into their own property array entry
  for( i=0; i < cArr.length; i++ ) {
    if ( squaremark === 'first' && cArr[ i ] === '[' ) {
      squaremark = 'start';
      continue;
    }
    if ( squaremark === 'end' && cArr[ i ] === '[' ) {
      squaremark = 'start';
      if ( currentName.trim() !== '' ) { // prevent double push on constructs like arr[0][0]
        property.push( currentName.trim() );
      }
      currentName = '';
      continue;
    }
    if ( squaremark === 'start' && cArr[ i ] === ']' ) {
      squaremark = 'end';
      currentName = currentName.trim();
      // If the property name between [] is a pure number, coerces the string to a number
      if ( re_number.test( currentName ) ) {
        currentName = parseInt( currentName, 10 );
      }
      // Remove quotes around property name if they are present like obj["property name"], returning property name
      if ( re_quotes.test( currentName ) ) {
        currentName = re_quotes.exec( currentName )[2];
      }
      property.push( currentName );
      currentName = '';
      continue;
    }
    // Traditional . delimiter
    if ( squaremark === 'end' && cArr[ i ] === '.' ) {
      if ( currentName.trim() !== '' ) { // prevent double push on constructs like arr[0].name
        property.push( currentName.trim() );
      }
      currentName = '';
      continue;
    }
    currentName += cArr[ i ];
  }
  if ( currentName !== '' ) {
    property.push( currentName.trim() );
  }
  return property;
}

/**
 * Retrieves a property of an ECMA object (or its subordinate object) and returns it in the specified type.
 * Note: To reference properties with a dot in their name use the format ["property.name"]
 * @version 1.0.0
 * @since 1.0.0
 *
 * @param {(object|string)}  inputJSON   Input JSON (ECMA object). If a string-serialized JSON is provided it will be converted to a JSON object internally
 * @param {string}           whattoget   Dot-separated list of properties as if you are accessing them via ECMAscript
 * @param {string=}          [returntype]  (Optional) Desired return type. Valid values are: string, number, raw. Defaults to raw in case whatever is provided is not one of the 3 valid options
 *
 * @return {(string|number|boolean|object)} Selected property's value in the selected format. If parsing of the object fails returns an empty string
 */
function JSONget( inputJSON, whattoget, returntype ) {
    var i, itval, itobj, JSONobj, getArr, propName, res = '';
    // Review input data
    if ( typeof inputJSON === 'string' ) {
      JSONobj = JSONparse( inputJSON );
    } else {
      JSONobj = inputJSON;
    }
    if ( typeof whattoget === 'string' ) {
      getArr = charArrToPropertyNames( stringToCharArray( whattoget ) );
    } else {
      return res;
    }
    if ( returntype !== 'string' && returntype !== 'number' && returntype !== 'raw' ) {
        returntype = 'raw';
    }
    // Iterates through the object using itobj and itval as the middle steps to find the desired result
    itobj = JSONobj;
    for( i = 0; i < getArr.length; i++ ) {
      propName = getArr[ i ];
      logmsg.trace( ' JSONget(): Parsing: "' + propName + '", type: ' + typeof propName, 5 );
      if ( typeof itobj === 'object' && propName in itobj ) {
        itval = itobj[ propName ];
      } else {
        logmsg.trace( '  JSONget(): could not find property "' + propName + '" in the current object location.', 5 );
        return res;
      }
      itobj = itval;
    }
    // Inspect returned data and coerce it as needed. No deafult set since res is set at the start of the function
    switch ( returntype ) {
        case 'string':
            res = String( itval );
            break;
        case 'number':
            res = parseInt( String( itval ), 10 );
            break;
            case 'raw':
            res = itval;
            break;
    }
    return res;
}

/**
 * Verify if an ECMA object has the selected location.
 * Note: To reference properties with a dot in their name use the format ["property.name"]
 * @version 1.0.0
 * @since 1.0.0
 *
 * @param {(object|string)}  inputJSON    Input JSON (ECMA object). If a string-serialized JSON is provided it will be converted to a JSON object internally
 * @param {string}           whattotest   Dot-separated list of properties as if you are accessing them via ECMAscript
 *
 * @return {boolean} true if the path is found, false otherwise
 */
function JSONtest( inputJSON, whattotest ) {
  var i, itval, itobj, JSONobj, getArr, propName;
  // Review input data
  if ( typeof inputJSON === 'string' ) {
    JSONobj = JSONparse( inputJSON );
  } else {
    JSONobj = inputJSON;
  }
  if ( typeof whattotest === 'string' ) {
    getArr = charArrToPropertyNames( stringToCharArray( whattotest ) );
  } else {
    return false;
  }
  // Iterates through the object using itobj and itval as the middle steps to find the desired result
  itobj = JSONobj;
  for( i = 0; i < getArr.length; i++ ) {
    propName = getArr[ i ];
    logmsg.trace( ' JSONget(): Parsing: "' + propName + '", type: ' + typeof propName, 5 );
    if ( typeof itobj === 'object' && propName in itobj ) {
      itval = itobj[ propName ];
    } else {
      logmsg.trace( '  JSONtest(): could not find property "' + propName + '" in the current object location.', 5 );
      return false;
    }
    itobj = itval;
  }
  return true;
}

/**
 * Returns a nodeset with the contents of the provided ECMA array serialized into strings.
 * @version 1.0.0
 * @since 1.0.0
 *
 * @param  {array}  arr   ECMA array
 *
 * @return {nodeset} xml nodeset with the data provided in the array. The nodeset structure will be:
 * <array>
 *   <element></element>
 *   ...
 * </array>
 * Where  each element's content will be a string representation of the array element.
 * Whenever the array element being parsed is an object or other arrays their representation will be built
 *  by using JSON.stringify() on the element.
 */
function arrayToNodeset( arr ) {
    var i, doc, ns, xmlroot, xmlnode, xmltext;

    // https://www.novell.com/documentation/developer/dirxml/dirxmlbk/api/com/novell/xml/xpath/NodeSet.html
    ns = new Packages.com.novell.xml.xpath.NodeSet();
    // https://www.novell.com/documentation/developer/dirxml/dirxmlbk/api/com/novell/xml/dom/DocumentFactory.html
    // https://docs.oracle.com/javase/8/docs/api/org/w3c/dom/Document.html
    doc = Packages.com.novell.xml.dom.DocumentFactory.newDocument();

    // Create root element 'array'
    xmlroot = doc.createElement( 'array' );

    // Anything other than Array as the input parameter and we exit returning a nodeset with only <array/> on it
    if ( ! (arr instanceof Array) ) {
        logmsg.trace( ' arrayToNodeset(): The provided parameter is not an ECMA Array.',5 );
        ns.add( xmlroot );
        return ns;
    }

    // Iterate through elements coercing them to string directly if their contents are primitives (string, number, boolean, undefined, null)
    // or via JSON.stringify() if their contents are ECMA arrays or objects.
    for ( i = 0; i < arr.length; i++ ) {
        xmlnode = doc.createElement( 'element' );
        // Build element node's text sub-node based on the rules outlined above
        if ( arr[ i ] === null ) {
            xmltext = doc.createTextNode( 'null' );
        } else if ( typeof arr[ i ] === 'object' ) {
            xmltext = doc.createTextNode( JSONstringify( arr[ i ] ) );
        } else {
            // We are risking receiving a function or symbol here due to the logic used. For why see:
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/typeof
            xmltext = doc.createTextNode( String( arr[ i ] ) );
        }
        // put all together for this iteration
        xmlnode.appendChild( xmltext );
        xmlroot.appendChild( xmlnode );
    }

    ns.add( xmlroot );

    return ns;
}

/**
 * Parse a nodeset with an <instance> query result and returns 1 level JSON with the attribute names as object properties
 * and the attribute value as their values. Multi-valued attributes will result in an array of values assigned to the JSON property.
 * This iteration does not handle structured attributes
 * @version 1.0.0
 * @since 1.0.0
 *
 * @param  {nodeset}  instnodeset    Nodeset local variable from DirXML Policy
 * @param  {string=}  [returntype]   (optional) return type - ECMA object 'object' or Serialized JSON object 'serialized'
 *                                   If omitted will default to 'serialized'
 *
  * @return {(string|object)} Serialized JSON string | ECMA Object
 */
function instanceXMLtoJSON( instnodeset, returntype ) {
    /* base XML will have multiple nodes in the format <attr attr-name="name"><value>attribute value</value></attr>
     * conversion does peek at the @type attribute of the value element. number and string are treated as such,
     * any other types currently are coerced into strings
     */
    var ret = null, retObj = {}, i, j, rettype,topnode, attrname, attrvalue, attrtype, attrArr, valueArr;

    if ( typeof instnodeset != 'object' ) {
      return 'Function parameter need to be a local variable of the type NodeSet';
    }

    rettype = String( returntype ).toLowerCase();
    if ( rettype !== 'object' && rettype !== 'serialized' ) {
      rettype = 'serialized';
    }

  try {
        topnode = instnodeset.first();
        if ( topnode ) {
            logmsg.trace( ' instanceXMLtoJSON(): Top node  => "' + topnode.getNodeName() + '"',5 );
        } else {
            return 'Error: Could not get the first child node of the parameter passed.';
        }
  } catch( e ) {
    return 'Error: Could not get the first child node of the parameter passed.';
  }

    /* If the XML Parse token was used to create the nodeset, its topmost node is #document, not instance.
     * If that is the case then we need to go down one more level to try and identiy the top element
     */

    if ( String( topnode.getNodeName() ).toLowerCase() === '#document' && topnode.hasChildNodes() ) {
        try {
            topnode = topnode.getFirstChild();
            if ( topnode ) {
                logmsg.trace( ' instanceXMLtoJSON(): Iterating #document node - new Top node  => "' + topnode.getNodeName() + '"',5 );
            } else {
                return 'Error: Could not get the first child node of #document node.';
            }
        } catch( e ) {
            return 'Error: Could not get the first child node of #document node.';
        }
    }

     // Check basic structure for the instance and attr elements, then process the same
  if ( String( topnode.getNodeName() ) === 'instance' && topnode.hasChildNodes() &&
     topnode.getElementsByTagName( 'attr' ).getLength() > 0 )
  {
      attrArr = topnode.getElementsByTagName( 'attr' );
      for( i = 0; i < attrArr.getLength() ; i++) {
          if ( attrArr.item( i ).getAttributes().getNamedItem( 'attr-name' ) != null &&
               attrArr.item( i ).getElementsByTagName( 'value' ).getLength() > 0 )
            {
              // Wrapping attrname and attrvalue declarations into ECMA Strings to avoid JSON conversion error
                attrname = String( attrArr.item( i ).getAttributes().getNamedItem( 'attr-name' ).getNodeValue() );
                // If the attribute has a single value element, we return it as is. Otherwise we return an array of values
                if ( attrArr.item( i ).getElementsByTagName( 'value' ).getLength() == 1 ) {
                    // Single-valued attribute
                    if ( attrArr.item( i ).getElementsByTagName( 'value' ).item( 0 ).hasChildNodes() ) {
                        attrvalue = String( attrArr.item( i ).getElementsByTagName( 'value' ).item( 0 ).getFirstChild().getNodeValue() );
                    } else {
                        attrvalue = '';
                    }
                    logmsg.trace( '  instanceXMLtoJSON(): Found => ' + attrname + ':' + attrvalue ,5);
                } else {
                    // Multi-valued attribute
                    valueArr = [];
                    for( j = 0; j < attrArr.item( i ).getElementsByTagName( 'value' ).getLength(); j++ ) {
                        if ( attrArr.item( i ).getElementsByTagName( 'value' ).item( 0 ).hasChildNodes() ) {
                            valueArr.push( String( attrArr.item( i ).getElementsByTagName( 'value' ).item( j ).getFirstChild().getNodeValue() ) );
                        } else {
                            valueArr.push( '' );
                        }
                    }
                    attrvalue = valueArr.slice();
                    logmsg.trace( '  instanceXMLtoJSON(): Found => ' + attrname + ': [ ' + attrvalue.join( ', ') + ' ]' ,5);
                }
                retObj[ attrname ] = attrvalue;
            }
      }
  } else {
    return 'Nodeset passed does not have a root <instance> element with one or more child <attr> nodes.';
  }

    switch ( rettype ) {
        case 'object':
            ret = retObj;
            break;
        case 'serialized':
            ret = JSONstringify( retObj );
            break;
        default:
            // Just to guarantee we always have a return. This was the original return for the function
            ret = JSONstringify( retObj );
    }
    return ret;
}