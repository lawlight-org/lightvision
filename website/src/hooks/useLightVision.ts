import { useContext } from "react";
import { LightVision } from "../contexts/LightVisionContext";
import type { LightVisionType } from "../types/LightVisionType";

export const useLightVision = (): LightVisionType => {
  return useContext(LightVision);
};
