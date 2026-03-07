// TypeScript type definitions for @mediapipe/hands and @mediapipe/camera_utils

declare module '@mediapipe/hands' {
  export interface HandsOptions {
    locateFile?: (file: string) => string;
  }

  export interface HandsConfig {
    maxNumHands?: number;
    modelComplexity?: 0 | 1;
    selfieMode?: boolean;
    minDetectionConfidence?: number;
    minTrackingConfidence?: number;
  }

  export interface Landmark {
    x: number;
    y: number;
    z: number;
  }

  export interface HandsResults {
    multiHandLandmarks?: Landmark[][];
    multiHandedness?: Array<{
      index: number;
      score: number;
      label: string;
    }>;
    image?: HTMLCanvasElement | HTMLVideoElement | ImageBitmap;
  }

  export class Hands {
    constructor(options: HandsOptions);
    setOptions(config: HandsConfig): void;
    onResults(callback: (results: HandsResults) => void): void;
    send(inputs: { image: HTMLVideoElement | HTMLCanvasElement | ImageBitmap }): Promise<void>;
    close(): void;
  }
}

declare module '@mediapipe/camera_utils' {
  export interface CameraOptions {
    onFrame: () => Promise<void> | void;
    width?: number;
    height?: number;
  }

  export class Camera {
    constructor(videoElement: HTMLVideoElement, options: CameraOptions);
    start(): Promise<void>;
    stop(): void;
  }
}
