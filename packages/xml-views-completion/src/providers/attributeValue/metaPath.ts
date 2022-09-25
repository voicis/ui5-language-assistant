import {
  filterAnnotationsForControl,
  getAllowedAnnotationsTermsForControl,
  getElementAttributeValue,
  getEntitySetFromController,
  getEntityTypeForEntitySet,
  getUI5PropertyByXMLAttributeKey,
  resolveMetadataElementName,
} from "@ui5-language-assistant/logic-utils";
import {
  AnnotationPathInXMLAttributeValueCompletion,
  PropertyPathInXMLAttributeValueCompletion,
} from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";
import type {
  AppContext,
  EntityTypeFullyQualifiedName,
  Metadata,
  MetadataElementFullyQualifiedName,
  MetadataEntityTypeNavigationProperty,
  ServiceDetails,
} from "@ui5-language-assistant/semantic-model-types";
import { completePathExpressions, EdmType } from "./pathUtils";
import { ConvertedMetadata } from "@sap-ux/vocabularies-types";
import { AnnotationTerm } from "@ui5-language-assistant/logic-utils/src/api";
import { EntityTypeAnnotations } from "@sap-ux/vocabularies-types/vocabularies/Edm_Types";

export interface CompletionItem {
  name: string;
  text: string;
  commitCharacters: string[];
  commitCharacterRequired: boolean;
  // documentation: { kind: MarkupKind.Markdown, value: documentation.join('\n') }
}

/**
 * Suggests values for macros metaPath
 */
export function metaPathSuggestions({
  element,
  attribute,
  context,
  prefix,
}: UI5AttributeValueCompletionOptions): (
  | AnnotationPathInXMLAttributeValueCompletion
  | PropertyPathInXMLAttributeValueCompletion
)[] {
  const result: (
    | AnnotationPathInXMLAttributeValueCompletion
    | PropertyPathInXMLAttributeValueCompletion
  )[] = [];
  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );

  const startString = prefix || "";
  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    let annotationList: any[] | undefined;
    // ui5Property.
    let contextPath = getElementAttributeValue(element, "contextPath");
    const control = element.name ?? "";
    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    if (typeof contextPath === "string") {
      annotationList = collectAnnotationsForTarget(
        service.annotations,
        contextPath
      );
    } else {
      const entitySet =
        getEntitySetFromController(element, context.manifest) ?? "";
      contextPath = `/${entitySet}`;
      const type = service.convertedMetadata.entitySets.find(
        (e) => e.name === entitySet
      )?.entityTypeName;
      if (type) {
        const allowedTerms = getAllowedAnnotationsTermsForControl(control);
        annotationList = collectAnnotationsForType(
          service.convertedMetadata,
          type,
          allowedTerms
        );
      }
    }

    // Entity type properties
    // TODO: provide props from associated targets
    if (isPropertyPathAllowed(control)) {
      result.push(
        ...getPropertyPathsForCompletion(service, contextPath, startString).map(
          (property) =>
            ({
              type: "PropertyPathInXMLAttributeValue",
              astNode: attribute,
              ui5Node: {
                kind: "PropertyPath",
                name: property.name,
                value: property.text,
              },
              details: {
                startString,
                remainingString:
                  attribute.value?.slice(startString.length) || "",
                commitCharacters: property.commitCharacterRequired
                  ? property.commitCharacters
                  : [],
              },
            } as PropertyPathInXMLAttributeValueCompletion)
        )
      );
    }
    // Annotation terms
    if (annotationList?.length) {
      result.push(
        ...annotationList.map((annotation) => {
          const fullPath = annotation.qualifier
            ? `${annotation.term}#${annotation.qualifier}`
            : annotation.term;
          return {
            type: "AnnotationPathInXMLAttributeValue",
            astNode: attribute,
            ui5Node: {
              kind: "AnnotationPath",
              name: `@${fullPath}`,
              value: `@${fullPath}`,
            },
          } as AnnotationPathInXMLAttributeValueCompletion;
        })
      );
    }
    return result;
  }

  // const prefix = prefix ?? "";
  // const prefixMatchingValues = filterMembersForSuggestion(
  //   [],
  //   prefix,
  //   []
  // );

  // const completions: BooleanValueInXMLAttributeValueCompletion[] = map(
  //   prefixMatchingValues,
  //   (_) => ({
  //     type: "BooleanValueInXMLAttributeValue",
  //     astNode: attribute as XMLAttribute,
  //     ui5Node: _,
  //   })
  // );
  return [];
}

