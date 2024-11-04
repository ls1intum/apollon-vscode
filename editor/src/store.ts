import { create } from "zustand";
import { ApollonOptions, UMLDiagramType, UMLModel } from "@ls1intum/apollon";
import { defaultEditorOptions } from "./types";

interface Store {
  model?: UMLModel;
  createNewEditor: boolean;
  options: ApollonOptions;
  setModel: (model: UMLModel) => void;
  setCreateNewEditor: (createNewEditor: boolean) => void;
  setModelType: (type: UMLDiagramType) => void;
}

export const useStore = create<Store>((set) => ({
  model: undefined,
  createNewEditor: true,
  options: defaultEditorOptions,
  setModel: (model: UMLModel) => {
    set({ model: model });
  },
  setCreateNewEditor: (createNewEditor: boolean) => {
    set({ createNewEditor: createNewEditor });
  },
  setModelType: (type: UMLDiagramType) => {
    set((state) => ({
      options: { ...state.options, type },
    }));
  },
}));

export default useStore;
