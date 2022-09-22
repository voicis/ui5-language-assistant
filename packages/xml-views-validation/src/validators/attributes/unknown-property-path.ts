import { XMLAttribute } from "@xml-tools/ast";
import {
  AppContext,
  Metadata,
  MetadataEntityType,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";
import {
  getElementAttributeValue,
  getEntitySetFromController,
  getEntityTypeForEntitySet,
  getUI5PropertyByXMLAttributeKey,
  resolveMetadataElementName,
} from "@ui5-language-assistant/logic-utils";
import { AnnotationIssue } from "../../../api";
import { isPossibleBindingAttributeValue } from "../../utils/is-binding-attribute-value";

export function validateUnknownPropertyPath(
  attribute: XMLAttribute,
  context: AppContext
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

  const ui5Property = getUI5PropertyByXMLAttributeKey(
    attribute,
    context.ui5Model
  );
  if (
    ui5Property?.library !== "sap.fe.macros" ||
    ui5Property?.name !== "metaPath"
  ) {
    return [];
  }
  if (!attribute.value || attribute.value.includes("@")) {
    // empty attribute or annotation path are handled in annotation path validator
    return [];
  }

  const element = attribute.parent;
  const contextPath = getElementAttributeValue(element, "contextPath");
  let target: MetadataEntityType | undefined;
  let targetName: string;
  const mainServicePath = context.manifest?.mainServicePath;
  const service = mainServicePath
    ? context.services[mainServicePath]
    : undefined;
  if (!service) {
    return [];
  }
  if (typeof contextPath === "string") {
    const resolvedName = resolveMetadataElementName(
      service.metadata,
      contextPath
    );
    target = service.metadata.entityTypes.find(
      (entry) => entry.fullyQualifiedName === resolvedName.fqn
    );
    targetName = contextPath;
  } else {
    const entitySet =
      getEntitySetFromController(element, context.manifest) || "";
    target = getEntityTypeForEntitySet(service.metadata, entitySet);
    targetName = target?.name || "";
  }

  const allowedProperties = target
    ? (
        service.metadata.entityTypes.find(
          (entry) => entry.fullyQualifiedName === target?.fullyQualifiedName
        )?.entityProperties || []
      ).map((prop) => prop.name)
    : [];

  // TODO: distinguish not allowed and not existing path
  if (!allowedProperties.includes(attribute.value)) {
    return [
      {
        kind: "PathDoesNotExist",
        message: `Path does not exist: "${targetName}/${attribute.value}"`,
        offsetRange: {
          start: actualAttributeValueToken.startOffset,
          end: actualAttributeValueToken.endOffset,
        },
        severity: "warn",
      },
    ];
  }

  return [];
}
