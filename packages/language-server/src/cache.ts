import { readFile } from "fs/promises";
import { fileURLToPath } from "url";
import { sep, normalize, join } from "path";

import { Fetcher } from "api";
import fetch from "node-fetch";
import {
  AnnotationPathCache,
  AppContext,
  ManifestDetails,
  Metadata,
  MetadataEntityTypeProperty,
  PathExpressions,
  ServiceDetails,
  UI5Framework,
  UI5SemanticModel,
} from "@ui5-language-assistant/semantic-model-types";

import { getCdsMetadata } from "./cds";
import { getMinUI5VersionForXMLFile } from "./manifest-handling";
import { createSemanticModelWithFetcher } from "./ui5-model";

import { ConvertedMetadata, convertMetadata } from "./convertMetadata";
import {
  AllAppResults,
  getCapModelAndServices,
  loadModuleFromProject,
} from "@sap-ux/project-access";

import { parse, merge } from "@sap-ux/edmx-parser";
import type { Manifest } from "@sap-ux/project-types";
import { getUI5FrameworkForXMLFile } from "./ui5yaml-handling";
import { isCapProject } from "@sap-ux/project-access/dist/project/cap";
import {
  addAnnotationToPathExpressionCache,
  addPathToObject,
} from "./pathCache";
import { resolveMetadataElementName } from "@ui5-language-assistant/logic-utils";

const cache: Map<string, CachedProject> = new Map();

type CachedApp = AllAppResults & {
  manifestDetails?: ManifestDetails;
  localServices: Map<string, CachedService>;
};
interface CachedProject {
  root: string;
  services: Map<string, CachedService>;
  apps: Map<string, CachedApp>;
}

interface CachedService {
  path: string;
  annotations: any[];
  metadata: Metadata;
  pathExpressions: PathExpressions;
}

// cache the semantic model creation promise to ensure unique instances per version
const semanticModelCache: Record<
  string,
  Promise<UI5SemanticModel>
> = Object.create(null);

const serviceLookup: { [file: string]: string } = {};

function getProject(root: string): CachedProject {
  const cachedProject = cache.get(root);
  if (cachedProject) {
    return cachedProject;
  }
  const project: CachedProject = {
    root,
    services: new Map(),
    apps: new Map(),
  };
  cache.set(root, project);
  return project;
}

export async function init(apps: AllAppResults[]): Promise<void> {
  const projects = new Set<CachedProject>();
  for (const app of apps) {
    const cachedProject = getProject(app.projectRoot);
    projects.add(cachedProject);
    const manifestDetails = await getManifestDetails(app);
    const localServices = new Map<string, CachedService>();
    const localServiceFiles = await getLocalServiceData(app);
    if (localServiceFiles) {
      const localService = parseServiceFiles(localServiceFiles);
      if (localService) {
        localServices.set(localService.path, localService);
      }
    }
    cachedProject.apps.set(app.appRoot, {
      ...app,
      manifestDetails,
      localServices,
    });
  }

  for (const cachedProject of projects) {
    if (await isCapProject(cachedProject.root)) {
      await updateCapProject(cachedProject);
    }
  }
}

export async function updateApp(app: CachedApp): Promise<void> {
  const manifestDetails = await getManifestDetails(app);
  const localServices = new Map<string, CachedService>();
  const localServiceFiles = await getLocalServiceData(app);
  if (localServiceFiles) {
    const localService = parseServiceFiles(localServiceFiles);
    if (localService) {
      localServices.set(localService.path, localService);
    }
  }
  const cachedProject = getProject(app.projectRoot);
  cachedProject.apps.set(app.appRoot, {
    ...app,
    manifestDetails,
    localServices,
  });
}

export async function getAppContext(
  modelCachePath: string | undefined,
  cacheKey: string,
  manifestDetails: ManifestDetails | undefined,
  framework: UI5Framework,
  version: string | undefined,
  ignoreCache?: boolean
): Promise<AppContext> {
  const [ui5Model] = await Promise.all([
    getSemanticModel(
      modelCachePath,
      cacheKey,
      manifestDetails,
      framework,
      version,
      ignoreCache
    ),
  ]);
  return {
    services: {},
    ui5Model,
  };
}

