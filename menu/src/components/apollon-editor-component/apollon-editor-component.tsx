import { uuid } from "../../utils/uuid";
import {
  ApollonEditor,
  ApollonMode,
  Patch,
  Selection,
  UMLModel,
} from "@ls1intum/apollon";
import React, { useEffect, useRef, useState, useMemo, useContext } from "react";
import { ApollonEditorContext } from "./apollon-editor-context";
import styled from "styled-components";

const ApollonContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 2;
  overflow: hidden;
  background-color: white;
`;

export const ApollonEditorComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ApollonEditor | null>(null);
  const [selection, setSelection] = useState<Selection>({
    elements: {},
    relationships: {},
  });
  const editorContext = useContext(ApollonEditorContext);

  const editor = editorContext?.editor;
  const setEditor = editorContext?.setEditor;

  useEffect(() => {
    if (containerRef.current && setEditor) {
      // if (editorRef.current) {
      //   editorRef.current.destroy();
      // }
      const editor = new ApollonEditor(containerRef.current, {});
      editorRef.current = editor;
      setEditor(editorRef.current);
    }
  }, [containerRef.current]);

  return <ApollonContainer key={uuid()} ref={containerRef} />;
};
