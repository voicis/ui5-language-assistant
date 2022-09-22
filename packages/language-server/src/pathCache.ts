import { AnnotationPathCache } from "@ui5-language-assistant/semantic-model-types";

/**
 * recursively add type specific entries for element to provided map
 * @param context
 * @param fileUrisConcat
 * @param annotation
 * @param targetPath
 * @param aliasInfo
 */
export function addAnnotationToPathExpressionCache(
  // context: Context,
  // fileUrisConcat: string,
  cache: AnnotationPathCache,
  annotation: any,
  targetPath: string, //EdmValueType.PathValue,
  // aliasInfo: AliasInformation,
  addSupportForCodeCompletion?: boolean
): void {
  //   function handleElement(element: Element, path: EdmValueType.PathValue, valueType: ValueType, map: any, noDrill?: boolean): void {
  //     // add entry in path cache (map)
  //     const typeName = convertValueTypeToString(valueType);
  //     map[typeName] = map[typeName] || {};
  //     addPathToObject(map[typeName], path);
  //     // additional entry for corresponding abstract type (Collection, EntityType, ComplexType, PrimitiveType)
  //     const abstractType = getAbstractTypeName(context, typeName);
  //     if (abstractType && abstractType !== valueType.name) {
  //       map[abstractType] = map[abstractType] || {};
  //       addPathToObject(map[abstractType], path);
  //     }
  //     if (noDrill) {
  //       return;
  //     }
  //     // drill into content only where it complies with type
  //     if (valueType.asCollection) {
  //       if (element.name === 'Annotation') {
  //         // annotation value provided via attribute, e.g. path: no more cache entries
  //       } else if (element.name === 'Collection') {
  //         // loop over collection entries
  //         let index = 0;
  //         (element.content || []).forEach((subElement: Element) => {
  //           if (subElement.type === ELEMENT_TYPE) {
  //             if (subElement.name === 'Annotation') {
  //               addAnnotationToPathExpressionCache(context, fileUrisConcat, subElement, path, aliasInfo);
  //             } else {
  //               const valueTypeEntry = Object.assign({}, valueType);
  //               valueTypeEntry.asCollection = false;
  //               handleElement(subElement, path + '/' + String(index++), valueTypeEntry, map);
  //             }
  //           }
  //         });
  //       } else {
  //         // e.g. Path as sub node: no more cache entries
  //       }
  //     } else {
  //       let typeObject: VocabularyType = null;
  //       if (!valueType.name.startsWith('Edm.')) {
  //         typeObject = getVocabularyType(context, valueType.name);
  //       }
  //       if (typeObject && typeObject.kind === Edm.ComplexType) {
  //         let recordTypeName = valueType.name;
  //         if (element.name === 'Record' && getElementAttribute(element, 'Type')) {
  //           // specific type specified in Record
  //           recordTypeName = element.attributes['Type'].value || recordTypeName;
  //           recordTypeName = resolveName(recordTypeName, aliasInfo.aliasMapVocabulary).qName;
  //         }
  //         if (element.name === 'Annotation' || element.name === 'Record') {
  //           // get all possible properties of record type
  //           const structuredTypeDefinition: ExpandedComplexType = context.vocabularies.getComplexType(recordTypeName);
  //           const properties: Map<string, ComplexTypeProperty> = (structuredTypeDefinition && structuredTypeDefinition.properties) || new Map();

  //           const propNameMap: { [propertyName: string]: EdmNameType.FullyQualifiedTypeName } = {};
  //           properties.forEach(property => (propNameMap[property.name] = property.type));

  //           // handle all sub nodes representing properties
  //           (element.content || []).forEach((subElement: Element) => {
  //             if (subElement.name === 'Annotation') {
  //               addAnnotationToPathExpressionCache(context, fileUrisConcat, subElement, path, aliasInfo);
  //             } else if (subElement.name === 'PropertyValue') {
  //               const propName = getElementAttributeValue(subElement, Edm.Property) || '';
  //               if (propName) {
  //                 let property = properties.get(propName);
  //                 if (propName && !property && context.supportSplit) {
  //                   // split supported: record type might be coming from somewhere else - try to find any valid property for base type
  //                   const derivedTypeNames = [...context.vocabularies.getDerivedTypeNames(valueType.name)];
  //                   for (let i = 0; i < derivedTypeNames.length && !property; i++) {
  //                     property = context.vocabularies.getComplexTypeProperty(derivedTypeNames[i], propName);
  //                   }
  //                 }
  //                 if (property) {
  //                   // valid property
  //                   delete propNameMap[propName];
  //                   const valueTypeEntry: ValueType = {
  //                     name: property.type,
  //                     asCollection: property.isCollection,
  //                   };
  //                   handleElement(subElement, path + '/' + propName, valueTypeEntry, map);
  //                 }
  //               }
  //             }
  //           });

  //           if (!context.supportSplit) {
  //             // add cache entries for remaining properties
  //             // (not when split is supported: we don't know the correct type)
  //             Object.keys(propNameMap).forEach(propName => {
  //               const propTypeName = propNameMap[propName];
  //               map[propTypeName] = map[propTypeName] || {};
  //               addPathToObject(map[propTypeName], path + '/' + propName);
  //               const abstractType = getAbstractTypeName(context, typeName);
  //               if (abstractType && abstractType !== valueType.name) {
  //                 map[abstractType] = map[abstractType] || {};
  //                 addPathToObject(map[abstractType], path);
  //               }
  //             });
  //           }
  //         }
  //       }
  //     }
  //   }
  // resolve type for term
  const termName = annotation.term;
  // determine qualifier
  const qualifier = annotation.qualifier || "";
  // add term specific path to annotationPath cache (for specific term and for group containing all terms)
  cache[termName] = cache[termName] || {};

  const separator = "/";
  let path = "";

  // TODO: is this needed?

  //     // find out target type (different handling for NavigationProperty)
  //     const targetElement = lookupTarget(context, targetPath, aliasInfo).metadataElement;
  //     const targetKinds = targetElement ? context.metadata.getEdmTargetKinds(targetElement.path) : [];
  //     // annotations on navigation properties require segments like /toCurrency@Capabilities.InsertRestrictions
  //     // and are only supported by model paths (i.e. not suitable for path cache)
  //     // url://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/csprd06/odata-csdl-xml-v4.01-csprd06.html#sec_PathSyntax
  //     if (targetKinds.includes(Edm.NavigationProperty)) {
  //         // CDS associations have both target kinds: NavigationProperty and Property, if possible assign term to property
  //         if (
  //             !targetKinds.includes(Edm.Property) ||
  //             ((term.appliesTo || []).length && !term.appliesTo.includes(TargetKindValue.Property))
  //         ) {
  //             // term must be applied to navigation property - need to be referenced without separator
  //             separator = '';
  //         }
  //     }
  //     path = targetPath + separator + '@' + resolvedTermName.qName + (qualifier ? '#' + qualifier : '');
  // }
  path =
    targetPath +
    separator +
    "@" +
    termName +
    (qualifier ? "#" + qualifier : "");
  addPathToObject(cache[termName], path);

  // TODO: is it needed?
  // if (valueType.name.split('.').pop() === 'AggregatedPropertyType') {
  //     const props = getVirtualProperties(annotation);
  //     props.forEach((propertyName) => {
  //         const path = targetPath + separator + propertyName;
  //         if (!context.completionOnly) {
  //             context.pathExpressions.path[fileUrisConcat][EdmType.VirtualProperty] =
  //                 context.pathExpressions.path[fileUrisConcat][EdmType.VirtualProperty] || {};
  //             addPathToObject(context.pathExpressions.path[fileUrisConcat][EdmType.VirtualProperty], path);
  //         }
  //         if (addSupportForCodeCompletion) {
  //             context.pathExpressions.pathCc[fileUrisConcat][EdmType.VirtualProperty] =
  //                 context.pathExpressions.pathCc[fileUrisConcat][EdmType.VirtualProperty] || {};
  //             addPathToObject(context.pathExpressions.pathCc[fileUrisConcat][EdmType.VirtualProperty], path);
  //             // virtual property should be available for property path code completion
  //             context.pathExpressions.propertyPathCc[fileUrisConcat] =
  //                 context.pathExpressions.propertyPathCc[fileUrisConcat] || {};
  //             context.pathExpressions.propertyPathCc[fileUrisConcat][EdmType.VirtualProperty] =
  //                 context.pathExpressions.propertyPathCc[fileUrisConcat][EdmType.VirtualProperty] || {};
  //             addPathToObject(context.pathExpressions.propertyPathCc[fileUrisConcat][EdmType.VirtualProperty], path);
  //         }
  //     });
  // }

  function visitRecord(record: any, path: string) {
    cache[record.type] = cache[record.type] || {};
    addPathToObject(cache[record.type], path);
    record.propertyValues.forEach((prop) => {
      const propertyPath = path + "/" + prop.name;
      if (prop.value.type === "Record") {
        visitRecord(prop.value["Record"], propertyPath);
      }
      if (prop.value.type === "Collection") {
        visitCollection(prop.value["Collection"], propertyPath);
      }
    });
  }

  function visitCollection(collection: any, path: string) {
    if (collection.type === "Record") {
      collection.forEach((entry, idx) => {
        visitRecord(entry, path + "/" + idx);
      });
    }
  }

  // process records and collections
  if (annotation.record) {
    visitRecord(annotation.record, path);
  } else if (annotation.collection) {
    visitCollection(annotation.collection, path);
  }
}

