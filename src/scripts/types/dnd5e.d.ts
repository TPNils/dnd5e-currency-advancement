export {};

interface DnD5e {
  [key: string]: any;
  config: Config;
  documents: Documents;
}

interface Config {
  [key: string]: any;
  armorIds: {
    [key: string]: string;
  }
  traits: {
    [key: string]: ConfigTrait;
    armor: ConfigTrait;
    ci: ConfigTrait;
    di: ConfigTrait;
    dr: ConfigTrait;
    dv: ConfigTrait;
    languages: ConfigTrait;
    saves: ConfigTrait;
    skills: ConfigTrait;
    tool: ConfigTrait;
    weapon: ConfigTrait;
  }
  shieldIds: {
    [key: string]: string;
  }
  toolType: {
    [key: string]: string;
  }
  weaponIds: {
    [key: string]: string;
  }
}

interface ConfigTrait {
  actorKeyPath?: string;
  children?: {
    [key: string]: string;
  }
  configKey?: string;
  expertise?: boolean;
  icon: string;
  labels: {
    localization: string;
    title: string;
  };
  labelKeyPath?: string;
  sortCategories?: boolean;
  subtypes?: {
    keyPath: string;
    ids: Array<keyof Config>;
  }
}

interface Documents {
  [key: string]: any;
  advancement: {
    [key: string]: any;
    Advancement: typeof Advancement;
  }
}

interface AdvancementData {
  _id?: string;
  type: string;
  configuration: any;
  value: any;
  level?: number;
  title?: string;
  icon?: string;
  classRestriction?: 'primary' | 'secondary';
}

export class Advancement extends foundry.abstract.DataModel<AdvancementData, Item> {
  static availableForItem(item: Item): boolean;
  static readonly metadata: {
    apps: {
      config: FormApplication;
      flow: FormApplication;
    };
    hint: string;
    icon: string;
    multiLevel: boolean;
    order: number;
    title: string;
    validItemTypes: string[];
  };

  readonly id: string;
  readonly uuid: string;
  readonly actor: Actor;
  readonly item: Item;
  readonly levels: number[];
  readonly appliesToClass: boolean;
  readonly actor: Actor;

  /**
   * Prepare data for the Advancement.
   */
  public prepareData(): void;

  /**
   * Perform preliminary operations before an Advancement is created.
   * @param data The initial data object provided to the document creation request.
   * @returns    A return value of false indicates the creation operation should be cancelled.
   */
  protected _preCreate(data: object): boolean | void;
  
  /**
   * Has the player made choices for this advancement at the specified level?
   * @param level  Level for which to check configuration.
   * @returns      Have any available choices been made?
   */
  public configuredForLevel(level: number): boolean;
  
  /**
   * Value used for sorting this advancement at a certain level.
   * @param level  Level for which this entry is being sorted.
   * @returns      String that can be used for sorting.
   */
  public sortingValueForLevel(level: number): string;

  /**
   * Title displayed in advancement list for a specific level.
   * @param {number} level                       Level for which to generate a title.
   * @param {object} [options={}]
   * @param {object} [options.configMode=false]  Is the advancement's item sheet in configuration mode? When in
   *                                             config mode, the choices already made on this actor should not
   *                                             be displayed.
   * @returns {string}                           HTML title with any level-specific information.
   */
  public titleForLevel(level: number, options?: {configMode?: boolean}): string;


  /**
   * Summary content displayed beneath the title in the advancement list.
   * @param level              Level for which to generate the summary.
   * @param options
   * @param options.configMode Is the advancement's item sheet in configuration mode? When in
   *                             config mode, the choices already made on this actor should not
   *                             be displayed.
   * @returns                  HTML content of the summary.
   */
  public summaryForLevel(level: number, options?: {configMode?: boolean}): string;

  /* -------------------------------------------- */

  /**
   * Render all of the Application instances which are connected to this advancement.
   * @param force    Force rendering
   * @param context  Optional context
   */
  public render(force?: boolean=false, context?: object): void;

  /**
   * Update this advancement.
   * @param updates  Updates to apply to this advancement.
   * @returns        This advancement after updates have been applied.
   */
  public async update(updates: object): Promise<Advancement>;

  /* -------------------------------------------- */

  /**
   * Update this advancement's data on the item without performing a database commit.
   * @param updates  Updates to apply to this advancement.
   * @returns        This advancement after updates have been applied.
   */
  public updateSource(updates: object): Advancement;

  /**
   * Serialize salient information for this Advancement when dragging it.
   * @returns An object of drag data.
   */
  public toDragData(): object;

  /**
   * Locally apply this advancement to the actor.
   * @param level   Level being advanced.
   * @param data    Data from the advancement form.
   */
  public async apply(level: number, data: object): Promise<void>

  /* -------------------------------------------- */

  /**
   * Locally apply this advancement from stored data, if possible. If stored data can not be restored for any reason,
   * throw an AdvancementError to display the advancement flow UI.
   * @param level  Level being advanced.
   * @param data   Data from `Advancement#reverse` needed to restore this advancement.
   */
  public restore(level: number, data: object): Promise<void>

  /* -------------------------------------------- */

  /**
   * Locally remove this advancement's changes from the actor.
   * @param level  Level being removed.
   * @returns      Data that can be passed to the `Advancement#restore` method to restore this reversal.
   */
  public reverse(level: number): Promise<object>;
}

declare global {
  export const dnd5e: DnD5e;
}