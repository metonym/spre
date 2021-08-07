import { PreprocessorGroup } from "svelte/types/compiler/preprocess";
import { walk, parse } from "svelte/compiler";
import MagicString from "magic-string";

type MaybeString = undefined | null | string;

interface SpreOptions {
  onImportDeclaration?: (params: {
    sourceName: string;
    importName?: string;
    localName: string;
    isDefaultImport: boolean;
    isNamespaceImport: boolean;
  }) => MaybeString;
}

export function spre(options?: SpreOptions): Pick<PreprocessorGroup, "script"> {
  const onImportDeclaration = options?.onImportDeclaration;

  return {
    script({ content, filename }) {
      if (!filename || /node_modules/.test(filename)) return { code: content };

      const source = `<script>${content}</script>`;
      const ast = parse(source);
      const s = new MagicString(source);

      walk(ast, {
        enter(node: any) {
          if (
            node.type === "ImportDeclaration" &&
            typeof onImportDeclaration === "function"
          ) {
            const sourceName = node.source.value;
            const result: MaybeString[] = node.specifiers
              .map((specifier: any) => {
                return onImportDeclaration.call(this, {
                  sourceName,
                  importName: specifier.imported?.name,
                  localName: specifier.local.name,
                  isDefaultImport: specifier.type === "ImportDefaultSpecifier",
                  isNamespaceImport:
                    specifier.type === "ImportNamespaceSpecifier",
                });
              })
              .filter(Boolean)
              .join("");

            if (typeof result === "string") {
              s.overwrite(node.start, node.end, result);
            }
          }
        },
      });

      s.trimStart("<script>");
      s.trimEnd("</script>");

      return {
        code: s.toString(),
        map: s.generateMap({ file: filename, includeContent: true }).toString(),
      };
    },
  };
}
