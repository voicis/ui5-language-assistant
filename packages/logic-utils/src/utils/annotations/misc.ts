import { XMLElement } from "@xml-tools/ast";
import { getRootElement } from "./xml-utils";
import { specification } from "./spec";

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
  const spec = specification[controlName];
  if (spec) {
    return spec.allowedAnnotations;
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
