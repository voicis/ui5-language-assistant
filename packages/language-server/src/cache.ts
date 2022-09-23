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
import { convert } from "@sap-ux/annotation-converter";
import { ConvertedMetadata as AVTMetadata } from "@sap-ux/vocabularies-types";
import type { Manifest } from "@sap-ux/project-types";
import { getUI5FrameworkForXMLFile } from "./ui5yaml-handling";
import {
  isCapJavaProject,
  isCapNodeJsProject,
  isCapProject,
} from "@sap-ux/project-access/dist/project/cap";
import {
  addAnnotationToPathExpressionCache,
  addPathToObject,
} from "./pathCache";
import { resolveMetadataElementName } from "@ui5-language-assistant/logic-utils";
import { findProjectRoot } from "@sap-ux/project-access/dist/project/findApps";

import { FileName } from "@sap-ux/project-types";
import { Configuration, UI5Config } from "@sap-ux/ui5-config";
import findUp from "find-up";

const CAP_PROJECT_TYPE = "CAP";
interface CAPProject {
  type: typeof CAP_PROJECT_TYPE;
  kind: CAPProjectKind;
  root: string;
  ui5Config?: UI5Config;
  /**
   * Mapping from service path to service metadata
   */
  services: Map<string, string>;
  apps: Map<string, CachedApp>;
}

const UI5_PROJECT_TYPE = "UI5";

interface UI5Project {
  type: typeof UI5_PROJECT_TYPE;

  root: string;
  ui5Config?: Configuration;
  app?: CachedApp;
}

type CAPProjectKind = "Java" | "NodeJS";
type ProjectKind = CAPProjectKind;
type ProjectType = typeof UI5_PROJECT_TYPE | typeof CAP_PROJECT_TYPE;
type Project = UI5Project | CAPProject;

async function getUI5Config(
  projectRoot: string
): Promise<Configuration | undefined> {
  try {
    const ui5YamlPath = join(projectRoot, FileName.Ui5Yaml);
    const yamlString = await readFile(ui5YamlPath, "utf-8");
    const ui5Config = await UI5Config.newInstance(yamlString);
    return ui5Config.getConfiguration();
  } catch {
    return undefined;
  }
}

async function getUI5Manifest(
  webappRoot: string
): Promise<Manifest | undefined> {
  try {
    const manifestPath = join(webappRoot, FileName.Manifest);
    const manifestString = await readFile(manifestPath, "utf-8");
    return JSON.parse(manifestString);
  } catch {
    return undefined;
  }
}

async function findAppRoot(path: string): Promise<string | undefined> {
  const manifestJson = await findUp(FileName.Manifest, { cwd: path });
  if (manifestJson) {
    return normalize(join(manifestJson, ".."));
  }
  return undefined;
}

const cache: Map<string, Project> = new Map();

type CachedApp = {
  appRoot: string;
  projectRoot: string;
  manifest: Manifest;
  manifestDetails?: ManifestDetails;
  localServices: Map<string, CachedService>;
};

interface CachedService {
  path: string;
  annotations: any[];
  convertedMetadata: AVTMetadata;
  metadata: Metadata;
  pathExpressions: PathExpressions;
}

// cache the semantic model creation promise to ensure unique instances per version
const semanticModelCache: Record<
  string,
  Promise<UI5SemanticModel>
> = Object.create(null);

const serviceLookup: { [file: string]: string } = {};

async function getProject(root: string): Promise<Project> {
  const cachedProject = cache.get(root);
  if (cachedProject) {
    return cachedProject;
  }
  const typeAndKind = await getProjectTypeAndKind(root);
  if (typeAndKind.type === CAP_PROJECT_TYPE) {
    const project: CAPProject = {
      ...typeAndKind,
      root,
      services: new Map(),
      apps: new Map(),
    };
    await loadCapServices(project);
    cache.set(root, project);
    return project;
  } else {
    const ui5Config = await getUI5Config(root);
    const project: UI5Project = {
      ...typeAndKind,
      root,
      ui5Config,
    };
    cache.set(root, project);
    return project;
  }
}

async function getProjectTypeAndKind(
  projectRoot: string
): Promise<
  | { type: typeof CAP_PROJECT_TYPE; kind: CAPProjectKind }
  | { type: typeof UI5_PROJECT_TYPE }
> {
  if (await isCapJavaProject(projectRoot)) {
    return {
      type: CAP_PROJECT_TYPE,
      kind: "Java",
    };
  } else if (await isCapNodeJsProject(projectRoot)) {
    return {
      type: CAP_PROJECT_TYPE,
      kind: "NodeJS",
    };
  } else {
    return {
      type: UI5_PROJECT_TYPE,
    };
  }
}

