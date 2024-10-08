<img src="https://raw.githubusercontent.com/joepietrzyk/better-share-button/main/assets/circular-icon.svg" alt="Circular Icon" width="200" height="200"/>

# Better Share Button

[![License](https://img.shields.io/github/license/joepietrzyk/better-share-button)](./LICENSE)
[![Version](https://img.shields.io/github/package-json/v/joepietrzyk/better-share-button)](./package.json)
![example workflow](https://github.com/joepietrzyk/better-share-button/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/github/joepietrzyk/better-share-button/graph/badge.svg?token=MN3ZFJDRXB)](https://codecov.io/github/joepietrzyk/better-share-button)

## Overview

**Better Share Button** is a Firefox extension that makes it easier to share Discord embeddable URLs from popular social media websites. Currently, this supports X/Twitter and (old/RES) Reddit. Right now this is a for-fun project I'm doing in my free-time.

### Features

- **Convenient**: Instead of having to manually edit the text in the URL before sending to your friends over Discord (or worse-- expect them to actually click your link), it adds a "Share" button that copies the already-fixed, embeddable URL.
- **Customizable**: Easily configure which embed generator is used for each website.

## Building

1. Run `npm i -g pnpm@9.12.1`
2. Run `pnpm i`
3. Run `pnpm build`
4. Run `pnpm package`

This will build the extension to the `dist` directory and output the packaged extension to the `output` directory.

## Installation

It's not available in the Firefox Add-ons store yet, but will be if version 1.0.0 is ever released.

1. Run `npm install`
2. Run `npm run build`
3. Open Firefox and visit `about:debugging`
4. Navigate to "This Firefox" and select Load Temporary Add-on...
5. Select the `dist/manifest.json` file.
6. Alternatively, you can run `npm run start:firefox` to load the addon into a temporary instance of Firefox

# Development

All development is done on Node.js version `20.17.0` and pnpm version `9.12`. In order to run the integration tests, you will need to install
[Firefox Developer Edition](https://www.mozilla.org/en-US/firefox/developer/), [geckodriver](https://github.com/mozilla/geckodriver/releases/tag/v0.35.0), and create a .env file (see [.env.example](./.env.example)).

## Contributing

Right now this is a solo project. However, if you do wish to contribute, please follow these steps:

1. Fork the repository.
2. Commit all changes to a new branch (`git checkout -b feature/my-feature`).
3. Ensure proper styling is enforced (`pnpm lint` and `pnpm format`).
4. Make sure all the unit tests pass (`pnpm test`). Add or modify any unit tests necessary for your changes.
5. Open a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
