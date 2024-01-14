export {};

interface DnD5e {
  [key: string]: any;
  applications: Applications;
  config: Config;
  documents: Documents;
}

interface AdvancementTypes {
  [key: string]: any;
  AbilityScoreImprovement: typeof Advancement;
  HitPoints: typeof Advancement;
  ItemChoice: typeof Advancement;
  ItemGrant: typeof Advancement;
  ScaleValue: typeof Advancement;
  Size: typeof Advancement;
  Trait: typeof Advancement;
}

interface Applications {
  advancement: {
    [key: string]: typeof FormApplication;
    AbilityScoreImprovementConfig: typeof AdvancementFlow,
    AbilityScoreImprovementFlow: typeof AdvancementFlow,
    AdvancementConfig: typeof AdvancementFlow,
    AdvancementConfirmationDialog: typeof AdvancementFlow,
    AdvancementFlow: typeof AdvancementFlow,
    AdvancementManager: typeof AdvancementFlow,
    AdvancementMigrationDialog: typeof AdvancementFlow,
    AdvancementSelection: typeof AdvancementFlow,
    HitPointsConfig: typeof AdvancementFlow,
    HitPointsFlow: typeof AdvancementFlow,
    ItemChoiceConfig: typeof AdvancementFlow,
    ItemChoiceFlow: typeof AdvancementFlow,
    ItemGrantConfig: typeof AdvancementFlow,
    ItemGrantFlow: typeof AdvancementFlow,
    ScaleValueConfig: typeof AdvancementFlow,
    ScaleValueFlow: typeof AdvancementFlow,
    SizeConfig: typeof AdvancementFlow,
    SizeFlow: typeof AdvancementFlow,
    TraitConfig: typeof AdvancementFlow,
    TraitFlow: typeof AdvancementFlow,
  }
}

interface Config {
  [key: string]: any;
  advancementTypes: AdvancementTypes;
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
  Trait: {
    [key: string]: any;
    localizedList(loc: { grants?: Set<string>, choices?: Array<{count: number; pool: Set<string>;}> }): string;
  }
  advancement: {
    [key: string]: any;
    Advancement: typeof Advancement;
  }
}

interface AdvancementData<T = any> {
  _id?: string;
  type: string;
  configuration: T;
  value: any;
  level?: number;
  title?: string;
  icon?: string;
  classRestriction?: 'primary' | 'secondary';
}

/**
 * Base class for the advancement interface displayed by the advancement prompt that should be subclassed by
 * individual advancement types.
 *
 * @param item           Item to which the advancement belongs.
 * @param advancementId  ID of the advancement this flow modifies.
 * @param level          Level for which to configure this flow.
 * @param options        Application rendering options.
 */
class AdvancementFlow<DATA = object, T extends Advancement = Advancement<AdvancementData<DATA>>> extends FormApplication<FormApplicationOptions, FormApplication.Data<AdvancementData<DATA>>> {
  
  public constructor(item: Item, advancementId: string, level: number, options?: object);

  /**
   * The item that houses the Advancement.
   */
  public item: Item;

  /**
   * ID of the advancement this flow modifies.
   */
  private _advancementId: string;

  /**
   * Level for which to configure this flow.
   */
  public level: number;
  
  /**
   * Data retained by the advancement manager during a reverse step. If restoring data using Advancement#restore,
   * this data should be used when displaying the flow's form.
   */
  public retainedData: object|null;

  /**
   * The Advancement object this flow modifies.
   */
  public get advancement(): Advancement | null;

  /* -------------------------------------------- */

  /**
   * Set the retained data for this flow. This method gives the flow a chance to do any additional prep
   * work required for the retained data before the application is rendered.
   * @param data  Retained data associated with this flow.
   */
  public retainData(data: object): Promise<void>;

  /** @inheritdoc */
  public getData(): {appId: string; advancement: Advancement; type: string; title: string; summary: string; level: number;};
  
  /** @inheritdoc */
  public _updateObject(event, formData): Promise<unknown>;

}

class Advancement<T extends AdvancementData = AdvancementData> extends foundry.abstract.DataModel<T, Item> implements T {
  static availableForItem(item: Item): boolean;
  
  /**
   * Name of this advancement type that will be stored in config and used for lookups.
   */
  static readonly typeName: string;
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