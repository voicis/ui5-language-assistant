import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  getUI5PropertyByXMLAttributeKey,
  getUI5ClassByXMLElement,
} from "@ui5-language-assistant/logic-utils";
import { find, map } from "lodash";
import { UnknownEnumValueIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";

const SAP_FE_MACROS = "sap.fe.macros";

export function validateUnknownElementId(
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
  // filterBar id validation
  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "filterBar"
  ) {
    const element = attribute.parent;
    const root = getRootElement(element);
    const ids = collectFilterBarElements(root, model);
    if (!ids.includes(actualAttributeValue)) {
      return [
        {
          kind: "UnknownEnumValue",
          message: `Unknown element id: ${actualAttributeValueToken.image}`,
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

function getRootElement(element: XMLElement): XMLElement {
  let current: XMLElement = element;
  while (current.parent.type === "XMLElement") {
    current = current.parent;
  }
  return current;
}

export function collectFilterBarElements(
  element: XMLElement,
  model: UI5SemanticModel
): string[] {
  const ids: string[] = [];
  for (const child of element.subElements) {
    const ui5Class = getUI5ClassByXMLElement(child, model);
    if (ui5Class?.name === "FilterBar" && ui5Class.library === SAP_FE_MACROS) {
      const id = child.attributes.find((attribute) => attribute.key === "id")
        ?.value;
      if (id) {
        ids.push(id);
      }
    } else {
      const childIds = collectFilterBarElements(child, model);
      if (childIds.length) {
        Array.prototype.push.apply(ids, childIds);
      }
    }
  }

  return ids;
}
