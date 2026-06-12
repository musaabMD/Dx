import Paragraph from "@tiptap/extension-paragraph";
import Heading from "@tiptap/extension-heading";
import Blockquote from "@tiptap/extension-blockquote";
import {
  Table,
  TableRow,
  TableCell,
  TableHeader,
} from "@tiptap/extension-table";
import { Node } from "@tiptap/core";

function preservedAttrs() {
  return {
    style: {
      default: null as string | null,
      parseHTML: (element: HTMLElement) => element.getAttribute("style"),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (!attributes.style) return {};
        return { style: attributes.style as string };
      },
    },
    class: {
      default: null as string | null,
      parseHTML: (element: HTMLElement) => element.getAttribute("class"),
      renderHTML: (attributes: Record<string, unknown>) => {
        if (!attributes.class) return {};
        return { class: attributes.class as string };
      },
    },
  };
}

/** Paragraphs keep Word/Mammoth inline layout (margins, alignment, etc.). */
export const ImportParagraph = Paragraph.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedAttrs(),
    };
  },
});

export const ImportHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedAttrs(),
    };
  },
});

export const ImportBlockquote = Blockquote.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedAttrs(),
    };
  },
});

export const ImportTableCell = TableCell.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedAttrs(),
    };
  },
});

export const ImportTableHeader = TableHeader.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedAttrs(),
    };
  },
});

export const ImportTable = Table.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedAttrs(),
    };
  },
});

export const ImportTableRow = TableRow.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ...preservedAttrs(),
    };
  },
});

/** Visual “next page” separator (gray gutter) inside the paper column. */
export const PageCut = Node.create({
  name: "pageCut",
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,

  parseHTML() {
    return [{ tag: 'div[data-lnkdoc-page-cut="1"]' }];
  },

  renderHTML() {
    return [
      "div",
      {
        "data-lnkdoc-page-cut": "1",
        class: "lnkdoc-page-cut",
        contenteditable: "false",
      },
    ];
  },

});
