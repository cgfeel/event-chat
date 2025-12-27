import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resolve } from 'path';
import type { StorybookConfig } from 'storybook-react-rsbuild';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const getAbsolutePath = (value: string): any => {
  return path.resolve(
    fileURLToPath(new URL(import.meta.resolve(`${value}/package.json`, import.meta.url))),
    '..'
  );
};

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: ['@chromatic-com/storybook', '@storybook/addon-docs', '@storybook/addon-onboarding'],
  framework: {
    name: getAbsolutePath('storybook-react-rsbuild'),
    options: {},
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      tsconfigPath: resolve(__dirname, '../tsconfig.json'),
      compilerOptions: {
        baseUrl: resolve(__dirname, '../'), // 统一为绝对路径（与上面 tsconfig 对应）
        paths: {
          '@/*': [resolve(__dirname, '../src/*')],
          '@event-chat/*': [resolve(__dirname, '../../packages/*/src')],
        },
      },
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
      propFilter: () => true,
    },
    check: true,
  },
  //   framework: 'storybook-react-rsbuild',
};
export default config;
