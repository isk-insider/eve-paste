# eve-paste

`eve-paste` is a Node.js library that parses copied and pasted data from [EVE Online](https://www.eveonline.com/).

It was inspired by [evepraisal/evepaste](https://github.com/evepraisal/evepaste) python library but uses a different parsing strategy that makes it a bit more flexible.

## Features

-   Parses inventory items, contracts and multibuy.
-   Excludes Blueprint Copies (BPCs) while parsing Blueprint Originals (BPOs) and Formulas.
-   Supports parsing volume instead of quantity in specific scenarios (**beta**).
-   Integrates an internal lookup table with the latest Static Data Export (SDE) for accurate metadata resolution.

## Install

```sh
npm install eve-paste
```

## Usage

### Example

```ts
import { parser } from "eve-paste";

const result = parser("Tritanium\t1");
console.log(result);
// => {
//      items: [{ type_id: 34, type_name: "Tritanium", quantity: 1 }],
//      failed_lines: []
//    }
```

### Complex Input Example

```ts
const input = `
Tritanium\t1
Pyerite\t50
InvalidLine
Total:\t4,50
`;

const result = parser(input);
console.log(result);
// => {
//      items: [
//        { type_id: 34, type_name: "Tritanium", quantity: 1 },
//        { type_id: 35, type_name: "Pyerite", quantity: 50 }
//      ],
//      failed_lines: ["InvalidLine", "Total:\t4,50"]
//    }
```

## API

### `parser(text_input)`

Parses raw `text_input` into an array of `items`.

#### Returns:

-   `items` (Array): An array of parsed items with the structure:

    ```ts
    {
        "type_id": number,
        "type_name": string,
        "quantity": number
    }
    ```

-   `failedLines` (Array): An array of strings representing lines that could not be parsed.

#### Parameters

-   `text_input` (string): The raw text input to parse, typically copied from EVE Online.

### `tokenize(text_input)`

Splits `text_input` into tokens for further processing.
This method runs internally during `parser` but can be used independently for advanced cases.

#### Returns:

-   `items` (Array): An array of parsed tokens with the structure:

    ```ts
    {
      "type_name": string,
      "quantity"?: number,
      "volume"?: number
    }
    ```

    > `quantity` and `volume` are optional fields and will only be included if they can be inferred from the input data. If neither is parsed, the line will be marked as `failed`.

-   `failed_lines` (Array): Lines that could not be tokenized.

#### Parameters

-   `text_input` (string): The raw text input to parse, typically copied from EVE Online.

### `lookup(type_name)`

Search for metadata associated with a given `type_name`.
This method runs internally during `parser` but can be used independently for advanced cases.

#### Returns:

```ts
{
  "type_name"?: string,
  "type_id"?: number,
  "type_volume"?: number,
}
```

If no match is found, an empty object is returned.

#### Parameters

-   `type_name` (string): The item name to look up.

## Notes

-   The output format aligns with Python-style conventions, making integration with tools like [ESI](https://esi.evetech.net/ui/) or [EveRef](https://docs.everef.net/datasets/) seamless.
