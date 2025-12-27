const ignoreList = ['packages/ignore-package', 'config.ts', '.d.ts'];

module.exports = {
  // 匹配所有子包的 js/ts 文件，执行 eslint
  'packages/**/src/**/*.{js,ts,jsx,tsx}': 'eslint --fix --config ./eslint.config.ts',
  // 匹配所有子包的样式文件，执行 stylelint
  'packages/**/*.{css,less,scss}': 'stylelint --fix',
  // 可选：格式化文件
  '**/*.{js,ts,jsx,tsx,json,md}': 'prettier --write',
  // 排除 packages/ignore-package 目录
  'packages/**/*.{js,ts}': (filenames) => {
    const filtered = filenames.filter(
      (file) => !ignoreList.some((item) => file.indexOf(item) >= -1)
    );
    return filtered.length ? `eslint --fix ${filtered.join(' ')}` : [];
  },
};
