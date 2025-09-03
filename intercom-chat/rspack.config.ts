import { NxModuleFederationPlugin } from '@nx/module-federation/rspack.js';
import { NxAppRspackPlugin } from '@nx/rspack/app-plugin.js';
import { NxReactRspackPlugin } from '@nx/rspack/react-plugin.js';
import { join } from 'path';
import { withZephyr } from 'zephyr-rspack-plugin';

import config from './module-federation.config';

// Environment configuration
const use_zephyr_deploy = process.env.USE_ZEPHYR_DEPLOY === 'true';
const isProduction = process.env.NODE_ENV === 'production';

// Core plugins array
const plugins = [
  new NxAppRspackPlugin({
    tsConfig: './tsconfig.app.json',
    main: './src/index.tsx',
    index: './src/index.html',
    baseHref: '/',
    // Remove empty arrays to avoid path issues
    outputHashing: isProduction ? 'all' : 'none',
    optimization: isProduction,
    extractLicenses: false, // Disable to avoid empty path issues with license-webpack-plugin
  }),
  new NxReactRspackPlugin(),
  new NxModuleFederationPlugin({ config }, { dts: false }),
];

// Base configuration
let baseConfig = {
  context: __dirname, // Set context to app directory so zephyr plugin finds the correct package.json
  entry: './src/index.tsx',
  output: {
    path: join(__dirname, '../../dist/mfe/intercom-chat'),
    publicPath: 'auto',
  },
  devServer: {
    port: 3006, // From project.json
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true as const,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
  },
  plugins,
};

// Create async configuration function to handle Zephyr
const createConfig = async () => {
  // Handle Zephyr configuration if enabled
  if (use_zephyr_deploy) {
    //@ts-expect-error zephyr rspack version type mismatch
    baseConfig = await withZephyr()(baseConfig);
  }

  return baseConfig;
};

export default createConfig();
