import { XMLAttribute } from "@xml-tools/ast";
import {
  Metadata,
  AppContext,
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
  context: AppContext
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

  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );
  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "contextPath"
  ) {
    const element = attribute.parent;
    const control = element.name || "";
    const mainServicePath = context.manifest?.mainServicePath;
    const service = mainServicePath
      ? context.services[mainServicePath]
      : undefined;
    if (!service) {
      return [];
    }
    const allowedTargets = isPropertyPathAllowed(control)
      ? service.metadata.entityTypes.map((entry) => entry.fullyQualifiedName)
      : service.annotations
          .filter(
            (entry) =>
              filterAnnotationsForControl(control, entry.annotations).length > 0
          )
          .map((entry) => entry.target);
    const allowedTargetsMap = resolveTargets(service.metadata, allowedTargets);
    const distinctAllowedTargets = [
      ...new Set(
        allowedTargets
          .filter((t) => !!allowedTargetsMap[t])
          .map((target) => {
            const namespaceEndIndex = target.indexOf(".");
            return `/${target.slice(namespaceEndIndex + 1)}`;
          })
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

    const allAvailableTargets = service.annotations.map(
      (entry) => entry.target
    );
    const allAvailableTargetsMap = resolveTargets(
      service.metadata,
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
      result[`/${rt.name}`] = rt;
    });
  });
  return result;
}

function isPropertyPathAllowed(control: string): boolean {
  return control === "Field";
}
