# eve-paste

`eve-paste` is a Node.js library that parses copied and pasted data from [EVE Online](https://www.eveonline.com/).

It was inspired by [evepraisal/evepaste](https://github.com/evepraisal/evepaste) python library but uses a different parsing strategy that makes it a bit more flexible.

## Features

### Features

-   **Lightweight and Dependency-Free**  
    A minimal, efficient library with **zero dependencies**, ensuring fast performance and easy integration into any project.

-   **Comprehensive Parsing Capabilities**  
    Handles multiple data types from EVE Online, including:

    -   Inventory
    -   Personal Assets
    -   Contracts
    -   Multibuy

-   **Blueprint Handling**  
    Automatically excludes **Blueprint Copies (BPCs)**, while parsing **Blueprint Originals (BPOs)** and **Formulas**.

-   **Static Data Export (SDE)**  
    Seamlessly integrates [fuzzwork's SDE](https://www.fuzzwork.co.uk/) for metadata resolution.

## Install

```sh
npm i @isk-insider/eve-paste
```

## Usage

### Example

```ts
import { parser } from "@isk-insider/eve-paste";

const result = parser("Tritanium\t1");
console.log(result);
// => {
//      items: [{ type_id: 34, type_name: "Tritanium", quantity: 1 }],
//      failed_lines: []
//    }
```

## API

### `parser(text_input)`

Parses raw `text_input` into an array of `items`.

```ts
const input = "Tritanium\t1\nPyerite\t50\nInvalidLine\nTotal:\t4,50";
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

```ts
const input = "Tritanium\t1\nPyerite\t50\nChromite: 1,200 m³\nTotal:\t4,50";
const result = tokenize(input);

console.log(result);
// => {
//      tokenized_items: [
//        { type_name: "Tritanium", quantity: 1 },
//        { type_name: "Pyerite", quantity: 50 },
//        { type_name: "Chromite", volume: 1200 },
//      ],
//      failed_lines: ["Total:\t4,50"]
//    }
```

The function performs a **best-effort** parsing by matching patterns from common scenarios. While it may not always achieve perfect accuracy by itself, it remains practical for the following use cases:

-   **Preprocessing Data**: Use this function to preprocess raw text data into structured tokens before further processing or querying.

-   **Low-Latency Applications**: When querying a database for appraisal data, you can bypass the additional lookup process performed by `eve-paste` and directly use the inferred `type_name`. This approach is particularly useful in low-latency applications.

#### Returns:

-   `tokenized_items` (Array): An array of parsed tokens with the structure:

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

Search for metadata associated with a given `type_name` in the [invTypes](https://www.fuzzwork.co.uk/dump/) SDE.
This method is used internally by the `parser` but can also be invoked independently for advanced use cases.

The lookup table can be quite large (~1.4 MB), as it includes all **published** items from EVE Online.

```ts
const typeName = "tritanium";
const result = lookup(typeName);

console.log(result);
// => { type_name: "Tritanium", type_id: 34, type_volume: 0.01 }
```

#### Returns:

```ts
{
  "type_name"?: string,
  "type_id"?: number,
  "type_volume"?: number, // repackaged volume of each unit (m³)
}
```

If no match is found, an empty object is returned.

#### Parameters

-   `type_name` (string): The item name to look up.

## Notes

-   The output format aligns with Python-style conventions, making integration with tools like [ESI](https://esi.evetech.net/ui/) or [EveRef](https://docs.everef.net/datasets/) seamless.
