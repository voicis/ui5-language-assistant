import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { UnknownEnumValueIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";

export function validateUnknownAnnotationTarget(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): UnknownEnumValueIssue[] {
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
    const allowedTargets = getDistinctTargets(element, model.annotations);

    if (!allowedTargets.includes(actualAttributeValue)) {
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

function getDistinctTargets(element: XMLElement, annotations: any[]): string[] {
  const filteredTargets = annotations
    .filter(
      (entry) =>
        filterAnnotations(element.name || "", entry.annotations).length > 0
    )
    .map((entry) => entry.target);
  return [...new Set(filteredTargets).values()];
}

function filterAnnotations(control: string, annotations: any[]): any[] {
  switch (control) {
    case "FilterBar": {
      return annotations.filter(
        (annotation) =>
          annotation.term === "com.sap.vocabularies.UI.v1.SelectionFields"
      );
    }
    case "Chart": {
      return annotations.filter(
        (annotation) => annotation.term === "com.sap.vocabularies.UI.v1.Chart"
      );
    }
  }
  return [];
}
