import { resolveMetadataElementName } from "@ui5-language-assistant/logic-utils";
import {
  AnnotationPathCache,
  Metadata,
  MetadataElementBase,
  NavigationMap,
  PathCache,
} from "@ui5-language-assistant/semantic-model-types";

export type NextPossibleSegment = {
  name: string;
  kind: string;
  usages: SegmentUsage;
};

export interface CaseIssue {
  correct: string;
  wrong: string;
}

export enum EdmType {
  EntitySet = "Edm.EntitySet",
  EntityType = "Edm.EntityType",
  Singleton = "Edm.Singleton",
  PropertyPath = "Edm.PropertyPath",
  NavigationPropertyPath = "Edm.NavigationPropertyPath",
  PrimitiveType = "Edm.PrimitiveType",
  ComplexType = "Edm.ComplexType",
}

interface GetPathInfoResult {
  value: boolean | string; // value stored for this path in path cache (in case sub segments exist: value of $Self)
  nextPossibleSegments: NextPossibleSegment[];
  validPath: boolean;
  invalidSegmentIndex: number;
  caseIssues: CaseIssue | undefined;
  isCollection: boolean;
}

export enum SegmentUsage {
  asLastSegmentOnly = "Last",
  asIntermediateSegmentOnly = "Intermediate",
  asLastOrIntermediateSegment = "LastOrIntermediate",
}

/**
 * complete path expressions
 * @param valueHandlingContext
 * @param valueType
 * @param pathKind
 * @param startString
 */
export function completePathExpressions(
  metadata: Metadata,
  pathExpressions: any,
  pathBase: MetadataElementBase,
  // valueType: ValueType,
  terms: string[],
  types: string[],
  startString: string
): {
  name: string;
  text: string;
  commitCharacters: string[];
  commitCharacterRequired: boolean;
  // documentation: { kind: MarkupKind.Markdown, value: documentation.join('\n') }
}[] {
  const completionItems: any[] = [];
  // determine array of segments (replacing aliases with namespaces) from path (converted to absolute path)
  const path = (startString || "").trim();
  // if (valueHandlingContext.context.supportSplit && path.startsWith('/')) {
  //     return [];
  // } // no support of absolute paths in CDS
  const { segments, baseSegmentsCount } = determineSegmentsFromPath(
    path,
    pathBase,
    true
  );
  // determine array of types and/or array of terms to be used for lookup in path cache
  // const { types, terms } = determineTermsTypesForCacheLookup(valueHandlingContext, valueType, pathKind);

  // read the cache
  const pathInfo = getPathInfo(
    pathExpressions,
    metadata,
    segments,
    types,
    terms,
    false,
    baseSegmentsCount
  );
  if (pathInfo.validPath) {
    pathInfo.nextPossibleSegments.forEach((segment) => {
      const completionText = segment.name;
      // convert namespaces to alias
      if (completionText.includes(".")) {
        // const indexTerm = completionText.indexOf('@') + 1;
        // if (indexTerm) {
        //     let termName = completionText.slice(indexTerm);
        //     termName = getAliasQualifiedNameDefVoc(termName, namespaceToAlias);
        //     completionText = completionText.slice(0, indexTerm) + termName;
        // } else {
        //     completionText = getAliasQualifiedName(completionText, valueHandlingContext.aliasInfo);
        // }
      }

      const documentation: string[] = [];
      // let truncatedText: string;
      if (completionText.includes(".")) {
        const indexAt = completionText.indexOf("@");
        const qualifiedName =
          indexAt >= 0 ? completionText.slice(indexAt + 1) : completionText;
        // truncatedText = appendNameToDocumentationAndTruncate(
        //     qualifiedName,
        //     documentation,
        //     valueHandlingContext.context,
        //     true,
        //     valueHandlingContext.aliasInfo
        // );
        // truncatedText = completionText.replace(qualifiedName, truncatedText);
      } else {
        // truncatedText = appendNameToDocumentationAndTruncate(
        //     completionText,
        //     documentation,
        //     valueHandlingContext.context,
        //     false,
        //     null,
        //     'Item'
        // );
      }
      const truncatedText = completionText;

      if (completionText) {
        completionItems.push({
          name: completionText,
          text: truncatedText,
          commitCharacters:
            segment.usages === SegmentUsage.asLastSegmentOnly ? [] : ["/"],
          commitCharacterRequired:
            segment.usages === SegmentUsage.asIntermediateSegmentOnly,
          // documentation: { kind: MarkupKind.Markdown, value: documentation.join('\n') }
        });
      }
    });
  }

  return completionItems;
}

