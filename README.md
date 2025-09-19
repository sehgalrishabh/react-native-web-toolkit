# React Native Web Toolkit

A CLI toolkit to seamlessly add web support to React Native projects using Webpack.

## Features

- Easy setup of React Native Web in existing React Native projects
- Automated Webpack configuration
- Support for both development and production builds
- Single setup option:
  - Webpack configuration for custom control

## Prerequisites

- React Native >= 0.81.0
- Node.js and npm installed

## Installation

```bash
npx react-native-web-toolkit
```

## Troubleshooting

### Common Issues

#### Version Mismatch Errors

- **React Version Mismatch**
  ```bash
  Error: Invalid hook call
  ```
  **Solution**: Ensure `react` and `react-dom` versions match exactly. For example:
  ```json
  {
    "dependencies": {
      "react": "19.1.1",
      "react-dom": "19.1.1"
    }
  }
  ```

#### Webpack Configuration Issues

- **@react-native/new-app-screens Error**

  ```bash
  Error: Unable to resolve module @react-native/new-app-screens
  ```

  **Solution**: Remove `@react-native/new-app-screens` imports from `App.tsx` as they're not supported by react-native-web:

  ```typescript
  // Remove this line from App.tsx
  - import { ... } from '@react-native/new-app-screens';
  ```

- **React Not Found Error**

  ```bash
  Error: React must be in scope when using JSX
  ```

  or

  ```bash
  Error: React not found
  ```

  **Solution**: Add React import at the top of your `App.tsx`:

  ```typescript
  import React from "react";
  ```

- **Loader Not Found Error**
  ```bash
  Module parse failed: Unexpected token
  You may need an appropriate loader to handle this file type
  ```
  **Solution**: Add the problematic package to Babel loader include paths in `webpack.config.js`:
  ```javascript
  {
    test: /\.[jt]sx?$/,
    include: [
      path.resolve(appDirectory, 'node_modules/package-name'),
      // ...other includes
    ],
    use: {
      loader: 'babel-loader'
    }
  }
  ```

#### Build Performance Issues

- If the build is slow, try:
  - Using `cache-loader` for frequently used modules
  - Enabling Webpack's cache in development mode
  - Adding heavy dependencies to `externals` if not needed for web

#### Development Server Issues

- If hot reload isn't working:
  - Check if WebSocket connection is established
  - Ensure no port conflicts (default: 8080)
  - Clear browser cache and node_modules/.cache

For more specific issues, please check our [GitHub Issues](https://github.com/sehgalrishabh/react-native-web-toolkit/issues) page.
