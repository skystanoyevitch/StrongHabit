// Mock for expo-sharing module
const Sharing = {
  isAvailableAsync: jest.fn().mockResolvedValue(true),
  shareAsync: jest
    .fn()
    .mockResolvedValue({ action: "shared", dialogTitle: "Share" }),
};

export default Sharing;
