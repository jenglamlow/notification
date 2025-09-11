export function renderTemplate(
  template: string,
  data: Record<string, any>,
): string {
  let rendered = template;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, data[key]);
  }
  return rendered;
}
