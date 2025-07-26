export type LightVisionType = {
  content: Record<string, string>;
  setEditing: (boolean: boolean) => void;
  login: () => void;
  makeEditable: () => void;
  reLogin: boolean;
  setReLogin: (boolean: boolean) => void;
  handleSave: () => void;
};
