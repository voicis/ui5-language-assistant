import { XMLElement } from "@xml-tools/ast";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { AnnotationTargetInXMLAttributeValueCompletion } from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";
import { getRootElement } from "../utils/misc";

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
    // const controllerName = getRootElement(element).attributes.find(attribute => attribute.key === 'controllerName')?.value;
    // if (controllerName) {
    // const entitySet = context.customViews[controllerName]?.entitySet;
    // if (entitySet) {
    // const targetAnnotationsList = context.annotations.find(annotationList => annotationList.target.split('.').slice(-1)[0] === entitySet);
    // if (targetAnnotationsList) {

    // TODO: filter based on completion context, i.e. element name
    const control = ui5Property.parent?.name || "";
    const filteredTargets = context.annotations
      .filter(
        (entry) => filterAnnotations(control, entry.annotations).length > 0
      )
      .map((entry) => entry.target);
    const distinctTargets = [...new Set(filteredTargets).values()];

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
