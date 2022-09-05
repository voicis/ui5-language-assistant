import { XMLElement } from "@xml-tools/ast";
import {
  getElementAttributeValue,
  getEntitySetFromController,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationPathInXMLAttributeValueCompletion } from "../../../api";
import { UI5AttributeValueCompletionOptions } from "./index";
import { getRootElement } from "../utils/misc";

/**
 * Suggests values for macros metaPath
 */
export function metaPathSuggestions({
  element,
  attribute,
  context,
}: UI5AttributeValueCompletionOptions): AnnotationPathInXMLAttributeValueCompletion[] {
  const ui5Property = getUI5PropertyByXMLAttributeKey(attribute, context);

  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    let annotationList: any[] | undefined;
    const contextPath = getElementAttributeValue(element, "contextPath");

    if (typeof contextPath === "string") {
      annotationList = context.annotations.find(
        (annotationList) => annotationList.target === contextPath
      )?.annotations;
    } else {
      const entitySet = getEntitySetFromController(element, context);
      annotationList = context.annotations.find(
        (annotationList) =>
          annotationList.target.split(".").slice(-1)[0] === entitySet
      )?.annotations;
    }

    if (annotationList?.length) {
      const filteredAnnotations = filterAnnotations(
        element.name || "",
        annotationList
      );
      return filteredAnnotations.map((annotation) => {
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
        };
      });
    }
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
