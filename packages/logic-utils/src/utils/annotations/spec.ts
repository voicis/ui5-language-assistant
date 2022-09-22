export interface BuildingBlockSpecification {
  name: string;
  allowedAnnotations: string[];
  attributeLinks?: AttributeLink[];
}

export interface AttributeLink {
  controlName: string;
  localAttributeName: string;
  foreignAttributeName: string;
}

const specs: BuildingBlockSpecification[] = [
  {
    name: "FilterBar",
    allowedAnnotations: ["com.sap.vocabularies.UI.v1.SelectionFields"],
    attributeLinks: [
      {
        controlName: "Chart",
        localAttributeName: "id",
        foreignAttributeName: "filterBar",
      },
      {
        controlName: "MicroChart",
        localAttributeName: "id",
        foreignAttributeName: "filterBar",
      },
      {
        controlName: "Table",
        localAttributeName: "id",
        foreignAttributeName: "filterBar",
      },
    ],
  },
  {
    name: "Form",
    allowedAnnotations: ["com.sap.vocabularies.UI.v1.FieldGroup"],
  },
  {
    name: "Field",
    allowedAnnotations: [
      "com.sap.vocabularies.UI.v1.DataField",
      "com.sap.vocabularies.UI.v1.DataPoint",
    ],
  },
  {
    name: "MicroChart",
    allowedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"],
  },
  {
    name: "Chart",
    allowedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"],
  },
  {
    name: "Table",
    allowedAnnotations: [
      "com.sap.vocabularies.UI.v1.LineItem",
      "com.sap.vocabularies.UI.v1.PresentationVariant",
    ],
  },
];

export const specification: {
  [name: string]: BuildingBlockSpecification;
} = specs.reduce((acc, spec) => {
  acc[spec.name] = spec;
  return acc;
}, {});
