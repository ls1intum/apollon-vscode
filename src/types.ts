import { UMLModel } from "@ls1intum/apollon";
import { uuid } from "./util";

export type Diagram = {
  id: string;
  title: string;
  model?: UMLModel;
  lastUpdate: string;
  versions?: Diagram[];
  description?: string;
  token?: string;
};

export const defaultDiagram: Diagram = {
  id: uuid(),
  title: "UMLClassDiagram",
  model: undefined,
  lastUpdate: new Date().toISOString(),
};
