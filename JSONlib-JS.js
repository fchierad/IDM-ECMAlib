/**
 * @fileoverview Custom ECMA Library contains extension functions for use with NetIQ Identity Manager drivers. Requires IDM 4.5 or later.
 *               Latest version available at https://github.com/fchierad/IDM-ECMAlib
 * @version 1.0.2
 */

// Object declaration on the global scope to allow all functions in this library to issue driver trace commands with logmsg.trace( message, level );
var logmsg = new Packages.com.novell.nds.dirxml.driver.Trace( 'ECMA debug' );

// Auxiliary functions since es:JSON.parse() and es:JSON.stringify() do not work inside Xpath() token.

/**
 * Wrapper for the JSON.parse() call
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
 * @version 1.0.1
 * @since 1.0.0
 *
 * @param {string}     s          String with valid JSON syntax
 * @param {function=}  [reviver] (Optional) If a function, this prescribes how the value originally produced by parsing is transformed, before being returned.
 *
 * @return {object} ECMA Object generated from the JSON string
 */
function JSONparse( s, reviver ) {
  var JSONobj = {};
  try {
    JSONobj = JSON.parse( s, reviver );
  } catch( e ) {
    logmsg.trace( ' JSONparse(): Failed to parse input string: ' + e.message, 5 );
  }
  return JSONobj;
}

/**
 * Wrapper for the JSON.stringify() call
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify
 * @version 1.0.1
 * @since 1.0.0
 *
 * @param {object}                        o           ECMA object to convert to JSON
 * @param {(function|string[]|number[])=} [replacer]  (Optional) A function that alters the behavior of the stringification process, or an array of String and Number objects that serve as a whitelist for selecting/filtering the properties of the value object to be included in the JSON string. If this value is null or not provided, all properties of the object are included in the resulting JSON string
 * @param {(string|number)=}              [space]     (Optional) A String or Number object that's used to insert white space into the output JSON string for readability purposes. If this is a Number, it indicates the number of space characters to use as white space; this number is capped at 10 (if it is greater, the value is just 10). Values less than 1 indicate that no space should be used. If this is a String, the string (or the first 10 characters of the string, if it's longer than that) is used as white space. If this parameter is not provided (or is null), no white space is used.
 *
 * @return {string} Serialized ECMA object in JSON format
 */
