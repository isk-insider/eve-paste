import test from "ava";
import { tokenize, lookup, parser } from "../dist/index.js";

const tokenizeTests = [
    {
        title: "inventory-item",
        input: "Platinum	24.647	Moon Materials	Material			1.232,35 m3		None	221.440.478,56 ISK",
        expected: {
            tokenized_items: [
                {
                    type_name: "Platinum",
                    quantity: 24647,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "inventory-item-missing-cols",
        input: "Platinum	1.232,35 m3		None	221.440.478,56 ISK\nPlatinum	221.440.478,56 ISK",
        expected: {
            tokenized_items: [],
            failed_lines: [
                "Platinum	1.232,35 m3		None	221.440.478,56 ISK",
                "Platinum	221.440.478,56 ISK",
            ],
        },
    },
    {
        title: "inventory-unpacked-item",
        input: "10MN Afterburner II		Propulsion Module	Module			5 m3	5	2	2.361.084,25 ISK",
        expected: {
            tokenized_items: [],
            failed_lines: [
                "10MN Afterburner II		Propulsion Module	Module			5 m3	5	2	2.361.084,25 ISK",
            ],
        },
    },
    {
        title: "inventory-used-ammo",
        input: "Aurora S		Advanced Beam Laser Crystal	Charge	Small		1 m3	5	2	77.892,89 ISK",
        expected: {
            tokenized_items: [],
            failed_lines: [
                "Aurora S		Advanced Beam Laser Crystal	Charge	Small		1 m3	5	2	77.892,89 ISK",
            ],
        },
    },
    {
        title: "inventory-assembled-ship",
        input: "Fulanos's Revelation Navy Issue		Dreadnought	Ship			18.500.000 m3	7	1	5.418.428.571,43 ISK",
        expected: {
            tokenized_items: [],
            failed_lines: [
                "Fulanos's Revelation Navy Issue		Dreadnought	Ship			18.500.000 m3	7	1	5.418.428.571,43 ISK",
            ],
        },
    },
    {
        title: "inventory-bpo",
        input: "Antimatter Reactor Unit Blueprint		Construction Component Blueprints			0,01 m3	5.119.396,66 ISK",
        expected: {
            tokenized_items: [
                {
                    type_name: "Antimatter Reactor Unit Blueprint",
                    quantity: 1,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "inventory-bpc",
        input: "Ares Blueprint		Frigate Blueprint			0,01 m3	",
        expected: {
            tokenized_items: [],
            failed_lines: ["Ares Blueprint		Frigate Blueprint			0,01 m3"],
        },
    },
    {
        title: "inventory-formula",
        input: "Axosomatic Neurolink Enhancer Reaction Formula		Molecular-Forged Reaction Formulas	Blueprint			0,01 m3		1	10.000.000,00 ISK",
        expected: {
            tokenized_items: [
                {
                    type_name: "Axosomatic Neurolink Enhancer Reaction Formula",
                    quantity: 1,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "contract-item",
        input: "Batch Compressed Golden Omber	4.187	Omber	Asteroid	",
        expected: {
            tokenized_items: [
                {
                    type_name: "Batch Compressed Golden Omber",
                    quantity: 4187,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "contract-assembled-ship",
        input: " Warrior II	5	Combat Drone	Drone	Drone Bay\nEagle	1	Heavy Assault Cruiser	Ship	",
        expected: {
            tokenized_items: [
                {
                    type_name: "Warrior II",
                    quantity: 5,
                },
                {
                    type_name: "Eagle",
                    quantity: 1,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "contract-bpo",
        input: " Augoror Blueprint	1	Cruiser Blueprint	Blueprint	ORIGINAL BLUEPRINT - Material Efficiency: 6 - Time Efficiency: 12\nSmall Standard Container	1	Cargo Container	Celestial	",
        expected: {
            tokenized_items: [
                {
                    type_name: "Augoror Blueprint",
                    quantity: 1,
                },
                {
                    type_name: "Small Standard Container",
                    quantity: 1,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "contract-bpc",
        input: " Capital Ancillary Remote Armor Repairer Blueprint	1	Remote Armor Repairer Blueprint	Blueprint	BLUEPRINT COPY - Runs: 20 - Material Efficiency: 0 - Time Efficiency: 0\nSmall Standard Container	1	Cargo Container	Celestial	",
        expected: {
            tokenized_items: [
                {
                    type_name: "Small Standard Container",
                    quantity: 1,
                },
            ],
            failed_lines: [
                "Capital Ancillary Remote Armor Repairer Blueprint	1	Remote Armor Repairer Blueprint	Blueprint	BLUEPRINT COPY - Runs: 20 - Material Efficiency: 0 - Time Efficiency: 0",
            ],
        },
    },
    {
        title: "contract-formula",
        input: " Axosomatic Neurolink Enhancer Reaction Formula	1	Molecular-Forged Reaction Formulas	Blueprint			0,01 m3		1	10.000.000,00 ISK",
        expected: {
            tokenized_items: [
                {
                    type_name: "Axosomatic Neurolink Enhancer Reaction Formula",
                    quantity: 1,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "multibuy",
        input: "Co-Processor II	1	964.900,00	964.900,00\nTotal:			964.900,00",
        expected: {
            tokenized_items: [
                {
                    type_name: "Co-Processor II",
                    quantity: 1,
                },
            ],
            failed_lines: ["Total:			964.900,00"],
        },
    },
    {
        title: "brave-moon-ping",
        input: "Cobaltite: 15,828,569 m³\nChromite: 8,115,740 m³\nMonazite: 13,232,691 m³",
        expected: {
            tokenized_items: [
                {
                    type_name: "Cobaltite",
                    volume: 15828569,
                },
                {
                    type_name: "Chromite",
                    volume: 8115740,
                },
                {
                    type_name: "Monazite",
                    volume: 13232691,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "manual-item",
        input: "Tritanium 3269\nCo-Processor II 1\nProton S",
        expected: {
            tokenized_items: [
                {
                    type_name: "Tritanium",
                    quantity: 3269,
                },
                {
                    type_name: "Co-Processor II",
                    quantity: 1,
                },
                {
                    type_name: "Proton S",
                    quantity: 1,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "manual-blueprint",
        input: "Scourge Torpedo Blueprint 1\nExplosive Coating I Blueprint",
        expected: {
            tokenized_items: [],
            failed_lines: [
                "Scourge Torpedo Blueprint 1",
                "Explosive Coating I Blueprint",
            ],
        },
    },
    {
        title: "empty",
        input: "",
        expected: {
            tokenized_items: [],
            failed_lines: [],
        },
    },
];

const lookupTests = [
    {
        title: "item",
        input: "Tritanium",
        expected: {
            type_name: "Tritanium",
            type_id: 34,
            type_volume: 0.01,
        },
    },
    {
        title: "item-name-with-space",
        input: "Overdrive Injector System II",
        expected: {
            type_name: "Overdrive Injector System II",
            type_id: 1236,
            type_volume: 5,
        },
    },
    {
        title: "item-typo",
        input: "Tritaniumm",
        expected: {},
    },
];

const parserTests = [
    {
        title: "inventory-item",
        input: "Platinum	24.647	Moon Materials	Material			1.232,35 m3		None	221.440.478,56 ISK",
        expected: {
            items: [
                {
                    type_name: "Platinum",
                    type_id: 16644,
                    quantity: 24647,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "brave-moon-ping",
        input: "Cobaltite: 15,828,569.1 m³\nChromite: 8,115,740 m³\nMonazite: 13,232,691 m³",
        expected: {
            items: [
                {
                    type_name: "Cobaltite",
                    type_id: 45494,
                    quantity: 1582856,
                },
                {
                    type_name: "Chromite",
                    type_id: 45501,
                    quantity: 811574,
                },
                {
                    type_name: "Monazite",
                    type_id: 45511,
                    quantity: 1323269,
                },
            ],
            failed_lines: [],
        },
    },
    {
        title: "item-typo",
        input: "Tritaniumm",
        expected: {
            items: [],
            failed_lines: ["Tritaniumm"],
        },
    },
];

const tokenizeMacro = test.macro({
    exec(t, input, expected) {
        t.deepEqual(tokenize(input), expected);
    },
    title(providedTitle, input) {
        return "tokenize | " + providedTitle ?? input;
    },
});

const lookupMacro = test.macro({
    exec(t, input, expected) {
        t.deepEqual(lookup(input), expected);
    },
    title(providedTitle, input) {
        return "lookup | " + providedTitle ?? input;
    },
});

const parserMacro = test.macro({
    exec(t, input, expected) {
        t.deepEqual(parser(input), expected);
    },
    title(providedTitle, input) {
        return "parser | " + providedTitle ?? input;
    },
});

tokenizeTests.forEach((test_case) => {
    test(test_case.title, tokenizeMacro, test_case.input, test_case.expected);
});

lookupTests.forEach((test_case) => {
    test(test_case.title, lookupMacro, test_case.input, test_case.expected);
});

parserTests.forEach((test_case) => {
    test(test_case.title, parserMacro, test_case.input, test_case.expected);
});