export function addPathToObject(object: any, path: string, value?: any): void {
  if (typeof object === "object") {
    const segments = path.split("/");
    const lastIndex = segments.length - 1;
    let currentObject = object;
    segments.forEach((segment, index) => {
      if (segment) {
        if (currentObject[segment]) {
          if (index === lastIndex) {
            if (typeof currentObject[segment] === "object") {
              // object exists already for deeper path: set $Self property for path ending here
              currentObject[segment]["$Self"] = value || true;
            } else {
              // primitive target existed already - try to preserve it as $Self
              let selfValue = currentObject[segment];
              if (typeof value === "object") {
                if (
                  typeof selfValue === "boolean" ||
                  (value.$Self && typeof value.$Self !== "boolean")
                ) {
                  selfValue = value.$Self || true; // use non boolean (string) value if present
                }
                currentObject[segment] = Object.assign({}, value, {
                  $Self: selfValue,
                });
              } else if (
                typeof selfValue === "boolean" ||
                (value && typeof value !== "boolean")
              ) {
                currentObject[segment] = value || true; // preserve non boolean (string) value
              }
            }
          }
        } else {
          currentObject[segment] = index === lastIndex ? value || true : {};
        }
        if (index < lastIndex && typeof currentObject[segment] !== "object") {
          // prepare for deeper nesting: save primitive value in $Self attribute
          currentObject[segment] = { $Self: currentObject[segment] };
        }
        currentObject = currentObject[segment];
      }
    });
  }
}
