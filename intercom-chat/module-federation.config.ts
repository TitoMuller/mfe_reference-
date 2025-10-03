import type { ModuleFederationConfig, SharedLibraryConfig } from '@nx/module-federation';

const sharedLibs: Record<string, SharedLibraryConfig> = {
  react: { singleton: true, requiredVersion: false },
  'react-dom': { singleton: true, requiredVersion: false },
  '@tanstack/react-query': { singleton: true, requiredVersion: false },
  'app-zephyr-environment': { singleton: true, requiredVersion: false },
  'app-zephyr-domains/*': { singleton: true, requiredVersion: false, eager: true },
};

const config: ModuleFederationConfig = {
  name: '@mfe/intercom-chat',
  exposes: {
    '.': './src/index.tsx',
  },
  shared: (libraryName, shared) => {
    // how app-zephyr-domains shows in the lib name: "app-zephyr-domains/*"
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (libraryName?.startsWith('app-zephyr-domains/')) {
      return sharedLibs['app-zephyr-domains/*'];
    }
    return sharedLibs[libraryName] ?? false;
  },
};

export default config;