// /**
//  * determine array of types and/or array of terms to be used for lookup in path cache
//  * @param valueType
//  * @param pathKind
//  */
//  function determineTermsTypesForCacheLookup(
//     valueHandlingContext: ValueHandlingContext,
//     valueType: ValueType,
//     pathKind: PathKind
// ): { types: EdmNameType.FullyQualifiedTypeName[]; terms: EdmNameType.FullyQualifiedName[] } {
//     // determine cache (type based/term based) and list of types/terms to consider
//     const types: EdmNameType.FullyQualifiedTypeName[] = [];
//     let terms: EdmNameType.FullyQualifiedName[] = [];
//     const valueTypeAsString = convertValueTypeToString(valueType);
//     const derivedTypes: Set<EdmNameType.FullyQualifiedName> =
//         valueHandlingContext.context.vocabularies.getDerivedTypeNames(valueType.name);
//     const typeDefinition = valueHandlingContext.context.vocabularies.getType(valueType.name);
//     if (typeDefinition && typeDefinition.kind === Edm.TypeDefinition && typeDefinition.underlyingType) {
//         derivedTypes.add(typeDefinition.underlyingType);
//     }

//     if (pathKind === Edm.Path) {
//         types.push(valueTypeAsString);
//         const vocabularyType = getVocabularyType(valueHandlingContext.context, valueType.name);
//         if (
//             (vocabularyType && vocabularyType.kind === Edm.EnumType) ||
//             ([EdmType.Decimal, EdmType.Double] as string[]).includes(valueType.name)
//         ) {
//             // add all integer types as well
//             Object.keys(primitiveTypeMap)
//                 .filter((primitiveType) => primitiveTypeMap[primitiveType].constantExpressionName === Edm.Int)
//                 .forEach((typeName) => types.push(typeName));
//         } else {
//             // add derived types
//             derivedTypes.forEach((type) => {
//                 types.push(convertValueTypeToString({ name: type, asCollection: valueType.asCollection }));
//             });
//         }

//         if (vocabularyType?.kind === Edm.EnumType) {
//             // add string type as well
//             types.push(EdmType.String);
//         }
//     } else {
//         const pathTypes = (pathTypeMap[valueTypeAsString] &&
//             pathTypeMap[valueTypeAsString].validNonAbstractPathTypes) || [valueTypeAsString];
//         (pathTypes || []).forEach((nonAbstractType) => {
//             switch (nonAbstractType) {
//                 case EdmType.Property:
//                     types.push(
//                         EdmType.PrimitiveType,
//                         EdmType.ComplexType,
//                         EdmType.NonEntityTypeCollection,
//                         EdmType.VirtualProperty
//                     );
//                     break;
//                 case EdmType.NavigationPropertyPath:
//                     types.push(EdmType.EntityType, EdmType.EntityTypeCollection);
//                     break;
//                 case EdmType.AnnotationPath:
//                     if (valueType.constraints && valueType.constraints.allowedTerms.length > 0) {
//                         terms = terms.concat(valueType.constraints.allowedTerms); // allow restricted terms only
//                     }
//                     if (!terms.length) {
//                         terms.push(cacheKeyAnyTermName); // allow any term
//                     }
//                     break;
//             }
//         });
//     }
//     return { types, terms };
// }

/**
 * determine array of segments (replacing aliases with namespaces) from path (converted to absolute path)
 * @param path
 * @param valueHandlingContext
 * @param forCompletion
 */