export async function getContextForFile(
  uri: string,
  modelCachePath?: string
): Promise<AppContext> {
  const documentPath = fileURLToPath(uri);
  const minUI5Version = getMinUI5VersionForXMLFile(documentPath);
  const framework = getUI5FrameworkForXMLFile(documentPath);
  const project = getCachedProject(documentPath);
  const app = getCachedApp(documentPath);

  const cacheKey = uri.split("webapp")[0]; // TODO: improve project finding logic
  // const manifest = getManifestDetails(documentPath);

  // const metadata = await getServiceMetadataForAppFile(uri);

  const ui5Model = await getSemanticModel(
    modelCachePath,
    cacheKey,
    app?.manifestDetails,
    framework,
    minUI5Version,
    false
  );
  // const manifestData = manifest ?
  //    {
  //       flexEnabled: manifest?.flexEnabled,
  //       minUi5Version: manifest?.minUI5Version,
  //       customViews: manifest?.customViews,
  //   }
  //  : undefined

  // const service = getCachedService(app);

  const services = {};
  for (const [servicePath, service] of app?.localServices ??
    new Map<string, CachedService>()) {
    services[servicePath] = {
      annotations: service.annotations,
      metadata: service.metadata,
      pathExpressions: service.pathExpressions,
    };
  }
  for (const [servicePath, service] of project?.services ?? new Map()) {
    services[servicePath] = {
      annotations: service.annotations,
      metadata: service.metadata,
      pathExpressions: service.pathExpressions,
    };
  }
  return {
    services,
    manifest: app?.manifestDetails,
    ui5Model,
  };
}

export async function getSemanticModel(
  modelCachePath: string | undefined,
  cacheKey: string,
  manifestDetails: ManifestDetails | undefined,
  framework: UI5Framework,
  version: string | undefined,
  ignoreCache?: boolean
): Promise<UI5SemanticModel> {
  return getSemanticModelWithFetcher(
    fetch,
    modelCachePath,
    cacheKey,
    manifestDetails,
    framework,
    version,
    ignoreCache
  );
}

// This function is exported for testing purposes (using a mock fetcher)
export async function getSemanticModelWithFetcher(
  fetcher: Fetcher,
  modelCachePath: string | undefined,
  cacheKey: string,
  manifestDetails: ManifestDetails | undefined,
  framework: UI5Framework,
  version: string | undefined,
  ignoreCache?: boolean
): Promise<UI5SemanticModel> {
  const frameWorkCacheKey = `${framework || "INVALID"}:${version || "INVALID"}`;
  if (ignoreCache || semanticModelCache[frameWorkCacheKey] === undefined) {
    semanticModelCache[frameWorkCacheKey] = createSemanticModelWithFetcher(
      fetcher,
      modelCachePath,
      manifestDetails,
      framework,
      version
    );
  }
  return semanticModelCache[frameWorkCacheKey];
}

// TODO: check multiple service case for XML

/**
 * Returns metadata as XML string for the given application.
 * @param uri Uri of an file that belongs to an application
 */
export async function getServiceMetadataForAppFile(
  uri: string
): Promise<string | undefined> {
  // const serviceRoot = serviceLookup[uri] ?? await getServiceRoot(uri);
  // if (!serviceRoot) {
  //     return undefined;
  // }
  // const metadata = cache.services[serviceRoot];
  // if (metadata) {
  //     return metadata;
  // }
  // const edmx = await getCdsMetadata(serviceRoot);
  // cache.services[serviceRoot] = edmx;

  // return edmx;
  return undefined;
}

export async function updateManifestData2(uri: string): Promise<void> {
  const path = fileURLToPath(uri);
  const app = getCachedApp(path);
  if (app) {
    await updateApp(app);
  }
}

export async function updateAppFile(uri: string): Promise<void> {
  const path = fileURLToPath(uri);
  const app = getCachedApp(path);
  if (app) {
    await updateApp(app);
  }
}

