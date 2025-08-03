import { CurrencyAdvancementConfig } from "./currency-advancement-config.js";
import { CurrencyAdvancementFlow } from "./currency-advancement-flow.js";
import { AdvancementData } from "./types/dnd5e.js";
import type { DataSchema } from "./types/foundry";
import { Version } from "./version.js";

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

export class CurrencyAdvancement extends dnd5e.documents.advancement.Advancement<Partial<ICurrencyAdvancementData>, Partial<ICurrencyAdvancementData>> {

  static get metadata(): typeof dnd5e.documents.advancement.Advancement['metadata'] {
    return foundry.utils.mergeObject(super.metadata, {
      dataModels: {
        configuration: CurrencyAdvancementData,
        value: CurrencyAdvancementData,
      },
      icon: "icons/commodities/currency/coins-assorted-mix-copper-silver-gold.webp",
      title: game.i18n.localize("DND5E.Currency"),
      // hint: '0 ' + game.i18n.localize("DND5E.CurrencyGP"),
      validItemTypes: new Set(["background", "class", "race"]),
      apps: {
        config: CurrencyAdvancementConfig,
        flow: CurrencyAdvancementFlow,
      },
    });
  }

  public static autoDetectCurrencies(description: string): ICurrencyAdvancementData {
    const data: ICurrencyAdvancementData = {
      cp: 0,
      ep: 0,
      gp: 0,
      pp: 0,
      sp: 0,
    }
    
    if (!description) {
      return data;
    }
    
      // crude but simple way to search per line
      description = description.replace(/<\\p>|<br\\?>/ig, '\n');

      let match: RegExpExecArray;
      for (const [key, currency] of Object.entries(dnd5e.config.currencies)) {
        const rgx = new RegExp(`(?<=Equipment:.*?)([0-9]+)\\s*(?:${currency.abbreviation}|${key})`, 'gi');
        while (match = rgx.exec(description)) {
          data[key] += Number(match[1]);
        }
      }

    return data;
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
    const actorUpdate: Record<string, number> = {};
    const advancementUpdate: Partial<ICurrencyAdvancementData> = {};
    if (!flowFormData.skip) {
      for (const currencyKey in this.configuration) {
        actorUpdate[currencyKey] = (this.actor as any).system.currency[currencyKey] + this.configuration[currencyKey];
        advancementUpdate[currencyKey] = this.value[currencyKey] + this.configuration[currencyKey];
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
    const actorUpdate: Record<string, number> = {};
    const advancementUpdate: Record<string, number> = {};
    for (const currencyKey in this.value) {
      const current = (this.actor as any).system.currency[currencyKey];
      const newTotal = Math.max(0, current - this.value[currencyKey]);
      advancementUpdate[currencyKey] = current - newTotal;
      actorUpdate[currencyKey] = newTotal;
    }
    (this.actor as any as foundry.abstract.DataModel).updateSource({system: {currency: actorUpdate}});
    this.updateSource({value: advancementUpdate})
    return advancementUpdate;
  }
  
}

Hooks.on('preUpdateItem', (oldDocument: any, updateData: any, options: object) => {
  const oldAdvancements = new Map<string, AdvancementData>();

  for (const advancement of oldDocument._source.system.advancement ?? []) {
    oldAdvancements.set(advancement._id, advancement);
  }

  advancementLoop: for (const advancement of (updateData.system?.advancement as AdvancementData[]) ?? []) {
    if (oldAdvancements.has(advancement._id)) {
      continue;
    }
    if (advancement.type !== CurrencyAdvancement.typeName) {
      continue;
    }
    for (const key of Object.keys(dnd5e.config.currencies)) {
      // Was configured during create
      if (advancement.configuration[key] !== 0) {
        continue advancementLoop;
      }
    }
    
    advancement.configuration = CurrencyAdvancement.autoDetectCurrencies(updateData?.system?.description?.value || oldDocument?.system?.description?.value);
  }
})

// Register advancement
Hooks.on('init', () => {
  const dndVersion = Version.fromString((game.system as any).version);
  if (dndVersion >= new Version(3, 1)) {
    dnd5e.config.advancementTypes[CurrencyAdvancement.typeName] = {
      documentClass: CurrencyAdvancement,
      validItemTypes: CurrencyAdvancement.metadata.validItemTypes,
    };
  } else {
    dnd5e.config.advancementTypes[CurrencyAdvancement.typeName] = CurrencyAdvancement;
  }
});