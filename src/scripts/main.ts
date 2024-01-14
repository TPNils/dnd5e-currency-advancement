import { CurrencyAdvancement } from "./currency-advancement.js";

Hooks.on('init', () => {
  dnd5e.config.advancementTypes[CurrencyAdvancement.typeName] = CurrencyAdvancement;
});