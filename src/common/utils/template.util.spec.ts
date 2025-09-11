import { renderTemplate } from './template.util';

describe('Template Utility', () => {
  describe('renderTemplate', () => {
    it('should replace multiple template variables', () => {
      const template = 'Hello {{firstName}} {{lastName}} from {{company}}';
      const data = {
        firstName: 'John',
        lastName: 'Doe',
        company: 'Company A',
      };

      const result = renderTemplate(template, data);

      expect(result).toBe('Hello John Doe from Company A');
    });

    it('should handle empty template', () => {
      const template = '';
      const data = { name: 'John' };

      const result = renderTemplate(template, data);

      expect(result).toBe('');
    });
  });
});
