import { dirname, join, normalize } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { maxBy, map, filter } from "lodash";
import { readFile } from "fs-extra";
import { URI } from "vscode-uri";
import globby from "globby";
import { FileChangeType } from "vscode-languageserver";
import { getLogger } from "./logger";

type AbsolutePath = string;
type ManifestData = Record<AbsolutePath, ManifestDetails>;

export type ManifestDetails = {
  flexEnabled: boolean;
  minUI5Version: string;
  metadataFile: string | undefined;
  annotationFiles: string[];
  customViews: { [name: string]: { entitySet: string } };
};

const manifestData: ManifestData = Object.create(null);

export function isManifestDoc(uri: string): boolean {
  return uri.endsWith("manifest.json");
}

export async function initializeManifestData(
  workspaceFolderPath: string
): Promise<void[]> {
  const manifestDocuments = await findAllManifestDocumentsInWorkspace(
    workspaceFolderPath
  );

  const readManifestPromises = map(manifestDocuments, async (manifestDoc) => {
    const response = await readManifestFile(manifestDoc);

    // Parsing of manifest.json failed because the file is invalid
    if (response !== "INVALID") {
      manifestData[manifestDoc] = response;
    }
  });

  getLogger().info("manifest data initialized", { manifestDocuments });
  return Promise.all(readManifestPromises);
}

export function getManifestDetails(
  xmlPath: string
): ManifestDetails | undefined {
  const manifestFilesForCurrentFolder = filter(
    Object.keys(manifestData),
    (manifestPath) => xmlPath.startsWith(dirname(manifestPath))
  );

  const closestManifestPath = maxBy(
    manifestFilesForCurrentFolder,
    (manifestPath) => manifestPath.length
  );

  if (closestManifestPath === undefined) {
    return undefined;
  }

  return manifestData[closestManifestPath];
}

export function getFlexEnabledFlagForXMLFile(xmlPath: string): boolean {
  const manifestFilesForCurrentFolder = filter(
    Object.keys(manifestData),
    (manifestPath) => xmlPath.startsWith(dirname(manifestPath))
  );

  const closestManifestPath = maxBy(
    manifestFilesForCurrentFolder,
    (manifestPath) => manifestPath.length
  );

  if (closestManifestPath === undefined) {
    return false;
  }

  return manifestData[closestManifestPath].flexEnabled;
}

export function getMinUI5VersionForXMLFile(
  xmlPath: string
): string | undefined {
  const manifestFilesForCurrentFolder = filter(
    Object.keys(manifestData),
    (manifestPath) =>
      xmlPath.replace(/\\/g, "/").startsWith(dirname(manifestPath))
  );

  const closestManifestPath = maxBy(
    manifestFilesForCurrentFolder,
    (manifestPath) => manifestPath.length
  );

  if (closestManifestPath === undefined) {
    return undefined;
  }

  return manifestData[closestManifestPath].minUI5Version;
}

export async function updateManifestData(
  manifestUri: string,
  changeType: FileChangeType
): Promise<void> {
  getLogger().debug("`updateManifestData` function called", {
    manifestUri,
    changeType,
  });
  const manifestPath = fileURLToPath(manifestUri);
  switch (changeType) {
    case 1: //created
    case 2: {
      //changed
      const response = await readManifestFile(manifestUri);
      // Parsing of manifest.json failed because the file is invalid
      // We want to keep last successfully read state - manifset.json file may be actively edited
      if (response !== "INVALID") {
        manifestData[manifestPath] = response;
      }
      return;
    }
    case 3: //deleted
      delete manifestData[manifestPath];
      return;
  }
}

async function findAllManifestDocumentsInWorkspace(
  workspaceFolderPath: string
): Promise<string[]> {
  return globby(`${workspaceFolderPath}/**/manifest.json`).catch((reason) => {
    getLogger().error(
      `Failed to find all manifest.json files in current workspace!`,
      {
        workspaceFolderPath,
        reason,
      }
    );
    return [];
  });
}

async function readManifestFile(
  manifestUri: string
): Promise<ManifestDetails | "INVALID"> {
  const manifestURL = manifestUri.startsWith("file:")
    ? manifestUri
    : pathToFileURL(manifestUri).toString();
  const manifestPath = fileURLToPath(manifestURL);
  const manifestContent = await readFile(manifestPath, "utf-8");

  let manifestJsonObject;
  try {
    manifestJsonObject = JSON.parse(manifestContent);
  } catch (err) {
    return "INVALID";
  }

  const flexEnabled = manifestJsonObject["sap.ui5"]?.flexEnabled;
  const minUI5Version =
    manifestJsonObject["sap.ui5"]?.dependencies?.minUI5Version;
  const customViews = {};

  const modelDataSource =
    manifestJsonObject["sap.ui5"]?.models?.[""]?.dataSource;
  const dataSources = manifestJsonObject["sap.app"]?.dataSources;

  let metadataContent: string | undefined;
  let annotationContent: string[] = [];
  if (dataSources) {
    const defaultModelDataSource = dataSources[modelDataSource];
    const localUri = defaultModelDataSource?.settings?.localUri;
    if (localUri) {
      const metadataPath = normalize(join(manifestPath, "..", localUri));
      metadataContent = await readFile(metadataPath, {
        encoding: "utf8",
      });
    }

    const annotationFilePaths = (
      defaultModelDataSource?.settings?.annotations ?? []
    )
      .map((name) => dataSources[name]?.settings?.localUri)
      .filter((path) => !!path);
    if (annotationFilePaths.length) {
      annotationContent = await Promise.all(
        annotationFilePaths.map((path) =>
          readFile(normalize(join(manifestPath, "..", path)), {
            encoding: "utf8",
          })
        )
      );
    }
  }

  const targets = manifestJsonObject["sap.ui5"]?.routing?.targets;
  if (targets) {
    for (const name of Object.keys(targets)) {
      const target = targets[name];
      if (target) {
        const settings = target?.options?.settings;
        if (settings.entitySet && settings.viewName) {
          customViews[settings.viewName] = {
            entitySet: settings.entitySet,
          };
        }
      }
    }
  }

  return {
    flexEnabled: flexEnabled,
    minUI5Version: minUI5Version,
    annotationFiles: annotationContent,
    metadataFile: metadataContent,
    customViews,
  };
}
