import { XMLAttribute, XMLElement } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  filterAnnotationsForControl,
  getAllowedAnnotationsTermsForControl,
  getElementAttributeValue,
  getEntitySetFromController,
  getUI5PropertyByXMLAttributeKey,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";

export function validateUnknownAnnotationPath(
  attribute: XMLAttribute,
  model: UI5SemanticModel
): AnnotationIssue[] {
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
    let annotationList: any[] | undefined;
    const contextPath = getElementAttributeValue(element, "contextPath");

    let target = contextPath;
    if (typeof contextPath === "string") {
      annotationList = model.annotations.find(
        (annotationList) => annotationList.target === contextPath
      )?.annotations;
    } else {
      const entitySet = getEntitySetFromController(element, model);
      target = entitySet;
      annotationList = model.annotations.find(
        (annotationList) =>
          annotationList.target.split(".").slice(-1)[0] === entitySet
      )?.annotations;
    }

    const controlName = element.name || "";
    const filteredAnnotations = filterAnnotationsForControl(
      controlName,
      annotationList || []
    );

    const match = filteredAnnotations.find(
      (annotation) => annotationToPath(annotation) === attribute.value
    );
    if (!match) {
      if (!attribute.value) {
        return [
          {
            kind: "AnnotationPathRequired",
            message: "Annotation path is required",
            offsetRange: {
              start: actualAttributeValueToken.startOffset,
              end: actualAttributeValueToken.endOffset,
            },
            severity: "warn",
          },
        ];
      }

      const isAnnotationExists = (annotationList || []).find(
        (annotation) => annotationToPath(annotation) === attribute.value
      );
      if (isAnnotationExists) {
        // Wrong term or no suitable annotations for control
        const issue = {
          kind: "InvalidAnnotationTerm",
          message: `Invalid term: ${actualAttributeValueToken.image}`,
          offsetRange: {
            start: actualAttributeValueToken.startOffset,
            end: actualAttributeValueToken.endOffset,
          },
          severity: "warn",
        } as AnnotationIssue;

        if (filteredAnnotations.length) {
          const expectedTerms = filteredAnnotations.map((annotation) =>
            annotationToPath(annotation)
          );
          issue.message = `${issue.message}. Expected: ${expectedTerms.join(
            ","
          )}`;
        } else {
          issue.message = `${issue.message}. There are no suitable annotations in the project for the current metaPath`;
        }

        return [issue];
      }

      return [
        {
          kind: "PathDoesNotExist",
          message: `Path does not exist: "${target}/${attribute.value}"`,
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

function annotationToPath(annotation: {
  term: string;
  qualifier?: string;
}): string {
  const fullPath = annotation.qualifier
    ? `${annotation.term}#${annotation.qualifier}`
    : annotation.term;
  return `@${fullPath}`;
}