export function determineSegmentsFromPath(
  path,
  pathBase: MetadataElementBase,
  forCompletion?: boolean
): {
  segments: string[];
  originalSegments: string[];
  lastSegment: string;
  baseSegmentsCount: number;
} {
  let absolutePath = path;
  let baseSegmentsCount = 0;
  if (!path.startsWith("/")) {
    absolutePath = "/" + pathBase.fullyQualifiedName;
    absolutePath += path ? `/${path}` : "";
    baseSegmentsCount = pathBase.fullyQualifiedName.split("/").length;
  }
  absolutePath = absolutePath.slice(1);
  const originalSegments = absolutePath.split("/");
  // for completion? separate completed segments from (maybe unfinished) last segment, remove aliases from completed segments
  const lastSegment = forCompletion && path ? originalSegments.pop() : "";
  const segments = originalSegments.map((originalSegment) => {
    // TODO: return getSegmentWithoutAlias(valueHandlingContext.aliasInfo, originalSegment);
    return originalSegment;
  });
  return { segments, originalSegments, lastSegment, baseSegmentsCount };
}

export function getPathInfo(
  pathExpressions: any,
  metadata: Metadata,
  segments: string[],
  types: string[],
  terms: string[],
  forCheck: boolean,
  baseSegmentsCount = 0
): GetPathInfoResult {
  const pathInfo: GetPathInfoResult = {
    value: true,
    nextPossibleSegments: [],
    validPath: true,
    invalidSegmentIndex: -1,
    caseIssues: undefined,
    isCollection: false,
  };

  // determine cache to look at and types or terms to consider
  const isPropertyPath = false; //types.includes(EdmType.VirtualProperty); // VirtualProperty is only requested for propertyPath
  const isNavigationPropertyPath =
    types.includes(EdmType.EntityType) ||
    types.includes(EdmType.EntitySet) ||
    types.includes(EdmType.NavigationPropertyPath);
  let lookupProperty = "";
  if (forCheck) {
    lookupProperty = types.length
      ? "path"
      : terms.length
      ? "annotationPath"
      : "targetPath";
    //   } else if (isPropertyPath) {
    //     lookupProperty = 'propertyPathCc';
  } else {
    lookupProperty = types.length
      ? "pathCc"
      : terms.length
      ? "annotationPathCc"
      : "targetPath";
  }
  // 1:n associations in paths are only allowed for "model" but not for "instance" paths
  // TODO: support mixture of collection like and single-tone types ?
  const isTypesAreCollections = types.every((t) => t.startsWith("Collection("));
  const isCollectionAllowed =
    isNavigationPropertyPath ||
    isPropertyPath ||
    !lookupProperty.startsWith("path") ||
    isTypesAreCollections;
  //   || types.includes(EdmType.PrimitiveCollection); // used e.g. for UI.DataField/Value
  const lookup = pathExpressions[lookupProperty];
  const termsOrTypes = types.length ? types : terms.length ? terms : [""];
  let lookupResult: any;

  if (segments.length === 0) {
    // no segments so far - get/check availability of start segments
    lookupResult = {};
    collectPathResultsFromCache(
      lookup,
      termsOrTypes,
      [],
      forCheck,
      forCheck,
      lookupResult
    );
  } else if (
    segments[0].indexOf(".") < 0 &&
    !metadata.lookupMap.has(
      resolveMetadataElementName(metadata, segments[0]).fqn || ""
    )
  ) {
    // invalid: if no namespace is used, at least first segment needs to be valid root element in metadata service
    pathInfo.invalidSegmentIndex = 0;
  } else {
    // a branch represents a way to follow a path, i.e.
    // Container/entitySet/ could be followed by annotations of entitySet or corresponding entity type
    const branches: string[][] = [[]];
    // check availability segment by segment
    for (let i = 0; i < segments.length; i++) {
      const isLastSegment = segments.length - 1 === i;
      const checkExistenceOnly = !isLastSegment;
      branches.forEach((branch) => branch.push(segments[i]));
      lookupResult = {};
      const deleteIndices: number[] = [];
      for (let j = 0; j < branches.length; j++) {
        const currentSegments: string[] = branches[j];
        // if path represents navigation to something else: append new branch
        const {
          schemaChildByNav,
          schemaChildByNavCaseIssue,
          isCollection,
        } = getNavTarget(
          metadata,
          currentSegments,
          isCollectionAllowed || i < baseSegmentsCount
        );
        if (schemaChildByNav) {
          branches.push([schemaChildByNav]);
        }
        if (
          (isLastSegment && forCheck && lookupResult.$Self) ||
          (checkExistenceOnly && Object.keys(lookupResult).length)
        ) {
          break; // already found what we were looking for
        }
        // collect results from all segments for branch
        const { found, caseIssues } = collectPathResultsFromCache(
          lookup,
          termsOrTypes,
          currentSegments,
          checkExistenceOnly,
          forCheck,
          lookupResult
        );
        let navSegmentAdded = false;
        if (
          currentSegments.length &&
          (!found || (isLastSegment && !checkExistenceOnly))
        ) {
          navSegmentAdded = addNavSegments(
            metadata,
            currentSegments.join("/"),
            lookup,
            termsOrTypes,
            isCollectionAllowed || i < baseSegmentsCount - 1,
            lookupResult
          );
        }
        if (!found && !navSegmentAdded) {
          deleteIndices.push(j);
        }

        if (caseIssues) {
          pathInfo.caseIssues = caseIssues;
        }
        if (schemaChildByNavCaseIssue) {
          pathInfo.caseIssues = schemaChildByNavCaseIssue;
        }
        if (schemaChildByNav && isCollection) {
          pathInfo.isCollection = true;
        }
      }
      if (Object.keys(lookupResult).length === 0) {
        // no cache entries found starting with current segment
        pathInfo.invalidSegmentIndex = i;
        break;
      }
      // remove branches which are not needed anymore
      let j = deleteIndices.length;
      while (j--) {
        branches.splice(deleteIndices[j], 1);
      }
    }
  }

  if (pathInfo.invalidSegmentIndex < 0) {
    pathInfo.value = lookupResult.$Self;
    if (forCheck) {
      pathInfo.validPath = !!lookupResult.$Self;
    }
    Object.keys(lookupResult).forEach((segmentName) => {
      if (segmentName !== "$Self") {
        const subSegments =
          typeof lookupResult[segmentName] === "object"
            ? Object.keys(lookupResult[segmentName])
            : [];
        const subSegmentFound = subSegments.some((item) => item !== "$Self");
        let usage: SegmentUsage = SegmentUsage.asLastOrIntermediateSegment;
        if (!lookupResult[segmentName].$Self) {
          usage = SegmentUsage.asIntermediateSegmentOnly;
        }
        if (!subSegmentFound) {
          usage = SegmentUsage.asLastSegmentOnly;
        }
        pathInfo.nextPossibleSegments.push({
          name: segmentName,
          kind: lookupResult[segmentName].$Kind,
          usages: usage,
        });
      }
    });
  } else {
    // invalid segment found
    pathInfo.validPath = false;
  }

  return pathInfo;
}

