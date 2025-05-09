import { captureRef } from "react-native-view-shot";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform } from "react-native";

/**
 * Takes a screenshot of a component and saves it to the device
 * @param viewRef - Reference to the component to capture
 * @param filename - Name of the file (without extension)
 * @param shareAfterCapture - Whether to share the screenshot after capturing
 * @returns Path to the saved screenshot
 */
export const takeScreenshot = async (
  viewRef: any,
  filename: string = "StrongHabit-Screenshot",
  shareAfterCapture: boolean = true
): Promise<string | null> => {
  try {
    // Ensure screenshots directory exists
    const screenshotsDir = `${FileSystem.documentDirectory}screenshots/`;
    const dirInfo = await FileSystem.getInfoAsync(screenshotsDir);

    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(screenshotsDir, {
        intermediates: true,
      });
    }

    // Generate a filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const path = `${screenshotsDir}${filename}-${timestamp}.png`;

    // Capture the screenshot
    const result = await captureRef(viewRef, {
      format: "png",
      quality: 1,
      result: "file",
      fileName: path,
    });

    console.log(`Screenshot saved to: ${result}`);

    // Share if requested
    if (shareAfterCapture && (await Sharing.isAvailableAsync())) {
      await Sharing.shareAsync(result, {
        mimeType: "image/png",
        dialogTitle: "Share Screenshot",
      });
    }

    return result;
  } catch (error) {
    console.error("Screenshot failed:", error);
    return null;
  }
};

/**
 * Takes multiple screenshots of a component with different props
 * Useful for generating app store screenshots with different states
 * @param viewRef - Reference to the component to capture
 * @param baseFilename - Base name for the files
 * @param variations - Number of variations to capture
 * @returns Array of paths to the saved screenshots
 */
export const takeMultipleScreenshots = async (
  viewRef: any,
  baseFilename: string = "StrongHabit",
  variations: number = 5
): Promise<(string | null)[]> => {
  const results: (string | null)[] = [];

  for (let i = 1; i <= variations; i++) {
    const filename = `${baseFilename}-${i}`;
    const path = await takeScreenshot(viewRef, filename, false);
    results.push(path);

    // Add a small delay between screenshots
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
};
