export {};


interface DataFieldOptions {
  /** Is this field required to be populated? */
  required?: boolean;
  /** Can this field have null values? */
  nullable?: boolean;
  /** The initial value of a field, or a function which assigns that initial value. */
  initial?: Function | any;
  /** A data validation function which accepts one argument with the current value. */
  validate?: Function;
  /** A localizable label displayed on forms which render this field. */
  label?: string;
  /** Localizable help text displayed on forms which render this field. */
  hint?: string;
  /** A custom validation error string. When displayed will be prepended with the document name, field name, and candidate value. */
  validationError?: string;
}

interface FilePathFieldOptions extends StringFieldOptions {
  /** A set of categories in CONST.FILE_CATEGORIES which this field supports */
  categories?: string[];
  /** Is embedded base64 data supported in lieu of a file path? */
  base64?: boolean;
  /** Does this file path field allow wildcard characters? */
  wildcard?: boolean;
}

interface NumberFieldOptions extends DataFieldOptions {
  /** A minimum allowed value */
  min?: number;
  /** A maximum allowed value */
  max?: number;
  /** A permitted step size */
  step?: number;
  /** Must the number be an integer? */
  integer?: boolean;
  /** Must the number be positive? */
  positive?: boolean;
  /** 
   * An array of values or an object of values/labels which represent allowed choices for the field.
   * A function may be provided which dynamically returns the array of choices. 
   */
  choices?: number[] | object | function;
}

interface StringFieldOptions extends DataFieldOptions {
  /** Is the string allowed to be blank (empty)? */
  blank?: boolean;
  /** Should any provided string be trimmed as part of cleaning? */
  trim?: boolean;
  /** 
   * An array of values or an object of values/labels which represent allowed choices for the field.
   * A function may be provided which dynamically returns the array of choices.
   */
  choices?: string[] | object | (() => string[] | object);
}

export interface DataSchema {
  [key: string]: DataFieldAbstract;
}

abstract class DataFieldAbstract<T = any, OPTIONS extends DataFieldOptions = DataFieldOptions> {
  /**
     * @param options Options which configure the behavior of the field
     */
  constructor(options?: OPTIONS);

  public options: OPTIONS;

  /**
   * The field name of this DataField instance.
   * This is assigned by SchemaField#initialize.
   * @internal
   */
  public name: string;

  /**
   * A reference to the parent schema to which this DataField belongs.
   * This is assigned by SchemaField#initialize.
   * @internal
   */
  public parent;

  /**
   * Default parameters for this field type
   */
  protected static get _defaults(): DataFieldOptions;

  /**
   * A dot-separated string representation of the field path within the parent schema.
   */
  public get fieldPath(): string;

  /**
   * Apply a function to this DataField which propagates through recursively to any contained data schema.
   * @param fn       The function to apply
   * @param value    The current value of this field
   * @param options  Additional options passed to the applied function
   * @returns        The results object
   */
  public apply(fn: string | Function, value: any, options?: object): object;

  /**
   * Coerce source data to ensure that it conforms to the correct data type for the field.
   * Data coercion operations should be simple and synchronous as these are applied whenever a DataModel is constructed.
   * For one-off cleaning of user-provided input the sanitize method should be used.
   * @param value            The initial value
   * @param options          Additional options for how the field is cleaned
   * @param options.partial  Whether to perform partial cleaning?
   * @param options.source   The root data model being cleaned
   * @returns                The cast value
   */
  public clean(value: any, options: { partial?: boolean; source?: object; }): T;

  /**
   * Apply any cleaning logic specific to this DataField type.
   * @param value    The appropriately coerced value.
   * @param options  Additional options for how the field is cleaned.
   * @returns        The cleaned value.
   */
  protected _cleanType(value: any, options: object): T;

  /**
   * Cast a non-default value to ensure it is the correct type for the field
   * @param  value  The provided non-default value
   * @returns       The standardized value
   */
  protected abstract _cast(value: any): T;

  /**
   * Attempt to retrieve a valid initial value for the DataField.
   * @param data  The source data object for which an initial value is required
   * @returns     A valid initial value
   * @throws      An error if there is no valid initial value defined
   */
  public getInitialValue(data: object): T;

  /**
   * Validate a candidate input for this field, ensuring it meets the field requirements.
   * A validation failure can be provided as a raised Error (with a string message) or by returning false.
   * A validator which returns true denotes that the result is certainly valid and further validations are unnecessary.
   * @param value    The initial value
   * @param options  Options which affect validation behavior
   * @returns        Returns a ModelValidationError if a validation failure occurred
   */
  public validate(value: any, options?: object): ModelValidationError;

  /* -------------------------------------------- */

  /**
   * Special validation rules which supersede regular field validation.
   * This validator screens for certain values which are otherwise incompatible with this field like null or undefined.
   * @param value  The candidate value
   * @returns      A boolean to indicate with certainty whether the value is valid.
   *                 Otherwise, return void.
   * @throws       May throw a specific error if the value is not valid
   */
  protected _validateSpecial(value: any): boolean | void;