export async function init(apps: AllAppResults[]): Promise<void> {
  // const projects = new Set<CachedProject>();
  // for (const app of apps) {
  //   const cachedProject = getProject(app.projectRoot);
  //   projects.add(cachedProject);
  //   const manifestDetails = await getManifestDetails(app);
  //   const localServices = new Map<string, CachedService>();
  //   const localServiceFiles = await getLocalServiceData(app);
  //   if (localServiceFiles) {
  //     const localService = parseServiceFiles(localServiceFiles);
  //     if (localService) {
  //       localServices.set(localService.path, localService);
  //     }
  //   }
  //   cachedProject.apps.set(app.appRoot, {
  //     ...app,
  //     manifestDetails,
  //     localServices,
  //   });
  // }
  // for (const cachedProject of projects) {
  //   if (await isCapProject(cachedProject.root)) {
  //     await updateCapProject(cachedProject);
  //   }
  // }
}

// export async function updateApp(app: CachedApp, ): Promise<void> {
//   const manifestDetails = await getManifestDetails(app);
//   const localServices = new Map<string, CachedService>();
//   const localServiceFiles = await getLocalServiceData(app);
//   if (localServiceFiles) {
//     const localService = parseServiceFiles(localServiceFiles);
//     if (localService) {
//       localServices.set(localService.path, localService);
//     }
//   }
//   const cachedProject = getProject(app.projectRoot);
//   cachedProject.apps.set(app.appRoot, {
//     ...app,
//     manifestDetails,
//     localServices,
//   });
// }

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
  const projectRoot = await findProjectRoot(documentPath, false).catch(
    () => undefined
  );
  const appRoot = await findAppRoot(documentPath);
  // const webappPath = await (projectRoot);
  const framework = getUI5FrameworkForXMLFile(documentPath);
  const project = projectRoot ? await getProject(projectRoot) : undefined;
  const app = project && appRoot ? await getApp(project, appRoot) : undefined;
  const minUI5Version =
    app?.manifestDetails?.minUI5Version ??
    getMinUI5VersionForXMLFile(documentPath);

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
      convertedMetadata: service.convertedMetadata,
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
  const projectRoot = await findProjectRoot(path, false).catch(() => undefined);
  const appRoot = await findAppRoot(path);
  if (!projectRoot || !appRoot) {
    return;
  }

  const project = await getProject(projectRoot);
  const app = await loadApp(project, appRoot);
  if (app) {
    if (project.type === CAP_PROJECT_TYPE) {
      project.apps.set(appRoot, app);
    } else {
      project.app = app;
    }
  }
}

export async function updateAppFile(uri: string): Promise<void> {
  const path = fileURLToPath(uri);
  const projectRoot = await findProjectRoot(path, false).catch(() => undefined);
  const appRoot = await findAppRoot(path);
  if (!projectRoot || !appRoot) {
    return;
  }

  const project = await getProject(projectRoot);
  const app = await loadApp(project, appRoot);
  if (app) {
    if (project.type === CAP_PROJECT_TYPE) {
      project.apps.set(appRoot, app);
    } else {
      project.app = app;
    }
  }
}

export async function updatePackageJson(uri: string): Promise<void> {
  const path = fileURLToPath(uri);
  const projectRoot = await findProjectRoot(path, false).catch(() => undefined);
  const appRoot = await findAppRoot(path);
  if (!projectRoot || !appRoot) {
    return;
  }

  cache.delete(projectRoot);

  const project = await getProject(projectRoot);
  const app = await loadApp(project, appRoot);
  if (app) {
    if (project.type === CAP_PROJECT_TYPE) {
      project.apps.set(appRoot, app);
    } else {
      project.app = app;
    }
  }
}

async function loadCapServices(project: CAPProject): Promise<void> {
  try {
    const data = await getCapModelAndServices(project.root);
    const cds = await loadModuleFromProject<any>(project.root, "@sap/cds");
    for (const service of data.services) {
      const metadataContent = cds.compile.to.edmx(data.model, {
        version: "v4",
        service: service.name,
        odataForeignKeys: true,
        odataContainment: false,
      });

      project.services.set(service.urlPath, metadataContent);
    }
  } catch (error) {
    console.log(error);
  }
  return undefined;
}

async function updateCapProject(project: CAPProject): Promise<void> {
  await loadCapServices(project);
  const updatedApps = new Map<string, CachedApp>();
  for (const [, app] of project.apps) {
    const updatedApp = await loadApp(project, app.appRoot);
    if (updatedApp) {
      updatedApps.set(app.appRoot, updatedApp);
    }
  }
  project.apps = updatedApps;
}

