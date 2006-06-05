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

#package(listview)

************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ListViewContentCellIconHtml", qx.ui.embed.IconHtmlEmbed, 
function(vHtml, vIcon, vIconWidth, vIconHeight)
{
  qx.ui.embed.IconHtmlEmbed.call(this, vHtml, vIcon, vIconWidth, vIconHeight);

  this.setSelectable(false);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "list-view-content-cell-icon-html" });

qx.ui.listview.ListViewContentCellIconHtml.empty =
{
  icon : qx.constant.Core.EMPTY,
  html : qx.constant.Core.EMPTY
};
