export type UI5Framework = "OpenUI5" | "SAPUI5";

export interface AppContext {
  services: Record<string, ServiceDetails>;
  manifest?: ManifestDetails;
  ui5Model: UI5SemanticModel;
}

export type ManifestDetails = {
  flexEnabled: boolean | undefined;
  minUI5Version: string | undefined;
  mainServicePath?: string;
  customViews: { [name: string]: { entitySet: string } };
};

export interface ServiceDetails {
  metadata: Metadata;
  pathExpressions: PathExpressions;
  annotations: any[];
}

export interface UI5SemanticModel {
  version?: string;
  framework?: UI5Framework;
  includedLibraries: string[];
  classes: Record<string, UI5Class>;
  enums: Record<string, UI5Enum>;
  namespaces: Record<string, UI5Namespace>;
  interfaces: Record<string, UI5Interface>;
  // - only 10 of these in whole OpenUI (1.60) api.jsons
  // Likely Not Relevant for XML.Views
  typedefs: Record<string, UI5Typedef>;
  // Likely Not Relevant for XML.Views
  functions: Record<string, UI5Function>;
}

export interface PropertyType {
  name: string;
}

export interface MetadataElement {
  name: string;
  path: string;
  children: MetadataElement[];
}

export const METADATA_ENTITY_CONTAINER_KIND = "EntityContainer";
export const METADATA_ENTITY_TYPE_KIND = "EntityType";
export const METADATA_ENTITY_SET_KIND = "EntitySet";
export const METADATA_ENTITY_PROPERTY_KIND = "Property";
export const METADATA_ENTITY_NAVIGATION_PROPERTY_KIND = "NavigationProperty";
export const METADATA_ACTION_KIND = "Action";
export const METADATA_ACTION_PARAMETER_KIND = "ActionParameter";
export const METADATA_ACTION_IMPORT_KIND = "ActionImport";
export const METADATA_COMPLEX_TYPE_KIND = "ComplexType";

export type EntityContainerFullyQualifiedName = string;
export type EntityTypeFullyQualifiedName = string;
export type EntitySetFullyQualifiedName = string;
export type NavigationPropertyFullyQualifiedName = string;
export type PropertyFullyQualifiedName = string;
export type ActionFullyQualifiedName = string;
export type ActionParameterFullyQualifiedName = string;
export type ComplexTypeFullyQualifiedName = string;

export type MetadataElementFullyQualifiedName =
  | EntityContainerFullyQualifiedName
  | EntityTypeFullyQualifiedName
  | EntitySetFullyQualifiedName
  | NavigationPropertyFullyQualifiedName
  | PropertyFullyQualifiedName
  | ActionFullyQualifiedName
  | ActionParameterFullyQualifiedName
  | ComplexTypeFullyQualifiedName;

export type Path = string;
export interface MetadataElementBase {
  fullyQualifiedName: string;
  name: string;
  kind: string; // internal semantic type to identify metadata element
  /**
   * To restrict applicable terms (AppliesTo: 'Collection' - 	Entity Set or collection-valued Property or Navigation Property).
   * To restrict path expressions to generic types (e.g. 'Collection(Edm.PrimitiveType)').
   */
  isCollection?: boolean;
  /**
   * To qualify as value for abstract type 'Edm.EntityType'.
   * In EDM: all EntityTypes, EntitySets, Singletons, NavigationProperties.
   */
  isEntityType?: boolean;
  /**
   * To qualify as value for abstract type 'Edm.ComplexType'.
   * In EDM: all ComplexType, Properties and Parameters typed with ComplexTypes.
   */
  isComplexType?: boolean;
  /**
   * Only for primitive values; if present also qualifies for abstract type 'Edm.PrimitiveValue'.
   * To restrict paths correctly, e.g. to 'Edm.String' values, to apply 'Core.RequiresType' constraint for terms.
   */
  edmPrimitiveType?: string;
  /**
   * For all structured values: (absolute) path to metadata element defining the structure.
   * (e.g. EntityType for EDM NavigationProperty, target for CDS association)
   */
  structuredType?: Path;
}