export async function updateServiceFiles(uris: string[]): Promise<void> {
  const projectRoots = new Set<string>();
  for (const uri of uris) {
    const path = fileURLToPath(uri);
    const projectRoot = await findProjectRoot(path).catch(() => undefined);
    if (projectRoot) {
      projectRoots.add(projectRoot);
    }
  }
  for (const projectRoot of projectRoots) {
    const project = await getProject(projectRoot);
    if (project.type === CAP_PROJECT_TYPE) {
      await updateCapProject(project);
    }
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

function getCachedProject(path: string): Project | undefined {
  let currentPath = path;
  let matchedProject: Project | undefined;
  const cachedProject = cache.get(currentPath);
  if (cachedProject) {
    return cachedProject;
  }
  while (currentPath.length) {
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

async function getApp(
  project: Project,
  appRoot: string
): Promise<CachedApp | undefined> {
  if (project.type === UI5_PROJECT_TYPE) {
    if (project.app) {
      return project.app;
    }
    // const webAppPath = project.ui5Config?.paths?.webapp ?? 'webapp';
    project.app = await loadApp(project, appRoot);
    return project.app;
  }

  const cachedApp = project.apps.get(appRoot);
  if (cachedApp) {
    return cachedApp;
  }

  const app = await loadApp(project, appRoot);
  if (app) {
    project.apps.set(appRoot, app);
  }

  return app;
}

async function loadApp(
  project: Project,
  appRoot: string
): Promise<CachedApp | undefined> {
  const manifest = await getUI5Manifest(appRoot);
  if (!manifest) {
    return undefined;
  }
  const manifestDetails = await getManifestDetails(manifest);
  const localServices = new Map<string, CachedService>();
  const localServiceFiles = await getLocalServiceData(appRoot, manifest);
  if (localServiceFiles) {
    const metadata =
      project.type === CAP_PROJECT_TYPE
        ? project.services.get(localServiceFiles.path)
        : undefined;
    if (metadata) {
      // override local service metadata with latest metadata from service
      localServiceFiles.metadataContent = metadata;
    }
    const localService = parseServiceFiles(localServiceFiles);
    if (localService) {
      localServices.set(localService.path, localService);
    }
  }
  const app: CachedApp = {
    projectRoot: project.root,
    appRoot,
    manifest,
    manifestDetails,
    localServices,
  };
  return app;
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

async function getManifestDetails(
  manifest: Manifest
): Promise<ManifestDetails> {
  const flexEnabled = manifest["sap.ui5"]?.flexEnabled;
  const minUI5Version = manifest["sap.ui5"]?.dependencies?.minUI5Version;
  const customViews = {};

  const targets = manifest["sap.ui5"]?.routing?.targets;
  if (targets) {
    for (const name of Object.keys(targets)) {
      const target = targets[name];
      if (target) {
        const settings = (target?.options as any)?.settings;
        if (settings?.entitySet && settings?.viewName) {
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

  const myParsedEdmx = parse(metadataContent, "metadata");
  const annotations = annotationFiles.map((file, i) =>
    parse(file, `annotationFile${i}`)
  );
  const mergedModel = merge(myParsedEdmx, ...annotations);

  const convertedMetadata = convert(mergedModel);
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
    convertedMetadata,
  };
  const cache = buildAnnotationPathCache(service);
  service.pathExpressions["annotationPath"] = cache;
  service.pathExpressions["annotationPathCc"] = cache;
  buildMetadataPathCache(service);

  return service;
}

async function getLocalServiceData(
  appRoot: string,
  manifest: Manifest
): Promise<ServiceFiles | undefined> {
  const mainServiceName = getMainService(manifest);

  if (mainServiceName !== undefined) {
    const metadataContent = await getLocalMetadataForService(
      manifest,
      mainServiceName,
      appRoot
    );
    const annotationFiles = await getLocalAnnotationsForService(
      manifest,
      mainServiceName,
      appRoot
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
  appRoot: string
): Promise<string | undefined> {
  const dataSources = manifest["sap.app"]?.dataSources;

  if (dataSources && serviceName !== undefined) {
    const defaultModelDataSource = dataSources[serviceName];

    const localUri = defaultModelDataSource?.settings?.localUri;
    if (localUri) {
      try {
        const metadataPath = join(appRoot, localUri);
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
  appRoot: string
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
            readFile(join(appRoot, path), {
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
