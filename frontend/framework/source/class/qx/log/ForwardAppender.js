/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(log)

************************************************************************ */

/**
 * An appender that forwards all log events to a log event processor.
 *
 * @param targetProcessor {LogEventProcessor} The log event processor Where to
 *    pass the log events.
 */
qx.OO.defineClass("qx.log.ForwardAppender", qx.log.Appender,
function(targetProcessor) {
  qx.log.Appender.call(this);

  this._targetProcessor = targetProcessor;
});


// overridden
qx.Proto.appendLogEvent = function(evt) {
  this._targetProcessor.handleLogEvent(evt);
}