export interface MetadataEntityTypeProperty extends MetadataElementBase {
  fullyQualifiedName: PropertyFullyQualifiedName;
  kind: typeof METADATA_ENTITY_PROPERTY_KIND;
  type: string; // property Edm type
}

export interface MetadataEntityTypeNavigationProperty
  extends MetadataElementBase {
  fullyQualifiedName: NavigationPropertyFullyQualifiedName;
  kind: typeof METADATA_ENTITY_NAVIGATION_PROPERTY_KIND;
  containsTarget: boolean;
  targetTypeName: string;
}

export interface MetadataEntityType extends MetadataElementBase {
  fullyQualifiedName: EntityTypeFullyQualifiedName;
  kind: typeof METADATA_ENTITY_TYPE_KIND;
  entityProperties: MetadataEntityTypeProperty[];
  navigationProperties: MetadataEntityTypeNavigationProperty[];
}

export interface MetadataEntitySet extends MetadataElementBase {
  fullyQualifiedName: EntitySetFullyQualifiedName;
  kind: typeof METADATA_ENTITY_SET_KIND;
  entityTypeName: string;
  navigationPropertyBinding: { [name: string]: MetadataEntitySet };
}

export interface MetadataActionParameter extends MetadataElementBase {
  fullyQualifiedName: ActionParameterFullyQualifiedName;
  kind: typeof METADATA_ACTION_PARAMETER_KIND;
  type: string;
}
export interface MetadataAction extends MetadataElementBase {
  fullyQualifiedName: ActionFullyQualifiedName;
  kind: typeof METADATA_ACTION_KIND;
  isBound: boolean;
  isFunction: boolean;
  parameters?: MetadataActionParameter[];
}
export interface MetadataComplexType extends MetadataElementBase {
  fullyQualifiedName: ComplexTypeFullyQualifiedName;
  kind: typeof METADATA_COMPLEX_TYPE_KIND;
  type: string;
  properties: MetadataEntityTypeProperty[];
  navigationProperties: MetadataEntityTypeNavigationProperty[];
}

export type MetadataMap = Map<Path, MetadataElementBase>;
// Mapping of action/function names to all their overloads
export type ActionNameMap = Map<Path, Set<Path>>;

export type NavigationMap = {
  [navSourceType: string]: {
    [navTargetType: string]: {
      [navPropName: string]: { isCollection: boolean };
    };
  };
};
export interface Metadata {
  actions: MetadataAction[];
  entityContainer?: MetadataElementBase & {
    fullyQualifiedName: EntityContainerFullyQualifiedName;
    kind: typeof METADATA_ENTITY_CONTAINER_KIND;
  };
  entitySets: MetadataEntitySet[];
  entityTypes: MetadataEntityType[];
  complexTypes: MetadataComplexType[];
  namespace: string;
  namespaceAlias?: string;
  namespaces: Set<string>;
  lookupMap: MetadataMap;
  actionMap: ActionNameMap;
  navigationSourceMap: NavigationMap;
}

export type PathKind = string;

export interface PathExpressions {
  [pathKind: PathKind]: PathCache | AnnotationPathCache | TargetPathCache;
}

export type TargetPathCache = {
  [firstPathSegment: string]:
    | string
    | {
        [property: string]: string;
      };
};

export type PathCache = {
  [typeFqName: string]: {
    [firstPathSegment: string]: unknown;
  };
};

export interface AnnotationPathCache {
  [typeFqName: string]: {
    [firstPathSegment: string]: {
      [term: string]:
        | {
            [property: string]: boolean;
          }
        | boolean;
    };
  };
}

export interface UI5Meta {
  library: string;
  description: string | undefined;
  since: string | undefined;
  deprecatedInfo: UI5DeprecatedInfo | undefined;
  experimentalInfo: UI5ExperimentalInfo | undefined;
  visibility: UI5Visibility;
}

export interface BaseUI5Node extends UI5Meta {
  name: string;
  kind: string;
  // Note: top level Namespaces has an undefined parent
  // This cannot be defined on UI5Namespace because it inherits this property
  parent: BaseUI5Node | undefined;
}

