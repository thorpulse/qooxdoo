/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(storage)
#require(qx.OO)

************************************************************************ */

qx.OO.defineClass("qx.io.local.CookieApi",
{
  STR_EXPIRES : "expires",
  STR_PATH : "path",
  STR_DOMAIN : "domain",
  STR_SECURE : "secure",
  STR_DELDATA : "Thu, 01-Jan-1970 00:00:01 GMT"
});





/*
---------------------------------------------------------------------------
  USER APPLICATION METHODS
---------------------------------------------------------------------------
*/

qx.Class.get = function(vName)
{
  var start = document.cookie.indexOf(vName + qx.constant.Core.EQUAL);
  var len = start + vName.length + 1;

  if ((!start) && (vName != document.cookie.substring(0, vName.length))) {
    return null;
  };

  if (start == -1) {
    return null;
  };

  var end = document.cookie.indexOf(qx.constant.Core.SEMICOLON, len);

  if (end == -1) {
    end = document.cookie.length;
  };

  return unescape(document.cookie.substring(len, end));
};

qx.Class.set = function(vName, vValue, vExpires, vPath, vDomain, vSecure)
{
  var today = new Date();
  today.setTime(today.getTime());

  // Generate cookie
  var vCookie = [ vName, qx.constant.Core.EQUAL, escape(vValue) ];

  if (vExpires)
  {
    vCookie.push(qx.constant.Core.SEMICOLON);
    vCookie.push(qx.io.local.CookieApi.STR_EXPIRES);
    vCookie.push(qx.constant.Core.EQUAL);
    vCookie.push(new Date(today.getTime() + (vExpires * 1000 * 60 * 60 * 24)).toGMTString());
  };

  if (vPath)
  {
    vCookie.push(qx.constant.Core.SEMICOLON);
    vCookie.push(qx.io.local.CookieApi.STR_PATH);
    vCookie.push(qx.constant.Core.EQUAL);
    vCookie.push(vPath);
  };

  if (vDomain)
  {
    vCookie.push(qx.constant.Core.SEMICOLON);
    vCookie.push(qx.io.local.CookieApi.STR_DOMAIN);
    vCookie.push(qx.constant.Core.EQUAL);
    vCookie.push(vDomain);
  };

  if (vSecure)
  {
    vCookie.push(qx.constant.Core.SEMICOLON);
    vCookie.push(qx.io.local.CookieApi.STR_SECURE);
  };

  // Store cookie
  document.cookie = vCookie.join(qx.constant.Core.EMPTY);
};

qx.Class.del = function(vName, vPath, vDomain)
{
  if (!qx.io.local.CookieApi.get(vName)) {
    return;
  };

  // Generate cookie
  var vCookie = [ vName, qx.constant.Core.EQUAL ];

  if (vPath)
  {
    vCookie.push(qx.constant.Core.SEMICOLON);
    vCookie.push(qx.io.local.CookieApi.STR_PATH);
    vCookie.push(qx.constant.Core.EQUAL);
    vCookie.push(vPath);
  };

  if (vDomain)
  {
    vCookie.push(qx.constant.Core.SEMICOLON);
    vCookie.push(qx.io.local.CookieApi.STR_DOMAIN);
    vCookie.push(qx.constant.Core.EQUAL);
    vCookie.push(vDomain);
  };

  vCookie.push(qx.constant.Core.SEMICOLON);
  vCookie.push(qx.io.local.CookieApi.STR_EXPIRES);
  vCookie.push(qx.constant.Core.EQUAL);
  vCookie.push(qx.io.local.CookieApi.STR_DELDATA);

  // Store cookie
  document.cookie = vCookie.join(qx.constant.Core.EMPTY);
};