/**
 * Add navigation segments
 * @param valueHandlingContext
 * @param sourcePath - name of potential navigation source
 * @param lookUp
 * @param typesOrTerms
 * @param accumulatedResult - accumulate navigation segments here
 */
function addNavSegments(
  metadata: Metadata,
  sourcePath: string,
  lookUp: PathCache | AnnotationPathCache,
  typesOrTerms: string[],
  isCollectionAllowed: boolean,
  accumulatedResult
): boolean {
  let added = false;
  if (typesOrTerms.length === 1 && typesOrTerms[0] === "") {
    // no restriction regarding types or terms - allow all navigation properties as next nav segments
    const navSourceMap = metadata.navigationSourceMap;

    Object.keys(navSourceMap[sourcePath] || {}).forEach((targetName) => {
      Object.keys(navSourceMap[sourcePath][targetName] || {}).forEach(
        (navigationProperty) => {
          if (navigationProperty) {
            // value of accumulated result entry should represent lookup result for navigation property target
            const value = {};
            collectPathResultsFromCache(
              lookUp,
              typesOrTerms,
              [targetName],
              false,
              false,
              value
            );
            addPathToObject(accumulatedResult, navigationProperty, value);
            added = true;
          }
        }
      );
    });
  } else {
    // build map of available target types per source type
    const navSourceMapOrig = metadata.navigationSourceMap;
    const navigationMap: NavigationMap = {};
    Object.keys(navSourceMapOrig).forEach((navSourceType) => {
      Object.keys(navSourceMapOrig[navSourceType] || {}).forEach(
        (navTargetType) => {
          Object.keys(navSourceMapOrig[navSourceType][navTargetType]).forEach(
            (navPropName) => {
              const isCollection =
                navSourceMapOrig[navSourceType][navTargetType][navPropName][
                  "isCollection"
                ];
              if (!isCollection || isCollectionAllowed) {
                const path = [navSourceType, navTargetType, navPropName].join(
                  "/"
                );
                const value =
                  navSourceMapOrig[navSourceType][navTargetType][navPropName];
                addPathToObject(navigationMap, path, value);
              }
            }
          );
        }
      );
    });

    // get all targets which have paths leading to correct types or terms
    const targetNames = {};
    collectPathResultsFromCache(
      lookUp,
      typesOrTerms,
      [],
      false,
      false,
      targetNames
    );
    // add navPropNames of source type which lead to supported target type
    Object.keys(navigationMap[sourcePath] || {}).forEach((navTargetType) => {
      let include = false;
      let navigationPath = "";
      let navigationTargetType = "";
      if (navTargetType === sourcePath) {
        // don't include nav properties pointing to same entity
      } else if (targetNames[navTargetType]) {
        // nav target type already is supporting correct types or terms
        include = true;
      } else {
        for (const targetName of Object.keys(targetNames)) {
          // check if from current navTargetType, a type can be reached that supports correct types or terms
          const ignoreTypes: { [type: string]: boolean } = {};
          ignoreTypes[sourcePath] = true;
          ignoreTypes[navTargetType] = true;
          ({ navigationPath, navigationTargetType } = existsNavPath(
            navigationMap,
            navTargetType,
            targetName,
            ignoreTypes,
            0
          ));
          if (navigationPath) {
            include = true;
            break;
          }
        }
      }
      if (include) {
        // add all navigation properties leading to that navTargetType as path segments
        Object.keys(navigationMap[sourcePath][navTargetType]).forEach(
          (navPropertyName) => {
            if (navPropertyName) {
              if (typeof targetNames[navTargetType] === "object") {
                // add next segments as path - otherwise navPropertyName itself becomes a valid last segment in path
                Object.keys(targetNames[navTargetType]).forEach(
                  (nextSegment) => {
                    const value = targetNames[navTargetType][nextSegment];
                    addPathToObject(
                      accumulatedResult,
                      [navPropertyName, nextSegment].join("/"),
                      value
                    );
                  }
                );
              } else if (navigationPath) {
                const path = [navPropertyName, navigationPath.split("/")].join(
                  "/"
                );
                addPathToObject(accumulatedResult, path, navigationTargetType);
              }
              added = true;
            }
          }
        );
      }
    });
  }
  return added;
}

