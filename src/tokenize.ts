export interface ItemTokens {
    type_name: string;
    quantity?: number;
    volume?: number;
}

export interface TokenizationResult {
    tokenized_items: ItemTokens[];
    failed_lines: string[];
}

export function tokenize(rawText: string): TokenizationResult {
    // Parsers should be ordered from most specific to least specific
    const tokenizers = [
        inventoryOrContract, // should always be first
        braveMoonPing,
        manualEntryItem,
    ];

    const tokenizedResult = rawText.split(/\r?\n/).reduce(
        (acc_result, line) => {
            const line_trimmed = line.trim();
            let tokenized = null;

            for (const parser of tokenizers) {
                tokenized = parser(line_trimmed);
                if (tokenized !== null) {
                    break;
                }
            }

            if (tokenized !== null) {
                acc_result.tokenized_items.push(tokenized);
            } else {
                acc_result.failed_lines.push(line_trimmed);
            }

            return acc_result;
        },
        {
            tokenized_items: [] as ItemTokens[],
            failed_lines: [] as string[],
        }
    );

    return tokenizedResult;
}

function inventoryOrContract(line: string) {
    const fields = line.split(/\t/);

    if (fields.length < 2) {
        return null;
    }

    let [type_name, quantity] = fields;
    quantity = quantity.replace(/\./g, ""); // remove thousand separators for convenience

    // if type_name has no letters or is multibuy's totals
    if (!/[A-Za-z]/.test(type_name) || type_name.startsWith("Total:")) {
        return null;
    }

    // if the item is a Blueprint or a Formula
    if (type_name.includes("Blueprint") || type_name.includes("Formula")) {
        if (
            !fields[fields.length - 1].includes(" ISK") &&
            !line.includes("ORIGINAL BLUEPRINT")
        ) {
            return null;
        }

        if (quantity === "") {
            quantity = "1";
        }
    }

    // if quantity contains a comma or is not an integer
    if (quantity.includes(",") || !/^\d+$/.test(quantity)) {
        return null;
    }

    return {
        type_name,
        quantity: parseInt(quantity, 10),
    };
}

function braveMoonPing(line: string) {
    const fields = line.split(" ");

    if (fields.length < 3) {
        return null;
    }

    let [type_name, volume, unit] = fields;
    type_name = type_name.replace(":", ""); // remove eventual colon
    volume = volume.replace(/,/g, ""); // remove thousand separators for convenience

    // if type_name has no letters
    if (!/[A-Za-z]/.test(type_name)) {
        return null;
    }

    // if volume is not a number
    if (Number.isNaN(Number(volume))) {
        return null;
    }

    // if unit is not cubic meters
    const validUnits = new Set(["m³", "m3"]);
    if (!validUnits.has(unit)) {
        return null;
    }

    return {
        type_name,
        volume: parseFloat(volume),
    };
}

function manualEntryItem(line: string) {
    // if is a tab-separated it is not considered a manual entry
    if (line.includes("\t")) {
        return null;
    }

    // if the item is a Blueprint (we cant differentiate bpo from bpc)
    if (line.includes("Blueprint")) {
        return null;
    }

    const lastSpaceIndex = line.lastIndexOf(" ");
    const type_name = line.substring(0, lastSpaceIndex);
    const quantity = line.substring(lastSpaceIndex + 1);

    // if type_name has no letters
    if (!/[A-Za-z]/.test(line) && !/[A-Za-z]/.test(type_name)) {
        return null;
    }

    // if quantity does not contains a comma and is an integer
    if (!quantity.includes(",") && /^\d+$/.test(quantity)) {
        return {
            type_name,
            quantity: parseInt(quantity, 10),
        };
    }

    return {
        type_name: line,
        quantity: 1,
    };
}
