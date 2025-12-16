import { pluginReact } from '@rsbuild/plugin-react';
import { pluginEslint } from '@rsbuild/plugin-eslint';
import { defineConfig } from '@rslib/core';

export default defineConfig({
  source: {
    entry: {
      index: ['./src/**'],
    },
  },
  lib: [
    {
      bundle: false,
      dts: true,
      format: 'esm',
      output: {
        filename: {
          js: '[name].js'
        }
      }
    },
  ],
  output: {
    target: 'web',
    externals: ['react', 'react-dom']
  },
  plugins: [pluginReact(),
    pluginEslint({
      // 配置 ESLint 9 扁平配置
      eslintPluginOptions: {
        cache: true,
        cwd: __dirname, // 指定配置文件所在目录（通常是项目根目录）
        configType: 'flat', // 关键：启用 flat 扁平配置模式
      },
    }),],
});
