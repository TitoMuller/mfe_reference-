import { NxModuleFederationDevServerPlugin, NxModuleFederationPlugin } from '@nx/module-federation/rspack.js';
import { NxAppRspackPlugin } from '@nx/rspack/app-plugin.js';
import { NxReactRspackPlugin } from '@nx/rspack/react-plugin.js';
import { join } from 'path';
import { withZephyr } from 'zephyr-rspack-plugin';

import config from './module-federation.config';

const use_zephyr_deploy = process.env.USE_ZEPHYR_DEPLOY === 'true';
const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
  new NxAppRspackPlugin({
    tsConfig: './tsconfig.app.json',
    main: './src/index.ts',
    index: './src/index.html',
    baseHref: '/',
    outputHashing: isProduction ? 'all' : 'none',
    optimization: isProduction,
    extractLicenses: false,
  }),
  new NxReactRspackPlugin(),
  new NxModuleFederationPlugin({ config }, { dts: false }),
  new NxModuleFederationDevServerPlugin({ config }),
];

let baseConfig = {
  context: __dirname,
  entry: './src/index.ts',
  output: {
    path: join(__dirname, '../../dist/mfe/subscriptions'),
    publicPath: 'auto',
  },
  devServer: {
    port: 3008,
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

const createConfig = async () => {
  if (use_zephyr_deploy) {
    //@ts-expect-error zephyr rspack version type mismatch
    baseConfig = await withZephyr()(baseConfig);
  }

  return baseConfig;
};

export default createConfig();
