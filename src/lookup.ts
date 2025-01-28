import { lookupTable } from "./lookup-table.js";

export interface LookupResult {
    type_name?: string;
    type_id?: number;
    type_volume?: number;
}

export function lookup(typeName: string): LookupResult {
    const index = lookupTable.type_name.findIndex(
        (type_name) => type_name.toLowerCase() === typeName.toLowerCase()
    );

    if (index === -1) {
        return {};
    }

    return {
        type_name: typeName,
        type_id: lookupTable.type_id[index],
        type_volume: lookupTable.type_volume[index],
    };
}
