/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */
qx.Class.define("qx.test.ui.tree.VirtualTree",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {
    tree : null,


    setUp : function()
    {
      this.base(arguments);

      this.tree = new qx.ui.tree.VirtualTree();
      this.getRoot().add(this.tree);

      this.flush();
    },


    tearDown : function()
    {
      this.base(arguments);

      this.tree.dispose();
      this.tree = null;
    },


    createModel : function()
    {
      var root = {
        name: "Root node",
        children: []
      };

      this.__createNodes(root, 3);

      return root;
    },


    testCreation : function()
    {
      this.assertEquals("virtual-tree", this.tree.getAppearance(), "Init value for 'appearance' is wrong!");
      this.assertTrue(this.tree.getFocusable(), "Init value for 'focusable' is wrong!");
      this.assertEquals(100, this.tree.getWidth(), "Init value for 'width' is wrong!");
      this.assertEquals(200, this.tree.getHeight(), "Init value for 'height' is wrong!");
      this.assertEquals(25, this.tree.getItemHeight(), "Init value for 'itemHeight' is wrong!");
      this.assertEquals(25, this.tree.getPane().getRowConfig().getDefaultItemSize(), "Init value for 'itemHeight' is wrong!");
      this.assertEquals("dblclick", this.tree.getOpenMode(), "Init value for 'openMode' is wrong!");
      this.assertFalse(this.tree.getHideRoot(), "Init value for 'hideRoot' is wrong!");
      this.assertFalse(this.tree.getRootOpenClose(), "Init value for 'rootOpenClose' is wrong!");

      var model = this.tree.getModel();
      this.assertEquals("", model.name, "Init value for 'model' is wrong!");
      this.assertArrayEquals([], model.children, "Init value for 'model' is wrong!");
    },


    testSetItemHeight : function()
    {
      this.tree.setItemHeight(30);

      this.assertEquals(30, this.tree.getPane().getRowConfig().getDefaultItemSize());
    },


    testSetModel : function()
    {
      var model = this.createModel();
      this.tree.setModel(model);

      this.assertEquals(model, this.tree.getModel());
    },


    testResetModel : function()
    {
      var oldModel = this.tree.getModel();

      var model = this.createModel();
      this.tree.setModel(model);

      this.tree.resetModel();
      this.assertEquals(oldModel, this.tree.getModel());
    },


    testBuildLookupTable : function()
    {
      var model = this.createModel();
      this.tree.setModel(model);

      var root = model;
      var expected = this.__getVisibleItemsFrom(root, [root]);
      qx.lang.Array.insertAt(expected, root, 0);

      this.__testBuildLookupTable(expected);
    },


    testBuildLookupTableWithOpenNodes : function()
    {
      var model = this.createModel();
      this.tree.setModel(model);
      
      var root = model;
      var openNodes = [
        root, 
        root.children[9],
        root.children[9].children[5]
      ];
      
      for (var i = 0; i < openNodes.length; i++) {
        this.tree.setOpen(openNodes[i]);
      }

      var expected = this.__getVisibleItemsFrom(root, openNodes);
      qx.lang.Array.insertAt(expected, root, 0);

      this.__testBuildLookupTable(expected);
    },


    __testBuildLookupTable : function(expected)
    {
      this.assertArrayEquals(expected, this.tree.getLookupTable());
      this.assertEquals(expected.length, this.tree.getPane().getRowConfig().getItemCount());
    },


    testGetOpenNodes : function()
    {
      var model = this.createModel();
      this.tree.setModel(model);

      var expected = [];
      var root = model;
      expected.push(root);

      this.assertArrayEquals(expected, this.tree.getOpenNodes());
    },


    testIsOpenNode : function()
    {
      var model = this.createModel();
      this.tree.setModel(model);

      var root = model;
      this.tree.setOpen(root);
      this.tree.setOpen(root.children[0]);

      this.assertTrue(this.tree.isOpen(root));
      this.assertTrue(this.tree.isOpen(root.children[0]));
      this.assertFalse(this.tree.isOpen(root.children[1]));
    },


    testSetOpenNodes : function()
    {
      var model = this.createModel();
      this.tree.setModel(model);

      var expectedOpen = [];
      var root = model;
      expectedOpen.push(root);
      expectedOpen.push(root.children[0]);

      this.tree.setOpen(root.children[0]);
      this.assertArrayEquals(expectedOpen, this.tree.getOpenNodes());

      this.tree.setOpen(root.children[0]);
      this.assertArrayEquals(expectedOpen, this.tree.getOpenNodes());
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHODS TO CREATE A TREE STRUCTURE
    ---------------------------------------------------------------------------
    */


    __createNodes : function(parent, level) {
      if (level > 0)
      {
        for (var i = 0; i < 10; i++)
        {
          var item = {
            name: "Node " + this.__getPrefix(parent.name) + i,
            children: []
          };
          parent.children.push(item);

          this.__createNodes(item, level - 1);
          this.__createLeafs(item);
        }
      }
    },


    __createLeafs : function(parent)
    {
      for (var i = 0; i < 10; i++)
      {
        parent.children.push({
          name: "Leaf " + this.__getPrefix(parent.name) + i
        });
      }
    },


    __getPrefix : function(name)
    {
      var prefix = "";
      if (qx.lang.String.startsWith(name, "Node")) {
        prefix = name.substr(5, name.length - 5) + ".";
      }
      return prefix;
    },


    /*
    ---------------------------------------------------------------------------
      HELPER METHOD TO CALCULATE THE VISIBLE ITEMS
    ---------------------------------------------------------------------------
    */


    __getVisibleItemsFrom : function(parent, openNodes)
    {
      var expected = [];

      if (parent.children != null)
      {
        for (var i = 0; i < parent.children.length; i++)
        {
          var child = parent.children[i];
          expected.push(child);

          if (openNodes.indexOf(child) > -1)
          {
            var otherExpected = this.__getVisibleItemsFrom(child, openNodes);
            expected = expected.concat(otherExpected);
          }
        }
      }

      return expected;
    }
  }
});