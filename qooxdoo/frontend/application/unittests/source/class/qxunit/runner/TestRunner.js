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
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(qxunit)
#resource(css:css)
#resource(image:image)

************************************************************************ */

/**
 * The GUI definition of the qooxdoo unit test runner.
 */

qx.Class.define("qxunit.runner.TestRunner",
{
  extend : qx.ui.layout.VerticalBoxLayout,

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  construct : function()
  {
    this.base(arguments);
    this.set({
      height : "100%",
      width : "100%"
    });
    this.widgets = {};
    this.tests   = {};

    // Hidden IFrame for test runs
    var iframe = new qx.ui.embed.Iframe("html/QooxdooTest.html?testclass=qxunit.test");
    iframe.setEdge(0);
    this.iframe = iframe;
    iframe.addToDocument();
    this.setZIndex(5);

    // Get the TestLoader from the Iframe (in the event handler)
    iframe.addEventListener("load", this.ehIframeOnLoad, this);

    // Header Pane
    this.header = new qx.ui.embed.HtmlEmbed("<center><h1>QxRunner - The qooxdoo Test Runner</h1></center>");
    this.header.setHtmlProperty("className", "header");
    this.header.setHeight(50);
    this.add(this.header);

    // Toolbar
    this.toolbar = new qx.ui.toolbar.ToolBar;
    this.toolbar.setShow("icon");
    this.add(this.toolbar);

    // -- tree view radio
    var treeview = new qx.ui.toolbar.Part;
    this.toolbar.add(treeview);
    this.widgets["toolbar.treeview"] = treeview;
    var b1 = new qx.ui.toolbar.RadioButton("Full Tree","icon/16/actions/view-pane-tree.png");
    var b2 = new qx.ui.toolbar.RadioButton("Flat Tree","icon/16/actions/view-pane-text.png");
    b1.setChecked(true);
    treeview.add(b1,b2);
    treeview.b1 = b1;
    treeview.b2 = b2;
    var radiomgr = new qx.manager.selection.RadioManager(null, [b1,b2]);
    radiomgr.addEventListener("changeSelected", this.leftReloadTree, this);
    this.toolbar.add(new qx.ui.toolbar.Separator);

    // -- run button
    this.runbutton = new qx.ui.toolbar.Button("Run Test", "icon/16/actions/media-playback-start.png");
    this.toolbar.add(this.runbutton);
    this.runbutton.addEventListener("execute", this.runTest, this);
    this.toolbar.add(new qx.ui.toolbar.Separator);

    // -- reload button
    this.reloadbutton = new qx.ui.toolbar.Button("Reload", "icon/16/actions/view-refresh.png");
    this.toolbar.add(this.reloadbutton);
    this.testSuiteUrl = new qx.ui.form.TextField("html/QooxdooTest.html?testclass=qxunit.test");
    this.toolbar.add(this.testSuiteUrl);
    this.testSuiteUrl.set({
      width : 300
    });
    this.reloadbutton.addEventListener("execute", this.reloadTestSuite, this);
    this.testSuiteUrl.addEventListener("keydown", function (e) {
      if (e.getKeyIdentifier() == "Enter") {
        this.reloadTestSuite();
      }
    }, this);
    this.toolbar.add(new qx.ui.toolbar.Separator);

    // -- reload switch
    this.reloadswitch = new qx.ui.toolbar.CheckBox("Reload before Test");
    this.toolbar.add(this.reloadswitch);
    this.reloadswitch.setShow("both");


    // Main Pane
    // split
    var mainsplit = new qx.ui.splitpane.HorizontalSplitPane(250, "1*");
    this.add(mainsplit);
    this.mainsplit = mainsplit;
    mainsplit.setLiveResize(true);
    mainsplit.set({
      height : "1*"
    });

    // Right
    var right = new qx.ui.layout.VerticalBoxLayout();
    right.set({
      width : "100%",
      spacing : 10,
      height : "100%",
      border : "inset",
      padding : 10
    });
    mainsplit.addRight(right);

    var groupBox = new qx.ui.groupbox.GroupBox();
    groupBox.set({
      height : "auto"
    });
    right.add(groupBox);

    var vert = new qx.ui.layout.VerticalBoxLayout();
    vert.set({
      height : "auto"
    });
    groupBox.add(vert);

    // status
    var statuspane = this.__makeStatus();
    //right.add(statuspane);
    vert.add(statuspane);
    this.widgets["statuspane"] = statuspane;

    // progress bar
    var progress = this.__makeProgress();
    vert.add(progress);
    //right.add(progress);

    // button view
    var buttview = this.__makeButtonView();
    right.add(buttview);

    // EXPERIMENTAL !
    //var treetest = new qxunit.runner.TreeTest();

  }, //constructor


  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    succCnt :
    {
      check : "Integer",
      init  : 0,
      apply : "_applySuccCnt"
    },

    failCnt :
    {
      check : "Integer",
      init  : 0,
      apply : "_applyFailCnt"
    }
  },


  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */
  members: {

    // ------------------------------------------------------------------------
    //   CONSTRUCTOR HELPERS
    // ------------------------------------------------------------------------

    __makeButtonView : function ()
    {
      var buttview = new qx.ui.pageview.tabview.TabView();
      buttview.set({
        height : "1*"
      });

      var bsb1 = new qx.ui.pageview.tabview.Button("Test Results", "icon/16/devices/video-display.png");
      var bsb2 = new qx.ui.pageview.tabview.Button("Log", "icon/16/apps/graphics-snapshot.png");
      bsb1.setChecked(true);
      buttview.getBar().add(bsb1, bsb2);

      var p1 = new qx.ui.pageview.tabview.Page(bsb1);
      p1.set({
        padding : [5]
        //spacing   : 5
      });
      var p2 = new qx.ui.pageview.tabview.Page(bsb2);
      p2.set({
        padding : [5]
      });
      buttview.getPane().add(p1, p2);

      // First Page
      var f1 = new qxunit.runner.TestResultView();
      this.f1 = f1;
      p1.add(f1);
      f1.set({
        overflow: "auto",
        height : "100%",
        width : "100%"
      });

      // Second Page
      var pp2 = new qx.ui.layout.VerticalBoxLayout();
      p2.add(pp2);
      pp2.set({
        height : "100%",
        width  : "100%"
      });

      this.f2 = new qx.ui.form.TextArea("Session Log, listing test invokations and all outputs");
      this.f2.set({
        height : "1*",
        width : "100%"
      });

      var ff1 = new qx.ui.toolbar.ToolBar;
      var ff1_b1 = new qx.ui.toolbar.Button("Clear");
      ff1.add(ff1_b1);
      ff1_b1.set({
        width : "auto"
      });
      ff1_b1.addEventListener("execute", function (e) {
        this.f2.setValue("");
      }, this);
      pp2.add(ff1, this.f2);

      return buttview;
    }, //makeButtonView

    // -------------------------------------------------------------------------

    /**
     * Tree View in Left Pane
    */
    __makeLeft: function ()
    {
      var that   = this;

      /*
      var node = this.tests.handler.getRoot();
      this.debug("Root node: " + node);
      this.tests.handler.getChilds(node);
      this.tests.handler.getTests(node);
      */
      var tmap = this.tests.handler.tmap;

      //var left = new qx.ui.tree.Tree("Test Classes");
      var left = new qx.ui.tree.Tree("All");
      left.set({
        width : "100%",
        height : "100%",
        padding : [10],
        overflow: "auto",
        border : "inset"
      });

      // fill the tree
      this.left = left; // only because leftReloadTree needs it
      this.leftReloadTree(null);
      left.getManager().addEventListener("changeSelection", this.leftGetSelection, this);

      return left;
    }, //makeLeft


    // -------------------------------------------------------------------------

    __makeProgress: function ()
    {
      var progress = new qx.ui.layout.HorizontalBoxLayout();
      progress.set({
        height: "auto",
        padding: [10],
        spacing : 10,
        width : "100%"
      });

      var progressb = new qxunit.runner.ProgressBar();
      progress.add(progressb);
      progressb.set({
        showStepStatus: true,
        showPcntStatus: true,
        barColor: "#36a618"
      });
      this.widgets["progresspane"] = progress;
      this.widgets["progresspane.progressbar"] = progressb;
      progress.add(new qx.ui.toolbar.Separator);

      /* Wishlist:
      var progressb = new qx.ui.component.ProgressBar();
      progressb.set({
        scale    : null,   // display no scale
        startLabel : "0%",
        endLabel   : "100%",
        fillLabel : "(0/10)", // status label right of bar
        fillStatus: "60%"     // fill degree of the progress bar
      });
      progressb.update("9/15"); // update progress
      progressb.update("68%");  // dito
      */

      progress.add(new qx.ui.basic.Label("Failed: "));
      var failcnt = new qx.ui.basic.Label("0");
      progress.add(failcnt);
      failcnt.set({
        backgroundColor : "#C1ECFF"
      });

      progress.add(new qx.ui.basic.Label("Succeeded: "));
      var succcnt = new qx.ui.basic.Label("0");
      progress.add(succcnt);
      succcnt.set({
        backgroundColor : "#C1ECFF"
      });
      this.widgets["progresspane.succ_cnt"] = succcnt;
      this.widgets["progresspane.fail_cnt"] = failcnt;

      return progress;
    }, //makeProgress


    // -------------------------------------------------------------------------

    __makeStatus: function (){
      var statuspane = new qx.ui.layout.HorizontalBoxLayout();
      statuspane.set({
        padding: [10],
        spacing : 10,
        height : "auto",
        width : "100%"
      });
      statuspane.add(new qx.ui.basic.Label("Selected Test: "));
      var l1 = new qx.ui.basic.Label("");
      statuspane.add(l1);
      l1.set({
        backgroundColor : "#C1ECFF"
      });
      this.widgets["statuspane.current"] = l1;
      statuspane.add(new qx.ui.basic.Label("Number of Tests: "));
      var l2 = new qx.ui.basic.Label("");
      statuspane.add(l2);
      l2.set({
        backgroundColor : "#C1ECFF"
      });
      this.widgets["statuspane.number"] = l2;

      return statuspane;
    }, //makeStatus


    // ------------------------------------------------------------------------
    //   EVENT HANDLER
    // ------------------------------------------------------------------------

    leftGetSelection : function (e) {
      if (! this.left.getSelectedElement()) {// this is a kludge!
        return; }
      this.tests.selected = this.tests.handler.getFullName(this.left.getSelectedElement().modelLink);
      this.appender(this.tests.selected);
      this.widgets["statuspane.current"].setText(this.tests.selected);
      this.tests.selected_cnt = this.tests.handler.testCount(this.left.getSelectedElement().modelLink);
      this.widgets["statuspane.number"].setText(this.tests.selected_cnt+"");
    }, //leftGetSelection


    // -------------------------------------------------------------------------

    leftReloadTree : function (e) {  // use tree struct
      var ttree   = this.tests.handler.ttree;
      var left    = this.left;
      var handler = this.tests.handler;
      var that    = this;
      this.widgets["statuspane.current"].setText("");
      this.widgets["statuspane.number"].setText("");
      left.resetSelected();
      left.setEnabled(false);
      left.destroyContent(); // clean up before re-build

      /**
       * create widget tree from model
       *
       * @param widgetR {qx.ui.tree.Tree}    [In/Out]
       *        widget root under which the widget tree will be built
       * @param modelR  {qxunit.runner.Tree} [In]
       *        model root for the tree from which the widgets representation
       *        will be built
       */
      function buildSubTree (widgetR, modelR)
      {
        var children = modelR.getChildren();
        var t;
        for (var i=0; i<children.length; i++)
        {
          var currNode = children[i];
          if (currNode.hasChildren())
          {
            t = new qx.ui.tree.TreeFolder(currNode.label);
            buildSubTree(t,currNode);
          } else
          {
            t = new qx.ui.tree.TreeFile(currNode.label);
          }
          // make connections
          widgetR.add(t);
          t.modelLink         = currNode;
          currNode.widgetLink = t;
          if (that.tests.handler.getFullName(currNode) == that.tests.selected)
          {
            selectedElement = t;//that.left.setSelectedElement(t);
          }
        }

      }; //buildSubTree;


      function buildSubTreeFlat (widgetR, modelR)
      {
        var iter = modelR.getIterator("depth");
        var currNode;
        while (currNode = iter())
        {
          if (currNode.type && currNode.type == "test")
            ;
          else  // it's a container
          {
            if (handler.hasTests(currNode)) {
              var fullName = handler.getFullName(currNode);
              var t = new qx.ui.tree.TreeFolder(fullName);
              widgetR.add(t);
              t.modelLink         = currNode;
              currNode.widgetLink = t;
              if (that.tests.handler.getFullName(currNode) == that.tests.selected)
              {
                selectedElement = t;
              }
              var children = currNode.getChildren();
              for (var i=0; i<children.length; i++)
              {
                if (children[i].type && children[i].type == "test")
                {
                  var c = new qx.ui.tree.TreeFile(children[i].label);
                  t.add(c);
                  c.modelLink            = children[i];
                  children[i].widgetLink = c;
                  if (that.tests.handler.getFullName(children[i]) == that.tests.selected)
                  {
                    selectedElement = c;
                  }
                }
              }
            }
          }
        }
      }; //buildSubTreeFlat

      // -- Main --------------------------------

      // link top leve widget and model
      left.modelLink   = ttree;
      ttree.widgetLink = left;
      var selectedView = this.widgets["toolbar.treeview"].b1.getManager().getSelected();
      var selectedElement = null;
      if (selectedView.getLabel && selectedView.getLabel()=="Flat Tree") {
        buildSubTreeFlat(left,ttree);
      } else {
        buildSubTree(left,ttree);
      }

      left.setEnabled(true);
      if (selectedElement) { // try to re-select previously selected element
        this.left.setSelectedElement(selectedElement);
      }
    }, //leftReloadTree


    // -------------------------------------------------------------------------
    /**
     * event handler for the Run Test button - performs the tests
     */
    runTest : function (e)
    {

      // -- Vars and Setup -----------------------

      this.toolbar.setEnabled(false);
      //this.left.setEnabled(false);

      this.resetGui();
      var bar = this.widgets["progresspane.progressbar"];
      // Make initial entry in output windows (test result, log, ...)
      this.appender("Now running: " + this.tests.selected);

      var tstCnt = this.tests.selected_cnt;
      var tstCurr = 1;
      var testResult;

      // start test

      // Currently, a flat list of individual tests is computed (buildList), and
      // then processed by a recursive Timer.once-controlled funtion (runtest);
      // each test is passed to the same iframe object to be run(loader.runTests).

      var that    = this;
      var tlist   = [];
      var tlist1  = [];
      var handler = this.tests.handler;

      // -- Helper Functions ---------------------

      // create testResult obj
      function init_testResult () {
        var testResult = new that.frameWindow.qxunit.TestResult();

        // set up event listeners
        testResult.addEventListener("startTest", function(e)
        {
          var test = e.getData();
          that.currentTestData = new qxunit.runner.TestResultData(test.getFullName());
          that.f1.addTestResult(that.currentTestData);
          that.appender("Test '"+test.getFullName()+"' started.");
        }, that);

        testResult.addEventListener("failure", function(e)
        {
          var ex = e.getData().exception;
          var test = e.getData().test;
          that.currentTestData.setMessage(ex.toString());
          that.currentTestData.setException(ex);
          that.currentTestData.setState("failure");
          bar.setBarColor("#9d1111");
          var val = that.getFailCnt();
          that.setFailCnt(++val);
          that.appender("Test '"+test.getFullName()+"' failed: " +  ex.getMessage() + " - " + ex.getComment());
          that.widgets["progresspane.progressbar"].update(String(tstCurr+"/"+tstCnt));
          tstCurr++;
        }, that);

        testResult.addEventListener("error", function(e)
        {
          var ex = e.getData().exception;
          that.currentTestData.setMessage(ex.toString());
          that.currentTestData.setException(ex);
          that.currentTestData.setState("error");
          bar.setBarColor("#9d1111");
          var val = that.getFailCnt();
          that.setFailCnt(++val);
          that.appender("The test '"+e.getData().test.getFullName()+"' had an error: " + ex, ex);
          that.widgets["progresspane.progressbar"].update(String(tstCurr+"/"+tstCnt));
          tstCurr++;
        }, that);

        testResult.addEventListener("endTest", function(e)
        {
          var state = that.currentTestData.getState();
          if (state == "start") {
            that.currentTestData.setState("success");
            //that.widgets["progresspane.succ_cnt"].setText(++that.tests.succ_cnt+"");
            var val = that.getSuccCnt();
            that.setSuccCnt(++val);
            that.widgets["progresspane.progressbar"].update(String(tstCurr+"/"+tstCnt));
            tstCurr++;
          }
        }, that);

        return testResult;
      }; //init_testResult

      /*
       * function to process a list of individual tests
       * because of Timer.once restrictions, using an external var as parameter
       * (tlist)
       */
      function runtest()
      {
        if (tlist.length) {
          var test = tlist[0];
          that.loader.runTests(testResult, test[0], test[1]);
          tlist = tlist.slice(1,tlist.length);  // recurse with rest of list
          qx.client.Timer.once(runtest,this,100);
        } else { // no more tests -> re-enable toolbar
          that.toolbar.setEnabled(true);
          //that.left.setEnabled(true);
        }
      };


      /**
       * build up a list that will be used by runtest() as input (var tlist)
      */
      function buildList(node) // node is a modelNode
      {
        var tlist = [];
        var path = handler.getPath(node);
        var tclass = path.join(".");

        if (node.hasChildren()) {
          var children = node.getChildren();
          for (var i=0; i<children.length; i++)
          {
            if (children[i].hasChildren()){
              tlist = tlist.concat(buildList(children[i]));
            } else {
              tlist.push([tclass, children[i].label]);
            }
          }
        } else {
          tlist.push([tclass, node.label]);
        }
        return tlist;
      }; //buildList


      // -- Main ---------------------------------

      // get model node from selected tree node
      var modelNode = this.left.getSelectedElement().modelLink;
      // build list of individual tests to perform
      tlist = buildList(modelNode);
      if (this.reloadswitch.getChecked()) {
        // set up pending tests
        this.tests.run_pending = function ()
        {
          testResult = init_testResult();
          if (!testResult) {
            that.debug("Alarm: no testResult!");}
          else {
            runtest();}
        };
        this.reloadTestSuite();
      } else {
        // run the tests now
        testResult = init_testResult();
        runtest();
      }

    }, //runTest


    // -------------------------------------------------------------------------
    /**
     * reloads iframe's URL
     */
    reloadTestSuite : function (e)
    {
      var curr = this.iframe.getSource();
      var neu  = this.testSuiteUrl.getValue();
      this.toolbar.setEnabled(false);
      // reset status information
      this.resetGui();
      qx.client.Timer.once(function () {
        if (curr == neu) {
          this.iframe.reload();
        } else {
          this.iframe.setSource(neu);
        }
      },this,0);
    }, //reloadTestSuite


    ehIframeOnLoad : function (e) {
      var iframe = this.iframe;
      this.loader = iframe.getContentWindow().qxunit.TestLoader.getInstance();
      if (!this.loader) { // wait for the iframe to load
        qx.client.Timer.once(arguments.callee, this, 50);
        return;
      }

      this.frameWindow   = iframe.getContentWindow();
      var testRep        = this.loader.getTestDescriptions();
      this.tests.handler = new qxunit.runner.TestHandler(testRep);
      if (! this.left) {
        var left = this.__makeLeft();
        this.left = left;
        this.mainsplit.addLeft(left);
      } else {
        this.leftReloadTree();
      }
      this.toolbar.setEnabled(true);  // in case it was disabled (for reload)
      if (this.tests.run_pending) {   // do we have pending tests to run?
        this.tests.run_pending();
        delete this.tests.run_pending;
      }
    },


    // ------------------------------------------------------------------------
    //   MISC HELPERS
    // ------------------------------------------------------------------------

    resetGui : function ()
    {
      this.resetProgress();
      this.resetTabView();
    },


    resetProgress : function ()
    {
      var bar = this.widgets["progresspane.progressbar"];
      bar.reset();
      bar.setBarColor("#36a618");
      this.setSuccCnt(0);
      this.setFailCnt(0);
    },


    resetTabView : function ()
    {
      this.f1.clear();
    },


    _applySuccCnt : function (newSucc)
    {
      this.widgets["progresspane.succ_cnt"].setText(newSucc+"");
    },


    _applyFailCnt : function (newFail)
    {
      this.widgets["progresspane.fail_cnt"].setText(newFail+"");
    },


    appender : function (str) {
      //this.f1.setValue(this.f1.getValue() + str);
      //this.f1.setHtml(this.f1.getHtml()+"<br>"+str);
    } //appender


  } //members

});


