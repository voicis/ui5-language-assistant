import { XMLAttribute } from "@xml-tools/ast";
import { UI5SemanticModel } from "@ui5-language-assistant/semantic-model-types";
import {
  filterAnnotationsForControl,
  getElementAttributeValue,
  getEntitySetFromController,
  getUI5PropertyByXMLAttributeKey,
  getEntityTypeForEntitySet,
  resolveMetadataElementName,
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
  if (
    ui5Property?.library === "sap.fe.macros" &&
    ui5Property.name === "metaPath"
  ) {
    const element = attribute.parent;
    let annotationList: any[] | undefined;
    const contextPath = getElementAttributeValue(element, "contextPath");

    let target = contextPath;
    if (typeof contextPath === "string") {
      annotationList = collectAnnotationsForTarget(model, contextPath);
    } else {
      const entitySet = getEntitySetFromController(element, model) || "";
      target =
        getEntityTypeForEntitySet(model.metadata, entitySet)?.name || entitySet;
      annotationList = collectAnnotationsForTarget(model, target);
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

      if (!(attribute.value || "").includes("@")) {
        if (isPropertyPathAllowed(controlName)) {
          // The value seem to be a property path, another validator takes care
          return [];
        } else {
          return [
            {
              kind: "PropertyPathNotAllowed",
              message: `Property path not allowed. Use code completion to select annotation path`,
              offsetRange: {
                start: actualAttributeValueToken.startOffset,
                end: actualAttributeValueToken.endOffset,
              },
              severity: "warn",
            },
          ];
        }
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
          issue.message = `${issue.message}. There are no annotations in the project that are suitable for the current element`;
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

function isPropertyPathAllowed(control: string): boolean {
  return control === "Field";
}

function collectAnnotationsForTarget(model: UI5SemanticModel, target: string) {
  const resolvedTarget = resolveMetadataElementName(model.metadata, target);
  if (resolvedTarget.fqn) {
    const allowedTargetNames = [resolvedTarget.fqn, resolvedTarget.aliasedName];
    const annotationsForTarget = model.annotations.filter((annotationList) =>
      allowedTargetNames.includes(annotationList.target)
    );
    return [].concat(
      ...annotationsForTarget.map((entry) => entry.annotations || [])
    );
  } else {
    return [];
  }
}
