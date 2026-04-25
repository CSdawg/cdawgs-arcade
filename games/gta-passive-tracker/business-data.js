/*
  GTA Online passive business tracker data.
  Most values are community/wiki sourced and can be tuned here without touching app.js.
  Unit system:
  - Supply based businesses use supplies 0 to 100 and product units.
  - Nightclub uses crates and has no supply consumption.
  - "productFromFullSupply" is how many product units a 100 supply bar can produce.
*/

window.GTA_BUSINESS_DATA = {
  supplyBusinesses: [
    {
      id: "bunker",
      name: "Bunker",
      group: "Gunrunning",
      productLabel: "Stock",
      maxSupply: 100,
      maxProduct: 100,
      sourceNote: "Bunker values use Disruption Logistics stock units and Los Santos 50 percent sale bonus.",
      upgrades: {
        none: {
          label: "No upgrades",
          minutesPerUnit: 10,
          valueClose: 5000,
          valueFar: 7500,
          productFromFullSupply: 10
        },
        staff: {
          label: "Staff only",
          minutesPerUnit: 8.5,
          valueClose: 6000,
          valueFar: 9000,
          productFromFullSupply: 10
        },
        equipment: {
          label: "Equipment only",
          minutesPerUnit: 8.5,
          valueClose: 6000,
          valueFar: 9000,
          productFromFullSupply: 20
        },
        both: {
          label: "Equipment + Staff",
          minutesPerUnit: 7,
          valueClose: 7000,
          valueFar: 10500,
          productFromFullSupply: 20
        }
      },
      defaultUpgrade: "both"
    },
    {
      id: "acid",
      name: "Acid Lab",
      group: "Los Santos Drug Wars",
      productLabel: "Acid units",
      maxSupply: 100,
      maxProduct: 160,
      sourceNote: "Acid Lab uses 160 product units. Naming acid adds about 5 percent value in game.",
      valueBonusToggle: {
        key: "acidNameBonus",
        label: "Acid product named (+5%)",
        multiplier: 1.05
      },
      upgrades: {
        standard: {
          label: "Standard",
          minutesPerUnit: 2.25,
          valueClose: 1485,
          valueFar: 1485,
          productFromFullSupply: 50
        },
        standardBoost: {
          label: "Standard + daily boost",
          minutesPerUnit: 68 / 60,
          valueClose: 1485,
          valueFar: 1485,
          productFromFullSupply: 50
        },
        equipment: {
          label: "Equipment upgrade",
          minutesPerUnit: 1.5,
          valueClose: 2095,
          valueFar: 2095,
          productFromFullSupply: 50
        },
        equipmentBoost: {
          label: "Equipment + daily boost",
          minutesPerUnit: 0.75,
          valueClose: 2095,
          valueFar: 2095,
          productFromFullSupply: 50
        }
      },
      defaultUpgrade: "equipment"
    },
    {
      id: "cocaine",
      name: "Cocaine Lockup",
      group: "MC Business",
      productLabel: "Stacks",
      maxSupply: 100,
      maxProduct: 10,
      sourceNote: "Fully upgraded product from one full supply bar is 4 stacks. No upgrade supply conversion is estimated, but time and value use published unit values.",
      upgrades: {
        none: {
          label: "No upgrades",
          minutesPerUnit: 50,
          valueClose: 27000,
          valueFar: 40500,
          productFromFullSupply: 2.5,
          estimatedSupply: true
        },
        equipment: {
          label: "Equipment only",
          minutesPerUnit: 40,
          valueClose: 31000,
          valueFar: 46500,
          productFromFullSupply: 4
        },
        both: {
          label: "Equipment + Staff",
          minutesPerUnit: 30,
          valueClose: 35000,
          valueFar: 52500,
          productFromFullSupply: 4
        }
      },
      defaultUpgrade: "both"
    },
    {
      id: "meth",
      name: "Methamphetamine Lab",
      group: "MC Business",
      productLabel: "Bins",
      maxSupply: 100,
      maxProduct: 20,
      sourceNote: "Fully upgraded product from one full supply bar is 8 bins. No upgrade supply conversion is estimated, but time and value use published unit values.",
      upgrades: {
        none: {
          label: "No upgrades",
          minutesPerUnit: 30,
          valueClose: 11475,
          valueFar: 17212.5,
          productFromFullSupply: 5,
          estimatedSupply: true
        },
        equipment: {
          label: "Equipment only",
          minutesPerUnit: 24,
          valueClose: 13175,
          valueFar: 19762.5,
          productFromFullSupply: 8
        },
        both: {
          label: "Equipment + Staff",
          minutesPerUnit: 18,
          valueClose: 14875,
          valueFar: 22312.5,
          productFromFullSupply: 8
        }
      },
      defaultUpgrade: "both"
    },
    {
      id: "cash",
      name: "Counterfeit Cash Factory",
      group: "MC Business",
      productLabel: "Stacks",
      maxSupply: 100,
      maxProduct: 40,
      sourceNote: "Car Wash bonus can be applied from the top option. Fully upgraded product from one full supply bar is 20 stacks.",
      linkedBonus: {
        key: "carWashCashBonus",
        label: "Hands On Car Wash cash boost",
        multiplier: 1.35
      },
      upgrades: {
        none: {
          label: "No upgrades",
          minutesPerUnit: 12,
          valueClose: 4725,
          valueFar: 7087.5,
          productFromFullSupply: 12,
          estimatedSupply: true
        },
        equipment: {
          label: "Equipment only",
          minutesPerUnit: 10,
          valueClose: 5425,
          valueFar: 8137.5,
          productFromFullSupply: 20
        },
        both: {
          label: "Equipment + Staff",
          minutesPerUnit: 8,
          valueClose: 6125,
          valueFar: 9187.5,
          productFromFullSupply: 20
        }
      },
      defaultUpgrade: "both"
    },
    {
      id: "weed",
      name: "Weed Farm",
      group: "MC Business",
      productLabel: "Bundles",
      maxSupply: 100,
      maxProduct: 80,
      sourceNote: "Smoke on the Water bonus can be applied from the top option. Fully upgraded product from one full supply bar is 50 bundles.",
      linkedBonus: {
        key: "smokeWeedBonus",
        label: "Smoke on the Water weed boost",
        multiplier: 1.35
      },
      upgrades: {
        none: {
          label: "No upgrades",
          minutesPerUnit: 6,
          valueClose: 2025,
          valueFar: 3037.5,
          productFromFullSupply: 30,
          estimatedSupply: true
        },
        equipment: {
          label: "Equipment only",
          minutesPerUnit: 5,
          valueClose: 2325,
          valueFar: 3487.5,
          productFromFullSupply: 50
        },
        both: {
          label: "Equipment + Staff",
          minutesPerUnit: 4,
          valueClose: 2625,
          valueFar: 3937.5,
          productFromFullSupply: 50
        }
      },
      defaultUpgrade: "both"
    },
    {
      id: "documents",
      name: "Document Forgery Office",
      group: "MC Business",
      productLabel: "Boxes",
      maxSupply: 100,
      maxProduct: 60,
      sourceNote: "Fully upgraded product from one full supply bar is 50 boxes. No upgrade supply conversion is estimated, but time and value use published unit values.",
      upgrades: {
        none: {
          label: "No upgrades",
          minutesPerUnit: 5,
          valueClose: 1350,
          valueFar: 2025,
          productFromFullSupply: 35,
          estimatedSupply: true
        },
        equipment: {
          label: "Equipment only",
          minutesPerUnit: 4,
          valueClose: 1550,
          valueFar: 2325,
          productFromFullSupply: 50
        },
        both: {
          label: "Equipment + Staff",
          minutesPerUnit: 3,
          valueClose: 1750,
          valueFar: 2625,
          productFromFullSupply: 50
        }
      },
      defaultUpgrade: "both"
    }
  ],

  nightclubGoods: [
    {
      id: "cargo",
      name: "Cargo and Shipments",
      source: "CEO Special Cargo Warehouse or Hangar",
      valuePerCrate: 10000,
      baseMinutesPerCrate: 140,
      minStorage: 10
    },
    {
      id: "sporting",
      name: "Sporting Goods",
      source: "Gunrunning Bunker",
      valuePerCrate: 5000,
      baseMinutesPerCrate: 80,
      minStorage: 20
    },
    {
      id: "southAmerican",
      name: "South American Imports",
      source: "Cocaine Lockup",
      valuePerCrate: 27000,
      baseMinutesPerCrate: 240,
      minStorage: 2
    },
    {
      id: "pharma",
      name: "Pharmaceutical Research",
      source: "Methamphetamine Lab",
      valuePerCrate: 11475,
      baseMinutesPerCrate: 120,
      minStorage: 4
    },
    {
      id: "organic",
      name: "Organic Produce",
      source: "Weed Farm",
      valuePerCrate: 2025,
      baseMinutesPerCrate: 40,
      minStorage: 16
    },
    {
      id: "printing",
      name: "Printing and Copying",
      source: "Document Forgery Office",
      valuePerCrate: 1350,
      baseMinutesPerCrate: 30,
      minStorage: 12
    },
    {
      id: "cashCreation",
      name: "Cash Creation",
      source: "Counterfeit Cash Factory",
      valuePerCrate: 4725,
      baseMinutesPerCrate: 60,
      minStorage: 8
    }
  ]
};
