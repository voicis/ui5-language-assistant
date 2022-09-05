import { XMLElement } from "@xml-tools/ast";
import { getRootElement } from "./xml-utils";

export function getEntitySetFromController(
  element: XMLElement,
  context: any
): string | undefined {
  let result: string | undefined;
  const controllerName = getRootElement(element).attributes.find(
    (attribute) => attribute.key === "controllerName"
  )?.value;
  if (controllerName) {
    result = context.customViews[controllerName]?.entitySet;
  }
  return result;
}

export function getAllowedAnnotationsTermsForControl(
  controlName: string
): string[] {
  switch (controlName) {
    case "FilterBar": {
      return ["com.sap.vocabularies.UI.v1.SelectionFields"];
    }
    case "Chart": {
      return ["com.sap.vocabularies.UI.v1.Chart"];
    }
  }
  return [];
}

export function filterAnnotationsForControl(
  control: string,
  annotations: any[]
): any[] {
  const terms = getAllowedAnnotationsTermsForControl(control);
  return annotations.filter((annotation) => terms.includes(annotation.term));
}
