import {
  filterAnnotationsForControl,
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
import {
  EntityTypeFullyQualifiedName,
  Metadata,
  MetadataEntityType,
  MetadataEntityTypeProperty,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";

/**
 * Suggests values for macros metaPath
 */
export function metaPathSuggestions({
  element,
  attribute,
  context,
}: UI5AttributeValueCompletionOptions): (
  | AnnotationPathInXMLAttributeValueCompletion
  | PropertyPathInXMLAttributeValueCompletion
)[] {
  const result: (
    | AnnotationPathInXMLAttributeValueCompletion
    | PropertyPathInXMLAttributeValueCompletion
  )[] = [];
  const ui5Property = getUI5PropertyByXMLAttributeKey(attribute, context);

  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    let annotationList: any[] | undefined;
    const contextPath = getElementAttributeValue(element, "contextPath");
    const control = element.name || "";

    let targetName: string;
    if (typeof contextPath === "string") {
      targetName = contextPath;
      annotationList = collectAnnotationsForTarget(context, contextPath);
    } else {
      const entitySet = getEntitySetFromController(element, context) || "";
      targetName =
        getEntityTypeForEntitySet(context.metadata, entitySet)?.name ||
        entitySet;
      annotationList = collectAnnotationsForTarget(context, targetName);
    }

    // Entity type properties
    // TODO: provide props from associated targets
    if (isPropertyPathAllowed(control)) {
      result.push(
        ...getPropertyPathsForCompletion(context.metadata, targetName).map(
          (property) =>
            ({
              type: "PropertyPathInXMLAttributeValue",
              astNode: attribute,
              ui5Node: {
                kind: "PropertyPath",
                name: property,
                value: property,
              },
            } as PropertyPathInXMLAttributeValueCompletion)
        )
      );
    }
    // Annotation terms
    if (annotationList?.length) {
      const filteredAnnotations = filterAnnotationsForControl(
        control,
        annotationList
      );
      result.push(
        ...filteredAnnotations.map((annotation) => {
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
  metadata: Metadata,
  targetName: EntityTypeFullyQualifiedName
): string[] {
  const resolvedName = resolveMetadataElementName(metadata, targetName);
  const properties = metadata.entityTypes.find(
    (entry) => entry.fullyQualifiedName === (resolvedName.fqn || targetName)
  )?.entityProperties;
  return (properties || []).map((property) => property.name);
}

function isPropertyPathAllowed(control: string): boolean {
  return control === "Field";
}

function collectAnnotationsForTarget(model: UI5SemanticModel, target: string) {
  const resolvedTarget = resolveMetadataElementName(model.metadata, target);
  if (resolvedTarget.fqn) {
    const allowedTargetNames = [resolvedTarget.fqn, resolvedTarget.aliasedName];
    const annotationsForTarget = model.annotations.filter((annotationList) =>
      allowedTargetNames.includes(annotationList.target)
    );
    return [].concat(
      ...annotationsForTarget.map((entry) => entry.annotations || [])
    );
  } else {
    return [];
  }
}
