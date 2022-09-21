import type {
  Metadata,
  MetadataComplexType,
  MetadataElementBase as MetadataElement,
  MetadataEntitySet,
  MetadataEntityType,
  MetadataEntityTypeProperty,
  Path,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types/api";

// TODO: import them from semantic model defs
const METADATA_ENTITY_CONTAINER_KIND = "EntityContainer";
const METADATA_ENTITY_TYPE_KIND = "EntityType";
const METADATA_ENTITY_SET_KIND = "EntitySet";
const METADATA_ENTITY_PROPERTY_KIND = "Property";
const METADATA_ENTITY_NAVIGATION_PROPERTY_KIND = "NavigationProperty";
const METADATA_ACTION_KIND = "Action";
const METADATA_ACTION_PARAMETER_KIND = "ActionParameter";
const METADATA_ACTION_IMPORT_KIND = "ActionImport";
const METADATA_COMPLEX_TYPE_KIND = "ComplexType";

interface ExpectedMergedModel<
  B extends MetadataElement,
  S extends MetadataEntitySet,
  T extends MetadataEntityType,
  CT extends MetadataComplexType
> {
  _entityContainer: B;
  _entitySets: S[];
  _entityTypes: T[];
  _namespace: string;
  _references: { uri: string; alias: string; namespace: string }[];
  _complexTypes: CT[];
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
    isCollection: true,
    isEntityType: true,
  };
  const bindingKeys = Object.keys(set.navigationPropertyBinding);
  bindingKeys.forEach((key) => {
    parentEntityTypes = { [set.fullyQualifiedName]: result };
    addNavigationBindingRecursive(set, key, result);
  });
  return result;
}

function convertMetadataEntityType<
  T extends MetadataEntityType,
  ST extends MetadataComplexType
>(entityType: T, complexTypes: ST[]): MetadataEntityType {
  const result: MetadataEntityType = {
    ...entityType,
    kind: METADATA_ENTITY_TYPE_KIND,
    isCollection: true,
    isEntityType: true,
    properties: [],
    navigationProperties: [],
  };
  result.entityProperties = entityType.entityProperties.map((p) => {
    const property: MetadataEntityTypeProperty = {
      ...p,
      kind: METADATA_ENTITY_PROPERTY_KIND,
    };
    const { isCollection, edmPrimitiveType, structuredType } = resolveType(
      p.type,
      complexTypes
    );
    property.isCollection = isCollection;
    property.edmPrimitiveType = edmPrimitiveType;
    property.structuredType = structuredType;
    property.isComplexType = !!structuredType;
    return property;
  });
  result.navigationProperties = entityType.navigationProperties.map((p) => ({
    ...p,
    kind: METADATA_ENTITY_NAVIGATION_PROPERTY_KIND,
    isEntityType: true,
    structuredType: p.targetTypeName,
  }));
  return result;
}

function resolveType<T extends MetadataComplexType>(
  type: string,
  structuredTypes: T[]
): { edmPrimitiveType?: string; structuredType?: string; isCollection } {
  const isCollection = type.startsWith("Collection(");
  const typeName = isCollection
    ? type.slice("Collection(".length, type.length - 1)
    : type;
  const edmPrimitiveType = typeName.startsWith("Edm.") ? typeName : undefined;
  const structuredType = edmPrimitiveType
    ? undefined
    : structuredTypes.find((st) => st.fullyQualifiedName === typeName)
        ?.fullyQualifiedName;
  return { edmPrimitiveType, structuredType, isCollection };
}

function convertMetadataComplexType<
  T extends MetadataComplexType,
  ST extends MetadataComplexType
>(complexType: T, complexTypes: ST[]): MetadataComplexType {
  const result: MetadataComplexType = {
    ...complexType,
    kind: METADATA_COMPLEX_TYPE_KIND,
    properties: [],
    navigationProperties: [],
    isComplexType: true,
  };

  result.properties = complexType.properties.map((p) => {
    const property: MetadataEntityTypeProperty = {
      ...p,
      kind: METADATA_ENTITY_PROPERTY_KIND,
    };
    const { isCollection, edmPrimitiveType, structuredType } = resolveType(
      p.type,
      complexTypes
    );
    property.isCollection = isCollection;
    property.edmPrimitiveType = edmPrimitiveType;
    property.structuredType = structuredType;
    property.isComplexType = !!structuredType;
    return property;
  });
  result.navigationProperties = complexType.navigationProperties.map((p) => ({
    ...p,
    kind: METADATA_ENTITY_NAVIGATION_PROPERTY_KIND,
    isCollection: true,
    isEntityType: true,
    structuredType: p.targetTypeName,
  }));
  return result;
}

