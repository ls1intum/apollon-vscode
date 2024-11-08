import {
  VSCodeButton,
  VSCodeTextField,
  VSCodeDropdown,
  VSCodeOption,
  VSCodeDivider,
  VSCodeProgressRing,
} from "@vscode/webview-ui-toolkit/react";
import { vscode } from "./index";
import { useState } from "react";
import useStore from "./store";

function App() {
  const existingDiagrams = useStore((state) => state.diagrams);
  const [newDiagramName, setNewDiagramName] = useState<string>("");
  const [existingDiagramPath, setExistingDiagramPath] = useState<
    string | undefined
  >(undefined);

  const isValidDiagramName = (name: string) => {
    const invalidCharacters = /[\x00-\x1f\x80-\x9f<>:"/\\|?*\u0000]/;
    return name.length > 0 && !invalidCharacters.test(name);
  };

  const createDiagram = () => {
    vscode.postMessage({
      type: "createDiagram",
      name: newDiagramName,
    });
  };

  const loadDiagram = () => {
    vscode.postMessage({
      type: "loadDiagram",
      path: existingDiagramPath ? existingDiagramPath : existingDiagrams![0],
    });
  };

  return (
    <div className="flex flex-col mx-5">
      <label htmlFor="new-diagram-name">New diagram name</label>
      <VSCodeTextField
        id="new-diagram-name"
        onInput={(e) => {
          setNewDiagramName((e.target as HTMLInputElement).value);
        }}
      />
      <VSCodeButton
        className="my-3"
        disabled={!isValidDiagramName(newDiagramName)}
        onClick={createDiagram}
      >
        Create new diagram
      </VSCodeButton>

      <VSCodeDivider className="w-full h-1" />

      {!existingDiagrams && (
        <div className="flex flex-col items-center justify-center">
          <VSCodeProgressRing />
          <p>Fetching diagrams</p>
        </div>
      )}
      {existingDiagrams && existingDiagrams.length === 0 && (
        <p>There are no diagrams available to load</p>
      )}
      {existingDiagrams && existingDiagrams.length > 0 && (
        <div className="dropdown-container">
          <label htmlFor="existing-diagrams">Existing diagrams</label>
          <VSCodeDropdown
            id="existing-diagrams"
            className="w-full"
            onInput={(e) => {
              setExistingDiagramPath((e.target as HTMLInputElement).value);
            }}
          >
            {existingDiagrams.map((diagram, index) => (
              <VSCodeOption key={index}>{diagram}</VSCodeOption>
            ))}
          </VSCodeDropdown>
        </div>
      )}
      <VSCodeButton
        className="my-3"
        disabled={!existingDiagrams || existingDiagrams.length == 0}
        onClick={loadDiagram}
      >
        Load diagram
      </VSCodeButton>
    </div>
  );
}

export default App;
