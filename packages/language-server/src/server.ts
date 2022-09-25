/* istanbul ignore file */
import { forEach } from "lodash";
import {
  createConnection,
  TextDocuments,
  TextDocumentSyncKind,
  ProposedFeatures,
  TextDocumentPositionParams,
  CompletionItem,
  InitializeParams,
  Hover,
  DidChangeConfigurationNotification,
} from "vscode-languageserver";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
  clearSettings,
  setGlobalSettings,
  clearDocumentSettings,
  setSettingsForDocument,
  hasSettingsForDocument,
  getSettingsForDocument,
} from "@ui5-language-assistant/settings";
import { commands } from "@ui5-language-assistant/user-facing-text";
import { ServerInitializationOptions } from "../api";
import { getCompletionItems } from "./completion-items";
import { getXMLViewDiagnostics } from "./xml-view-diagnostics";
import { getHoverResponse } from "./hover";
import { isManifestDoc } from "./manifest-handling";
import { isUI5YamlDoc, updateUI5YamlData } from "./ui5yaml-handling";
import { diagnosticToCodeActionFix } from "./quick-fix";
import { executeCommand } from "./commands";
import { initSwa } from "./swa";
import { getLogger, setLogLevel } from "./logger";
import { getCDNBaseUrl } from "./ui5-helper";
import {
  updateServiceFiles,
  getContextForFile,
  updateManifestData,
  updateAppFile,
  updatePackageJson,
} from "./cache";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);
let initializationOptions: ServerInitializationOptions | undefined;
let hasConfigurationCapability = false;

connection.onInitialize(async (params: InitializeParams) => {
  getLogger().info("`onInitialize` event", params);
  if (params?.initializationOptions?.logLevel) {
    setLogLevel(params?.initializationOptions?.logLevel);
  }
  initSwa(params);

  const capabilities = params.capabilities;

  // Does the client support the `workspace/configuration` request?
  // If not, we will fall back using global settings
  hasConfigurationCapability =
    capabilities.workspace !== undefined &&
    (capabilities.workspace.configuration ?? false);

  // These options are passed from the client extension in clientOptions.initializationOptions
  initializationOptions = params.initializationOptions;
  return {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      completionProvider: {
        resolveProvider: true,
        // TODO: can the trigger characters be more contextual?
        //       e.g: "<" of open tag only, not else where
        triggerCharacters: ['"', "'", ":", "<"],
      },
      hoverProvider: true,
      codeActionProvider: true,
      // Each command executes a different code action scenario
      executeCommandProvider: {
        commands: [
          commands.QUICK_FIX_STABLE_ID_ERROR.name,
          commands.QUICK_FIX_STABLE_ID_FILE_ERRORS.name,
        ],
      },
    },
  };
});

connection.onInitialized(async () => {
  getLogger().info("`onInitialized` event");
  if (hasConfigurationCapability) {
    // Register for all configuration changes
    connection.client.register(DidChangeConfigurationNotification.type, {
      section: "UI5LanguageAssistant",
    });
  }
});

connection.onCompletion(
  async (
    textDocumentPosition: TextDocumentPositionParams
  ): Promise<CompletionItem[]> => {
    getLogger().debug("`onCompletion` event", {
      textDocumentPosition,
    });

    const documentUri = textDocumentPosition.textDocument.uri;
    const document = documents.get(documentUri);
    if (document) {
      const context = await getContextForFile(
        documentUri,
        initializationOptions?.modelCachePath
      );
      const framework = context.ui5Model.framework ?? "SAPUI5";
      connection.sendNotification("UI5LanguageAssistant/ui5Model", {
        url: getCDNBaseUrl(framework, context.ui5Model.version),
        framework,
        version: context.ui5Model.version,
      });
      ensureDocumentSettingsUpdated(document.uri);
      const documentSettings = await getSettingsForDocument(document.uri);
      const completionItems = getCompletionItems({
        context,
        textDocumentPosition,
        document,
        documentSettings,
      });
      getLogger().trace("computed completion items", { completionItems });
      return completionItems;
    }
    return [];
  }
);

connection.onCompletionResolve(
  (item: CompletionItem): CompletionItem => {
    return item;
  }
);

connection.onHover(
  async (
    textDocumentPosition: TextDocumentPositionParams
  ): Promise<Hover | undefined> => {
    getLogger().debug("`onHover` event", {
      textDocumentPosition,
    });
    const documentUri = textDocumentPosition.textDocument.uri;
    const document = documents.get(documentUri);
    if (document) {
      const context = await getContextForFile(
        documentUri,
        initializationOptions?.modelCachePath
      );
      const framework = context.ui5Model.framework ?? "SAPUI5";
      connection.sendNotification("UI5LanguageAssistant/ui5Model", {
        url: getCDNBaseUrl(framework, context.ui5Model.version),
        framework,
        version: context.ui5Model.version,
      });
      const hoverResponse = getHoverResponse(
        context.ui5Model,
        textDocumentPosition,
        document
      );
      getLogger().trace("computed hoverResponse", {
        hoverResponse,
      });
      return hoverResponse;
    }
    return undefined;
  }
);

