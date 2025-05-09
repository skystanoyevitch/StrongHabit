declare module "react-native-view-shot" {
  /**
   * Takes a screenshot of a component
   * @param view - Reference to the component to capture
   * @param options - Options for the capture
   * @returns Promise that resolves with the result
   */
  export function captureRef(
    view: any,
    options?: {
      format?: "png" | "jpg" | "webm" | "raw";
      quality?: number;
      result?: "file" | "base64" | "data-uri";
      snapshotContentContainer?: boolean;
      fileName?: string;
      width?: number;
      height?: number;
    }
  ): Promise<string>;

  /**
   * Takes a screenshot of a specified screen area
   * @param rect - Area to capture
   * @param options - Options for the capture
   * @returns Promise that resolves with the result
   */
  export function captureScreen(options?: {
    format?: "png" | "jpg" | "webm" | "raw";
    quality?: number;
    result?: "file" | "base64" | "data-uri";
    snapshotContentContainer?: boolean;
    fileName?: string;
    width?: number;
    height?: number;
  }): Promise<string>;

  export const constants: {
    CachesDirectoryPath: string;
    DocumentDirectoryPath: string;
    ExternalDirectoryPath: string;
    ExternalStorageDirectoryPath: string;
    LibraryDirectoryPath: string;
    MainBundlePath: string;
    TemporaryDirectoryPath: string;
  };
}
