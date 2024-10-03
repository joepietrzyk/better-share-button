declare const process: {
  env: {
    NODE_ENV: 'development' | 'production' | 'test';
  };
};

declare module '*.svg' {
  const content: string;
  export default content;
}
