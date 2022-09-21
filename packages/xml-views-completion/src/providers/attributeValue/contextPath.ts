import { XMLElement } from "@xml-tools/ast";
import {
  filterAnnotationsForControl,
  getUI5PropertyByXMLAttributeKey,
  MetadataElementNameResolutionResult,
  resolveMetadataElementName,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationTargetInXMLAttributeValueCompletion } from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";
import {
  Metadata,
  MetadataEntitySet,
  MetadataEntityType,
  METADATA_ENTITY_TYPE_KIND,
} from "@ui5-language-assistant/semantic-model-types";

/**
 * Suggests values for macros metaPath
 */
export function contextPathSuggestions({
  element,
  attribute,
  context,
}: UI5AttributeValueCompletionOptions): AnnotationTargetInXMLAttributeValueCompletion[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(attribute, context);

  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "contextPath"
  ) {
    const control = element.name || "";
    const filteredTargets = isPropertyPathAllowed(control)
      ? context.metadata.entityTypes.map((entry) => entry.fullyQualifiedName)
      : context.annotations
          .filter(
            (entry) =>
              filterAnnotationsForControl(control, entry.annotations).length > 0
          )
          .map((entry) => entry.target);
    const targetMap = resolveTargets(context.metadata, filteredTargets);
    const distinctTargets = [
      ...new Set(
        filteredTargets
          .filter((t) => !!targetMap[t])
          .map((t) => `${targetMap[t].alias}.${targetMap[t].name}`)
      ),
    ];

    return distinctTargets.map((target) => {
      const namespaceEndIndex = target.lastIndexOf(".");
      const contextPath = `/${target.slice(namespaceEndIndex + 1)}`;
      return {
        type: "AnnotationTargetInXMLAttributeValue",
        astNode: attribute,
        ui5Node: {
          kind: "AnnotationTarget",
          name: contextPath,
          value: contextPath,
        },
      };
    });
  }
  return [];
}

function resolveTargets(
  metadata: Metadata,
  targets: string[]
): Record<string, MetadataElementNameResolutionResult> {
  const resolvedTargets = targets.map((t) =>
    resolveMetadataElementName(metadata, t)
  );
  const result: Record<string, MetadataElementNameResolutionResult> = {};
  resolvedTargets.forEach((rt) => {
    resolvedTargets.forEach((rt) => {
      if (rt.alias) {
        result[`${rt.alias}.${rt.name}`] = rt;
      }
      if (rt.fqn) {
        result[rt.fqn] = rt;
      }
    });
  });
  return result;
}

function isPropertyPathAllowed(control: string): boolean {
  return control === "Field";
}
