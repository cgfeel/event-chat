import { defineConfig } from '@rsbuild/core';
import { pluginEslint } from '@rsbuild/plugin-eslint';
import { pluginReact } from '@rsbuild/plugin-react';

// Docs: https://rsbuild.rs/config/
export default defineConfig({
  dev: {
    setupMiddlewares: (middlewares) => {
      middlewares.push((req, res, next) => {
        if (req.url === '/api/health') {
          let body = ''
          req.on('data', (chunk) => {
            body += chunk;
          })

          req.on('end', () => {
            try {
              const requestBody = body ? JSON.parse(body) : {};
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                code: 200,
                data: { date: new Date(), id: 1, name: '测试用户' },
                message: '成功',
                receivedBody: requestBody
              }));
            } catch {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ code: 400, message: '请求体格式错误' }));
            }
          })
          return;
        }
        next();
      })
    }
  },
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
  html: {
    title: 'EventChat',
    tags: (tags, { entryName }) => tags.concat([
      {
        tag: 'html',
        attrs: {
          lang: 'zh-CN',
          'data-entry': entryName,
        }
      },
    ]),
  },
  // 库模式配置（React 库开发）
  output: {
    // externals: ['react', 'react-dom', 'zod'],
    assetPrefix: process.env.NODE_ENV === 'production' ? '/event-chat/' : '/',
    distPath: {
      root: 'dist',
    },
    filename: {
      js: '[name].js'
    },
    sourceMap: true,
  },
  resolve: {
    alias: { '@/': './src' },
  },
  source: {
    entry: {
      iframe: './src/IframeEntry.tsx',
      index: './src/index.tsx', // 你的库主入口文件
    },
  }
});
