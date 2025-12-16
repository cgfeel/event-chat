// eslint.config.ts
import js from '@eslint/js';
import { base as aliBase, react as aliReact } from 'eslint-config-ali';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';
import react from 'eslint-plugin-react';
// import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import type { Linter, } from 'eslint';
import type { Plugin } from '@eslint/core';

// 核心配置数组（扁平结构）
const config: Linter.Config[] = [
  // 1. 基础ESLint推荐规则（对应 .eslintrc.cjs 中的 "extends": "eslint:recommended"）
  js.configs.recommended,
  ...aliBase,
  ...aliReact,

  // 2. TypeScript配置（核心转换）
  {
    // 作用文件范围（对应 .eslintrc.cjs 中的 overrides 或 files）
    files: ['**/*.{js,jsx,mjs,cjs,ts,tsx}'],
    languageOptions: {
      // 解析器（对应 .eslintrc.cjs 中的 parser）
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: import.meta.dirname, // 根目录（monorepo 根）
        allowDefaultProject: true, // 兼容未纳入 tsconfig 的配置文件
        // 对应 .eslintrc.cjs 中的 parserOptions
        // project: './tsconfig.json',
        // tsconfigRootDir: process.cwd(),
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      // 全局变量（对应 .eslintrc.cjs 中的 env）
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2020,
      },
    },
    // 插件注册（对应 .eslintrc.cjs 中的 plugins）
    plugins: {
      '@typescript-eslint': tsPlugin as unknown as Plugin,
    },
    // TS规则（对应 .eslintrc.cjs 中的 extends: ['plugin:@typescript-eslint/recommended']）
    rules: {
      ...tsPlugin.configs['recommended-type-checked']?.rules,
      ...tsPlugin.configs['stylistic-type-checked']?.rules,
      // 自定义规则（对应 .eslintrc.cjs 中的 rules）
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // 可添加你原有 .eslintrc.cjs 中的其他TS规则
      '@typescript-eslint/explicit-module-boundary-types': 'off', // 关闭显式返回类型强制要求
      '@stylistic/comma-dangle': 'off',
    },
  },

  // 3. React配置（核心转换）
  // 对应 .eslintrc.cjs 中的 extends: ['plugin:react/recommended', 'plugin:react-hooks/recommended']
  react.configs.flat.recommended,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      react,
      // 'react-hooks': reactHooks as unknown as Plugin,
      'react-refresh': reactRefresh,
    },
    settings: {
      // 对应 .eslintrc.cjs 中的 settings
      react: {
        version: 'detect',
      },
    },
    rules: {
      // 自定义React规则（对应 .eslintrc.cjs 中的 rules）
      '@typescript-eslint/no-unused-vars': ['error', {
        vars: 'all', // 检测所有未使用的变量（包括 const）
        args: 'after-used',
        ignoreRestSiblings: false,
      }],

      // React 规则
      'no-unused-vars': 'off',  // TS 类型替代 PropTypes
      'react/prop-types': 'off',
      'react/jsx-uses-react': 'off',  // React 17+ JSX 无需 import React
      'react/react-in-jsx-scope': 'off',  // React 17+ JSX 无需 import React

      // ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // 可添加你原有 .eslintrc.cjs 中的其他React规则
    },
  },

  // 4. 通用规则（全局生效）
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // 对应 .eslintrc.cjs 中的全局 rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-debugger': 'error',
      // 可添加你原有 .eslintrc.cjs 中的其他通用规则
    },
  },

  // 5. 忽略文件（对应 .eslintignore + .eslintrc.cjs 中的 ignorePatterns）
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/coverage/**',
      '*.config.js',
      '*.config.ts',
      '**/.storybook/**',
      '**/rslib.config.ts'
    ],
  },

  // 新增：集成 eslint-config-prettier（必须放在最后！）
  prettierConfig,
  
  // 可选：禁用 Prettier 不处理的 ESLint 格式规则（兜底）
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      // 关闭所有 stylistic 类格式规则（交给 Prettier）
      '@stylistic/arrow-parens': 'off',
      '@stylistic/comma-dangle': 'off',
      '@stylistic/indent': 'off',
      '@stylistic/semi': 'off',
      '@stylistic/quotes': 'off',
      '@stylistic/tab-width': 'off',
      '@stylistic/linebreak-style': 'off',
      // 关闭 TS 格式规则（交给 Prettier）
      '@typescript-eslint/indent': 'off',
      '@typescript-eslint/comma-dangle': 'off',
      '@typescript-eslint/quotes': 'off',
      '@typescript-eslint/semi': 'off',
    },
  },
];

export default config;