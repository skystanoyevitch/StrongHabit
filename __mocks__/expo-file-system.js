// Mock for expo-file-system module
const FileSystem = {
  documentDirectory: "file:///mock-document-directory/",
  cacheDirectory: "file:///mock-cache-directory/",
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  getInfoAsync: jest
    .fn()
    .mockResolvedValue({ exists: true, isDirectory: true, size: 0 }),
  readDirectoryAsync: jest.fn().mockResolvedValue(["file1.txt", "file2.txt"]),
  readAsStringAsync: jest.fn().mockResolvedValue("mock-file-content"),
  writeAsStringAsync: jest.fn().mockResolvedValue(undefined),
  deleteAsync: jest.fn().mockResolvedValue(undefined),
  copyAsync: jest.fn().mockResolvedValue(undefined),
  moveAsync: jest.fn().mockResolvedValue(undefined),
  EncodingType: {
    UTF8: "utf8",
    Base64: "base64",
  },
  createDownloadResumable: jest.fn(),
};

export default FileSystem;