export interface UI5Class extends BaseUI5Node {
  kind: "UI5Class";
  abstract: boolean;
  extends: UI5Class | undefined;
  implements: UI5Interface[];
  ctor: UI5Constructor | undefined;
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  properties: UI5Prop[];
  // Likely Not Relevant for XML.Views
  fields: UI5Prop[];
  aggregations: UI5Aggregation[];
  associations: UI5Association[];
  events: UI5Event[];
  defaultAggregation: UI5Aggregation | undefined;
}

export interface UI5Enum extends BaseUI5Node {
  kind: "UI5Enum";
  fields: UI5EnumValue[];
}

export interface UI5EnumValue extends BaseUI5Node {
  kind: "UI5EnumValue";
}

export interface UI5Namespace extends BaseUI5Node {
  kind: "UI5Namespace";
  // Likely Not Relevant for XML.Views
  fields: UI5Field[];
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  events: UI5Event[];
  namespaces: Record<string, UI5Namespace>;
  classes: Record<string, UI5Class>;
  // TODO: maybe we need all children here nested for string literal auto complete ("a.b.c...")
}

// Likely Not Relevant for XML.Views
export interface UI5Typedef extends BaseUI5Node {
  kind: "UI5Typedef";
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Constructor extends BaseUI5Node {
  kind: "UI5Constructor";
  name: "";
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Method extends BaseUI5Node {
  kind: "UI5Method";
  // TODO: TBD: Ignoring this type's content at this time.
}

// Likely Not Relevant for XML.Views
export interface UI5Function extends BaseUI5Node {
  kind: "UI5Function";
  // TODO: TBD: Ignoring this type's content at this time.
}

export interface UI5Prop extends BaseUI5Node {
  kind: "UI5Prop";
  type: UI5Type | undefined;
  default: unknown; // This should be of the property's type
}

export interface UI5Field extends BaseUI5Node {
  kind: "UI5Field";
  type: UI5Type | undefined;
}

export interface UI5Aggregation extends BaseUI5Node {
  kind: "UI5Aggregation";
  type: UI5Type | undefined;
  cardinality: UI5Cardinality;
  altTypes: UI5Type[];
}

export interface UI5Association extends BaseUI5Node {
  kind: "UI5Association";
  type: UI5Type | undefined;
  cardinality: UI5Cardinality;
}

export interface UI5Event extends BaseUI5Node {
  kind: "UI5Event";
  // Details on parameter type are Likely Not Relevant for XML.Views
}

export interface UI5Interface extends BaseUI5Node {
  kind: "UI5Interface";
  // Likely Not Relevant for XML.Views
  methods: UI5Method[];
  events: UI5Event[];
  // I could not locate any UI5 Interfaces with fields/properties...
}

export type UI5Visibility =
  | "restricted"
  | "protected"
  | "public"
  | "private"
  | "hidden";
export type UI5Cardinality = "0..1" | "0..n";

export interface UI5DeprecatedInfo {
  isDeprecated: boolean;
  since: string | undefined;
  text: string | undefined;
}

export interface UI5ExperimentalInfo {
  isExperimental: boolean;
  since: string | undefined;
  text: string | undefined;
}

export interface ArrayType {
  kind: "ArrayType";
  type: UI5Type | undefined;
}

export interface PrimitiveType {
  kind: "PrimitiveType";
  name: PrimitiveTypeName;
}

export interface UnresolvedType {
  kind: "UnresolvedType";
  name: string;
}

export type UI5Type =
  | UI5Class
  | UI5Interface
  | UI5Enum
  | UI5Namespace
  | UI5Typedef
  | ArrayType
  | PrimitiveType
  | UnresolvedType;

// TODO Should we keep int and float in addition to number? Should we keep both object and map?
export type PrimitiveTypeName =
  | "String"
  | "Boolean"
  | "Number"
  | "Integer"
  | "Float"
  | "Object"
  | "Map"
  | "Function";
