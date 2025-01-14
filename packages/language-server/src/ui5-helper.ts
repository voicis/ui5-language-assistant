import { UI5Framework } from "@ui5-language-assistant/semantic-model-types";

export const DEFAULT_UI5_FRAMEWORK = "SAPUI5";
export const DEFAULT_UI5_VERSION = "1.71.49";

const UI5_FRAMEWORK_CDN_BASE_URL = {
  OpenUI5: "https://sdk.openui5.org/",
  SAPUI5: "https://ui5.sap.com/",
};

export function getCDNBaseUrl(
  framework: UI5Framework,
  version: string | undefined
): string {
  let url = UI5_FRAMEWORK_CDN_BASE_URL[framework];
  if (version) {
    url += `${version}/`;
  }
  return url;
}

export function getVersionJsonUrl(/* framework: UI5Framework */): string {
  // version.json is only supported for SAPUI5 right now
  return `${UI5_FRAMEWORK_CDN_BASE_URL["SAPUI5"]}version.json`;
}

export function getVersionInfoUrl(
  framework: UI5Framework,
  version: string
): string {
  const cdnBaseUrl = getCDNBaseUrl(framework, version);
  return `${cdnBaseUrl}resources/sap-ui-version.json`;
}

export function getLibraryAPIJsonUrl(
  framework: UI5Framework,
  version: string,
  libName: string
): string {
  const cdnBaseUrl = getCDNBaseUrl(framework, version);
  const baseUrl = `${cdnBaseUrl}test-resources/`;
  const suffix = "/designtime/api.json";
  return baseUrl + libName.replace(/\./g, "/") + suffix;
}
