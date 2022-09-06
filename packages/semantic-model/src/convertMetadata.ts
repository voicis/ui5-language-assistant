import type {
  MetadataElementBase,
  MetadataEntitySet,
  MetadataEntityType,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";

// TODO: import them from semantic model defs
const METADATA_ENTITY_CONTAINER_KIND = "EntityContainer";
const METADATA_ENTITY_TYPE_KIND = "EntityType";
const METADATA_ENTITY_SET_KIND = "EntitySet";
const METADATA_ENTITY_PROPERTY_KIND = "Property";
const METADATA_ENTITY_NAVIGATION_PROPERTY_KIND = "NavigationProperty";
const METADATA_ACTION_KIND = "Action";
const METADATA_ACTION_PARAMETER_KIND = "ActionParameter";
const METADATA_ACTION_IMPORT_KIND = "ActionImport";

interface ExpectedMergedModel<
  B extends MetadataElementBase,
  S extends MetadataEntitySet,
  T extends MetadataEntityType
> {
  _entityContainer: B;
  _entitySets: S[];
  _entityTypes: T[];
}

function convertMetadataEntitySet<S extends MetadataEntitySet>(
  set: S
): MetadataEntitySet {
  let parentEntityTypes: Record<string, MetadataEntitySet>;

  const addNavigationBindingRecursive = (
    set: S,
    key: string,
    newSet: MetadataEntitySet
  ): void => {
    const boundSet = set.navigationPropertyBinding[key] as S;
    if (parentEntityTypes[boundSet.fullyQualifiedName]) {
      // circular navigation
      newSet.navigationPropertyBinding[key] =
        parentEntityTypes[boundSet.fullyQualifiedName];
    } else {
      const newBoundSet = {
        ...boundSet,
        kind: METADATA_ENTITY_SET_KIND,
        navigationPropertyBinding: {},
      };
      newSet.navigationPropertyBinding[key] = newBoundSet;
      parentEntityTypes[boundSet.fullyQualifiedName] = newBoundSet;
      Object.keys(boundSet.navigationPropertyBinding).forEach((k) => {
        addNavigationBindingRecursive(boundSet, k, newBoundSet);
      });
    }
  };

  const result: MetadataEntitySet = {
    ...set,
    kind: METADATA_ENTITY_SET_KIND,
    navigationPropertyBinding: {},
  };
  const bindingKeys = Object.keys(set.navigationPropertyBinding);
  bindingKeys.forEach((key) => {
    parentEntityTypes = { [set.fullyQualifiedName]: result };
    addNavigationBindingRecursive(set, key, result);
  });
  return result;
}

function convertMetadataEntityType<T extends MetadataEntityType>(
  entityType: T
): MetadataEntityType {
  const result: MetadataEntityType = {
    ...entityType,
    kind: METADATA_ENTITY_TYPE_KIND,
    properties: [],
    navigationProperties: [],
  };
  result.entityProperties = entityType.entityProperties.map((p) => ({
    ...p,
    kind: METADATA_ENTITY_PROPERTY_KIND,
  }));
  result.navigationProperties = entityType.navigationProperties.map((p) => ({
    ...p,
    kind: METADATA_ENTITY_NAVIGATION_PROPERTY_KIND,
  }));
  return result;
}

export function convertMetadata<
  B extends MetadataElementBase,
  S extends MetadataEntitySet,
  T extends MetadataEntityType
>(
  semanticModel: UI5SemanticModel,
  mergedModel: ExpectedMergedModel<B, S, T>
): void {
  if (mergedModel._entityContainer) {
    semanticModel.metadata.entityContainer = {
      ...mergedModel._entityContainer,
      kind: METADATA_ENTITY_CONTAINER_KIND,
    };
  }
  semanticModel.metadata.entitySets = mergedModel._entitySets.map((set) =>
    convertMetadataEntitySet(set)
  );
  semanticModel.metadata.entityTypes = mergedModel._entityTypes.map((type) =>
    convertMetadataEntityType(type)
  );
}