connection.onDidChangeWatchedFiles(async (changeEvent) => {
  getLogger().debug("`onDidChangeWatchedFiles` event", { changeEvent });
  const cdsFileChanges: string[] = [];
  forEach(changeEvent.changes, async (change) => {
    const uri = change.uri;
    if (isManifestDoc(uri)) {
      await updateManifestData(uri);
    } else if (isUI5YamlDoc(uri)) {
      await updateUI5YamlData(uri, change.type);
    } else if (uri.endsWith(".cds")) {
      cdsFileChanges.push(uri);
    } else if (uri.endsWith("package.json")) {
      await updatePackageJson(uri);
    } else {
      await updateAppFile(uri);
    }
  });
  await updateServiceFiles(cdsFileChanges);
});

documents.onDidChangeContent(async (changeEvent) => {
  getLogger().trace("`onDidChangeContent` event", { changeEvent });

  const documentUri = changeEvent.document.uri;
  const document = documents.get(documentUri);
  if (document !== undefined) {
    const context = await getContextForFile(
      documentUri,
      initializationOptions?.modelCachePath
    );
    const framework = context.ui5Model.framework ?? "SAPUI5";
    connection.sendNotification("UI5LanguageAssistant/ui5Model", {
      url: getCDNBaseUrl(framework, context.ui5Model.version),
      framework,
      version: context.ui5Model.version,
    });
    const diagnostics = getXMLViewDiagnostics({
      document,
      context,
      flexEnabled: context.manifest?.flexEnabled,
    });
    getLogger().trace("computed diagnostics", { diagnostics });
    connection.sendDiagnostics({ uri: changeEvent.document.uri, diagnostics });
  }
});

connection.onCodeAction(async (params) => {
  getLogger().debug("`onCodeAction` event", { params });

  const documentUri = params.textDocument.uri;
  const textDocument = documents.get(documentUri);
  if (textDocument === undefined) {
    return undefined;
  }

  const context = await getContextForFile(
    documentUri,
    initializationOptions?.modelCachePath
  );
  const framework = context.ui5Model.framework ?? "SAPUI5";

  connection.sendNotification("UI5LanguageAssistant/ui5Model", {
    url: getCDNBaseUrl(framework, context.ui5Model.version),
    framework,
    version: context.ui5Model.version,
  });

  const diagnostics = params.context.diagnostics;
  const codeActions = diagnosticToCodeActionFix(
    textDocument,
    diagnostics,
    context
  );
  getLogger().trace("`computed codeActions", { codeActions });
  return codeActions;
});

connection.onExecuteCommand(async (params) => {
  getLogger().debug("`onExecuteCommand` event", { params });
  executeCommand(connection, params);
});

function ensureDocumentSettingsUpdated(resource: string): void {
  // There are 2 flows for settings, depending on the client capabilities:
  // 1. The client doesn't support workspace/document-level settings (workspace/configuration request).
  //    In this case we use global settings (which arrive in onDidChangeConfiguration) and don't try to fetch the
  //    workspace/document settings.
  // 2. The client supports workspace/configuration request.
  //    In this case we ask for the document's settings when we need them (if we don't already have them),
  //    and clear all the document settings when the configuration changes (onDidChangeConfiguration).
  // The settings can be configured (in the client) on the user level, workspace level or (on theia) folder level,
  // using fallback logic from the most specific to most general, so we keep it cached on the document level.
  if (!hasConfigurationCapability) {
    return;
  }
  if (!hasSettingsForDocument(resource)) {
    const result = connection.workspace.getConfiguration({
      scopeUri: resource,
      section: "UI5LanguageAssistant",
    });
    getLogger().debug("updating settings for document", { result });
    setSettingsForDocument(resource, result);
  }
}

connection.onDidChangeConfiguration((change) => {
  getLogger().debug("`onDidChangeConfiguration` event");
  if (hasConfigurationCapability) {
    getLogger().trace("Reset all cached document settings");
    clearSettings();
  } else {
    if (change.settings.UI5LanguageAssistant !== undefined) {
      const ui5LangAssistSettings = change.settings.UI5LanguageAssistant;
      getLogger().trace("Set global settings", {
        ui5LangAssistSettings,
      });
      setGlobalSettings(ui5LangAssistSettings);
    }
  }
  // In the future we might want to
  // re-validate the files related to the `cached document settings`.

  // `setLogLevel` will ignore `undefined` values
  setLogLevel(change?.settings?.UI5LanguageAssistant?.logging?.level);
});

// Only keep settings for open documents
documents.onDidClose((textDocumentChangeEvent) => {
  getLogger().debug("`onDidClose` event", { textDocumentChangeEvent });
  clearDocumentSettings(textDocumentChangeEvent.document.uri);
});

documents.listen(connection);

connection.listen();

function isXMLView(uri: string): boolean {
  return /(view|fragment)\.xml$/.test(uri);
}