async function updateCapProject(
  cachedProject: CachedProject
): Promise<CachedService | undefined> {
  try {
    const data = await getCapModelAndServices(cachedProject.root);
    const cds = await loadModuleFromProject<any>(
      cachedProject.root,
      "@sap/cds"
    );
    for (const service of data.services) {
      const metadataContent = cds.compile.to.edmx(data.model, {
        version: "v4",
        service: service.name,
        odataForeignKeys: true,
        odataContainment: false,
      });
      const cachedService = parseServiceFiles({
        metadataContent,
        annotationFiles: [],
        path: service.urlPath,
      });
      if (cachedService) {
        cachedProject.services.set(service.urlPath, cachedService);
        return cachedService;
      }
    }
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

export async function updateServiceFiles(uris: string[]): Promise<void> {
  const projects = new Set<CachedProject>();
  for (const uri of uris) {
    const path = fileURLToPath(uri);
    const project = getCachedProject(path);
    if (project) {
      projects.add(project);
    }
  }
  // const serviceRoot = serviceLookup[uri] ?? await getServiceRoot(uri);
  //     if (serviceRoot) {
  //     }
  // }
  for (const project of projects) {
    await updateCapProject(project);
  }
}

async function getServiceRoot(uri: string): Promise<string | undefined> {
  const path = fileURLToPath(uri);

  for (
    let currentPath = path;
    currentPath.split(sep).length > 0;
    currentPath = normalize(join(currentPath, ".."))
  ) {
    // const existingService = cache.services[currentPath];
    // if (existingService) {
    //     return currentPath;
    // }

    const packageJsonPath = join(currentPath, "package.json");
    try {
      await readFile(packageJsonPath, "utf-8");
      serviceLookup[uri] = currentPath;
      return currentPath;
    } catch (error) {}
  }
  return undefined;
}

// model.customViews = manifest?.customViews ?? {};

// // read annotations

// if (manifest?.metadataFile) {
//   const myParsedEdmx = parser.parse(manifest.metadataFile);
//   const annotations = manifest.annotationFiles.map(parser.parse);
//   const mergedModel = parser.merge(myParsedEdmx, ...annotations);

//   // model.metadata = mergedModel;
//   model.annotations = Object.keys(mergedModel._annotations).reduce(
//     (acc, key) => {
//       const value = mergedModel._annotations[key];
//       const uniqueTargets: any[] = [];
//       for (const list of value) {
//         const match = acc.find((a) => a.target === list.target);
//         if (match) {
//           for (const annotation of list.annotations) {
//             const matchedAnnotation = match.annotations.find(
//               (a) =>
//                 a.term === annotation.term &&
//                 a.qualifier === annotation.qualifier
//             );
//             if (!matchedAnnotation) {
//               match.annotations.push(annotation);
//             }
//           }
//         } else {
//           uniqueTargets.push(list);
//         }
//       }
//       return [...acc, ...uniqueTargets];
//     },
//     [] as any[]
//   );

//   convertMetadata(model, mergedModel);
// }

function getCachedProject(path: string): CachedProject | undefined {
  let currentPath = path;
  let matchedProject: CachedProject | undefined;
  while (currentPath.length) {
    matchedProject = cache.get(currentPath);
    if (matchedProject) {
      return matchedProject;
    }
    const nextPath = normalize(join(currentPath, ".."));
    if (nextPath === currentPath) {
      return undefined;
    }
    currentPath = nextPath;
  }
  return undefined;
}

function getCachedApp(path: string): CachedApp | undefined {
  const project = getCachedProject(path);
  if (!project) {
    return undefined;
  }
  let currentPath = path;
  let matchedApp: CachedApp | undefined;
  while (currentPath.length) {
    matchedApp = project.apps.get(currentPath);
    if (matchedApp) {
      return matchedApp;
    }
    const nextPath = normalize(join(currentPath, ".."));
    if (nextPath === currentPath) {
      return undefined;
    }
    currentPath = nextPath;
  }
  return undefined;
}

function getCachedService(
  app: CachedApp | undefined
): CachedService | undefined {
  if (!app) {
    return undefined;
  }
  const mainServiceName = getMainService(app.manifest);

  if (mainServiceName !== undefined) {
    const path = getServicePath(app.manifest, mainServiceName) ?? "";
    return app.localServices.get(path);
  }

  return undefined;
}

async function getManifestDetails({
  manifest,
}: AllAppResults): Promise<ManifestDetails> {
  const flexEnabled = manifest["sap.ui5"]?.flexEnabled;
  const minUI5Version = manifest["sap.ui5"]?.dependencies?.minUI5Version;
  const customViews = {};

  const targets = manifest["sap.ui5"]?.routing?.targets;
  if (targets) {
    for (const name of Object.keys(targets)) {
      const target = targets[name];
      if (target) {
        const settings = (target?.options as any)?.settings;
        if (settings.entitySet && settings.viewName) {
          customViews[settings.viewName] = {
            entitySet: settings.entitySet,
          };
        }
      }
    }
  }

  const mainServiceName = getMainService(manifest);
  const mainServicePath = mainServiceName
    ? getServicePath(manifest, mainServiceName)
    : undefined;
  return {
    flexEnabled: flexEnabled,
    minUI5Version: minUI5Version,
    mainServicePath,
    customViews,
  };
}

interface ServiceFiles {
  path: string;
  metadataContent: string | undefined;
  annotationFiles: string[];
}

function parseServiceFiles({
  metadataContent,
  annotationFiles,
  path,
}: ServiceFiles): CachedService | undefined {
  if (!metadataContent) {
    return undefined;
  }

  const myParsedEdmx = parse(metadataContent);
  const annotations = annotationFiles.map((file) => parse(file));
  const mergedModel = merge(myParsedEdmx, ...annotations);

  // model.metadata = mergedModel;
  const annotationsList = Object.keys((mergedModel as any)._annotations).reduce(
    (acc, key) => {
      const value = (mergedModel as any)._annotations[key];
      const uniqueTargets: any[] = [];
      for (const list of value) {
        const match = acc.find((a) => a.target === list.target);
        if (match) {
          for (const annotation of list.annotations) {
            const matchedAnnotation = match.annotations.find(
              (a) =>
                a.term === annotation.term &&
                a.qualifier === annotation.qualifier
            );
            if (!matchedAnnotation) {
              match.annotations.push(annotation);
            }
          }
        } else {
          uniqueTargets.push(list);
        }
      }
      return [...acc, ...uniqueTargets];
    },
    [] as any[]
  );

  const metadata = convertMetadata(mergedModel as any);
  const service: CachedService = {
    path,
    annotations: annotationsList,
    pathExpressions: {},
    metadata,
  };
  const cache = buildAnnotationPathCache(service);
  service.pathExpressions["annotationPath"] = cache;
  service.pathExpressions["annotationPathCc"] = cache;
  buildMetadataPathCache(service);

  return service;
}

async function getLocalServiceData({
  manifest,
  manifestPath,
}: AllAppResults): Promise<ServiceFiles | undefined> {
  const mainServiceName = getMainService(manifest);

  if (mainServiceName !== undefined) {
    const metadataContent = await getLocalMetadataForService(
      manifest,
      mainServiceName,
      manifestPath
    );
    const annotationFiles = await getLocalAnnotationsForService(
      manifest,
      mainServiceName,
      manifestPath
    );
    const path = getServicePath(manifest, mainServiceName) ?? "";

    // const defaultModelDataSource = dataSources[mainServiceName];
    // const cdsMetadata = await getCdsMetadata(normalize(join(manifestPath, "..")));
    // if  (cdsMetadata) {
    //   metadataContent = cdsMetadata;
    // } else {

    // const localUri = defaultModelDataSource?.settings?.localUri;
    // if (localUri) {
    //   const metadataPath = normalize(join(manifestPath, "..", localUri));
    //   metadataContent = await readFile(metadataPath, {
    //     encoding: "utf8",
    //   });
    // }

    // }
    return {
      path,
      metadataContent,
      annotationFiles,
    };
  }

  return undefined;
}

function getServicePath(
  manifest: Manifest,
  serviceName: string
): string | undefined {
  const dataSources = manifest["sap.app"]?.dataSources;

  if (dataSources && serviceName !== undefined) {
    const defaultModelDataSource = dataSources[serviceName];

    return defaultModelDataSource?.uri;
  }
  return undefined;
}

async function getLocalMetadataForService(
  manifest: Manifest,
  serviceName: string,
  manifestPath: string
): Promise<string | undefined> {
  const dataSources = manifest["sap.app"]?.dataSources;

  if (dataSources && serviceName !== undefined) {
    const defaultModelDataSource = dataSources[serviceName];

    const localUri = defaultModelDataSource?.settings?.localUri;
    if (localUri) {
      try {
        const metadataPath = join(manifestPath, localUri);
        return await readFile(metadataPath, {
          encoding: "utf8",
        });
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

async function getLocalAnnotationsForService(
  manifest: Manifest,
  serviceName: string,
  manifestPath: string
): Promise<string[]> {
  const dataSources = manifest["sap.app"]?.dataSources;
  if (dataSources && serviceName !== undefined) {
    const dataSource = dataSources[serviceName];
    const annotationFilePaths = (dataSource?.settings?.annotations ?? [])
      .map((name) => dataSources[name]?.settings?.localUri)
      .filter((path): path is string => !!path);
    if (annotationFilePaths.length) {
      try {
        return await Promise.all(
          annotationFilePaths.map((path) =>
            readFile(join(manifestPath, "..", path), {
              encoding: "utf8",
            })
          )
        );
      } catch {
        return [];
      }
    }
  }
  return [];
}

function getMainService(manifest: Manifest): string | undefined {
  const model = manifest["sap.ovp"]?.globalFilterModel ?? "";
  return manifest["sap.ui5"]?.models?.[model].dataSource;
}

function buildMetadataPathCache(service: ServiceDetails): void {
  service.pathExpressions["targetPath"] = {};
  service.pathExpressions["pathCc"] = {};
  const targetPathRoot = service.pathExpressions["targetPath"];
  const propertyPathRoot = service.pathExpressions["pathCc"];

  const addComplexTypePropertyToCache = (
    cacheRootEntry: unknown,
    property: MetadataEntityTypeProperty
  ) => {
    addPathToObject(
      cacheRootEntry,
      `Edm.ComplexType/${property.fullyQualifiedName}`
    );
    const complexType = service.metadata.complexTypes.find(
      (ct) => ct.fullyQualifiedName === property.structuredType
    );
    if (complexType) {
      complexType.properties.forEach((prop) => {
        if (prop.edmPrimitiveType) {
          addPathToObject(
            cacheRootEntry,
            `Edm.PrimitiveType/${prop.fullyQualifiedName}`
          );
        } else if (prop.isComplexType) {
          addComplexTypePropertyToCache(cacheRootEntry, prop);
        }
      });
    }
  };

  const addPropertyToCache = (
    cacheRootEntry: unknown,
    property: MetadataEntityTypeProperty
  ) => {
    if (property.edmPrimitiveType) {
      addPathToObject(
        cacheRootEntry,
        `Edm.PrimitiveType/${property.fullyQualifiedName}`
      );
    }
    if (property.isComplexType) {
      addComplexTypePropertyToCache(cacheRootEntry, property);
    }
  };

  propertyPathRoot["Edm.EntityType"] = {};
  propertyPathRoot["Edm.PrimitiveType"] = {};
  // TODO: support actions
  service.metadata.entityTypes.forEach((entityType) => {
    // register entity type itself
    addPathToObject(targetPathRoot, entityType.fullyQualifiedName, {
      $Self: entityType.fullyQualifiedName,
    });
    addPathToObject(
      propertyPathRoot,
      `Edm.EntityType/${entityType.fullyQualifiedName}`
    );

    // append navigation data
    entityType.navigationProperties.forEach((property) => {
      addPathToObject(
        propertyPathRoot,
        `Edm.EntityType/${property.fullyQualifiedName}`,
        property.targetTypeName
      );
    });

    entityType.entityProperties.forEach((property) => {
      addPathToObject(
        targetPathRoot,
        property.fullyQualifiedName,
        property.fullyQualifiedName
      );
      addPropertyToCache(propertyPathRoot, property);
    });
  });
  const container = service.metadata.entityContainer;
  if (container) {
    addPathToObject(targetPathRoot, container.fullyQualifiedName, {
      $Self: container.fullyQualifiedName,
    });
    service.metadata.entitySets.forEach((entry) => {
      addPathToObject(
        targetPathRoot,
        entry.fullyQualifiedName,
        entry.fullyQualifiedName
      );
    });
  }
}

function buildAnnotationPathCache(service: CachedService): AnnotationPathCache {
  const cache: AnnotationPathCache = {};
  service.annotations.forEach((annotationList) => {
    const targetName = resolveMetadataElementName(
      service.metadata,
      annotationList.target
    );
    annotationList.annotations.forEach((annotation) => {
      addAnnotationToPathExpressionCache(
        cache,
        annotation,
        targetName.fqn || annotationList.target
      );
    });
  });
  return cache;
}