function existsNavPath(
  navigationMap: NavigationMap,
  sourcePath: string,
  targetType: string,
  ignoreTypes: { [type: string]: boolean },
  pathLength: number
): { navigationPath: string; navigationTargetType: string } {
  let navigationPath = "";
  let navigationTargetType = "";
  for (const type of Object.keys(navigationMap[sourcePath] || {})) {
    if (!ignoreTypes[type]) {
      if (type === targetType) {
        navigationPath = Object.keys(navigationMap[sourcePath][type])[0];
        navigationTargetType = targetType;
      } else if (pathLength <= 3) {
        const ignoreExtend = {};
        ignoreExtend[sourcePath] = true;
        ({ navigationPath, navigationTargetType } = existsNavPath(
          navigationMap,
          type,
          targetType,
          Object.assign(ignoreExtend, ignoreTypes),
          pathLength + 1
        ));
        if (navigationPath) {
          navigationPath +=
            Object.keys(navigationMap[sourcePath][type])[0] + "/";
        }
      }
      if (navigationPath) {
        break;
      }
    }
  }
  return { navigationPath, navigationTargetType };
}

/**
 * Check if path segments represent navigation to other schema child name
 * @param valueHandlingContext
 * @param segments
 */
function getNavTarget(
  metadata: Metadata,
  segments: string[],
  isCollectionAllowed: boolean
): {
  schemaChildByNav: string;
  schemaChildByNavCaseIssue: CaseIssue | undefined;
  isCollection: boolean;
} {
  // last segment is navigation property name, first segments represent path identifying metadata element which contains navigation property
  let schemaChildByNav = "";
  let schemaChildByNavCaseIssue: CaseIssue | undefined;
  let isCollection = false;
  const segmentsCopy = [...segments];
  const navPropertyName = segmentsCopy.pop() || "";
  const sourcePath = segmentsCopy.join("/");
  const navSourceMap = metadata.navigationSourceMap;
  const sourceEntry = navSourceMap[sourcePath] || {};
  Object.keys(sourceEntry).forEach((targetEntry) => {
    if (!schemaChildByNav) {
      if (sourceEntry[targetEntry][navPropertyName]) {
        isCollection = !!sourceEntry[targetEntry][navPropertyName].isCollection;
        if (!isCollection || isCollectionAllowed) {
          schemaChildByNav = targetEntry;
        }
      } else {
        const keys = Object.keys(sourceEntry[targetEntry]);
        const key =
          keys.find(
            (item) => item.toUpperCase() === navPropertyName.toUpperCase()
          ) || "";
        if (sourceEntry[targetEntry][key]) {
          isCollection = !!sourceEntry[targetEntry][key].isCollection;
          if (!isCollection || isCollectionAllowed) {
            schemaChildByNavCaseIssue = {
              wrong: navPropertyName,
              correct: key,
            };
          }
        }
      }
    }
  });
  return { schemaChildByNav, isCollection, schemaChildByNavCaseIssue };
}

