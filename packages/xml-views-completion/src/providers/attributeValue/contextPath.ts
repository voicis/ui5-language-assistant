import { XMLElement } from "@xml-tools/ast";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { AnnotationTargetInXMLAttributeValueCompletion } from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";

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
    // TODO: filter based on completion context, i.e. element name
    const distinctTargets = getDistinctTargets(element, context.annotations);

    return distinctTargets.map((target) => {
      return {
        type: "AnnotationTargetInXMLAttributeValue",
        astNode: attribute,
        ui5Node: {
          kind: "AnnotationTarget",
          name: target,
          value: target,
        },
      };
    });
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
