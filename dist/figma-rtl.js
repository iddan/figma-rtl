(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  var arrayWithHoles = _arrayWithHoles;

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  var iterableToArrayLimit = _iterableToArrayLimit;

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var nonIterableRest = _nonIterableRest;

  function _slicedToArray(arr, i) {
    return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || nonIterableRest();
  }

  var slicedToArray = _slicedToArray;

  var _figmaPlus = figmaPlus,
      React = _figmaPlus.React;
  /** Copy of from https://github.com/figma-plus/figma-plus/blob/gh-pages/src/api/scene.js#L72
   * with support for multiline text
   */

  var updateText = function updateText(node, val) {
    var selectedNodes = Object.keys(App._state.mirror.sceneGraphSelection);
    App.sendMessage("clearSelection");
    App.sendMessage("addToSelection", {
      nodeIds: [node.id]
    });
    App.triggerAction("request-edit-mode");
    var inputNode = document.querySelector(".focus-target");
    inputNode.focus();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = val[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var char = _step.value;

        if (char === "\n") {
          inputNode.dispatchEvent(new KeyboardEvent("keydown", {
            bubbles: true,
            cancelable: true,
            keyCode: 13
          }));
        } else {
          inputNode.value = char;
          inputNode.dispatchEvent(new InputEvent("input"));
        }
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }

    App.triggerAction("leave-edit-mode");
    App.sendMessage("clearSelection");
    if (selectedNodes.length > 0) App.sendMessage("addToSelection", {
      nodeIds: selectedNodes
    });
  };

  var flipText = function flipText(text) {
    return text.split("\n").map(function (row) {
      var characters = row.split("");
      characters.reverse();
      return characters.join("");
    }).join("\n");
  };

  var getSelectedTextBox = function getSelectedTextBox() {
    var selection = figmaPlus.currentPage.selection;

    if (selection.length !== 1) {
      throw new Error("Must select exactly one text box");
    }

    var _selection = slicedToArray(selection, 1),
        selectedNode = _selection[0];

    if (selectedNode.type !== "TEXT") {
      throw new Error("Must select exactly one text box");
    }

    return selectedNode;
  };

  var isTextBoxSelected = function isTextBoxSelected() {
    try {
      getSelectedTextBox();
      return true;
    } catch (_unused) {
      return false;
    }
  };

  var TextEditor = function TextEditor() {
    var _React$useState = React.useState(""),
        _React$useState2 = slicedToArray(_React$useState, 2),
        text = _React$useState2[0],
        setText = _React$useState2[1];

    var _React$useState3 = React.useState(),
        _React$useState4 = slicedToArray(_React$useState3, 2),
        error = _React$useState4[0],
        setError = _React$useState4[1];

    var handleChange = React.useCallback(function (event) {
      setText(event.target.value);
    }, [setText]);

    var getSelectedTextBoxWithUI = function getSelectedTextBoxWithUI() {
      try {
        return getSelectedTextBox();
      } catch (error) {
        setError(error.toString());
      }
    };

    var load = React.useCallback(function (event) {
      setError(undefined);
      var selectedTextBox = getSelectedTextBoxWithUI();

      if (selectedTextBox) {
        setText(flipText(selectedTextBox.characters));
      }
    }, [setText, setError]);
    var update = React.useCallback(function (event) {
      setError(undefined);
      var selectedTextBox = getSelectedTextBoxWithUI();

      if (selectedTextBox) {
        updateText(selectedTextBox, flipText(text));
      }
    }, [text, setError]);
    return React.createElement("div", {
      className: "figma-rtl"
    }, React.createElement("textarea", {
      dir: "rtl",
      onChange: handleChange,
      value: text,
      rows: 8
    }), React.createElement("div", {
      className: "actions"
    }, React.createElement("span", null, error), React.createElement("button", {
      onClick: load
    }, "Load"), React.createElement("button", {
      className: "primary",
      onClick: update
    }, "Update")));
  };

  figmaPlus.addCommand({
    label: "RTL Editor",
    action: function action() {
      figmaPlus.showUI({
        title: "RTL Text",
        reactComponent: TextEditor
      });
    },
    condition: isTextBoxSelected,
    showInSelectionMenu: true
  });

}));
//# sourceMappingURL=figma-rtl.js.map
