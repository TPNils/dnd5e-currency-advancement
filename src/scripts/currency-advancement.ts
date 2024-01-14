import { CurrencyAdvancementConfig } from "./currency-advancement-config.js";
import { CurrencyAdvancementFlow } from "./currency-advancement-flow.js";
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

export class CurrencyAdvancement extends dnd5e.documents.advancement.Advancement<ICurrencyAdvancementData, ICurrencyAdvancementData> {

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
        config: CurrencyAdvancementConfig,
        flow: CurrencyAdvancementFlow,
      },
    });
  }

  /** @inheritdoc */
  public summaryForLevel(level: number, options: {configMode?: boolean} = {}): string {
    const summaryParts = new Set<string>();
    for (const currency of CurrencyAdvancementConfig.getCurrencies()) {
      if (this.configuration[currency.key] > 0) {
        summaryParts.add(`${this.configuration[currency.key]} ${currency.label}`);
      }
    }
    if (summaryParts.size === 0) {
      summaryParts.add(`0 ${dnd5e.config.currencies.gp.label}`);
    }
    return dnd5e.documents.Trait.localizedList({grants: summaryParts})
  }

  /** @inheritdoc */
  public async apply(level: number, flowFormData: {skip: boolean}): Promise<void> {
    const actorUpdate = deepClone((this.actor as any).system.currency);
    const advancementUpdate = deepClone(this.value);
    if (!flowFormData.skip) {
      for (const currencyKey in this.configuration) {
        actorUpdate[currencyKey] += this.configuration[currencyKey];
        advancementUpdate[currencyKey] += this.configuration[currencyKey];
      }
    }
    (this.actor as any as foundry.abstract.DataModel).updateSource({system: {currency: actorUpdate}});
    this.updateSource({value: advancementUpdate});
  }

  /** @inheritdoc */
  public async restore(level: number, reverseData: any): Promise<void> {
    this.apply(level, reverseData);
  }

  /** @inheritdoc */
  public async reverse(level: number): Promise<object> {
    const actorUpdate = deepClone((this.actor as any).system.currency);
    const advancementUpdate = deepClone(this.value);
    for (const currencyKey in this.value) {
      const newTotal = Math.max(0, actorUpdate[currencyKey] - this.value[currencyKey]);
      advancementUpdate[currencyKey] = actorUpdate[currencyKey] - newTotal;
      actorUpdate[currencyKey] = newTotal;
    }
    (this.actor as any as foundry.abstract.DataModel).updateSource({system: {currency: actorUpdate}});
    this.updateSource({value: advancementUpdate})
    return advancementUpdate;
  }
  
}