global.browser = {
  storage: {
    // @ts-ignore
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
      onChanged: {
        addListener: jest.fn(),
        removeListener: jest.fn(),
        hasListener: jest.fn(),
      },
    },
    // @ts-ignore
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn(),
    },
    onChanged: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn(),
    },
  },
  runtime: {
    sendMessage: jest.fn(),
    // @ts-ignore
    onMessage: {
      addListener: jest.fn(),
    },
  },
  // @ts-ignore
  tabs: {
    create: jest.fn(),
    query: jest.fn(),
  },
  // Add more APIs as needed...
};
