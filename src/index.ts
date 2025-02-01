import { lookup } from "./lookup.js";
import { TokenizationResult, tokenize } from "./tokenize.js";

export interface Item {
    type_id: number;
    type_name: string;
    quantity: number;
}

export interface ParsingResult {
    parsedItems: Item[];
    failed_lines: string[];
}

function parser(rawText: string) {
    const { tokenized_items, failed_lines }: TokenizationResult =
        tokenize(rawText);

    const parsedItems: Item[] = tokenized_items
        .map((item) => {
            const { type_name, quantity, volume } = item;
            const {
                type_id,
                type_volume,
                type_name: lookup_type_name,
            } = lookup(type_name);

            if (!type_id) {
                failed_lines.push(type_name);
                return;
            }

            return {
                type_id,
                type_name: lookup_type_name,
                quantity:
                    Number(quantity ?? 0) +
                    Math.floor(Number(volume ?? 0) / Number(type_volume ?? 1)),
            };
        })
        .filter((item): item is Item => item != undefined && item != null);

    return { items: parsedItems, failed_lines };
}

export { lookup, parser, tokenize };
