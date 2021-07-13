
import path from 'path';
import fs from 'fs';
import { Plugin } from 'vite';
import _ from 'lodash';

export function symlinkIndexHtml(options: {
  template: string
  templateDate?: Record<string, unknown>
  entry?: string
}): Plugin {
  const rootIndexHtml = path.join(process.cwd(), 'index.html');

  if (!fs.existsSync(rootIndexHtml)) {
    // Ensure the index.html exists in root directory.
    fs.symlinkSync(options.template, rootIndexHtml);
  }

  return {
    name: '草鞋没号:transformIndexHtml',
    transformIndexHtml(html) {
      let indexHtml = html;
      const entry = options.entry || '/src/main.js';
      
      try {
        const compiled = _.template(indexHtml, { interpolate: /<%=([\s\S]+?)%>/g })

        indexHtml = compiled(options.templateDate);

        indexHtml = indexHtml.split('\n')
        .map(line => line.includes('</body>')
          ? `    <script type="module" src="${entry}"></script>
    ${line}`
          : line
        )
        .join('\n');
      } catch (error) {
        indexHtml = `<h2>${error}</h2>`;
      }

      return indexHtml;
    },
  };
}
