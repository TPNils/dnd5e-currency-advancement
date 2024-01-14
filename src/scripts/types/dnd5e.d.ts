export {};

export interface ConfigTrait {
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

export interface Currency {
  label: string;
  abbreviation: string;
  conversion: number;
}

export interface AdvancementData<CONFIG = any, VALUE = any> {
  _id?: string;
  type: string;
  configuration: CONFIG;
  value: VALUE;
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
class AdvancementFlowCls<DATA = object, T extends AdvancementCls = AdvancementCls<AdvancementData<DATA>>> extends FormApplication<FormApplicationOptions, FormApplication.Data<AdvancementData<DATA>>> {
  
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
  public get advancement(): AdvancementCls | null;

  /* -------------------------------------------- */

  /**
   * Set the retained data for this flow. This method gives the flow a chance to do any additional prep
   * work required for the retained data before the application is rendered.
   * @param data  Retained data associated with this flow.
   */
  public retainData(data: object): Promise<void>;

  /** @inheritdoc */
  public getData(): {appId: string; advancement: AdvancementCls; type: string; title: string; summary: string; level: number;};
  
  /** @inheritdoc */
  public _updateObject(event, formData): Promise<unknown>;

}

class AdvancementCls<CONFIG = any, VALUE = any> extends foundry.abstract.DataModel<AdvancementData<CONFIG, VALUE>, Item> {

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

  public readonly id: string;
  public readonly uuid: string;
  public readonly actor: Actor;
  public readonly item: Item;
  public readonly levels: number[];
  public readonly appliesToClass: boolean;
  public readonly actor: Actor;

  public _id?: string;
  public type: string;
  public configuration: T;
  public value: any;
  public level?: number;
  public title?: string;
  public icon?: string;
  public classRestriction?: 'primary' | 'secondary';

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
  public async update(updates: object): Promise<AdvancementCls>;

  /* -------------------------------------------- */

  /**
   * Update this advancement's data on the item without performing a database commit.
   * @param updates  Updates to apply to this advancement.
   * @returns        This advancement after updates have been applied.
   */
  public updateSource(updates: object): AdvancementCls;

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
  namespace dnd5e {
    namespace applications {
      class advancement {static [key: string]: typeof AdvancementFlowCls;};
      namespace advancement {
        const AbilityScoreImprovementConfig: typeof AdvancementFlowCls;
        const AbilityScoreImprovementFlow: typeof AdvancementFlowCls;
        const AdvancementConfig: typeof AdvancementFlowCls;
        const AdvancementConfirmationDialog: typeof AdvancementFlowCls;
        const AdvancementFlow: typeof AdvancementFlowCls;
        const AdvancementManager: typeof AdvancementFlowCls;
        const AdvancementMigrationDialog: typeof AdvancementFlowCls;
        const AdvancementSelection: typeof AdvancementFlowCls;
        const HitPointsConfig: typeof AdvancementFlowCls;
        const HitPointsFlow: typeof AdvancementFlowCls;
        const ItemChoiceConfig: typeof AdvancementFlowCls;
        const ItemChoiceFlow: typeof AdvancementFlowCls;
        const ItemGrantConfig: typeof AdvancementFlowCls;
        const ItemGrantFlow: typeof AdvancementFlowCls;
        const ScaleValueConfig: typeof AdvancementFlowCls;
        const ScaleValueFlow: typeof AdvancementFlowCls;
        const SizeConfig: typeof AdvancementFlowCls;
        const SizeFlow: typeof AdvancementFlowCls;
        const TraitConfig: typeof AdvancementFlowCls;
        const TraitFlow: typeof AdvancementFlowCls;
      }
    }
    namespace config {
      class advancementTypes {static [key: string]: typeof dnd5e.documents.advancement.Advancement<any>;};
      namespace advancementTypes {
        const AbilityScoreImprovement: typeof dnd5e.documents.advancement.Advancement<any>;
        const HitPoints: typeof dnd5e.documents.advancement.Advancement<any>;
        const ItemChoice: typeof dnd5e.documents.advancement.Advancement<any>;
        const ItemGrant: typeof dnd5e.documents.advancement.Advancement<any>;
        const ScaleValue: typeof dnd5e.documents.advancement.Advancement<any>;
        const Size: typeof dnd5e.documents.advancement.Advancement<any>;
        const Trait: typeof dnd5e.documents.advancement.Advancement<any>;
      }
      class armorIds {static [key: string]: string;};
      class currencies {static [key: string]: Currency;};
      namespace currencies {
        const cp: Currency;
        const sp: Currency;
        const ep: Currency;
        const gp: Currency;
        const pp: Currency;
      }
      class traits {static [key: string]: ConfigTrait;};
      namespace traits {
        const armor: ConfigTrait;
        const ci: ConfigTrait;
        const di: ConfigTrait;
        const dr: ConfigTrait;
        const dv: ConfigTrait;
        const languages: ConfigTrait;
        const saves: ConfigTrait;
        const skills: ConfigTrait;
        const tool: ConfigTrait;
        const weapon: ConfigTrait;
      }
      class shieldIds {static [key: string]: string;};
      class toolType {static [key: string]: string;};
      class weaponIds {static [key: string]: string;};
    }
    namespace documents {
      class advancement {static [key: string]: any;};
      namespace advancement {
        const Advancement = AdvancementCls;
      }
      
      class Trait {static [key: string]: any;};
      namespace Trait {
        const localizedList: (loc: { grants?: Set<string>, choices?: Array<{count: number; pool: Set<string>;}> }) => string;
      };
    }
  }
}