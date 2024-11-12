import { useState } from "react";
import { ApollonEditor } from "@ls1intum/apollon";
import { VSCodeButton } from "@vscode/webview-ui-toolkit/react";
import styled from "styled-components";
import { ApollonEditorProvider } from "./components/apollon-editor-component/ApollonEditorContext";
import { ApollonEditorComponent } from "./components/apollon-editor-component/ApollonEditorComponent";
import { vscode } from "./index";
import useStore from "./store";

const AppBar = styled.div`
  width: 100%;
  background: var(--vscode-activityBar-background);
  padding: 1rem 0;
  display: flex;
  justify-content: flex-start;
`;

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
      <AppBar>
        <VSCodeButton className="mx-3" onClick={saveDiagram}>
          Save
        </VSCodeButton>
        <VSCodeButton className="mx-3" onClick={exportDiagram}>
          Export
        </VSCodeButton>
      </AppBar>
      <ApollonEditorProvider value={{ editor, setEditor: handleSetEditor }}>
        <ApollonEditorComponent />
      </ApollonEditorProvider>
    </>
  );
}

export default App;
