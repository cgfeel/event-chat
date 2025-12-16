import { defineConfig } from '@rsbuild/core';
import { pluginEslint } from '@rsbuild/plugin-eslint';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  plugins: [pluginReact(), 
    pluginEslint({
      // 配置 ESLint 9 扁平配置
      eslintPluginOptions: {
        cache: true,
        cwd: __dirname, // 指定配置文件所在目录（通常是项目根目录）
        configType: 'flat', // 关键：启用 flat 扁平配置模式
      },
    }),
  ],
  // 库模式配置（React 库开发）
  output: {
    // externals: ['react', 'react-dom', 'zod'],
    distPath: {
      root: 'dist',
    },
    filename: {
      js: '[name].js'
    },
    sourceMap: true,
  },
  // resolve: {
  //   alias: { '@/': './src' },
  //   extensions: ['.ts', '.tsx', '.js', '.jsx'],
  // },
  source: {
    entry: {
      index: './src/index.tsx', // 你的库主入口文件
    },
  }
});
