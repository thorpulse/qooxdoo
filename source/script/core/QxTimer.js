/* ************************************************************************

   qooxdoo - the new era of web interface development

   Copyright:
     (C) 2004-2006 by Schlund + Partner AG, Germany
         All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.oss.schlund.de

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (aecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#package(core)

************************************************************************ */

/*!
  Global timer support. Simplifies javascript intervals for objects.
*/
qx.client.Timer = function(vInterval)
{
  qx.core.Target.call(this);

  this.setEnabled(false);

  if (qx.util.Validation.isValidNumber(vInterval)) {
    this.setInterval(vInterval);
  };

  // Object wrapper to timer event
  var o = this;
  this.__oninterval = function() { o._oninterval(); };
};

qx.client.Timer.extend(qx.core.Target, "qx.client.Timer");

qx.client.Timer.addProperty({ name : "interval", type : QxConst.TYPEOF_NUMBER, defaultValue : 1000 });

proto._intervalHandle = null;



/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

proto._modifyEnabled = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    window.clearInterval(this._intervalHandle);
    this._intervalHandle = null;
  }
  else if (propValue)
  {
    this._intervalHandle = window.setInterval(this.__oninterval, this.getInterval());
  };

  return true;
};




/*
---------------------------------------------------------------------------
  USER-ACCESS
---------------------------------------------------------------------------
*/

proto.start = function() {
  this.setEnabled(true);
};

proto.startWith = function(vInterval)
{
  this.setInterval(vInterval);
  this.start();
};

proto.stop = function() {
  this.setEnabled(false);
};

proto.restart = function()
{
  this.stop();
  this.start();
};

proto.restartWith = function(vInterval)
{
  this.stop();
  this.startWith(vInterval);
};




/*
---------------------------------------------------------------------------
  EVENT-MAPPER
---------------------------------------------------------------------------
*/

proto._oninterval = function()
{
  if (this.getEnabled()) {
    this.createDispatchEvent(QxConst.EVENT_TYPE_INTERVAL);
  };
};





/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

proto.dispose = function()
{
  if(this.getDisposed()) {
    return;
  };

  // Stop interval
  this.stop();

  // Clear handle
  if (this._intervalHandler)
  {
    window.clearInterval(this._intervalHandle);
    this._intervalHandler = null;
  };

  // Clear object wrapper function
  this.__oninterval = null;

  // Call qx.core.Target to do the other dispose work
  return qx.core.Target.prototype.dispose.call(this);
};





/*
---------------------------------------------------------------------------
  HELPER
---------------------------------------------------------------------------
*/

qx.client.Timer.once = function(vFunction, vObject, vTimeout)
{
  // Create time instance
  var vTimer = new qx.client.Timer(vTimeout);

  // Add event listener to interval
  vTimer.addEventListener(QxConst.EVENT_TYPE_INTERVAL, function(e)
  {
    vFunction.call(vObject, e);
    vTimer.dispose();

    vObject = null;
  }, vObject);

  // Directly start timer
  vTimer.start();
};