function getPropertyPathsForCompletion(
  service: ServiceDetails,
  targetName: EntityTypeFullyQualifiedName,
  startString: string
): CompletionItem[] {
  const result: CompletionItem[] = [];
  const resolvedName = resolveMetadataElementName(service.metadata, targetName);
  // const properties = metadata.entityTypes.find(entry => entry.fullyQualifiedName === (resolvedName.fqn || targetName))?.entityProperties || [];
  // result.push(...properties.map(property => property.name));

  // const associations = getAssociationsForEntityType(metadata, resolvedName.fqn || '');
  // associations.forEach(a => {
  //   const props = metadata.entityTypes.find(entry => entry.fullyQualifiedName === a.targetTypeName)?.entityProperties || [];
  //   result.push(...props.map(property => `${a.name}/${property.name}`));
  // });

  const opts = getCompletionOptionsForPath(
    service,
    resolvedName.fqn || "",
    startString
  );
  return [...result, ...opts];
}

function getCompletionOptionsForPath(
  service: ServiceDetails,
  targetName: MetadataElementFullyQualifiedName,
  path: string
): CompletionItem[] {
  const pathBase = service.metadata.lookupMap.get(targetName);
  if (!pathBase) {
    return [];
  }
  //const terms = completePathExpressions(context.metadata, context.pathExpressions, pathBase, ['com.sap.vocabularies.UI.v1.LineItem'], [],  path);
  const requestedTypes = determineTypesForCacheLookup([
    "NavigationProperty",
    "Property",
  ]);
  const properties = completePathExpressions(
    service.metadata,
    service.pathExpressions,
    pathBase,
    [],
    requestedTypes,
    path
  );
  return [...properties];
}

function determineTypesForCacheLookup(
  requestedPathTargetTypes: string[]
): (EdmType | "")[] {
  const UI5toEdmTypesMap = {
    EntitySet: EdmType.EntitySet,
    EntityType: EdmType.EntityType,
    Singleton: EdmType.Singleton,
    Property: EdmType.PropertyPath,
    NavigationProperty: EdmType.NavigationPropertyPath,
  };

  const types: Set<EdmType | ""> = new Set();
  requestedPathTargetTypes.forEach((requestedPathTargetType) => {
    const requestedEdmTarget = UI5toEdmTypesMap[requestedPathTargetType];

    switch (requestedEdmTarget) {
      case EdmType.EntityType:
        types.add(EdmType.EntityType);
        break;
      case EdmType.EntitySet:
        types.add(EdmType.EntitySet);
        break;
      case EdmType.Singleton:
        types.add(EdmType.Singleton);
        break;
      case EdmType.PropertyPath:
        types.add(EdmType.PrimitiveType);
        types.add(EdmType.ComplexType);
        break;
      case EdmType.NavigationPropertyPath:
        types.add(EdmType.EntityType);
        break;
    }
  });
  return [...types];
}

//
function getAssociationsForEntityType(
  metadata: Metadata,
  entityTypeName: EntityTypeFullyQualifiedName
): MetadataEntityTypeNavigationProperty[] {
  const props =
    metadata.entityTypes.find(
      (entry) => entry.fullyQualifiedName === entityTypeName
    )?.navigationProperties || [];
  // filter out SiblingEntity pointing to entity itself and DraftAdministrationData which is marked with containsTarget=true
  return props.filter(
    (p) => !p.containsTarget && p.targetTypeName !== entityTypeName
  );
}

function isPropertyPathAllowed(control: string): boolean {
  return control === "Field";
}

function collectAnnotationsForType(
  convertedMetadata: ConvertedMetadata,
  entityType: string,
  allowedTerms: AnnotationTerm[]
): any[] {
  const type = convertedMetadata.entityTypes.find(
    (entity) => entity.fullyQualifiedName === entityType
  );
  const matchedAnnotations: any[] = [];
  if (type) {
    for (const term of allowedTerms) {
      const annotations = type.annotations[term.alias];
      const paths = Object.keys(annotations);
      for (const path of paths) {
        const annotation = annotations[path];
        if (annotation.term === term.fullyQualifiedName) {
          matchedAnnotations.push(annotation);
        }
      }
    }
  }
  return matchedAnnotations;
}

function collectAnnotationsForTarget(annotations: any[], contextPath: string) {
  const annotationsForTarget = annotations.filter((annotationList) => {
    const namespaceEndIndex = annotationList.target.indexOf(".");

    return (
      contextPath === `/${annotationList.target.slice(namespaceEndIndex + 1)}`
    );
  });
  return [].concat(
    ...annotationsForTarget.map((entry) => entry.annotations || [])
  );
}

// function resolveContextPath(convertedMetadata: ConvertedMetadata, contextPath: string): string | undefined {
//   if (!contextPath.startsWith('/')) {
//     // relative paths not supported;
//     return undefined;
//   }
//   const segments = contextPath.split('/');
//   const firstSegment = segments[0];
//   if (!firstSegment) {
//     return undefined
//   }
//   const entitySet = convertedMetadata.entitySets.
// }

// function collectPaths()
