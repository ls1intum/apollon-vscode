import { ApollonEditor, UMLModel } from "@ls1intum/apollon";
import React, { useEffect, useRef, useContext } from "react";
import styled from "styled-components";

import { ApollonEditorContext } from "./ApollonEditorContext";
import useStore from "../../store";

const ApollonContainer = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--apollon-background);
  min-height: calc(100vh - 3rem);
`;

export const ApollonEditorComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<ApollonEditor | null>(null);
  const editorContext = useContext(ApollonEditorContext);
  const setEditor = editorContext?.setEditor;

  const model = useStore((state) => state.model);
  const createNewEditor = useStore((state) => state.createNewEditor);
  const options = useStore((state) => state.options);

  useEffect(() => {
    const initializeEditor = async () => {
      if (!containerRef.current) return;

      if (createNewEditor) {
        if (editorRef.current) {
          await editorRef.current.nextRender;
          editorRef.current.destroy();
        }

        editorRef.current = new ApollonEditor(containerRef.current, options);
        await editorRef.current?.nextRender;

        if (model) {
          editorRef.current.model = model;
        }

        editorRef.current.subscribeToModelChange((model: UMLModel) => {
          useStore.setState({ model: model });
        });

        setEditor!(editorRef.current);
        useStore.setState({ createNewEditor: false });
      }
    };

    initializeEditor();
  }, [createNewEditor]);

  return <ApollonContainer ref={containerRef} />;
};
