import type {
  EntitySetFullyQualifiedName,
  Metadata,
  MetadataEntityType,
} from "@ui5-language-assistant/semantic-model-types";

export function getEntityTypeForEntitySet(
  metadata: Metadata,
  entitySetName: EntitySetFullyQualifiedName
): MetadataEntityType | undefined {
  const entityTypeName = metadata.entitySets.find(
    (set) => set.name === entitySetName
  )?.entityTypeName;
  return metadata.entityTypes.find(
    (type) => type.fullyQualifiedName === entityTypeName
  );
}

export type MetadataElementNameResolutionResult = {
  alias?: string;
  namespace?: string;
  fqn?: string;
  name: string;
  aliasedName?: string;
};

export function resolveMetadataElementName(
  metadata: Metadata,
  name: string
): MetadataElementNameResolutionResult {
  const ns = metadata.namespace;
  const nsAlias = metadata.namespaceAlias;
  const parts = name.split(".");
  if (parts.length === 1) {
    return {
      alias: nsAlias,
      name,
      aliasedName: `${nsAlias}.${name}`,
      fqn: `${ns}.${name}`,
      namespace: ns,
    };
  } else {
    const namePart = parts.pop();
    const prefix = parts.join(".");
    if (![ns, nsAlias].includes(prefix)) {
      return { name };
    }
    return {
      alias: nsAlias,
      name: namePart as string,
      aliasedName: `${nsAlias}.${namePart}`,
      fqn: `${ns}.${namePart}`,
      namespace: ns,
    };
  }
}
