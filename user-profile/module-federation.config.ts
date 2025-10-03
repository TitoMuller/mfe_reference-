import { ModuleFederationConfig } from '@nx/module-federation';

type SharedLibraryConfig = Exclude<ReturnType<NonNullable<ModuleFederationConfig['shared']>>, null | undefined | false>;

const sharedLibs: Record<string, SharedLibraryConfig> = {
  react: { singleton: true, requiredVersion: false, eager: true },
  'react-dom': { singleton: true, requiredVersion: false, eager: true },
  'react/jsx-runtime': { singleton: true, requiredVersion: false, eager: true },
  'react/jsx-dev-runtime': { singleton: true, requiredVersion: false, eager: true },
  'react-helmet-async': { singleton: true, requiredVersion: false, eager: true },
  'react-hook-form': { singleton: true, requiredVersion: false, eager: true },
  '@tanstack/react-query': { singleton: true, requiredVersion: false, eager: true },
  '@tanstack/react-router': { singleton: true, requiredVersion: false, eager: true },
  '@emotion/react': { singleton: true, requiredVersion: false, eager: true },
  '@mui/material': { singleton: true, requiredVersion: false, eager: true },
  '@mui/styles': { singleton: true, requiredVersion: false, eager: true },
  'tss-react/mui': { singleton: true, requiredVersion: false, eager: true },
  'app-zephyr-environment': { singleton: true, requiredVersion: false, eager: true },
  'app-zephyr-domains': { singleton: true, requiredVersion: false, eager: true },
  'app-zephyr-components': { singleton: true, requiredVersion: false, eager: true },
  'app-zephyr-routes': { singleton: true, requiredVersion: false, eager: true },
  'app-zephyr-constants': { singleton: true, requiredVersion: false, eager: true },
  'app-zephyr-axios': { singleton: true, requiredVersion: false, eager: true },
};

const config: ModuleFederationConfig = {
  name: '@mfe/user-profile',
  exposes: {
    '.': './src/index.ts',
  },
  shared: (libraryName, shared) => sharedLibs[libraryName] ?? false,
};

export default config;
