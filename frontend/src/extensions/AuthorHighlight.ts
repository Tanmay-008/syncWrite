import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { ySyncPluginKey } from "@tiptap/y-tiptap";

export interface AuthorHighlightOptions {
  authorId: string;
  authorName: string;
  authorColor: string;
  HTMLAttributes: Record<string, any>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    authorHighlight: {
      setAuthorHighlight: (attributes: {
        authorId: string;
        authorName: string;
        authorColor: string;
      }) => ReturnType;
      unsetAuthorHighlight: () => ReturnType;
    };
  }
}

export const AuthorHighlight = Mark.create<AuthorHighlightOptions>({
  name: "authorHighlight",

  inclusive: false,
  excludes: "authorHighlight",

  addOptions() {
    return {
      authorId: "anonymous",
      authorName: "Collaborator",
      authorColor: "#6366f1",
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      authorId: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-author-id"),
        renderHTML: (attributes) => {
          if (!attributes.authorId) return {};
          return { "data-author-id": attributes.authorId };
        },
      },
      authorName: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-author-name"),
        renderHTML: (attributes) => {
          if (!attributes.authorName) return {};
          return {
            "data-author-name": attributes.authorName,
            title: `Written by ${attributes.authorName}`,
          };
        },
      },
      color: {
        default: "#6366f1",
        parseHTML: (element) => element.getAttribute("data-color"),
        renderHTML: (attributes) => {
          const color = attributes.color || "#6366f1";
          return {
            "data-color": color,
            style: `background-color: ${color}24; border-bottom: 2px solid ${color}; border-radius: 2px; padding: 0 1px;`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "span[data-author-id]",
        getAttrs: (element) => {
          const el = element as HTMLElement;
          return {
            authorId: el.getAttribute("data-author-id"),
            authorName: el.getAttribute("data-author-name"),
            color: el.getAttribute("data-color"),
          };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        class: "author-highlight",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAuthorHighlight:
        (attributes) =>
          ({ commands }) => {
            return commands.setMark(this.name, {
              authorId: attributes.authorId,
              authorName: attributes.authorName,
              color: attributes.authorColor,
            });
          },
      unsetAuthorHighlight:
        () =>
          ({ commands }) => {
            return commands.unsetMark(this.name);
          },
    };
  },

  addProseMirrorPlugins() {
    const markType = this.type;
    const options = this.options;
    const pluginKey = new PluginKey("authorHighlightPlugin");

    return [
      new Plugin({
        key: pluginKey,
        appendTransaction(transactions, _oldState, newState) {
          const docChanged = transactions.some((tr) => tr.docChanged);
          if (!docChanged) return null;

          if (transactions.some((tr) => tr.getMeta("authorHighlightApplied"))) {
            return null;
          }

          const isRemote = transactions.some(
            (tr) =>
              !!tr.getMeta(ySyncPluginKey) ||
              !!tr.getMeta("y-sync$") ||
              !!tr.getMeta("history$")
          );
          if (isRemote) return null;

          const tr = newState.tr;
          let hasChanges = false;

          const authorMark = markType.create({
            authorId: options.authorId,
            authorName: options.authorName,
            color: options.authorColor,
          });

          transactions.forEach((transaction) => {
            if (!transaction.docChanged) return;

            transaction.steps.forEach((step, stepIndex) => {
              const stepMap = step.getMap();
              const mappingAfterStep = transaction.mapping.slice(stepIndex + 1);

              stepMap.forEach((_oldStart, _oldEnd, newStart, newEnd) => {
                const mappedStart = mappingAfterStep.map(newStart, -1);
                const mappedEnd = mappingAfterStep.map(newEnd, 1);

                if (mappedEnd > mappedStart) {
                  newState.doc.nodesBetween(mappedStart, mappedEnd, (node, pos) => {
                    if (node.isText) {
                      const from = Math.max(mappedStart, pos);
                      const to = Math.min(mappedEnd, pos + node.nodeSize);
                      if (from < to) {
                        const hasExactMark = node.marks.some(
                          (m) =>
                            m.type === markType &&
                            m.attrs.authorId === options.authorId &&
                            m.attrs.color === options.authorColor
                        );

                        if (!hasExactMark) {
                          tr.removeMark(from, to, markType);
                          tr.addMark(from, to, authorMark);
                          hasChanges = true;
                        }
                      }
                    }
                  });
                }
              });
            });
          });

          if (hasChanges) {
            tr.setMeta("authorHighlightApplied", true);
            tr.setMeta("addToHistory", false);
            return tr;
          }

          return null;
        },
      }),
    ];
  },
});