declare namespace NodeJS {
  interface ProcessEnv {
    FIREFOX_BINARY_PATH: string;
    GECKODRIVER_BINARY_PATH: string;
    EXTENSION_PATH_GLOB: string;
  }
}
