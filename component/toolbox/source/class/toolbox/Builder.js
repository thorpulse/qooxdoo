/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************
#asset(toolbox/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "HelloWorld"
 */
qx.Class.define("toolbox.Builder",
{
  /*
	  *****************************************************************************
	     STATICS
	  *****************************************************************************
  */

  statics :
  {
    /**
     * creates a qooxdoo-skeleton
     *
     * @param adminPath {var} path of the cgi-script
     * @param fileName {var} name of the file
     * @param filePath {var} path of the file
     * @param nameSpace {var} namespace of the file
     * @param logFileName {var} lofgile of the file
     * @param type {var} type of the file
     * @param generate {var} if you also want to generate the source code
     * @param logFrame {var} the log output
     * @param appList {var} button of the applicatioon list
     * @return {void} 
     */
    createNewApplication : function(adminPath, fileName, filePath, nameSpace, 
                                    logFileName, type, generate, logFrame, appList)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var req2 = new qx.io.remote.Request(url, "POST", "application/json");
      var req3 = new qx.io.remote.Request(url, "POST");
      var dat = "action=create";
      var generateDat = "action=generate_Source";
      var openGen = "action=open_In_Browser&location=source";
      var saveAppList = "action=save_Application_List";
      
      this.__urlParms = new toolbox.UrlSearchParms();
      
      //replaces all whitespaces with underscores
      fileName = fileName.replace(/ /g, "_");
      var createParams = [ fileName, filePath, nameSpace, logFileName, type, generate ];

      req.setTimeout(100000);
      req2.setTimeout(100000);

      var params = [ "myName", "myPath", "myNamespace", "myLogfile", "myType", "generate_Source" ];

      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }
      
      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "")
        {
          dat += "&" + params[i] + "=" + createParams[i];
          generateDat += "&" + params[i] + "=" + createParams[i];
          openGen += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);

      this.__loader = new toolbox.ProgressLoader();
      this.__loader.setCaption("Creating skeleton");
      
      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();

        if (result.state != undefined)
        {
        	this.__loader.hide();
        	this.__loader.setModal(false);
        	
          var receivedState = result.state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.output);
              
              
              toolbox.Toolbox.APPLIST.push({name : fileName, path : filePath.replace(/\\/g, "/")}); 
              var changedAppList = qx.util.Json.stringify( toolbox.Toolbox.APPLIST, true);
              
              saveAppList += "&changedAppList=" + changedAppList;
              req3.setData(saveAppList);
              req3.send();
              
              
              
              if (generate == "true")
              {
                this.__loader.show();
                this.__loader.setModal(true);
                this.__loader.setCaption("Generating source version");

                req2.setData(generateDat);
                req2.send();
              }
            }

            if (receivedState == 1)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.error + '</font>');
            }
          }
          appList.setEnabled(true);
        }
        else
        {
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.error + '</font>');
        }
        
      },
      this);

      req3.addListener("failed", function(evt) {
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Application list could not extends by the created application </br>Failed to post to URL: " + url + '</font>');
      }, this);
      
      req2.addListener("completed", function(evt)
      {
        var genResult = evt.getContent();
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + genResult.gen_output);

        
        this.__loader.setModal(false);
        this.__loader.hide();
        
        req2.setData(openGen);
        req2.send();
      },
      this);

      req2.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
      },
      this);

      req.addListener("failed", function(evt)
      {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
      },
      this);

      req.send();

      return;
    },


    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param generate {var} TODOC
     * @param createApplicationLogFrame {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    generateSource : function(adminPath, fileName, filePath, generate, logFrame)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=generate_Source";
      var openSource = "action=open_In_Browser&location=source";
      var createParams = [ fileName, filePath, generate ];
      req.setTimeout(100000);

      this.__urlParms = new toolbox.UrlSearchParms();
      
      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      var params = [ "myName", "myPath", "generate_Source" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "")
        {
          dat += "&" + params[i] + "=" + createParams[i];
          openSource += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);

      this.__loader = new toolbox.ProgressLoader();
      this.__loader.setCaption("Generating source version");
      
      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();

        if (result.gen_state != undefined)
        {
          var receivedState = result.gen_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.gen_output);
              req.setData(openSource);
              req.send();
            }

            if (receivedState == 1)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.gen_error + '</font>');
            }
          }
        }
        else
        {
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.gen_error + '</font>');
        }

        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        this.__loader.setModal(false);
        this.__loader.hide();
      }, this);

      req.send();
    

      return;
    },


    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    generateBuild : function(adminPath, fileName, filePath, logFrame)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=generate_Build";
      var openBuild = "action=open_In_Browser&location=build";
      var createParams = [ fileName, filePath ];
      req.setTimeout(600000);

      this.__urlParms = new toolbox.UrlSearchParms();
      
      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      var params = [ "myName", "myPath" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "")
        {
          dat += "&" + params[i] + "=" + createParams[i];
          openBuild += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);
      
      this.__loader = new toolbox.ProgressLoader();
      this.__loader.setCaption("Generating build version");

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();

        if (result.build_state != undefined)
        {
          var receivedState = result.build_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.build_output);
              req.setData(openBuild);
              req.send();
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.build_error + '</font>');
            }
          }
        }
        else
        {
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.build_error + '</font>');
        }

        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        this.__loader.setModal(false);
        this.__loader.hide();
      }, this);

      req.send();

      return;
    },


    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    generateApi : function(adminPath, fileName, filePath, logFrame)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=generate_Api";
      var openApi = "action=open_In_Browser&location=api";
      var createParams = [ fileName, filePath ];
      req.setTimeout(600000);

      this.__urlParms = new toolbox.UrlSearchParms();
      
      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      var params = [ "myName", "myPath" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "")
        {
          dat += "&" + params[i] + "=" + createParams[i];
          openApi += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);

      this.__loader = new toolbox.ProgressLoader();
      this.__loader.setCaption("Generating API");

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();

        if(result.api_state != undefined) 
        {
          var receivedState = result.api_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + " <br> " + result.api_output);
              req.setData(openApi);
              req.send();
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + " <br> " + '<font color="red">' + result.api_error + '</font>');
            }
          }
        } else {
        	logFrame.setHtml(logFrame.getHtml() + " <br> " + '<font color="red">' + result.api_error + '</font>');
        }
        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        this.__loader.setModal(false);
        this.__loader.hide();
      }, this);

      req.send();

      return;
    },


    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    makePretty : function(adminPath, fileName, filePath, logFrame)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=make_Pretty";
      var createParams = [ fileName, filePath ];
      req.setTimeout(600000);

      this.__urlParms = new toolbox.UrlSearchParms();
      
      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      var params = [ "myName", "myPath" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "") {
          dat += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);
      
      this.__loader = new toolbox.ProgressLoader();
      this.__loader.setCaption("Prettifing the source code");

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();
        
        if(result.pretty_state != undefined)
        {
          var receivedState = result.pretty_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0) {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.pretty_output);
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.pretty_error + '</font>');
            }
          }
        } else {
        	logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.pretty_error + '</font>');
        }
        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        this.__loader.setModal(false);
        this.__loader.hide();
      }, this);

      req.send();

      return;
    },


    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    validateCode : function(adminPath, fileName, filePath, logFrame)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=validate_Code";
      var createParams = [ fileName, filePath ];
      req.setTimeout(600000);

      this.__urlParms = new toolbox.UrlSearchParms();
      
      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      var params = [ "myName", "myPath" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "") {
          dat += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);
      
      this.__loader = new toolbox.ProgressLoader();
      this.__loader.setCaption("Validating the source code");

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();
        
        if(result.val_state != undefined)
        {
          var receivedState = result.val_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.val_output);
            }

            if (receivedState == 1) {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.val_error + '</font>');
            }
          }
        } else {
        	logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.val_error + '</font>');
        }
        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        this.__loader.setModal(false);
        this.__loader.hide();
      }, this);

      req.send();

      return;
    },


    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    testApplication : function(adminPath, fileName, filePath, logFrame)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=test_Application";
      var openSource = "action=open_In_Browser&location=test";
      var createParams = [ fileName, filePath ];
      req.setTimeout(100000);

      this.__urlParms = new toolbox.UrlSearchParms();
      
      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      var params = [ "myName", "myPath" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "")
        {
          dat += "&" + params[i] + "=" + createParams[i];
          openSource += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);
      
      this.__loader = new toolbox.ProgressLoader();
      this.__loader.setCaption("Generating the Testrunner (using the tests in the build version)");

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();
        
        if(result.testApp_state != undefined) 
        {
          var receivedState = result.testApp_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.testApp_output);
              req.setData(openSource);
              req.send();
            }

            if (receivedState == 1)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.testApp_error + '</font>');
            }
          }
        } else {
        	logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.testApp_error + '</font>');
        }
        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        this.__loader.setModal(false);
        this.__loader.hide();
      }, this);

      req.send();

      return;
    },


    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    testSource : function(adminPath, fileName, filePath, logFrame)
    {
      var url = adminPath;
      var req = new qx.io.remote.Request(url, "POST", "application/json");
      var dat = "action=test_Source";
      var openSource = "action=open_In_Browser&location=test";
      var createParams = [ fileName, filePath ];
      req.setTimeout(100000);

      this.__urlParms = new toolbox.UrlSearchParms();
      
      // check cygwin path
      if ('cygwin' in this.__urlParms.getParms())
      {
        var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
        dat += "&" + cygParm;
      }

      var params = [ "myName", "myPath" ];

      for (var i=0; i<createParams.length; i++)
      {
        if (createParams[i] != "")
        {
          dat += "&" + params[i] + "=" + createParams[i];
          openSource += "&" + params[i] + "=" + createParams[i];
        }
      }

      req.setProhibitCaching(true);
      req.setData(dat);
      
      this.__loader = new toolbox.ProgressLoader();
      this.__loader.setCaption("Generating the Testrunner (using the tests in the source version)");

      req.addListener("completed", function(evt)
      {
        var result = evt.getContent();
        
        if(result.test_state != undefined)
        {
          var receivedState = result.test_state;

          if (receivedState == 1 || receivedState == 0)
          {
            if (receivedState == 0)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.test_output);
              req.setData(openSource);
              req.send();
            }

            if (receivedState == 1)
            {
              logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.test_error + '</font>');
            }
          }
        } else {
        	logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.test_error + '</font>');
        }
        this.__loader.setModal(false);
        this.__loader.hide();
      },
      this);

      req.addListener("failed", function(evt) {
        this.error("Failed to post to URL: " + url);
        logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        this.__loader.setModal(false);
        this.__loader.hide();
      }, this);

      req.send();

      return;
    },
    
    
    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param logFrame {var} TODOC
     * @param appList {var} TODOC
     * @return {void} 
     */
    removeCurrentApplication : function(adminPath, fileName, filePath, logFrame, appList)
    {  
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST");
        var dat = "action=delete_Application";
        var createParams = [ fileName, filePath ];
        req.setTimeout(100000);

        
        for(var i = 0; i < toolbox.Toolbox.APPLIST.length; i++) {
          if(toolbox.Toolbox.APPLIST[i].name == fileName & 
             toolbox.Toolbox.APPLIST[i].path == filePath.replace(/\\/g, "/")) 
          {
          	toolbox.Toolbox.APPLIST.splice(i, 1);
          	var changedAppList = qx.util.Json.stringify( toolbox.Toolbox.APPLIST, true);  
            
            var params = [ "myName", "myPath" ];

            for (var j=0; j<createParams.length; j++)
            {
              if (createParams[j] != "")
              {
                dat += "&" + params[j] + "=" + createParams[j];
              }
            }

            dat += "&changedAppList=" + changedAppList;
            req.setData(dat);
            req.send();
          }
        }
        req.setData(dat);

        req.addListener("failed", function(evt) {
          this.error("Failed to post to URL: " + url);
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + fileName + " in " + filePath + " could not remove </br>Failed to post to URL: " + url + '</font>');
        }, this);
        
        appList.setEnabled(true);
    },
    
    
    /**
     * TODOC
     *
     * @param adminPath {var} TODOC
     * @param logFrame {var} TODOC
     * @param appList {var} TODOC
     * @return {void} 
     */
    prepareApplicationList : function(adminPath, logFrame, appList)
    {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST");
        var dat = "action=show_Application_List";
        req.setTimeout(100000);


        req.setData(dat);
        
        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();
          result = result.replace(/\n/g, "").replace(/{/g, "\{").replace(/}/g, "\}");
          this.jsonObject = qx.util.Json.parse(result);
          toolbox.Toolbox.APPLIST = this.jsonObject;
          appList.setEnabled(true);
        },
        this);

        req.addListener("failed", function(evt) {
          this.error("Failed to post to URL: " + url);
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        }, this);

        req.send();
      
    }
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
    
  }
});