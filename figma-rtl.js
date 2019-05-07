const { React } = figmaPlus;

/** Copy of from https://github.com/figma-plus/figma-plus/blob/gh-pages/src/api/scene.js#L72
 * with support for multiline text
 */
const updateText = (node, val) => {
  const selectedNodes = Object.keys(App._state.mirror.sceneGraphSelection);
  App.sendMessage("clearSelection");
  App.sendMessage("addToSelection", { nodeIds: [node.id] });
  App.triggerAction("request-edit-mode");
  var inputNode = document.querySelector(".focus-target");
  inputNode.focus();
  for (const char of val) {
    if (char === "\n") {
      inputNode.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          cancelable: true,
          keyCode: 13
        })
      );
    } else {
      inputNode.value = char;
      inputNode.dispatchEvent(new InputEvent("input"));
    }
  }
  App.triggerAction("leave-edit-mode");
  App.sendMessage("clearSelection");
  if (selectedNodes.length > 0)
    App.sendMessage("addToSelection", { nodeIds: selectedNodes });
};

const flipText = text => {
  return text
    .split("\n")
    .map(row => {
      const characters = row.split("");
      characters.reverse();
      return characters.join("");
    })
    .join("\n");
};

const getSelectedTextBox = () => {
  const { selection } = figmaPlus.currentPage;
  if (selection.length !== 1) {
    throw new Error("Must select exactly one text box");
  }
  const [selectedNode] = selection;
  if (selectedNode.type !== "TEXT") {
    throw new Error("Must select exactly one text box");
  }
  return selectedNode;
};

const isTextBoxSelected = () => {
  try {
    getSelectedTextBox();
    return true;
  } catch {
    return false;
  }
};

const TextEditor = () => {
  const [text, setText] = React.useState("");
  const [error, setError] = React.useState();

  const handleChange = React.useCallback(
    event => {
      setText(event.target.value);
    },
    [setText]
  );

  const getSelectedTextBoxWithUI = () => {
    try {
      return getSelectedTextBox();
    } catch (error) {
      setError(error.toString());
    }
  };

  const load = React.useCallback(
    event => {
      setError(undefined);
      const selectedTextBox = getSelectedTextBoxWithUI();
      if (selectedTextBox) {
        setText(selectedTextBox.characters);
      }
    },
    [setText, setError]
  );

  const update = React.useCallback(
    event => {
      setError(undefined);
      const selectedTextBox = getSelectedTextBoxWithUI();
      if (selectedTextBox) {
        updateText(selectedTextBox, flipText(text));
      }
    },
    [text, setError]
  );

  return React.createElement("div", {}, [
    React.createElement("textarea", {
      dir: "rtl",
      onChange: handleChange,
      value: text,
      rows: 8,
      style: {
        width: "100%",
        height: "auto",
        textAlign: "right",
        padding: 8,
        border: "#E5E5E5 1px solid",
        marginBottom: 16,
        resize: "none"
      }
    }),
    React.createElement(
      "div",
      { style: { display: "flex", justifyContent: "flex-end" } },
      [
        React.createElement("span", { style: { color: "red" } }, error),
        React.createElement(
          "button",
          { onClick: load, style: { marginLeft: 8 } },
          "Load"
        ),
        React.createElement(
          "button",
          { onClick: update, className: "primary", style: { marginLeft: 8 } },
          "Update"
        )
      ]
    )
  ]);
};

figmaPlus.addCommand({
  label: "RTL Editor",
  action: () => {
    figmaPlus.showUI({
      title: "RTL Editor",
      reactComponent: TextEditor,
      positionX: 0,
      positionY: 0
    });
  },
  condition: isTextBoxSelected
});
