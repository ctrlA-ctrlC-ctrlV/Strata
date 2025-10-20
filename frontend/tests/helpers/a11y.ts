// axe-core helper placeholder (wire into Playwright when pages exist)
import axe from 'axe-core';

export async function runAxe(page: any) {
  // In real usage, inject axe script and run on the page
  await page.addScriptTag({ content: axe.source });
  const results = await page.evaluate(async () => {
    // @ts-ignore
    return await axe.run(document, { runOnly: ['wcag2a', 'wcag2aa'] });
  });
  return results;
}