/**
 * collect path results from cache
 * @param lookUp
 * @param segments
 * @param existenceCheckOnly - stop after first result has been found
 * @param checkAsWholePath - stop after first result representing valid path has been found
 * @param typesOrTerms - only consider these types or terms
 * @param accumulatedResult - accumulated result
 * @param valueHandlingContext
 */
function collectPathResultsFromCache(
  lookUp: PathCache | AnnotationPathCache,
  typesOrTerms: string[],
  segments: string[],
  existenceCheckOnly: boolean,
  checkAsWholePath: boolean,
  accumulatedResult: any
): { found: boolean; caseIssues?: CaseIssue } {
  let found = false;
  let done = false;
  let caseIssues: CaseIssue | undefined;
  for (let i = 0; i < typesOrTerms.length && !done; i++) {
    const cacheEntryForTypeOrTerm = typesOrTerms[i]
      ? lookUp[typesOrTerms[i]]
      : lookUp;
    if (cacheEntryForTypeOrTerm) {
      const path = collectPathResultFromCacheEntry(
        cacheEntryForTypeOrTerm,
        segments,
        accumulatedResult
      );
      found = found || path.pathFound;
      caseIssues = path.caseIssues ? path.caseIssues : caseIssues;
      if (existenceCheckOnly) {
        if (checkAsWholePath) {
          done = !!accumulatedResult.$Self; // valid as whole path only if $Self is present
        } else {
          done = Object.keys(accumulatedResult).length > 0;
        }
      }
    }
  }
  return { found, caseIssues };
}

