import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import { getUI5PropertyByXMLAttributeKey } from "@ui5-language-assistant/logic-utils";
import { find, map } from "lodash";
import { UnknownEnumValueIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";

export function validateUnknownAnnotationPath(
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
  const propType = ui5Property?.type;
  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    const element = attribute.parent;
    const controllerName = getRootElement(element).attributes.find(
      (attribute) => attribute.key === "controllerName"
    )?.value;
    if (controllerName) {
      const entitySet = model.customViews[controllerName]?.entitySet;
      if (entitySet) {
        const annotationList = model.annotations.find(
          (annotationList) =>
            annotationList.target.split(".").slice(-1)[0] === entitySet
        )?.annotations;
        if (annotationList) {
          const filteredAnnotations = annotationList;
          const match = filteredAnnotations.find((annotation) => {
            const fullPath = annotation.qualifier
              ? `${annotation.term}#${annotation.qualifier}`
              : annotation.term;
            const path = `@${fullPath}`;
            return attribute.value === path;
          });
          if (!match) {
            return [
              {
                kind: "UnknownEnumValue",
                message: `Unknown annotation path: ${actualAttributeValueToken.image}`,
                offsetRange: {
                  start: actualAttributeValueToken.startOffset,
                  end: actualAttributeValueToken.endOffset,
                },
                severity: "warn",
              },
            ];
          }
        }
      }
    }
  }
  return [];
}

function getRootElement(element: XMLElement): XMLElement {
  let current: XMLElement = element;
  while (current.parent.type === "XMLElement") {
    current = current.parent;
  }
  return current;
}
