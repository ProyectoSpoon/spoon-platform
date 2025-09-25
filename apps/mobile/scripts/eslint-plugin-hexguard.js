/**
 * ESLint custom rule: disallow raw hex color literals outside allowed paths.
 */
module.exports = {
  rules: {
    'no-raw-hex': {
      meta: {
        type: 'suggestion',
        docs: { description: 'Disallow raw hex color literals outside design system' },
        schema: [
          {
            type: 'object',
            properties: {
              allowInPaths: { type: 'array', items: { type: 'string' } },
              pattern: { type: 'string' },
              message: { type: 'string' }
            },
            additionalProperties: false
          }
        ]
      },
      create(context) {
        const options = context.options[0] || {};
        const allowIn = options.allowInPaths || [];
        const pattern = new RegExp(options.pattern || '#(?:[0-9a-fA-F]{3}){1,2}');
        const message = options.message || 'Avoid raw hex color, use design system tokens';
        const filename = context.getFilename().replace(/\\/g, '/');
        const isAllowed = allowIn.some(p => filename.includes(p));
        if (isAllowed) return {};
        return {
          Literal(node) {
            if (typeof node.value === 'string' && pattern.test(node.value)) {
              context.report({ node, message });
            }
          },
          TemplateElement(node) {
            const text = node.value && node.value.raw;
            if (text && pattern.test(text)) {
              context.report({ node, message });
            }
          }
        };
      }
    }
  }
};
