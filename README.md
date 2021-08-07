# spre

> Svelte preprocessing utilities

## Installation

**Yarn**

```sh
yarn add -D spre
```

**NPM**

```sh
npm i -D spre
```

## Usage

### onImportDeclaration

Use `onImportDeclaration` to re-write imports in the script block.

```diff
- import { Ad as Ad2 } from "svelte-lib";
- import { Bridge } from "svelte-lib";
+ import Ad2 from "svelte-lib/lib/Ad.svelte";
+ import Bridge from "svelte-lib/lib/Bridge.svelte";
```

```js
// svelte.config.js
import spre from "spre";

export default {
  preprocess: [
    spre({
      onImportDeclaration({ sourceName, importName, localName }) {
        return `import ${localName} from "${sourceName}/lib/${importName}.svelte";`;
      },
    }),
  ],
};
```

Example that only re-writes non-default and not namespaced imports from a specific library:

```js
spre({
  onImportDeclaration({ sourceName, importName, localName }) {
    if (sourceName !== "svelte-lib") return;
    if (isDefaultImport || !importName) return;
    return `import ${localName} from "${sourceName}/lib/${importName}.svelte";`;
  },
}),
```

## License

[MIT](LICENSE)
