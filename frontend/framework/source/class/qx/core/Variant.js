/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Andreas Ecker (ecker)
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#require(qx.util.Validation)
#require(qx.lang.Array)

/* ************************************************************************ */

qx.Clazz.define("qx.core.Variant",
{
    statics: {
        /**
         *
         */
        __variants : {},

        /**
         *
         */
        define : function (name, allowedValues)
        {
          if (typeof qx.core.Variant.__variants[name] !== "undefined") {
            throw new Error ("Variant \"" + name + "\" is already defined");
          }

          qx.core.Variant.__variants[name] = {};

          if (typeof allowedValues !== "undefined") {
            if (qx.util.Validation.isValidArray(allowedValues)) {
              qx.core.Variant.__variants[name].allowedValues = allowedValues;
            } else {
              throw new Error ("allowedValues is not an array");
            }
          }
        },

        /**
         *
         */
        set : function (name, value)
        {
          if (qx.util.Validation.isInvalidObject(qx.core.Variant.__variants[name])) {
            throw new Error ("Variant \"" + name + "\" is not defined");
          }

          var allowedValues = qx.core.Variant.__variants[name].allowedValues;
          if (qx.util.Validation.isValidArray(allowedValues)) {
            if (!qx.lang.Array.contains (allowedValues, value)) {
              throw new Error ("Value \"" + value + "\" for variant \"" + name +
              "\" is not one of the allowed values \"" + allowedValues.join("\", \"") + "\"");
            }
          }

          qx.core.Variant.__variants[name].value = value;
        },

        /**
         *
         */
        get : function (name)
        {
          if (typeof qx.core.Variant.__variants[name] !== "undefined") {
            return qx.core.Variant.__variants[name].value;
          } else {
            throw new Error ("Variant \"" + name + "\" is not defined");
          }
        },

        /**
         *
         */
        select : function (name, variants)
        {
          // WARINING: all changes to this function must be duplicated in the generator!!
          // modules/variantoptimizer.py (processVariantSelect)
          if (qx.util.Validation.isInvalidObject(qx.core.Variant.__variants[name])) {
            throw new Error("Variant \"" + name + "\" is not defined");
          }

          if (qx.util.Validation.isValidString(variants))
          {
            return qx.core.Variant.__matchKey(name, variants);
          }
          else if (qx.util.Validation.isValidObject(variants))
          {
            for (var key in variants)
            {
              if (qx.core.Variant.__matchKey(name, key)) {
                return variants[key];
              }
            }

            if (variants["none"]) {
              return variants["none"];
            }

            throw new Error ("No match for variant \"" + name +
              "\" found, and no default (\"none\") given");
          }
          else
          {
            throw new Error ("the second parameter must be a map or a string!")
          }

        },

        /**
         *
         */
         __matchKey: function(variantGroup, key)
         {
            var keyParts = key.split("|");

            for (var i=0; i<keyParts.length; i++)
            {
              if (keyParts[i] !== "none" && qx.core.Variant.get(variantGroup) === keyParts[i]) {
                return true;
              }
            }
            return false;
         }
    }
});


/**
 * enable debugging
 */
qx.core.Variant.define("qx.debug", ["on", "off"]);
qx.core.Variant.set("qx.debug", "on");
