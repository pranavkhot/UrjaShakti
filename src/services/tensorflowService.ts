// src/services/tensorflowService.ts

import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

let model: cocoSsd.ObjectDetection | null = null;

/**
 * Load the COCO-SSD model
 */
export const loadModel = async () => {
  if (!model) {
    model = await cocoSsd.load();
  }
  return model;
};

/**
 * Detect objects in an image element
 * @param imageElement HTMLImageElement
 */
export const detectObjects = async (imageElement: HTMLImageElement) => {
  if (!model) {
    await loadModel();
  }
  if (model) {
    const predictions = await model.detect(imageElement);
    return predictions;
  }
  return [];
};
