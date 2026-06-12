/**
 * Extra Word → HTML mappings on top of Mammoth defaults.
 * `includeEmbeddedStyleMap` also reads mappings stored inside the .docx.
 */
export const MAMMOTH_EXTRA_STYLE_MAP: string[] = [
  "p[style-name='Title'] => h1:fresh",
  "p[style-name='Subtitle'] => h2.subtitle:fresh",
  "p[style-name='Heading 1'] => h1:fresh",
  "p[style-name='Heading 2'] => h2:fresh",
  "p[style-name='Heading 3'] => h3:fresh",
  "p[style-name='Heading 4'] => h4:fresh",
  "p[style-name='Heading 5'] => h5:fresh",
  "p[style-name='Heading 6'] => h6:fresh",
  "p[style-name='Heading 1 Char'] => h1:fresh",
  "p[style-name='Heading 2 Char'] => h2:fresh",
  "p[style-name='Heading 3 Char'] => h3:fresh",
  "p[style-name='Quote'] => blockquote:fresh",
  "p[style-name='Intense Quote'] => blockquote.intense:fresh",
  "p[style-name='Caption'] => p.caption:fresh",
  "p[style-name='TOC Heading'] => h2.toc:fresh",
  "p[style-name='List Paragraph'] => p.list-paragraph:fresh",
  "p[style-name='No Spacing'] => p.no-spacing:fresh",
  /* Body / Normal variants (fixes “Unrecognised paragraph style: Body Text 2”) */
  "p[style-name='Normal'] => p:fresh",
  "p[style-name='Normal (Web)'] => p:fresh",
  "p[style-name='Normal Web'] => p:fresh",
  "p[style-name='Body Text'] => p.body-text:fresh",
  "p[style-name='Body Text 2'] => p.body-text-2:fresh",
  "p[style-name='Body Text 3'] => p.body-text-3:fresh",
  "p[style-name='Plain Text'] => p.plain-text:fresh",
  "r[style-name='Strong'] => strong",
  "r[style-name='Emphasis'] => em",
  "table => table",
];
