import { marked } from 'marked';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

// Configure marked with custom highlight and link rendering
marked.setOptions({
  breaks: true,
  gfm: true,
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (e) {
        console.error(e);
      }
    }
    return hljs.highlightAuto(code).value;
  }
});

// Configure DOMPurify hook to ensure links open safely in a new tab with noopener
if (typeof window !== 'undefined' && DOMPurify.addHook) {
  DOMPurify.addHook('afterSanitizeAttributes', function (node) {
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

export const renderMarkdown = (text) => {
  if (!text) return '';
  try {
    const rawHtml = marked.parse(text);
    return DOMPurify.sanitize(rawHtml, {
      USE_PROFILES: { html: true },
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'src', 'alt', 'title', 'width', 'height', 'align'],
      ADD_ATTR: ['target', 'rel']
    });
  } catch (e) {
    console.error('Error rendering markdown', e);
    return DOMPurify.sanitize(text);
  }
};

