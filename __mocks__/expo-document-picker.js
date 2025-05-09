// Mock for expo-document-picker module
const DocumentPicker = {
  getDocumentAsync: jest.fn().mockResolvedValue({
    type: "success",
    uri: "file:///mock-document-uri",
    name: "mock-document.json",
    size: 1024,
    mimeType: "application/json",
  }),
  isDocumentPickerAvailableAsync: jest.fn().mockResolvedValue(true),
};

export default DocumentPicker;
