import { useState } from "react";
import { ApollonEditor } from "@ls1intum/apollon";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import { ApollonEditorProvider } from "./components/apollon-editor-component/ApollonEditorContext";
import { ApollonEditorComponent } from "./components/apollon-editor-component/ApollonEditorComponent";
import { vscode } from "./index";
import useStore from "./store";

// TODO: Add dropdown to support export of types other than SVG

function App() {
  const [editor, setEditor] = useState<ApollonEditor>();
  const handleSetEditor = (newEditor: ApollonEditor) => {
    setEditor(newEditor);
  };
  const model = useStore((state) => state.model);

  const saveDiagram = () => {
    vscode.postMessage({
      type: "saveDiagram",
      model: model,
    });
  };

  const exportDiagram = async () => {
    const exportContent = (await editor!.exportAsSVG()).svg;

    vscode.postMessage({
      type: "exportDiagram",
      exportType: "svg",
      exportContent: exportContent,
    });
  };

  return (
    <>
      <ApollonEditorProvider value={{ editor, setEditor: handleSetEditor }}>
        <ApollonEditorComponent />
      </ApollonEditorProvider>
      <div className="mt-3">
        <VSCodeButton className="mx-3" onClick={saveDiagram}>
          Save
        </VSCodeButton>
        <VSCodeButton className="mx-3" onClick={exportDiagram}>
          Export
        </VSCodeButton>
      </div>
    </>
  );
}

export default App;
