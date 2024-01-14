import { ICurrencyAdvancementData } from "./currency-advancement.js";
import { Currency } from "./types/dnd5e.js";

export class CurrencyAdvancementConfig extends dnd5e.applications.advancement.AdvancementConfig<ICurrencyAdvancementData> {

  /** @inheritdoc */
  public static get defaultOptions(): FormApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      submitOnChange: true,
      template: "modules/dnd5e-currency-advancement/templates/currency-advancement-config.hbs",
    });
  }

  public getData() {
    const data: any = super.getData();
    data.currencies = CurrencyAdvancementConfig.getCurrencies();
    data.currenciesWidthPercent = Math.floor(100 / data.currencies.length);
    return data;
  }

  public static getCurrencies(): Array<{key: string;} & Currency> {
    return Object.entries(dnd5e.config.currencies).map(([key, currency]) => {
      return {
        ...(currency as any),
        key: key,
      }
    }).sort((a, b) => a.conversion - b.conversion)
  }

}