function JSONstringify( o, replacer, space ) {
  var str = '';
  try {
    str = JSON.stringify( o, replacer, space );
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
 * @param {(object|string)}  inputJSON     Input JSON (ECMA object). If a string-serialized JSON is provided it will be converted to a JSON object internally
 * @param {string}           whattoget     Dot-separated list of properties as if you are accessing them via ECMAscript
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
  // Inspect returned data and coerce it as needed. No default set since res is set at the start of the function
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
 * @param {array}  arr   ECMA array
 *
 * @return {nodeset} xml nodeset with the data provided in the array.
 *                   The nodeset root node will be 'array', with zero or more child 'element' nodes.
 *                   Each element node will have a child text node with a string representation of the array element.
 *                   Whenever the array element being parsed is an object or other arrays their representation will be built
 *                   by using JSON.stringify() on the element.
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
    logmsg.trace( ' arrayToNodeset(): The provided parameter is not an ECMA Array.', 5 );
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
 * @version 1.0.2
 * @since 1.0.0
 *
 * @param {com.novell.xml.xpath.InsertionOrderNodeSet}  instnodeset      Nodeset local variable from DirXML Policy
 * @param {string=}  [returntype]     (Optional) return type - ECMA object 'object' or Serialized JSON object 'serialized'. If omitted will default to 'serialized'
 * @param {string=}  [buildstructure] (Optional) Dot-separated list of properties to be created as part of the returned object.
 *                                      The object will be added as a property of the last location provided.
 *                                      If omitted the object will be returned by itself. Use the advsyntax parameter to expand parsing of this structure.
 * @param {string=}  [inserttype]     (Optional) 'value', 'list' or 'advanced'. Defaults to 'value' if omitted.
 *                                     'list' wraps the object generated from the instance XML document in an array, kept for backwards compatibility.
 *                                     'advanced' causes the parsing of the buildstructure to look for :value, :list at the end of of a property name,
 *                                      then uses those indicators to build the parsed structure to append the converted instance XML to.
 *
 * @return {(string|object)} Serialized JSON string | ECMA Object
 */
function instanceXMLtoJSON( instnodeset, returntype, buildstructure, inserttype ) {
  /* base XML will have multiple nodes in the format <attr attr-name="name"><value>attribute value</value></attr>
   * conversion does peek at the @type attribute of the value element. Reference the URL below for the different syntax types accepted:
   * https://www.netiq.com/documentation/identity-manager-developer/dtd-documentation/ndsdtd/value.html
   * 'state' will be converted to the proper boolean format, 'int' and 'count' will be converted via parseInt( value/text(), 10),
   * structured attributes will create one or more child objects, any other types currently are coerced into strings.
   */
  var ret = null, fname = 'instanceXMLtoJSON(): ', retObj = {}, retObjS2 = {}, retObjS3 = {},
    i, j, nsClass, nsValid = false, topnode, attrArr, attrobj,
    putArr, cur, lastProp, re_advone, reArr;
  // input validation
  try {
    nsClass = String( instnodeset.getClass() );
  } catch( e ){
    logmsg.trace( fname + 'Parsing input parameter failed. ' + e.message , 5 );
  }
  if ( nsClass !== 'class com.novell.xml.xpath.InsertionOrderNodeSet' ) {
    return 'Function parameter need to be a local variable of the type NodeSet';
  }

  // Extracts a com.novell.xml.dom.ElementImpl from the com.novell.xml.xpath.InsertionOrderNodeSet
  topnode = nodesetLV2ElementImpl( instnodeset );

  // Check if the returned piece is not null and is the correct type and node.
  if ( topnode ) {
    try {
      nsClass = String( topnode.getClass() );
      if( nsClass === 'class com.novell.xml.dom.ElementImpl' && String( topnode.getNodeName() ) === 'instance' &&
      topnode.hasChildNodes() && topnode.getElementsByTagName( 'attr' ).getLength() > 0 ) {
        nsValid = true;
      } else {
        return 'Nodeset passed does not have a root <instance> element with one or more child <attr> nodes.';
      }
    } catch( e ) {
      logmsg.trace( fname + 'Error processing nodeset. ' + e.message , 5 );
      return 'Error processing nodeset. ' + e.message;
    }
  } else {
    return 'Error: Could not retrieve a working path from the input value.';
  }

  // Process the instance document. Refactored to use multiple smaller functions for ease of maintenance and expansion.
  // https://www.novell.com/documentation/developer/dirxml/dirxmlbk/api/com/novell/xml/dom/ElementImpl.html
  if ( nsValid ) {
    attrArr = topnode.getElementsByTagName( 'attr' ); // class com.novell.xml.dom.TagNameNodeList
    for( i = 0; i < attrArr.getLength() ; i++) {
      attrobj = attr2obj( attrArr.item( i ) ); // .item() to pass an ElementImpl from the TagNameNodeList
      if ( attrobj && attrobj.attrname && attrobj.attrvalue ) {
        logmsg.trace( fname + 'Found => ' + attrobj.attrname + ':' + String( attrobj.attrvalue ), 5 ); // will print [object Object] for structured attributes
        retObj[ attrobj.attrname ] = attrobj.attrvalue;
      }
    }
  }

  // Process optional input parameters, modifying the output
  // Legacy option, left here for backwards compatibility.
  if ( inserttype === 'list' ) {
    retObjS2 = [ retObj ];
  } else { // Anything other than list will default to 'value'
    retObjS2 = retObj;
  }

  if ( typeof buildstructure === 'string' ) {
    re_advone = /^(.+):(value|list)$/;
    putArr = charArrToPropertyNames( stringToCharArray( buildstructure ) );
    if ( putArr.length > 0 ) {
      lastProp = putArr.pop();
      cur = retObjS3;
      putArr.forEach( function buildObjectStructure( property ) {
        var reArr;
        if ( inserttype === 'advanced' && (reArr = re_advone.exec( property )) !== null ) {
          if ( reArr[ 2 ] === 'list' ) {
            cur[ reArr[ 1 ] ] = [ {} ];
            cur = cur[ reArr[ 1 ] ][ 0 ];
          }
          if ( reArr[ 2 ] === 'value' ) {
            cur[ reArr[ 1 ] ] = {};
            cur = cur[ reArr[ 1 ] ];
          }
        } else {
          cur[ property ] = {};
          cur = cur[ property ];
        }
      });
      // Handles last property, after this resObjS3 will have the whole structure
      reArr = re_advone.exec( lastProp );
      if ( inserttype === 'advanced' && reArr !== null ) {
        if ( reArr[ 2 ] === 'list' ) {
          cur[ reArr[ 1 ] ] = [ retObjS2 ];
        }
        if ( reArr[ 2 ] === 'value' ) {
          cur[ reArr[ 1 ] ] = retObjS2;
        }
      } else {
        cur[ lastProp ] = retObjS2;
      }
    } else {
      retObjS3 = retObjS2;
    }
  } else { // If buildstructure is empty pass through
    retObjS3 = retObjS2;
  }

  if ( String( returntype ).toLowerCase() === 'object' ) {
    ret = retObjS3;
  } else { // If returntype is not 'object' defaults to 'serialized'
    ret = JSONstringify( retObjS3 );
  }

  return ret;
  // Supporting sub-functions. Built inside this function to avoid adding to omany pieces to the global scope.
}

/**
 * Parses the attr node and returns an ECMA object with its structure
 *
 * @version 1.0.0
 * @since 1.0.2
 *
 * @param {com.novell.xml.dom.ElementImpl} el Attribute node from an instance XML
 * @type {object}
 * @returns {object} ECMA Object generated from the parsed attr node.
 */
function attr2obj( el ) {
  // https://www.netiq.com/documentation/identity-manager-developer/dtd-documentation/ndsdtd/attr.html
  var ret = {
    attrname:null,
    attrvalue:null
  };
  if ( el.getAttributes().getNamedItem( 'attr-name' ) != null && el.getElementsByTagName( 'value' ).getLength() > 0 ) {
    // Coercing attrname to ECMA String to avoid JSON conversion error
    ret.attrname = String( el.getAttributes().getNamedItem( 'attr-name' ).getNodeValue() );
    ret.attrvalue = attrvalue2obj( el.getElementsByTagName( 'value' ) );
  }
  return ret;
}

/**
 * Parses the attr/value node and returns an ECMA object with its structure
 *
 * @version 1.0.0
 * @since 1.0.2
 *
 * @param {com.novell.xml.dom.TagNameNodeList} nl Value node list
 * @type {object}
 * @returns {(string|number|boolean|object)} ECMA primitives or object generated from the parsed attr/value node.
 */
function attrvalue2obj( nl ) {
  // https://www.netiq.com/documentation/identity-manager-developer/dtd-documentation/ndsdtd/value.html
  // 'state' will be converted to the proper boolean format, 'int' and 'count' will be converted via parseInt( value/text(), 10),
  // structured attributes will create one or more child objects, any other types currently are coerced into strings.
  // if @type is not present assumes string for immediate text() nodes, structured if any component child nodes are found.
  var ret = null, i, typeval, currval, valArr = [];

  for( i = 0; i < nl.getLength(); i++ ) {
    if( nl.item( i ).getAttributes().getNamedItem( 'type' ) != null ) {
      typeval = String( nl.item( i ).getAttributes().getNamedItem( 'type' ).getNodeValue() );
    } else {
      typeval = 'string';
    }
    // Check for structured attributes by also looking at child component node(s)
    if( typeval !== 'structured' && nl.item( i ).getElementsByTagName( 'component' ).getLength() > 0 ) {
      typeval = 'structured';
    }
    // Builds the current iteration's value and adds it to valArr
    if( nl.item( i ).hasChildNodes() ) {
      if ( typeval === 'structured' ) {
        valArr.push( valuecomponent2obj( nl.item( i ).getElementsByTagName( 'component' ) ) );
      } else {
        currval = String( nl.item( i ).getFirstChild().getNodeValue() );
        if( typeval === 'int' || typeval === 'count' ) {
          currval = parseInt( currval, 10 );
        }
        if( typeval === 'state' ) {
          currval = currval.toLowerCase();
          currval = ( currval === 'true' ) ? true : ( ( currval === 'false' ) ? false : null ); // Since Boolean( 'false' ) coerces to true as per ECMA spec.
        }
        valArr.push( currval );
      }
    }
  }
  // Returns array only if there are 2 or more elements to return
  if ( nl.getLength() === 1 ) {
    ret = valArr[ 0 ];
  } else {
    ret = valArr;
  }
  return ret;
}

/**
 * Parses the value/component node and returns an ECMA object with its structure
 *
 * @version 1.0.0
 * @since 1.0.2
 *
 * @param {com.novell.xml.dom.TagNameNodeList} nl Component node list
 * @type {object}
 * @returns {object} ECMA object generated from the parsed value/component nodes.
 */
function valuecomponent2obj( nl ) {
  // https://www.netiq.com/documentation/identity-manager-developer/dtd-documentation/ndsdtd/component.html
  var ret = {}, i,componentname, componentvalue;
  for( i = 0; i < nl.getLength() ; i++ ){
    if( nl.item( i ).hasChildNodes() && nl.item( i ).getAttributes().getNamedItem( 'name' ) != null ) {
      componentname = String( nl.item( i ).getAttributes().getNamedItem( 'name' ).getNodeValue() );
      componentvalue = String( nl.item( i ).getFirstChild().getNodeValue() );
      if( ret[ componentname ] ) {
        // Handles the scenario where multiplecomponents have the same name
        if( ! (ret[ componentname ] instanceof Array) ) {
          ret[ componentname ] = [ ret[ componentname ] ];
        }
        ret[ componentname ].push( componentvalue );
      } else {
        ret[ componentname ] = componentvalue;
      }
    }
  }
  return ret;
}

/**
 * Parses the main node and returns the node if it is not a #document node.
 * If it is a document node, navigates one level down to obtain the ElementImpl node.
 *
 * @version 1.0.0
 * @since 1.0.2
 *
 * @param {com.novell.xml.xpath.InsertionOrderNodeSet} ns Local Variable of type nodeset built in DirXML-Script
 * @type {com.novell.xml.dom.ElementImpl}
 * @returns {(null|com.novell.xml.dom.ElementImpl)} First ElementImpl object under the InsertionOrderNodeSet. returns null if the parsing failed.
 */
function nodesetLV2ElementImpl( ns ) {
  var node, fname = 'nodesetLV2ElementImpl(): ', nsClass;
  // input validation
  try {
    nsClass = String( ns.getClass() );
  } catch( e ){
    logmsg.trace( fname + 'Parsing input parameter failed. ' + e.message ,5);
  }
  if ( nsClass !== 'class com.novell.xml.xpath.InsertionOrderNodeSet' ) {
    logmsg.trace( fname + 'Input parameter ns is not a DirXML-Script nodeset-type local variable', 5 );
    return null;
  }

  // first() return either null, a com.novell.xml.dom.DocumentImpl or a com.novell.xml.dom.ElementImpl
  try {
    node = ns.first();
    if ( node ) {
      logmsg.trace( fname + 'Top node  => "' + node.getNodeName() + '"',5 );
    } else {
      logmsg.trace( fname + 'Error: Could not get the first child node of the parameter passed.', 5 );
      return null;
    }
  } catch( e ) {
    logmsg.trace( fname + 'Error: Could not get the first child node of the parameter passed.' + e.message, 5 );
    return null;
  }

  /* If the XML Parse token was used to create the nodeset, its topmost node is #document, not instance.
   * If that is the case then we need to go down one more level to try and identiy the top element
   */

  if ( String( node.getNodeName() ).toLowerCase() === '#document' && node.hasChildNodes() ) {
    try {
      node = node.getFirstChild();
      if ( node ) {
        logmsg.trace( fname + 'Iterating #document node - new Top node  => "' + node.getNodeName() + '"', 5 );
      } else {
        logmsg.trace( fname + 'Error: Could not get the first child node of #document node.', 5 );
        return null;
      }
    } catch( e ) {
      logmsg.trace( fname + 'Error: Could not get the first child node of #document node.' + e.message, 5 );
      return null;
    }
  }
  return node;
}