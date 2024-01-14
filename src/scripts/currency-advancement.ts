import type { DataSchema } from "./types/foundry";

export interface ICurrencyAdvancementData {
  cp: number;
  ep: number;
  gp: number;
  pp: number;
  sp: number;
}

class CurrencyAdvancementData extends foundry.abstract.DataModel<ICurrencyAdvancementData, Item> {
  
  public static defineSchema(): DataSchema {
    const schema: DataSchema = {};

    for (const currency of Object.keys((CONFIG as any).DND5E.currencies)) {
      schema[currency] = new foundry.data.fields.NumberField({
          integer: true,
          min: 0,
          initial: 0,
          label: `DND5E.Currency${currency.toUpperCase()}`,
          // hint: "DND5E.AdvancementAbilityScoreImprovementPointsHint",
      });
    }

    return schema;
  }

}

export class CurrencyAdvancement extends dnd5e.documents.advancement.Advancement {

  static get metadata() {
    return foundry.utils.mergeObject(super.metadata, {
      dataModels: {
        configuration: CurrencyAdvancementData,
        value: CurrencyAdvancementData,
      },
      icon: "icons/commodities/currency/coins-assorted-mix-copper-silver-gold.webp",
      title: game.i18n.localize("DND5E.Currency"),
      hint: '0 ' + game.i18n.localize("DND5E.CurrencyGP"),
      validItemTypes: new Set(["background", "class", "race"]),
      apps: {
        // config: CurrencyAdvancementConfig,
        // flow: CurrencyAdvancementFlow,
      },
    });
  }
  
}