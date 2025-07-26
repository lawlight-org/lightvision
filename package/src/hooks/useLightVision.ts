import { useContext } from "react";
import { LightVisionContext } from "../contexts/LightVisionContext";
import type { LightVisionType } from "../types/LightVisionType";

export const useLightVision = (): LightVisionType => {
  return useContext(LightVisionContext);
};
