// 3D components (PRD 14.3). The exported shells never import three.js statically: the scenes
// are lazy chunks, so pages without 3D never ship three (PRD 13.3).
export { ModelViewer3D } from "./model-viewer";
export type { ModelViewer3DProps, ModelViewerEvent, ModelViewerLabels } from "./model-viewer";
export { CareerCompass3D } from "./compass";
export type { CareerCompass3DProps, CompassWorld } from "./compass";
export { browserSavesData, compassLayout, formatBytes, hasWebGL } from "./util";