export function convertMetadata<
  B extends MetadataElement,
  S extends MetadataEntitySet,
  T extends MetadataEntityType,
  CT extends MetadataComplexType
>(
  semanticModel: UI5SemanticModel,
  mergedModel: ExpectedMergedModel<B, S, T, CT>
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
    convertMetadataEntityType(type, mergedModel._complexTypes)
  );
  semanticModel.metadata.complexTypes = mergedModel._complexTypes.map((type) =>
    convertMetadataComplexType(type, mergedModel._complexTypes)
  );
  semanticModel.metadata.namespace = mergedModel._namespace;
  semanticModel.metadata.namespaceAlias = mergedModel._references.find(
    (r) => r.namespace === mergedModel._namespace
  )?.alias;

  buildMetadataElementLookup(semanticModel.metadata);
  buildNavigationSourceMap(semanticModel.metadata);
}

function buildMetadataElementLookup(metadata: Metadata): void {
  const addNodesToMap = (nodes: MetadataElement | MetadataElement[]) => {
    (Array.isArray(nodes) ? nodes : [nodes]).forEach((node) => {
      const namespace = getNamespace(node.fullyQualifiedName);
      if (namespace) {
        metadata.namespaces.add(namespace);
      }
      if (node.name.includes("(")) {
        const actionName = getActionName(node.name);
        let overloadPaths = metadata.actionMap.get(actionName);
        if (!overloadPaths) {
          overloadPaths = new Set<string>();
          metadata.actionMap.set(actionName, overloadPaths);
        }
        overloadPaths.add(node.name);
      }
      metadata.lookupMap.set(node.fullyQualifiedName, node);
    });
  };

  for (const entry of metadata.entitySets) {
    addNodesToMap(entry);
    addNodesToMap(
      Object.keys(entry.navigationPropertyBinding)
        .filter((key) => key !== "SiblingEntity")
        .map((key) => entry.navigationPropertyBinding[key])
    );
  }

  for (const entry of metadata.entityTypes) {
    addNodesToMap(entry);
    addNodesToMap(
      entry.navigationProperties.filter(
        (prop) =>
          !["SiblingEntity", "DraftAdministrationData"].includes(prop.name)
      )
    );
    addNodesToMap(entry.entityProperties);
  }

  for (const action of metadata.actions) {
    addNodesToMap(action);
    addNodesToMap(action.parameters || []);
  }
}

function buildNavigationSourceMap(metadata: Metadata) {
  metadata.entityTypes.forEach((et) => {
    if (et.navigationProperties.length) {
      metadata.navigationSourceMap[et.fullyQualifiedName] = {};
      et.navigationProperties.forEach((prop) => {
        metadata.navigationSourceMap[et.fullyQualifiedName][
          prop.targetTypeName
        ] =
          metadata.navigationSourceMap[et.fullyQualifiedName][
            prop.targetTypeName
          ] || {};
        metadata.navigationSourceMap[et.fullyQualifiedName][
          prop.targetTypeName
        ][prop.name] = { isCollection: !!prop.isCollection };
      });
    }
  });
}

/**
 * Returns the namespace of an element identified by its path.
 *
 * @param path - Path of an element
 * @returns    - Namespace
 */
function getNamespace(path: string): string {
  let namespace = "";
  const segments = path.split("/");
  const firstSegment = segments[0] === "" ? segments[1] : segments[0];
  if (firstSegment) {
    // segment name for overloads can be <fqFunctionName>(<fqNamePar1>, <fqNamePar2>)
    // each fqName can contain dots
    const beforeFirstBracket = firstSegment.split("(")[0];
    const parts = beforeFirstBracket.split(".");
    parts.pop();
    namespace = parts.join(".");
  }
  return namespace;
}

function getActionName(name: Path): Path {
  // extract action/function name by removing the part enclosed in parentheses
  const partsOpen = name.split("(");
  const partsClose = name.split(")");
  return partsOpen.length > 1 && partsClose.length > 1
    ? (partsOpen.shift() ?? "") + (partsClose.pop() ?? "")
    : name;
}
