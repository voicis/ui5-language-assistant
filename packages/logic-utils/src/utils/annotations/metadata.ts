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

  const segments = name.split("/");

  if (!segments[0]) {
    segments[0] = ns;
  } else if (segments[0].includes(".")) {
    const parts = segments[0].split(".");
    segments[0] = parts.pop() || "";
    segments.unshift(parts.join("."));
  }

  if (segments.length === 1) {
    return {
      alias: nsAlias,
      name: segments[0],
      aliasedName: `${nsAlias}.${segments[0]}`,
      fqn: `${ns}.${segments[0]}`,
      namespace: ns,
    };
  } else {
    if (![ns, nsAlias].includes(segments[0])) {
      return { name };
    }
    const namePart = segments.slice(1).join("/");
    return {
      alias: nsAlias,
      name: namePart,
      aliasedName: `${nsAlias}.${namePart}`,
      fqn: `${ns}.${namePart}`,
      namespace: ns,
    };
  }
}
