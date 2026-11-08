import { Mark, mergeAttributes } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Fragment, Slice, Node as ProseMirrorNode } from "@tiptap/pm/model";

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

  inclusive: true,
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

    const createAuthorMark = () =>
      markType.create({
        authorId: options.authorId,
        authorName: options.authorName,
        color: options.authorColor,
      });

    const applyMarkToFragment = (fragment: Fragment): Fragment => {
      const authorMark = createAuthorMark();
      const nodes: ProseMirrorNode[] = [];

      fragment.forEach((node) => {
        if (node.isText) {
          const cleanMarks = node.marks.filter((m) => m.type !== markType);
          nodes.push(node.mark([...cleanMarks, authorMark]));
        } else {
          nodes.push(node.copy(applyMarkToFragment(node.content)));
        }
      });

      return Fragment.fromArray(nodes);
    };

    return [
      new Plugin({
        key: pluginKey,
        props: {
          handleTextInput(view, from, to, text) {
            const { state, dispatch } = view;
            const authorMark = createAuthorMark();

            const tr = state.tr.insertText(text, from, to);
            tr.addMark(from, from + text.length, authorMark);

            dispatch(tr);
            return true;
          },

          transformPasted(slice) {
            return new Slice(
              applyMarkToFragment(slice.content),
              slice.openStart,
              slice.openEnd
            );
          },
        },
      }),
    ];
  },
});