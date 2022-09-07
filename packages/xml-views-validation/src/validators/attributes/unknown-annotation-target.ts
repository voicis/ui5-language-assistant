import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import {
  Metadata,
  MetadataEntitySet,
  MetadataEntityType,
  METADATA_ENTITY_TYPE_KIND,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import {
  filterAnnotationsForControl,
  getUI5PropertyByXMLAttributeKey,
  MetadataElementNameResolutionResult,
  resolveMetadataElementName,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationIssue, UnknownEnumValueIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";

export function validateUnknownAnnotationTarget(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): (AnnotationIssue | UnknownEnumValueIssue)[] {
  const actualAttributeValue = attribute.value;
  const actualAttributeValueToken = attribute.syntax.value;
  if (
    actualAttributeValue === null ||
    actualAttributeValueToken === undefined ||
    isPossibleBindingAttributeValue(actualAttributeValue)
  ) {
    return [];
  }

  const ui5Property = getUI5PropertyByXMLAttributeKey(attribute, model);
  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "contextPath"
  ) {
    const element = attribute.parent;
    const control = element.name || "";
    const allowedTargets = isPropertyPathAllowed(control)
      ? model.metadata.entityTypes.map((entry) => entry.fullyQualifiedName)
      : model.annotations
          .filter(
            (entry) =>
              filterAnnotationsForControl(control, entry.annotations).length > 0
          )
          .map((entry) => entry.target);
    const allowedTargetsMap = resolveTargets(model.metadata, allowedTargets);
    const distinctAllowedTargets = [
      ...new Set(
        allowedTargets
          .filter((t) => !!allowedTargetsMap[t])
          .map(
            (t) => `${allowedTargetsMap[t].alias}.${allowedTargetsMap[t].name}`
          )
      ).values(),
    ];

    if (allowedTargetsMap[actualAttributeValue]) {
      return [];
    }

    // Target is mandatory
    if (!attribute.value) {
      return [
        {
          kind: "AnnotationTargetRequired",
          message: "Annotation target is required",
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }

    const allAvailableTargets = model.annotations.map((entry) => entry.target);
    const allAvailableTargetsMap = resolveTargets(
      model.metadata,
      allAvailableTargets
    );
    // Target itself is correct but doesn't suit current context
    if (allAvailableTargetsMap[actualAttributeValue]) {
      const issue = {
        kind: "InvalidAnnotationTarget",
        message: `Invalid annotation target: ${actualAttributeValueToken.image}`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      } as AnnotationIssue;

      if (allowedTargets.length === 0) {
        issue.message = `${issue.message}. There are no annotations in the project that are suitable for the current element`;
      } else {
        issue.message = `${
          issue.message
        }. Expected: ${distinctAllowedTargets.join(".")}`;
      }
      return [issue];
    } else {
      // Unknown target
      return [
        {
          kind: "UnknownEnumValue",
          message: `Unknown annotation target: ${actualAttributeValueToken.image}`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        },
      ];
    }
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
