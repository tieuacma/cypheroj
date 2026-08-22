import { marked } from "marked";
import katex from "katex";

export function renderMarkdownAndMath(text: string): string {
  if (!text) return "";

  // 1. Extract block math $$ ... $$ or \[ ... \]
  const blockMath: string[] = [];
  let parsedText = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    const placeholder = `BLOCKMATHPLACEHOLDER${blockMath.length}`;
    blockMath.push(math.trim());
    return placeholder;
  });

  parsedText = parsedText.replace(/\\\[([\s\S]+?)\\\]/g, (_, math) => {
    const placeholder = `BLOCKMATHPLACEHOLDER${blockMath.length}`;
    blockMath.push(math.trim());
    return placeholder;
  });

  // 2. Extract inline math $ ... $ or \( ... \)
  const inlineMath: string[] = [];
  parsedText = parsedText.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    const placeholder = `INLINEMATHPLACEHOLDER${inlineMath.length}`;
    inlineMath.push(math.trim());
    return placeholder;
  });

  parsedText = parsedText.replace(/\\\(([\s\S]+?)\\\)/g, (_, math) => {
    const placeholder = `INLINEMATHPLACEHOLDER${inlineMath.length}`;
    inlineMath.push(math.trim());
    return placeholder;
  });

  // 3. Render Markdown
  let html = "";
  try {
    html = marked.parse(parsedText, { async: false }) as string;
  } catch (err) {
    console.error("Markdown parse error:", err);
    html = parsedText;
  }

  // 4. Restore and render block math
  blockMath.forEach((math, index) => {
    try {
      const mathHtml = katex.renderToString(math, {
        displayMode: true,
        throwOnError: false,
      });
      const paragraphWrapped = `<p>BLOCKMATHPLACEHOLDER${index}</p>`;
      if (html.includes(paragraphWrapped)) {
        html = html.replace(paragraphWrapped, mathHtml);
      } else {
        html = html.replace(`BLOCKMATHPLACEHOLDER${index}`, mathHtml);
      }
    } catch {
      const errorWrapped = `<p>BLOCKMATHPLACEHOLDER${index}</p>`;
      const errorHtml = `<span class="text-red-500 font-mono">${math}</span>`;
      if (html.includes(errorWrapped)) {
        html = html.replace(errorWrapped, errorHtml);
      } else {
        html = html.replace(`BLOCKMATHPLACEHOLDER${index}`, errorHtml);
      }
    }
  });

  // 5. Restore and render inline math
  inlineMath.forEach((math, index) => {
    try {
      const mathHtml = katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
      });
      html = html.replace(`INLINEMATHPLACEHOLDER${index}`, mathHtml);
    } catch {
      html = html.replace(
        `INLINEMATHPLACEHOLDER${index}`,
        `<span class="text-red-500 font-mono">${math}</span>`
      );
    }
  });

  return html;
}