  /* -------------------------------------------- */

  /**
   * A default type-specific validator that can be overridden by child classes
   * @param value     The candidate value
   * @param options   Options which affect validation behavior
   * @returns         A boolean to indicate with certainty whether the value is valid.
   *                    Otherwise, return void.
   * @throws          May throw a specific error if the value is not valid
   */
  protected _validateType(value: any, options?: object): boolean | void;

  /* -------------------------------------------- */
  /*  Initialization and Serialization            */
  /* -------------------------------------------- */

  /**
   * Initialize the original source data into a mutable copy for the DataModel instance.
   * @param value    The source value of the field
   * @param model    The DataModel instance that this field belongs to
   * @param options  Initialization options
   * @returns        An initialized copy of the source data
   */
  public initialize(value: any, model: object, options: object={}): any;

  /**
   * Export the current value of the field into a serializable object.
   * @param value  The initialized value of the field
   * @returns      An exported representation of the field
   */
  public toObject(value: any): any;
}

class DataFieldCls<T = any, OPTIONS extends DataFieldOptions = DataFieldOptions> extends DataFieldAbstract<T, OPTIONS> {
  protected _cast(value: any): T;
}

declare global {
  namespace foundry {
    namespace abstract {
      class DataModel<DATA extends object = object, PARENT extends foundry.abstract.Document<any, any> = foundry.abstract.Document<any, any>> implements DATA {
        constructor(data?: DATA, options?: {parent?: any, strict?: boolean, [key: string]: any});
      
        readonly _source: Readonly<DATA>;
        readonly parent: PARENT;
        readonly schema: SchemaField;
        readonly invalid: boolean;
      
        /** Update with a DML */
        public update(diff: DeepPartial<DATA>, options?: any): Promise<this>;
        /** Update the source data locally without a DML */
        public updateSource(diff: DeepPartial<DATA>, options?: any): this;
        /**
         * Copy and transform the DataModel into a plain object.
         * Draw the values of the extracted object from the data source (by default) otherwise from its transformed values.
         * @param {boolean} [source=true]     Draw values from the underlying data source rather than transformed values
         * @returns {object}                  The extracted primitive object
         */
        public toObject(source?: boolean): object;
      }
    }
    namespace data {
      namespace fields {
        class AlphaField extends NumberField{};
        class AngleField extends NumberField{};
        class ArrayField<T extends DataFieldAbstract> extends DataFieldCls<T> {
          constructor(element: T, options?: DataFieldOptions);
          public element: T;
        };
        class BooleanField extends DataFieldCls<boolean>{};
        class ColorField extends StringField{};
        const DataField = DataFieldAbstract;
        class DocumentIdField extends StringField{};
        class DocumentOwnershipField extends ObjectField{};
        class DocumentStatsField extends SchemaField<{systemId: string;systemVersion: string;coreVersion: string;createdTime?: number;modifiedTime?: number;lastModifiedBy?: string;}>{};
        // class EmbeddedDataField extends DataFieldCls{};
        const EmbeddedCollectionField = ArrayField;
        class FilePathField extends DataFieldCls<string, FilePathFieldOptions>{};
        // class ForeignDocumentField extends DataFieldCls{};
        class HTMLField extends StringField{};
        class IntegerSortField extends NumberField{};
        class JSONField extends StringField{};
        class NumberField extends DataFieldCls<number, NumberFieldOptions>{};
        class ObjectField extends DataFieldCls<object>{};
        class SchemaField<T extends object> extends DataFieldCls<T> {
          constructor(fields: DataSchema, options?: DataFieldOptions);
          public fields: DataSchema;
          
          /**
           * An array of field names which are present in the schema.
           */
          public keys(): string[];

          /**
           * An array of DataField instances which are present in the schema.
           */
          public values(): DataField[];

          /**
           * An array of [name, DataField] tuples which define the schema.
           */
          public entries(): Array<[string, DataField]>;

          /**
           * Test whether a certain field name belongs to this schema definition.
           * @param fieldName  The field name
           * @returns          Does the named field exist in this schema?
           */
          public has(fieldName: string): boolean;

          /**
           * Get a DataField instance from the schema by name
           * @param fieldName  The field name
           * @returns          The DataField instance or undefined
           */
          public get(fieldName: string): DataField;
        };
        const SetField = ArrayField;
        class StringField extends DataFieldCls<string, StringFieldOptions>{};
        // class SystemDataField extends DataFieldCls{};
        class ModelValidationError extends Error {
          constructor(errors: {[key: string]: Error} | Error[]);
          public errors: {[key: string]: Error} | Error[];

          static formatErrors(errors: {[key: string]: Error}|Error[]): string;
        };
      }
    }
  }
}