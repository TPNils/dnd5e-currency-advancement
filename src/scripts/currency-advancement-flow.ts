import { ICurrencyAdvancementData } from "./currency-advancement.js";

export class CurrencyAdvancementFlow extends dnd5e.applications.advancement.AdvancementFlow<ICurrencyAdvancementData> {

  /** @inheritdoc */
  public static get defaultOptions(): FormApplicationOptions {
    return foundry.utils.mergeObject(super.defaultOptions, {
      template: "modules/dnd5e-currency-advancement/templates/currency-advancement-flow.hbs",
      popOut: false
    });
  }

}