/** collect path ( represented by segments) results from cache entry (into accumulated results)
 * @param cacheEntry - cache entry (found for specific type or term)
 * @param segments - path segments
 * @param accumulatedResult
 */
function collectPathResultFromCacheEntry(
  cacheEntry: any,
  segments: string[],
  accumulatedResult: any
): { pathFound: boolean; caseIssues: CaseIssue | undefined } {
  let caseIssues: CaseIssue | undefined;
  let pathFound = false;
  let currentObject = cacheEntry;

  if (currentObject) {
    ({ pathFound, caseIssues, currentObject } = findCacheObjectBySegments(
      segments,
      currentObject
    ));
    if (pathFound) {
      // accumulate result
      const result =
        typeof currentObject === "object"
          ? currentObject
          : { $Self: currentObject };
      Object.keys(result).forEach((key) => {
        // make sure finishing segments are kept
        if (!accumulatedResult[key] || !accumulatedResult[key].$Self) {
          accumulatedResult[key] = JSON.parse(JSON.stringify(result[key]));
        }
      });
    }
  }
  return { pathFound, caseIssues };
}

function findCacheObjectBySegments(
  segments: string[],
  currentObject: any
): {
  caseIssues: CaseIssue | undefined;
  pathFound: boolean;
  currentObject: any;
} {
  let pathFound = true;
  // let caseIssues = undefined;
  (segments || []).forEach((segment, idx) => {
    if (currentObject[segment]) {
      currentObject = currentObject[segment];
    } else {
      pathFound = false;
      // if (valueHandlingContext.aliasInfo) {
      //     caseIssues = checkPathValuesNameCase(valueHandlingContext, segment, currentObject);
      // }
    }
  });
  return { pathFound, caseIssues: undefined, currentObject };
}

// /**
//  * Check the namescase issue in path segment by segment
//  * @param valueHandlingContext
//  * @param segment
//  * @param currentObject
//  */
//  function checkPathValuesNameCase(
//     valueHandlingContext: ValueHandlingContext,
//     segment: string,
//     currentObject: any
// ): CaseIssue | undefined {
//     let caseIssues = undefined;
//     const segmentWithNameSpace = getGuessedQualifiedName(segment, valueHandlingContext.aliasInfo);
//     const keys = Object.keys(currentObject);
//     if (segmentWithNameSpace) {
//         const key = keys.find((item) => item.toUpperCase() === segmentWithNameSpace.toUpperCase());
//         if (currentObject[key]) {
//             caseIssues = {
//                 correct: key,
//                 wrong: segment
//             };
//             currentObject = currentObject[key];
//         }
//         // if segment don't have alias or namespace
//     } else if (!segment.includes('.')) {
//         const key = keys.find((item) => item.toUpperCase() === segment.toUpperCase());
//         if (currentObject[key]) {
//             caseIssues = {
//                 correct: key,
//                 wrong: segment
//             };
//             currentObject = currentObject[key];
//         }
//     }

//     return caseIssues;
// }

// /**
//  * get segment without alias
//  * @param segment
//  * @param aliasInfo
//  */
//  export function getGuessedQualifiedName(segment: string, aliasInfo: AliasInformation): string {
//     let segmentWithoutAlias = '';
//     const reverseAlias = aliasInfo.reverseAliasMap;
//     const indexAt = segment.indexOf('@');
//     if (indexAt >= 0) {
//         segment = segment.slice(indexAt + 1);
//     }

//     const parts = segment.trim().split('.');
//     const name = parts.pop();
//     const NSAlias = parts.join('.').toUpperCase();
//     for (const namesapce in reverseAlias) {
//         if (NSAlias === namesapce.toUpperCase() || NSAlias === reverseAlias[namesapce].toUpperCase()) {
//             segmentWithoutAlias = indexAt >= 0 ? `@${namesapce}.${name}` : `${namesapce}.${name}`;
//             break;
//         }
//     }

//     return segmentWithoutAlias;
// }
function addPathToObject(object: any, path: string, value?: any): void {
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
