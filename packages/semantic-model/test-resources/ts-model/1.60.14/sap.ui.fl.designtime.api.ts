import { LibraryFile } from "@vscode-ui5/semantic-model/src/apiJson";

const api: LibraryFile = {
  "$schema-ref": "http://schemas.sap.com/sapui5/designtime/api.json/1.0",
  version: "1.60.14",
  symbols: [
    {
      kind: "namespace",
      name: "sap.ui.fl",
      basename: "fl",
      resource: "sap/ui/fl/library.js",
      module: "sap/ui/fl/library",
      export: "",
      static: true,
      visibility: "restricted",
      description:
        "SAPUI5 library for UI Flexibility and Descriptor Changes and Descriptor Variants."
    },
    {
      kind: "namespace",
      name: "sap.ui.fl.ControlPersonalizationAPI",
      basename: "ControlPersonalizationAPI",
      resource: "sap/ui/fl/ControlPersonalizationAPI.js",
      module: "sap/ui/fl/ControlPersonalizationAPI",
      export: "",
      static: true,
      visibility: "restricted",
      since: "1.56",
      description:
        "Provides an API to handle specific functionality for personalized changes.",
      experimental: { since: "1.56" },
      methods: [
        {
          name: "activateVariant",
          visibility: "public",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "Returns Promise that resolves after the variant is updated or rejects when an error occurs"
          },
          parameters: [
            {
              name: "vElement",
              type: "sap.ui.base.ManagedObject|string",
              optional: false,
              description:
                "The component or control (instance or ID) on which the variantModel is set"
            },
            {
              name: "sVariantReference",
              type: "string",
              optional: false,
              description: "The variant reference which needs to be activated"
            }
          ],
          description:
            "Activates the passed variant applicable to the passed control/component."
        },
        {
          name: "addPersonalizationChanges",
          visibility: "public",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "Returns Promise resolving to an array of successfully applied changes, after the changes have been written to the map of dirty changes and applied to the control"
          },
          parameters: [
            {
              name: "mPropertyBag",
              type: "object",
              optional: false,
              parameterProperties: {
                controlChanges: {
                  name: "controlChanges",
                  type: "array",
                  optional: false,
                  description:
                    "Array of control changes of type {@link sap.ui.fl.ControlPersonalizationAPI.PersonalizationChange}"
                },
                ignoreVariantManagement: {
                  name: "ignoreVariantManagement",
                  type: "boolean",
                  optional: true,
                  defaultValue: false,
                  description:
                    "If flag is set to true then variant management will be ignored"
                }
              },
              description:
                "Changes along with other settings that need to be added"
            }
          ],
          description:
            "Creates personalization changes, adds them to the flex persistence (not yet saved) and applies them to the control."
        },
        {
          name: "clearVariantParameterInURL",
          visibility: "public",
          static: true,
          parameters: [
            {
              name: "oVariantManagementControl",
              type: "sap.ui.base.ManagedObject",
              optional: true,
              description:
                "The variant management control for which the URL technical parameter has to be cleared"
            }
          ],
          description:
            "Clears URL technical parameter 'sap-ui-fl-control-variant-id' for control variants. If a variant management control is given as parameter, only parameters specific to that control are cleared."
        },
        {
          name: "hasVariantManagement",
          visibility: "public",
          static: true,
          returnValue: {
            type: "boolean",
            description:
              "Returns true if a variant management control is encompassing the given control, else false"
          },
          parameters: [
            {
              name: "oControl",
              type: "sap.ui.base.ManagedObject",
              optional: false,
              description:
                "The control which should be tested for an encompassing variant management control"
            }
          ],
          description:
            "Determines the availability of an encompassing variant management control."
        },
        {
          name: "saveChanges",
          visibility: "public",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "Returns Promise which is resolved when the passed array of changes have been saved"
          },
          parameters: [
            {
              name: "aChanges",
              type: "array",
              optional: false,
              description: "Array of changes to be saved"
            },
            {
              name: "oManagedObject",
              type: "sap.ui.base.ManagedObject",
              optional: false,
              description:
                "A managed object instance which has an application component responsible, on which changes need to be saved"
            }
          ],
          description:
            "Saves unsaved changes added to {@link sap.ui.fl.ChangePersistence}."
        }
      ]
    },
    {
      kind: "typedef",
      name: "sap.ui.fl.ControlPersonalizationAPI.PersonalizationChange",
      basename: "PersonalizationChange",
      resource: "sap/ui/fl/ControlPersonalizationAPI.js",
      module: "sap/ui/fl/ControlPersonalizationAPI",
      export: "PersonalizationChange",
      static: true,
      visibility: "restricted",
      since: "1.56",
      description:
        "Object containing attributes of a change, along with the control to which this change should be applied.",
      properties: [
        {
          name: "selectorControl",
          type: "sap.ui.core.Element",
          visibility: "restricted",
          description:
            "The control object to be used as selector for the change"
        },
        {
          name: "changeSpecificData",
          type: "object",
          visibility: "restricted",
          description:
            "The map of change-specific data to perform a flex change"
        },
        {
          name: "changeSpecificData.changeType",
          type: "string",
          visibility: "restricted",
          description:
            "The change type for which a change handler is registered"
        }
      ]
    },
    {
      kind: "namespace",
      name: "sap.ui.fl.descriptorRelated",
      basename: "descriptorRelated",
      resource: "sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory.js",
      module: "sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
      static: true,
      visibility: "restricted",
      description: "Descriptor Related"
    },
    {
      kind: "namespace",
      name: "sap.ui.fl.descriptorRelated.api",
      basename: "api",
      resource: "sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory.js",
      module: "sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
      static: true,
      visibility: "restricted",
      description: "Descriptor Related Apis"
    },
    {
      kind: "class",
      name: "sap.ui.fl.descriptorRelated.api.DescriptorChange",
      basename: "DescriptorChange",
      resource: "sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory.js",
      module: "sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
      static: true,
      visibility: "restricted",
      constructor: {
        visibility: "restricted",
        parameters: [
          {
            name: "mChangeFile",
            type: "object",
            optional: false,
            description: "change file"
          },
          {
            name: "oInlineChange",
            type: "sap.ui.fl.descriptorRelated.api.DescriptorInlineChange",
            optional: false,
            description: "inline change object"
          },
          {
            name: "oSettings",
            type: "sap.ui.fl.registry.Settings",
            optional: false,
            description: "settings"
          }
        ],
        description: "Descriptor Change"
      },
      methods: [
        {
          name: "getJson",
          visibility: "restricted",
          returnValue: {
            type: "object",
            description: "copy of JSON object of the descriptor change"
          },
          description:
            "Returns a copy of the JSON object of the descriptor change"
        },
        {
          name: "setPackage",
          visibility: "restricted",
          returnValue: {
            type: "Promise",
            description: "resolving when setting of package was successful"
          },
          parameters: [
            {
              name: "sPackage",
              type: "string",
              optional: false,
              description: "package"
            }
          ],
          description: "Set package (for ABAP Backend)"
        },
        {
          name: "setTransportRequest",
          visibility: "restricted",
          returnValue: {
            type: "Promise",
            description:
              "resolving when setting of transport request was successful"
          },
          parameters: [
            {
              name: "sTransportRequest",
              type: "string",
              optional: false,
              description: "transport request"
            }
          ],
          description: "Set transport request (for ABAP Backend)"
        },
        {
          name: "store",
          visibility: "restricted",
          returnValue: { type: "object", description: "change object" },
          description: "Stores the descriptor change in change persistence"
        },
        {
          name: "submit",
          visibility: "restricted",
          returnValue: {
            type: "Promise",
            description: "resolving after all changes have been saved"
          },
          description: "Submits the descriptor change to the backend"
        }
      ]
    },
    {
      kind: "class",
      name: "sap.ui.fl.descriptorRelated.api.DescriptorChangeFactory",
      basename: "DescriptorChangeFactory",
      resource: "sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory.js",
      module: "sap/ui/fl/descriptorRelated/api/DescriptorChangeFactory",
      export: "",
      static: true,
      visibility: "restricted",
      constructor: {
        visibility: "restricted",
        description: "Factory for Descriptor Changes"
      },
      methods: [
        {
          name: "createNew",
          visibility: "restricted",
          returnValue: {
            type: "Promise",
            description: "resolving the new Change instance"
          },
          parameters: [
            {
              name: "sReference",
              type: "string",
              optional: false,
              description: "the descriptor id for which the change is created"
            },
            {
              name: "oInlineChange",
              type: "object",
              optional: false,
              description: "the inline change instance"
            },
            {
              name: "sLayer",
              type: "string",
              optional: false,
              description: "layer of the descriptor change"
            },
            {
              name: "oAppComponent",
              type: "object",
              optional: false,
              description: "application component to get the version from"
            },
            {
              name: "sTool",
              type: "string",
              optional: false,
              description:
                "tool which creates the descriptor change (e.g. RTA, DTA, FCC ...)"
            }
          ],
          description: "Creates a new descriptor change"
        }
      ]
    },
    {
      kind: "class",
      name: "sap.ui.fl.descriptorRelated.api.DescriptorInlineChange",
      basename: "DescriptorInlineChange",
      resource:
        "sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory.js",
      module: "sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
      static: true,
      visibility: "restricted",
      constructor: {
        visibility: "restricted",
        parameters: [
          {
            name: "sChangeType",
            type: "string",
            optional: false,
            description: "change type"
          },
          {
            name: "mParameters",
            type: "object",
            optional: true,
            description:
              "parameters of the inline change for the provided change type"
          },
          {
            name: "mTexts",
            type: "object",
            optional: true,
            description: "texts for the inline change"
          }
        ],
        description: "Descriptor Inline Change"
      }
    },
    {
      kind: "namespace",
      name: "sap.ui.fl.descriptorRelated.api.DescriptorInlineChangeFactory",
      basename: "DescriptorInlineChangeFactory",
      resource:
        "sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory.js",
      module: "sap/ui/fl/descriptorRelated/api/DescriptorInlineChangeFactory",
      export: "",
      static: true,
      visibility: "restricted",
      description: "Factory for Descriptor Inline Changes",
      methods: [
        {
          name: "create_app_addAnnotationsToOData",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                dataSourceId: {
                  name: "dataSourceId",
                  type: "string",
                  optional: false,
                  description:
                    "the id of the data source to be changed by adding annotations from annotations parameter"
                },
                annotations: {
                  name: "annotations",
                  type: "array",
                  optional: false,
                  description:
                    "array with ids of data sources of type 'ODataAnnotation' that should be added to the data source to be changed"
                },
                annotationsInsertPosition: {
                  name: "annotationsInsertPosition",
                  type: "enum",
                  optional: true,
                  description:
                    "position at which the annotations should be added to the annotations of the data source to be changed (BEGINNING/END, default BEGINNING)"
                },
                dataSource: {
                  name: "dataSource",
                  type: "object",
                  optional: false,
                  description:
                    "one or several data sources of type 'ODataAnnotation' which should be added, all need to be contained in the annotations parameter"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_addAnnotationsToOData"
        },
        {
          name: "create_app_addNewDataSource",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                dataSource: {
                  name: "dataSource",
                  type: "object",
                  optional: false,
                  description:
                    "the data source to be created according to descriptor schema (either one data source or one of type OData and one of type ODataAnnotation)"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_addNewDataSource"
        },
        {
          name: "create_app_addNewInbound",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                inbound: {
                  name: "inbound",
                  type: "object",
                  optional: false,
                  description:
                    "the inbound to be created according to descriptor schema"
                }
              },
              description: "parameters of the change type"
            },
            {
              name: "mTexts",
              type: "object",
              optional: true,
              description: "texts for the inline change"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_addNewInbound"
        },
        {
          name: "create_app_addNewOutbound",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                outbound: {
                  name: "outbound",
                  type: "object",
                  optional: false,
                  description:
                    "the outbound to be created according to descriptor schema"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_addNewOutbound"
        },
        {
          name: "create_app_addTechnicalAttributes",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                technicalAttributes: {
                  name: "technicalAttributes",
                  type: "array",
                  optional: false,
                  description: "the technicalAttributes"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_addTechnicalAttributes"
        },
        {
          name: "create_app_changeDataSource",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                dataSourceId: {
                  name: "dataSourceId",
                  type: "string",
                  optional: false,
                  description: "the id of the data source to be changed"
                },
                entityPropertyChange: {
                  name: "entityPropertyChange",
                  type: "object|array",
                  optional: false,
                  parameterProperties: {
                    propertyPath: {
                      name: "propertyPath",
                      type: "object",
                      optional: false,
                      description: "the property path inside the data source"
                    },
                    operation: {
                      name: "operation",
                      type: "object",
                      optional: false,
                      description:
                        "the operation (INSERT, UPDATE, UPSERT, DELETE)"
                    },
                    propertyValue: {
                      name: "propertyValue",
                      type: "object",
                      optional: false,
                      description: "the new property value"
                    }
                  },
                  description:
                    "the entity property change or an array of multiple changes"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_changeDataSource"
        },
        {
          name: "create_app_changeInbound",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                inboundId: {
                  name: "inboundId",
                  type: "string",
                  optional: false,
                  description: "the id of the inbound to be changed"
                },
                entityPropertyChange: {
                  name: "entityPropertyChange",
                  type: "object|array",
                  optional: false,
                  parameterProperties: {
                    propertyPath: {
                      name: "propertyPath",
                      type: "object",
                      optional: false,
                      description:
                        "the property path inside the inbound. If the propertyPath contains a parameter id with slash(es), each slash of the parameter id has to be escaped by exactly 2 backslashes."
                    },
                    operation: {
                      name: "operation",
                      type: "object",
                      optional: false,
                      description:
                        "the operation (INSERT, UPDATE, UPSERT, DELETE)"
                    },
                    propertyValue: {
                      name: "propertyValue",
                      type: "object",
                      optional: false,
                      description: "the new property value"
                    }
                  },
                  description:
                    "the entity property change or an array of multiple changes"
                }
              },
              description: "parameters of the change type"
            },
            {
              name: "mTexts",
              type: "object",
              optional: true,
              description: "texts for the inline change"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_changeInbound"
        },
        {
          name: "create_app_changeOutbound",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                outboundId: {
                  name: "outboundId",
                  type: "string",
                  optional: false,
                  description: "the id of the outbound to be changed"
                },
                entityPropertyChange: {
                  name: "entityPropertyChange",
                  type: "object|array",
                  optional: false,
                  parameterProperties: {
                    propertyPath: {
                      name: "propertyPath",
                      type: "object",
                      optional: false,
                      description:
                        "the property path inside the outbound. If the propertyPath contains a parameter id with slash(es), each slash of the parameter id has to be escaped by exactly 2 backslashes."
                    },
                    operation: {
                      name: "operation",
                      type: "object",
                      optional: false,
                      description:
                        "the operation (INSERT, UPDATE, UPSERT, DELETE)"
                    },
                    propertyValue: {
                      name: "propertyValue",
                      type: "object",
                      optional: false,
                      description: "the new property value"
                    }
                  },
                  description:
                    "the entity property change or an array of multiple changes"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_changeOutbound"
        },
        {
          name: "create_app_removeAllInboundsExceptOne",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                inboundId: {
                  name: "inboundId",
                  type: "string",
                  optional: false,
                  description: "the id of the inbound that should be preserved"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_removeAllInboundsExceptOne"
        },
        {
          name: "create_app_removeDataSource",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                dataSourceId: {
                  name: "dataSourceId",
                  type: "string",
                  optional: false,
                  description: "the id of the data source to be removed"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_removeDataSource"
        },
        {
          name: "create_app_removeInbound",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                inboundId: {
                  name: "inboundId",
                  type: "string",
                  optional: false,
                  description: "the id of the inbound to be removed"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_removeInbound"
        },
        {
          name: "create_app_removeOutbound",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                outboundId: {
                  name: "outboundId",
                  type: "string",
                  optional: false,
                  description: "the id of the outbound to be removed"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_removeOutbound"
        },
        {
          name: "create_app_removeTechnicalAttributes",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                technicalAttributes: {
                  name: "technicalAttributes",
                  type: "array",
                  optional: false,
                  description: "the technicalAttributes"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_removeTechnicalAttributes"
        },
        {
          name: "create_app_setAch",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                ach: {
                  name: "ach",
                  type: "object",
                  optional: false,
                  description: "the ACH component"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_setAch"
        },
        {
          name: "create_app_setDescription",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                maxLength: {
                  name: "maxLength",
                  type: "object",
                  optional: false,
                  description: "max length of description"
                },
                type: {
                  name: "type",
                  type: "object",
                  optional: true,
                  defaultValue: "'XTIT'",
                  description: "type of description"
                },
                comment: {
                  name: "comment",
                  type: "object",
                  optional: true,
                  description: "comment for additional information"
                },
                value: {
                  name: "value",
                  type: "object",
                  optional: true,
                  description:
                    'map of locale and text, "" represents the default description'
                }
              },
              description: "map of text properties"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_setDescription"
        },
        {
          name: "create_app_setDestination",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                destination: {
                  name: "destination",
                  type: "object",
                  optional: false,
                  description: "the destination"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_setDestination"
        },
        {
          name: "create_app_setInfo",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                maxLength: {
                  name: "maxLength",
                  type: "object",
                  optional: false,
                  description: "max length of info"
                },
                type: {
                  name: "type",
                  type: "object",
                  optional: true,
                  defaultValue: "'XTIT'",
                  description: "type of info"
                },
                comment: {
                  name: "comment",
                  type: "object",
                  optional: true,
                  description: "comment for additional information"
                },
                value: {
                  name: "value",
                  type: "object",
                  optional: true,
                  description:
                    'map of locale and text, "" represents the default info'
                }
              },
              description: "map of text properties"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_setInfo"
        },
        {
          name: "create_app_setKeywords",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                keywords: {
                  name: "keywords",
                  type: "array",
                  optional: false,
                  description: "the keywords"
                }
              },
              description: "parameters of the change type"
            },
            {
              name: "mTexts",
              type: "object",
              optional: true,
              description: "texts for the inline change"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_setKeywords"
        },
        {
          name: "create_app_setShortTitle",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                maxLength: {
                  name: "maxLength",
                  type: "object",
                  optional: false,
                  description: "max length of sub title"
                },
                type: {
                  name: "type",
                  type: "object",
                  optional: true,
                  defaultValue: "'XTIT'",
                  description: "type of short title"
                },
                comment: {
                  name: "comment",
                  type: "object",
                  optional: true,
                  description: "comment for additional information"
                },
                value: {
                  name: "value",
                  type: "object",
                  optional: true,
                  description:
                    'map of locale and text, "" represents the default short title'
                }
              },
              description: "map of text properties"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_setShortTitle"
        },
        {
          name: "create_app_setSubTitle",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                maxLength: {
                  name: "maxLength",
                  type: "object",
                  optional: false,
                  description: "max length of sub title"
                },
                type: {
                  name: "type",
                  type: "object",
                  optional: true,
                  defaultValue: "'XTIT'",
                  description: "type of sub title"
                },
                comment: {
                  name: "comment",
                  type: "object",
                  optional: true,
                  description: "comment for additional information"
                },
                value: {
                  name: "value",
                  type: "object",
                  optional: true,
                  description:
                    'map of locale and text, "" represents the default sub title'
                }
              },
              description: "map of text properties"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_setSubTitle"
        },
        {
          name: "create_app_setTitle",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                maxLength: {
                  name: "maxLength",
                  type: "object",
                  optional: false,
                  description: "max length of title"
                },
                type: {
                  name: "type",
                  type: "object",
                  optional: true,
                  defaultValue: "'XTIT'",
                  description: "type of title"
                },
                comment: {
                  name: "comment",
                  type: "object",
                  optional: true,
                  description: "comment for additional information"
                },
                value: {
                  name: "value",
                  type: "object",
                  optional: true,
                  description:
                    'map of locale and text, "" represents the default title'
                }
              },
              description: "map of text properties"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_app_setTitle"
        },
        {
          name: "create_flp_setConfig",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                config: {
                  name: "config",
                  type: "array",
                  optional: false,
                  description: "the config settings"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_flp_setConfig"
        },
        {
          name: "create_ovp_addNewCard",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                card: {
                  name: "card",
                  type: "object",
                  optional: false,
                  description:
                    "the card to be created according to descriptor schema"
                },
                model: {
                  name: "model",
                  type: "object",
                  optional: true,
                  description:
                    "the ui5 model to be created according to descriptor schema"
                },
                dataSource: {
                  name: "dataSource",
                  type: "object",
                  optional: true,
                  description:
                    "the data sources to be created according to descriptor schema (either not provided or of type OData or of type OData and ODataAnnotation"
                }
              },
              description: "parameters of the change type"
            },
            {
              name: "mTexts",
              type: "object",
              optional: true,
              description: "texts for the inline change"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ovp_addNewCard"
        },
        {
          name: "create_ovp_changeCard",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                cardId: {
                  name: "cardId",
                  type: "string",
                  optional: false,
                  description: "the id of the card to be changed"
                },
                entityPropertyChange: {
                  name: "entityPropertyChange",
                  type: "object|array",
                  optional: false,
                  parameterProperties: {
                    propertyPath: {
                      name: "propertyPath",
                      type: "object",
                      optional: false,
                      description:
                        "the property path inside the card (Eg. '/settings/title')."
                    },
                    operation: {
                      name: "operation",
                      type: "object",
                      optional: false,
                      description:
                        "the operation (INSERT, UPDATE, UPSERT, DELETE)"
                    },
                    propertyValue: {
                      name: "propertyValue",
                      type: "object",
                      optional: false,
                      description: "the new property value"
                    }
                  },
                  description:
                    "the entity property change or an array of multiple changes"
                }
              },
              description: "parameters of the change type"
            },
            {
              name: "mTexts",
              type: "object",
              optional: true,
              description: "texts for the inline change"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ovp_changeCard"
        },
        {
          name: "create_ovp_removeCard",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                cardId: {
                  name: "cardId",
                  type: "string",
                  optional: false,
                  description: "the id of the card to be removed"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ovp_removeCard"
        },
        {
          name: "create_smb_addNamespace",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                smartBusinessApp: {
                  name: "smartBusinessApp",
                  type: "object",
                  optional: false,
                  description:
                    "the smart business app to be created according to descriptor schema"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_smb_addNamespace"
        },
        {
          name: "create_smb_changeNamespace",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                smartBusinessApp: {
                  name: "smartBusinessApp",
                  type: "object",
                  optional: false,
                  description:
                    "the smart business app to be changed according to descriptor schema"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_smb_changeNamespace"
        },
        {
          name: "create_ui5_addLibraries",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                libraries: {
                  name: "libraries",
                  type: "object",
                  optional: false,
                  description: "library to be added"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ui5_addLibraries"
        },
        {
          name: "create_ui5_addNewModel",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                model: {
                  name: "model",
                  type: "object",
                  optional: false,
                  description:
                    "the ui5 model to be created according to descriptor schema"
                },
                dataSource: {
                  name: "dataSource",
                  type: "object",
                  optional: true,
                  description:
                    "the data sources to be created according to descriptor schema (either not provided or of arbitrary type or two provided of type OData and of type OData and ODataAnnotation)"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ui5_addNewModel"
        },
        {
          name: "create_ui5_addNewModelEnhanceWith",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                modelId: {
                  name: "modelId",
                  type: "string",
                  optional: false,
                  description: "the ui5 model id to be enhanced"
                }
              },
              description: "parameters of the change type"
            },
            {
              name: "texts",
              type: "object",
              optional: false,
              description: "the i18n properties file path"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ui5_addNewModelEnhanceWith"
        },
        {
          name: "create_ui5_removeModel",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                modelId: {
                  name: "modelId",
                  type: "string",
                  optional: false,
                  description: "the id of the ui5 model to be removed"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ui5_removeModel"
        },
        {
          name: "create_ui5_replaceComponentUsage",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                componentUsageId: {
                  name: "componentUsageId",
                  type: "object",
                  optional: false,
                  description: "the ui5 component usage id to be created"
                },
                componentUsage: {
                  name: "componentUsage",
                  type: "object",
                  optional: false,
                  description:
                    "the ui5 component usage data to replace the old one according to descriptor schema"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ui5_replaceComponentUsage"
        },
        {
          name: "create_ui_generic_app_setMainPage",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                page: {
                  name: "page",
                  type: "object",
                  optional: false,
                  description:
                    "the page to be created according to descriptor schema"
                }
              },
              description: "parameters of the change type"
            },
            {
              name: "mTexts",
              type: "object",
              optional: true,
              description: "texts for the inline change"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ui_generic_app_setMainPage"
        },
        {
          name: "create_ui_setDeviceTypes",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                deviceTypes: {
                  name: "deviceTypes",
                  type: "object",
                  optional: false,
                  description: "the device types"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ui_setDeviceTypes"
        },
        {
          name: "create_ui_setIcon",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                icon: {
                  name: "icon",
                  type: "object",
                  optional: false,
                  description: "the icon string"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_ui_setIcon"
        },
        {
          name: "create_url_setUri",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                uri: {
                  name: "uri",
                  type: "object",
                  optional: false,
                  description: "the uri string"
                }
              },
              description: "parameters of the change type"
            }
          ],
          description:
            "Creates an inline change of change type appdescr_url_setUri"
        },
        {
          name: "createDescriptorInlineChange",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "resolving when creating the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "sDescriptorChangeType",
              type: "string",
              optional: false,
              description: "the change type"
            },
            {
              name: "mParameters",
              type: "object",
              optional: false,
              description: "parameters of the changed type"
            },
            {
              name: "mTexts",
              type: "object",
              optional: true,
              description: "texts for the inline change"
            }
          ],
          description: "Creates an inline change"
        }
      ]
    },
    {
      kind: "class",
      name: "sap.ui.fl.descriptorRelated.api.DescriptorVariant",
      basename: "DescriptorVariant",
      resource: "sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory.js",
      module: "sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
      static: true,
      visibility: "restricted",
      constructor: {
        visibility: "restricted",
        parameters: [
          {
            name: "mParameters",
            type: "object",
            optional: false,
            parameterProperties: {
              id: {
                name: "id",
                type: "string",
                optional: false,
                description:
                  "the id of the app variant/CDM app config id to be provided for a new app variant/CDM app config and for deleting a app variant/CDM app config"
              },
              reference: {
                name: "reference",
                type: "string",
                optional: false,
                description:
                  "the proposed referenced descriptor or app variant/CDM app config id (might be overwritten by the backend) to be provided when creating a new app variant/CDM app config"
              },
              layer: {
                name: "layer",
                type: "string",
                optional: true,
                defaultValue: "'CUSTOMER",
                description:
                  "the proposed layer (might be overwritten by the backend) when creating a new app variant/CDM app config"
              },
              isAppVariantRoot: {
                name: "isAppVariantRoot",
                type: "boolean",
                optional: true,
                defaultValue: true,
                description:
                  "indicator whether this is an app variant, default is true"
              }
            },
            description: "parameters"
          },
          {
            name: "mFileContent",
            type: "object",
            optional: false,
            description:
              "file content of the existing app variant/CDM app config to be provided if app variant/CDM app config shall be created from an existing"
          },
          {
            name: "bDeletion",
            type: "boolean",
            optional: true,
            defaultValue: false,
            description:
              "deletion indicator to be provided if app variant/CDM app config shall be deleted"
          },
          {
            name: "oSettings",
            type: "sap.ui.fl.registry.Settings",
            optional: false,
            description: "settings"
          }
        ],
        description: "App variant/CDM app config"
      },
      methods: [
        {
          name: "addDescriptorInlineChange",
          visibility: "restricted",
          returnValue: {
            type: "Promise",
            description:
              "resolving when adding the descriptor inline change was successful (without backend access)"
          },
          parameters: [
            {
              name: "oDescriptorInlineChange",
              type: "sap.ui.fl.descriptorRelated.api.DescriptorInlineChange",
              optional: false,
              description: "the inline change"
            }
          ],
          description:
            "Adds a descriptor inline change to the app variant/CDM app config"
        },
        {
          name: "getJson",
          visibility: "restricted",
          returnValue: {
            type: "object",
            description: "copy of JSON object of the app variant/CDM app config"
          },
          description:
            "Returns a copy of the JSON object of the app variant/CDM app config"
        },
        {
          name: "setPackage",
          visibility: "restricted",
          returnValue: {
            type: "Promise",
            description: "resolving when setting of package was successful"
          },
          parameters: [
            {
              name: "sPackage",
              type: "string",
              optional: false,
              description: "ABAP package"
            }
          ],
          description: "Set package (for ABAP Backend)"
        },
        {
          name: "setReference",
          visibility: "restricted",
          parameters: [
            {
              name: "sReference",
              type: "string",
              optional: false,
              description: "the new reference"
            }
          ],
          description: "Set the reference of the app variant/CDM app config"
        },
        {
          name: "setTransportRequest",
          visibility: "restricted",
          returnValue: {
            type: "Promise",
            description:
              "resolving when setting of transport request was successful"
          },
          parameters: [
            {
              name: "sTransportRequest",
              type: "string",
              optional: false,
              description: "ABAP transport request"
            }
          ],
          description: "Set transport request (for ABAP Backend)"
        },
        {
          name: "submit",
          visibility: "restricted",
          returnValue: {
            type: "Promise",
            description:
              "resolving when submitting the app variant was successful"
          },
          description: "Submits the app variant to the backend"
        }
      ]
    },
    {
      kind: "namespace",
      name: "sap.ui.fl.descriptorRelated.api.DescriptorVariantFactory",
      basename: "DescriptorVariantFactory",
      resource: "sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory.js",
      module: "sap/ui/fl/descriptorRelated/api/DescriptorVariantFactory",
      export: "",
      static: true,
      visibility: "restricted",
      description: "Factory for App variant/CDM app configs",
      methods: [
        {
          name: "createDeletion",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description: "resolving the DescriptorVariant instance"
          },
          parameters: [
            {
              name: "sId",
              type: "string",
              optional: false,
              description: "the id of the app variant/CDM app config id"
            }
          ],
          description: "Creates an app variant/CDM app config deletion"
        },
        {
          name: "createForExisting",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description: "resolving the DescriptorVariant instance"
          },
          parameters: [
            {
              name: "sId",
              type: "string",
              optional: false,
              description: "the id of the app variant/CDM app config id"
            }
          ],
          description:
            "Creates an app variant/CDM app config instance for an existing app variant/CDM app config id"
        },
        {
          name: "createFromJson",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description: "resolving the DescriptorVariant instance"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              description: "DT content of app variant/CDM app config"
            }
          ],
          description:
            "Creates a app variant/CDM app config instance from a json"
        },
        {
          name: "createNew",
          visibility: "restricted",
          static: true,
          returnValue: {
            type: "Promise",
            description: "resolving the new DescriptorVariant instance"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: false,
              parameterProperties: {
                reference: {
                  name: "reference",
                  type: "string",
                  optional: false,
                  description:
                    "the proposed referenced descriptor or app variant/CDM app config id (might be overwritten by the backend)"
                },
                id: {
                  name: "id",
                  type: "string",
                  optional: false,
                  description: "the id for the app variant/CDM app config id"
                },
                layer: {
                  name: "layer",
                  type: "string",
                  optional: true,
                  defaultValue: "'CUSTOMER'",
                  description:
                    "the proposed layer for the app variant/CDM app config (might be overwritten by the backend)"
                },
                isAppVariantRoot: {
                  name: "isAppVariantRoot",
                  type: "boolean",
                  optional: true,
                  defaultValue: true,
                  description:
                    "indicator whether this is an app variant, default is true"
                },
                skipIam: {
                  name: "skipIam",
                  type: "boolean",
                  optional: true,
                  defaultValue: false,
                  description:
                    "indicator whether the default IAM item creation and registration is skipped"
                }
              },
              description: "the parameters"
            }
          ],
          description: "Creates a new app variant/CDM app config"
        }
      ]
    },
    {
      kind: "class",
      name: "sap.ui.fl.LrepConnector",
      basename: "LrepConnector",
      resource: "sap/ui/fl/LrepConnector.js",
      module: "sap/ui/fl/LrepConnector",
      export: "",
      static: true,
      visibility: "restricted",
      constructor: {
        visibility: "restricted",
        parameters: [
          {
            name: "mParameters",
            type: "object",
            optional: true,
            parameterProperties: {
              XsrfToken: {
                name: "XsrfToken",
                type: "String",
                optional: true,
                description:
                  "XSRF token which can be reused for back-end connectivity. If no XSRF token is passed, a new one will be fetched from back end."
              }
            },
            description: "map of parameters, see below"
          }
        ],
        description:
          "Provides the connectivity to the LRep & UI5 Flexibility Services REST-routes"
      },
      methods: [
        {
          name: "attachSentRequest",
          visibility: "public",
          static: true,
          parameters: [
            {
              name: "fCallback",
              type: "function",
              optional: false,
              description:
                "function called after all related promises are resolved"
            }
          ],
          description:
            "Registers a callback for a sent request to the back end. The callback is only called once for each change. Each call is done with an object similar to the resolve of the promises containing a <code>status</code> of the response from the back end i.e. <code>success</code>, a <code>response</code> containing the change processed in this request"
        },
        {
          name: "create",
          visibility: "public",
          returnValue: {
            type: "Object",
            description: "Returns the result from the request"
          },
          parameters: [
            {
              name: "oPayload",
              type: "Object",
              optional: false,
              description: "The content which is send to the server"
            },
            {
              name: "sChangelist",
              type: "String",
              optional: true,
              description: "The transport ID."
            },
            {
              name: "bIsVariant",
              type: "Boolean",
              optional: false,
              description: "is variant?"
            }
          ],
          description: "Creates a change or variant via REST call."
        },
        {
          name: "deleteChange",
          visibility: "public",
          returnValue: {
            type: "Object",
            description: "Returns the result from the request"
          },
          parameters: [
            {
              name: "mParameters",
              type: "String",
              optional: false,
              parameterProperties: {
                sChangeName: {
                  name: "sChangeName",
                  type: "String",
                  optional: false,
                  description: "name of the change"
                },
                sLayer: {
                  name: "sLayer",
                  type: "String",
                  optional: true,
                  defaultValue: '"USER"',
                  description:
                    "other possible layers: VENDOR,PARTNER,CUSTOMER_BASE,CUSTOMER"
                },
                sNamespace: {
                  name: "sNamespace",
                  type: "String",
                  optional: false,
                  description: "the namespace of the change file"
                },
                sChangelist: {
                  name: "sChangelist",
                  type: "String",
                  optional: false,
                  description: "The transport ID."
                }
              },
              description: "property bag"
            },
            {
              name: "bIsVariant",
              type: "Boolean",
              optional: false,
              description: "is it a variant?"
            }
          ],
          description: "Delete a change or variant via REST call."
        },
        {
          name: "deleteFile",
          visibility: "public",
          returnValue: {
            type: "Object",
            description: "Returns the result from the request"
          },
          parameters: [
            {
              name: "sNamespace",
              type: "String",
              optional: false,
              description:
                "The abap package goes here. It is needed to identify the change."
            },
            {
              name: "sName",
              type: "String",
              optional: false,
              description: "Name of the change"
            },
            {
              name: "sType",
              type: "String",
              optional: false,
              description: "File type extension"
            },
            {
              name: "sLayer",
              type: "String",
              optional: false,
              description: "File layer"
            },
            {
              name: "sChangelist",
              type: "String",
              optional: false,
              description: "The transport ID, optional"
            }
          ],
          description: "Delete a file via REST call."
        },
        {
          name: "detachSentRequest",
          visibility: "public",
          static: true,
          parameters: [
            {
              name: "fCallback",
              type: "function",
              optional: false,
              description:
                "function called after all related promises are resolved"
            }
          ],
          description:
            "Deregisters a callback for a sent request to the back end if the callback was registered"
        },
        {
          name: "getFileAttributes",
          visibility: "public",
          returnValue: {
            type: "Object",
            description: "Returns the result from the request"
          },
          parameters: [
            {
              name: "sNamespace",
              type: "String",
              optional: false,
              description:
                'The abap package goes here. It is needed to identify the change. Default LREP namespace is "localchange".'
            },
            {
              name: "sName",
              type: "String",
              optional: false,
              description: "Name of the change"
            },
            {
              name: "sType",
              type: "String",
              optional: false,
              description: "File type extension"
            },
            {
              name: "sLayer",
              type: "String",
              optional: false,
              description: "File layer"
            }
          ],
          description:
            "Retrieves the file attributes for a given resource in the LREP."
        },
        {
          name: "getStaticResource",
          visibility: "public",
          returnValue: {
            type: "Object",
            description: "Returns the result from the request"
          },
          parameters: [
            {
              name: "sNamespace",
              type: "String",
              optional: false,
              description:
                'The abap package goes here. It is needed to identify the change. Default LREP namespace is "localchange".'
            },
            {
              name: "sName",
              type: "String",
              optional: false,
              description: "Name of the change"
            },
            {
              name: "sType",
              type: "String",
              optional: false,
              description: "File type extension"
            },
            {
              name: "bIsRuntime",
              type: "Boolean",
              optional: false,
              description:
                "The stored file content is handed over to the lrep provider that can dynamically adjust the content to the runtime context (e.g. do text replacement to the users' logon language) before"
            }
          ],
          description: "Authenticated access to a resource in the Lrep"
        },
        {
          name: "isFlexServiceAvailable",
          visibility: "public",
          static: true,
          returnValue: {
            type: "Promise",
            description:
              "Promise resolved with a boolean value of the availability status"
          },
          description:
            "Gets the availability status of the flexibility service."
        },
        {
          name: "listContent",
          visibility: "public",
          returnValue: {
            type: "Object",
            description: "Returns the result from the request"
          },
          parameters: [
            {
              name: "sNamespace",
              type: "String",
              optional: false,
              description:
                "The file namespace goes here. It is needed to identify the change."
            },
            {
              name: "sLayer",
              type: "String",
              optional: false,
              description: "File layer"
            }
          ],
          description:
            "Retrieves the content for a given namespace and layer via REST call."
        },
        {
          name: "loadChanges",
          visibility: "public",
          returnValue: {
            type: "Promise",
            description:
              "Returns a Promise with the changes (changes, contexts, optional messagebundle), <code>componentClassName</code> and <code>etag</code> value; in case modules are present the Promise is resolved after the module request is finished"
          },
          parameters: [
            {
              name: "oComponent",
              type: "object",
              optional: false,
              parameterProperties: {
                name: {
                  name: "name",
                  type: "string",
                  optional: false,
                  description: "Name of component"
                },
                appVersion: {
                  name: "appVersion",
                  type: "string",
                  optional: true,
                  description: "Current running version of application"
                }
              },
              description: "Contains component data needed for reading changes"
            },
            {
              name: "mPropertyBag",
              type: "map",
              optional: true,
              parameterProperties: {
                appDescriptor: {
                  name: "appDescriptor",
                  type: "object",
                  optional: true,
                  description: "Manifest that belongs to actual component"
                },
                siteId: {
                  name: "siteId",
                  type: "string",
                  optional: true,
                  description:
                    "<code>sideId</code> that belongs to actual component"
                },
                layer: {
                  name: "layer",
                  type: "string",
                  optional: true,
                  description:
                    "Layer up to which changes shall be read (excluding the specified layer)"
                },
                appVersion: {
                  name: "appVersion",
                  type: "string",
                  optional: true,
                  description:
                    "Version of application whose changes shall be read"
                },
                flexModulesUrl: {
                  name: "flexModulesUrl",
                  type: "string",
                  optional: true,
                  description:
                    "address to which the request for modules should be sent in case modules are present"
                }
              },
              description: "Contains additional data needed for reading changes"
            }
          ],
          description: "Loads the changes for the given component class name.",
          references: ["sap.ui.core.Component"]
        },
        {
          name: "loadSettings",
          visibility: "public",
          returnValue: {
            type: "Promise",
            description:
              "Returns a Promise with the flexibility settings content"
          },
          description: "Loads flexibility settings."
        },
        {
          name: "send",
          visibility: "public",
          returnValue: {
            type: "Promise",
            description: "Returns a promise to the result of the request"
          },
          parameters: [
            {
              name: "sUri",
              type: "String",
              optional: false,
              description: "Relative URL for this request"
            },
            {
              name: "sMethod",
              type: "String",
              optional: true,
              description:
                "HTTP-method to be used by this request (default GET)"
            },
            {
              name: "oData",
              type: "Object",
              optional: true,
              description: "Payload of the request"
            },
            {
              name: "mOptions",
              type: "Object",
              optional: true,
              description:
                "Additional options which should be used in the request"
            }
          ],
          description: "Send a request to the back end"
        },
        {
          name: "setRequestUrlPrefix",
          visibility: "restricted",
          parameters: [
            {
              name: "sRequestUrlPrefix",
              type: "String",
              optional: false,
              description:
                "request URL prefix which must start with a (/) and must not end with a (/)"
            }
          ],
          description:
            "Prefix for request URL can be set in exceptional cases when consumer needs to add a prefix to the URL"
        },
        {
          name: "update",
          visibility: "public",
          returnValue: {
            type: "Object",
            description: "Returns the result from the request"
          },
          parameters: [
            {
              name: "oPayload",
              type: "Object",
              optional: false,
              description: "The content which is send to the server"
            },
            {
              name: "sChangeName",
              type: "String",
              optional: false,
              description: "Name of the change"
            },
            {
              name: "sChangelist",
              type: "String",
              optional: false,
              description: "(optional) The transport ID."
            },
            {
              name: "bIsVariant",
              type: "Boolean",
              optional: false,
              description: "is variant?"
            }
          ],
          description: "Update a change or variant via REST call."
        },
        {
          name: "upsert",
          visibility: "public",
          returnValue: {
            type: "Object",
            description: "Returns the result from the request"
          },
          parameters: [
            {
              name: "sNamespace",
              type: "String",
              optional: false,
              description:
                "The abap package goes here. It is needed to identify the change."
            },
            {
              name: "sName",
              type: "String",
              optional: false,
              description: "Name of the change"
            },
            {
              name: "sType",
              type: "String",
              optional: false,
              description: "File type extension"
            },
            {
              name: "sLayer",
              type: "String",
              optional: false,
              description: "File layer"
            },
            {
              name: "sContent",
              type: "String",
              optional: false,
              description: "File content to be saved as string"
            },
            {
              name: "sContentType",
              type: "String",
              optional: false,
              description:
                "Content type (e.g. application/json, text/plain, ...), default: application/json"
            },
            {
              name: "sChangelist",
              type: "String",
              optional: false,
              description: "The transport ID, optional"
            }
          ],
          description: "Upserts a given change or variant via REST call."
        }
      ]
    },
    {
      kind: "class",
      name: "sap.ui.fl.transport.TransportDialog",
      basename: "TransportDialog",
      resource: "sap/ui/fl/transport/TransportDialog.js",
      module: "sap/ui/fl/transport/TransportDialog",
      export: "",
      static: true,
      visibility: "public",
      extends: "sap.m.Dialog",
      description:
        "The Transport Dialog Control can be used to implement a value help for selecting an ABAP package and transport request. It is not a generic utility, but part of the Variantmanament and therefore cannot be used in any other application.",
      "ui5-metamodel": true,
      "ui5-metadata": {
        stereotype: "control",
        properties: [
          {
            name: "pkg",
            type: "string",
            defaultValue: null,
            group: "Misc",
            visibility: "public",
            description:
              "An ABAP package that can be used as default for the ABAP package selection.",
            methods: ["getPkg", "setPkg"]
          },
          {
            name: "transports",
            type: "any",
            defaultValue: null,
            group: "Misc",
            visibility: "public",
            description:
              "The set of ABAP transport requests that can be selected by a user.",
            methods: ["getTransports", "setTransports"]
          },
          {
            name: "lrepObject",
            type: "any",
            defaultValue: null,
            group: "Misc",
            visibility: "public",
            description:
              "The LREP object for which as transport request has to be selected",
            methods: ["getLrepObject", "setLrepObject"]
          },
          {
            name: "hidePackage",
            type: "boolean",
            defaultValue: null,
            group: "Misc",
            visibility: "public",
            description:
              "Flag indicating whether the selection of an ABAP package is to be hidden or not.",
            methods: ["getHidePackage", "setHidePackage"]
          }
        ],
        events: [
          {
            name: "ok",
            visibility: "public",
            description:
              "This event will be fired when the user clicks the OK button on the dialog.",
            methods: ["attachOk", "detachOk", "fireOk"]
          },
          {
            name: "cancel",
            visibility: "public",
            description:
              "This event will be fired when the user clicks the Cancel button on the dialog or Escape button on the keyboard.",
            methods: ["attachCancel", "detachCancel", "fireCancel"]
          }
        ]
      },
      constructor: {
        visibility: "public",
        parameters: [
          {
            name: "sId",
            type: "string",
            optional: true,
            description:
              "id for the new control, generated automatically if no id is given"
          },
          {
            name: "mSettings",
            type: "object",
            optional: true,
            description: "initial settings for the new control"
          }
        ],
        description:
          "Constructor for a new transport/TransportDialog.\n\nAccepts an object literal <code>mSettings</code> that defines initial property values, aggregated and associated objects as well as event handlers. See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object."
      },
      events: [
        {
          name: "cancel",
          visibility: "public",
          parameters: [
            {
              name: "oControlEvent",
              type: "sap.ui.base.Event",
              parameterProperties: {
                getSource: {
                  name: "getSource",
                  type: "sap.ui.base.EventProvider",
                  optional: false
                },
                getParameters: {
                  name: "getParameters",
                  type: "object",
                  optional: false
                }
              }
            }
          ],
          description:
            "This event will be fired when the user clicks the Cancel button on the dialog or Escape button on the keyboard."
        },
        {
          name: "ok",
          visibility: "public",
          parameters: [
            {
              name: "oControlEvent",
              type: "sap.ui.base.Event",
              parameterProperties: {
                getSource: {
                  name: "getSource",
                  type: "sap.ui.base.EventProvider",
                  optional: false
                },
                getParameters: {
                  name: "getParameters",
                  type: "object",
                  optional: false
                }
              }
            }
          ],
          description:
            "This event will be fired when the user clicks the OK button on the dialog."
        }
      ],
      methods: [
        {
          name: "attachCancel",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.transport.TransportDialog",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "oData",
              type: "object",
              optional: true,
              description:
                "An application-specific payload object that will be passed to the event handler along with the event object when firing the event"
            },
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object to call the event handler with. Defaults to this <code>sap.ui.fl.transport.TransportDialog</code> itself"
            }
          ],
          description:
            "Attaches event handler <code>fnFunction</code> to the {@link #event:cancel cancel} event of this <code>sap.ui.fl.transport.TransportDialog</code>.\n\nWhen called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, otherwise it will be bound to this <code>sap.ui.fl.transport.TransportDialog</code> itself.\n\nThis event will be fired when the user clicks the Cancel button on the dialog or Escape button on the keyboard."
        },
        {
          name: "attachOk",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.transport.TransportDialog",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "oData",
              type: "object",
              optional: true,
              description:
                "An application-specific payload object that will be passed to the event handler along with the event object when firing the event"
            },
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object to call the event handler with. Defaults to this <code>sap.ui.fl.transport.TransportDialog</code> itself"
            }
          ],
          description:
            "Attaches event handler <code>fnFunction</code> to the {@link #event:ok ok} event of this <code>sap.ui.fl.transport.TransportDialog</code>.\n\nWhen called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, otherwise it will be bound to this <code>sap.ui.fl.transport.TransportDialog</code> itself.\n\nThis event will be fired when the user clicks the OK button on the dialog."
        },
        {
          name: "detachCancel",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.transport.TransportDialog",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called, when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object on which the given function had to be called"
            }
          ],
          description:
            "Detaches event handler <code>fnFunction</code> from the {@link #event:cancel cancel} event of this <code>sap.ui.fl.transport.TransportDialog</code>.\n\nThe passed function and listener object must match the ones used for event registration."
        },
        {
          name: "detachOk",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.transport.TransportDialog",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called, when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object on which the given function had to be called"
            }
          ],
          description:
            "Detaches event handler <code>fnFunction</code> from the {@link #event:ok ok} event of this <code>sap.ui.fl.transport.TransportDialog</code>.\n\nThe passed function and listener object must match the ones used for event registration."
        },
        {
          name: "extend",
          visibility: "public",
          static: true,
          returnValue: {
            type: "function",
            description: "Created class / constructor function"
          },
          parameters: [
            {
              name: "sClassName",
              type: "string",
              optional: false,
              description: "Name of the class being created"
            },
            {
              name: "oClassInfo",
              type: "object",
              optional: true,
              description: "Object literal with information about the class"
            },
            {
              name: "FNMetaImpl",
              type: "function",
              optional: true,
              description:
                "Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>"
            }
          ],
          description:
            "Creates a new subclass of class sap.ui.fl.transport.TransportDialog with name <code>sClassName</code> and enriches it with the information contained in <code>oClassInfo</code>.\n\n<code>oClassInfo</code> might contain the same kind of information as described in {@link sap.m.Dialog.extend}."
        },
        {
          name: "fireCancel",
          visibility: "protected",
          returnValue: {
            type: "sap.ui.fl.transport.TransportDialog",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: true,
              description: "Parameters to pass along with the event"
            }
          ],
          description:
            "Fires event {@link #event:cancel cancel} to attached listeners."
        },
        {
          name: "fireOk",
          visibility: "protected",
          returnValue: {
            type: "sap.ui.fl.transport.TransportDialog",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: true,
              description: "Parameters to pass along with the event"
            }
          ],
          description: "Fires event {@link #event:ok ok} to attached listeners."
        },
        {
          name: "getHidePackage",
          visibility: "public",
          returnValue: {
            type: "boolean",
            description: "Value of property <code>hidePackage</code>"
          },
          description:
            "Gets current value of property {@link #getHidePackage hidePackage}.\n\nFlag indicating whether the selection of an ABAP package is to be hidden or not."
        },
        {
          name: "getLrepObject",
          visibility: "public",
          returnValue: {
            type: "any",
            description: "Value of property <code>lrepObject</code>"
          },
          description:
            "Gets current value of property {@link #getLrepObject lrepObject}.\n\nThe LREP object for which as transport request has to be selected"
        },
        {
          name: "getMetadata",
          visibility: "public",
          static: true,
          returnValue: {
            type: "sap.ui.base.Metadata",
            description: "Metadata object describing this class"
          },
          description:
            "Returns a metadata object for class sap.ui.fl.transport.TransportDialog."
        },
        {
          name: "getPkg",
          visibility: "public",
          returnValue: {
            type: "string",
            description: "Value of property <code>pkg</code>"
          },
          description:
            "Gets current value of property {@link #getPkg pkg}.\n\nAn ABAP package that can be used as default for the ABAP package selection."
        },
        {
          name: "getTransports",
          visibility: "public",
          returnValue: {
            type: "any",
            description: "Value of property <code>transports</code>"
          },
          description:
            "Gets current value of property {@link #getTransports transports}.\n\nThe set of ABAP transport requests that can be selected by a user."
        },
        {
          name: "setHidePackage",
          visibility: "public",
          parameters: [
            {
              name: "bHide",
              type: "boolean",
              optional: false,
              description:
                "if set to <code>true</code>, the package selection is hidden."
            }
          ],
          description:
            "Flag indicating whether the selection of an ABAP package is to be hidden or not."
        },
        {
          name: "setLrepObject",
          visibility: "public",
          parameters: [
            {
              name: "oObject",
              type: "object",
              optional: false,
              description:
                "an LREP object for which as transport request has to be selected. The object has the attributes name, namespace and type."
            }
          ],
          description:
            "The LREP object for which as transport request has to be selected. The property can only be set once and afterwards it cannot be changed."
        },
        {
          name: "setPkg",
          visibility: "public",
          parameters: [
            {
              name: "sPackage",
              type: "string",
              optional: false,
              description:
                "an ABAP package that can be used as default for the ABAP package selection."
            }
          ],
          description:
            "An ABAP package that can be used as default for the ABAP package selection. The property can only be set once and afterwards it cannot be changed."
        },
        {
          name: "setTransports",
          visibility: "public",
          parameters: [
            {
              name: "aSelection",
              type: "array",
              optional: false,
              description:
                "the set of ABAP transport requests that can be selected by a user."
            }
          ],
          description:
            "The set of ABAP transport requests that can be selected by a user."
        }
      ]
    },
    {
      kind: "class",
      name: "sap.ui.fl.transport.TransportSelection",
      basename: "TransportSelection",
      resource: "sap/ui/fl/transport/TransportSelection.js",
      module: "sap/ui/fl/transport/TransportSelection",
      export: "",
      static: true,
      visibility: "public",
      since: "1.38.0",
      constructor: {
        visibility: "public",
        parameters: [
          {
            name: "Utils",
            type: "sap.ui.fl.Utils",
            optional: false,
            description:
              "a reference to the flexibility utilities implementation."
          },
          {
            name: "Transports",
            type: "sap.ui.fl.transport.Transports",
            optional: false,
            description: "a reference to the transport service implementation."
          },
          {
            name: "TransportDialog",
            type: "sap.ui.fl.transport.TransportDialog",
            optional: false,
            description: "a reference to the transport dialog implementation."
          },
          {
            name: "FlexSettings",
            type: "sap.ui.fl.registry.Settings",
            optional: false,
            description: "a reference to the settings implementation"
          }
        ]
      },
      methods: [
        {
          name: "_prepareChangesForTransport",
          visibility: "public",
          returnValue: {
            type: "Promise",
            description: "Returns a Promise which resolves without parameters"
          },
          parameters: [
            {
              name: "oTransportInfo",
              type: "Object",
              optional: false,
              parameterProperties: {
                packageName: {
                  name: "packageName",
                  type: "string",
                  optional: false,
                  description: "name of the package"
                },
                transport: {
                  name: "transport",
                  type: "string",
                  optional: false,
                  description: "ID of the transport"
                }
              },
              description:
                "object containing the package name and the transport"
            },
            {
              name: "aAllLocalChanges",
              type: "Array",
              optional: false,
              description: "array that includes all local changes"
            }
          ],
          description:
            "Prepare all changes and assign them to an existing transport."
        },
        {
          name: "checkTransportInfo",
          visibility: "public",
          returnValue: {
            type: "boolean",
            description: "returns true if transport info is complete"
          },
          parameters: [
            {
              name: "oTransportInfo",
              type: "Object",
              optional: true,
              description: "transport info object"
            }
          ],
          description: "Checks transport info object"
        },
        {
          name: "openTransportSelection",
          visibility: "public",
          returnValue: {
            type: "Promise",
            description: "promise that resolves"
          },
          parameters: [
            {
              name: "oChange",
              type: "sap.ui.fl.Change",
              optional: true,
              description:
                "the change for which the transport information should be retrieved"
            },
            { name: "oControl", type: "object", optional: false }
          ],
          description: "Opens the transport selection dialog"
        },
        {
          name: "selectTransport",
          visibility: "public",
          parameters: [
            {
              name: "oObjectInfo",
              type: "object",
              optional: false,
              description:
                "the LREP object, which has the attributes name, name space, type, layer and package."
            },
            {
              name: "fOkay",
              type: "function",
              optional: false,
              description:
                "call-back to be invoked when a transport request has successfully been selected."
            },
            {
              name: "fError",
              type: "function",
              optional: false,
              description:
                "call-back to be invoked when an error occurred during selection of a transport request."
            },
            {
              name: "bCompactMode",
              type: "boolean",
              optional: false,
              description:
                "flag indicating whether the transport dialog should be opened in compact mode."
            },
            {
              name: "oControl",
              type: "object",
              optional: false,
              description: "Control instance"
            }
          ],
          description:
            "Selects a transport request for a given LREP object. First checks if the Adaptation Transport Organizer (ATO) is enabled If ATO is enabled and the layered repository object is in the CUSTOMER layer, the request 'ATO_NOTIFICATION' has to be used. This request triggers in the back end that the change is added to an ATO collection. If ATO is not enabled or LREP object not in CUSTOMER layer: If the LREP object is already assigned to an open transport request or the LREP object is assigned to a local ABAP package, no dialog to select a transport is started. Instead the success callback is invoked directly. The transport dialog is shown if a package or a transport request has still to be selected, so if more than one transport request is available for the current user and the LREP object is not locked in an open transport request."
        },
        {
          name: "setTransports",
          visibility: "public",
          returnValue: {
            type: "Promise",
            description: "promise that resolves without parameters"
          },
          parameters: [
            {
              name: "aChanges",
              type: "array",
              optional: false,
              description: "array of {sap.ui.fl.Change}"
            },
            {
              name: "oControl",
              type: "object",
              optional: false,
              description: "object of the root control for the transport"
            }
          ],
          description: "Sets the transports for all changes."
        }
      ]
    },
    {
      kind: "typedef",
      name: "sap.ui.fl.variants.SwitchChanges",
      basename: "SwitchChanges",
      resource: "sap/ui/fl/variants/VariantController.js",
      module: "sap/ui/fl/variants/VariantController",
      static: true,
      visibility: "public",
      description:
        "Returns the map with all changes to be reverted and applied when switching variants",
      properties: [
        {
          name: "aRevert",
          type: "array",
          visibility: "public",
          description: "an array of changes to be reverted"
        },
        {
          name: "aNew",
          type: "array",
          visibility: "public",
          description: "an array of changes to be applied"
        },
        {
          name: "component",
          type: "sap.ui.core.Component",
          visibility: "public",
          description: "the component responsible"
        }
      ]
    },
    {
      kind: "class",
      name: "sap.ui.fl.variants.VariantManagement",
      basename: "VariantManagement",
      resource: "sap/ui/fl/variants/VariantManagement.js",
      module: "sap/ui/fl/variants/VariantManagement",
      export: "",
      static: true,
      visibility: "public",
      since: "1.56",
      extends: "sap.ui.core.Control",
      description:
        "The <code>VariantManagement</code> control can be used to manage variants.\n\n<h3>Usage</h3>\n\nYou can use this control in most controls that are enabled for <i>UI adaptation at runtime</i>.",
      "ui5-metamodel": true,
      "ui5-metadata": {
        stereotype: "control",
        properties: [
          {
            name: "showExecuteOnSelection",
            type: "boolean",
            defaultValue: false,
            group: "Misc",
            visibility: "public",
            description:
              "Indicates that Execute on Selection is visible in the Save Variant and the Manage Variants dialogs.",
            methods: ["getShowExecuteOnSelection", "setShowExecuteOnSelection"]
          },
          {
            name: "showSetAsDefault",
            type: "boolean",
            defaultValue: true,
            group: "Misc",
            visibility: "public",
            description:
              "Indicates that set as default is visible in the Save Variant and the Manage Variants dialogs.",
            methods: ["getShowSetAsDefault", "setShowSetAsDefault"]
          },
          {
            name: "manualVariantKey",
            type: "boolean",
            defaultValue: false,
            group: "Misc",
            visibility: "public",
            description:
              "If set to<code>true</code>, the key for a vendor variant will be added manually.<br> <b>Node:</b>This flag is only used internally in the app variant scenarios.",
            methods: ["getManualVariantKey", "setManualVariantKey"]
          },
          {
            name: "inErrorState",
            type: "boolean",
            defaultValue: false,
            group: "Misc",
            visibility: "public",
            description:
              "Indicates that the control is in error state. If set to <code>true</code> error message will be displayed whenever the variant is opened.",
            methods: ["getInErrorState", "setInErrorState"]
          },
          {
            name: "editable",
            type: "boolean",
            defaultValue: true,
            group: "Misc",
            visibility: "public",
            description:
              "Indicates that the control is in edit state. If set to <code>false</code> the footer of the views list will be hidden.",
            methods: ["getEditable", "setEditable"]
          },
          {
            name: "modelName",
            type: "string",
            defaultValue: null,
            group: "Misc",
            visibility: "public",
            description:
              "Determines the name of the model. The binding context will be defined by the current ID. <p> <b>Note:</b> In a UI adaptation scenario, this property is not used at all because the model name is <i>$FlexVariants</i>",
            methods: ["getModelName", "setModelName"]
          },
          {
            name: "updateVariantInURL",
            type: "boolean",
            defaultValue: false,
            group: "Misc",
            visibility: "public",
            description:
              "Determines the intention of setting the current variant based on passed information. <p> <b>Note:</b> The VariantManagement control does not react in any way to this property.",
            methods: ["getUpdateVariantInURL", "setUpdateVariantInURL"]
          }
        ],
        associations: [
          {
            name: "for",
            singularName: "for",
            type: "sap.ui.core.Control",
            cardinality: "0..n",
            visibility: "public",
            description:
              "Contains the controls, for which the variant management is responsible.",
            methods: ["getFor", "addFor", "removeFor", "removeAllFor"]
          }
        ],
        events: [
          {
            name: "save",
            visibility: "public",
            description:
              "This event is fired when the Save Variant dialog is closed with OK for a variant.",
            parameters: {
              name: {
                name: "name",
                type: "string",
                description: "The variant title"
              },
              overwrite: {
                name: "overwrite",
                type: "boolean",
                description:
                  "Indicates if an existing variant is overwritten or if a new variant is created"
              },
              key: {
                name: "key",
                type: "string",
                description: "The variant key"
              },
              execute: {
                name: "execute",
                type: "boolean",
                description: "The Execute on Selection indicator"
              },
              def: {
                name: "def",
                type: "boolean",
                description: "The default variant indicator"
              }
            },
            methods: ["attachSave", "detachSave", "fireSave"]
          },
          {
            name: "manage",
            visibility: "public",
            description:
              "This event is fired when users apply changes to variants in the Manage Variants dialog.",
            methods: ["attachManage", "detachManage", "fireManage"]
          },
          {
            name: "initialized",
            visibility: "public",
            description:
              "This event is fired when the model and context are set.",
            methods: [
              "attachInitialized",
              "detachInitialized",
              "fireInitialized"
            ]
          },
          {
            name: "select",
            visibility: "public",
            description: "This event is fired when a new variant is selected.",
            parameters: {
              key: {
                name: "key",
                type: "string",
                description: "The variant key"
              }
            },
            methods: ["attachSelect", "detachSelect", "fireSelect"]
          }
        ],
        designtime: "sap/ui/fl/designtime/variants/VariantManagement.designtime"
      },
      constructor: {
        visibility: "public",
        parameters: [
          {
            name: "sId",
            type: "string",
            optional: true,
            description:
              "ID for the new control, generated automatically if no ID is given"
          },
          {
            name: "mSettings",
            type: "object",
            optional: true,
            description: "Initial settings for the new control"
          }
        ],
        description:
          "Constructor for a new VariantManagement.\n\nAccepts an object literal <code>mSettings</code> that defines initial property values, aggregated and associated objects as well as event handlers. See {@link sap.ui.base.ManagedObject#constructor} for a general description of the syntax of the settings object.",
        references: [
          "{@link topic:f1430c0337534d469da3a56307ff76af UI Adaptation at Runtime: Enable Your App}"
        ]
      },
      events: [
        {
          name: "initialized",
          visibility: "public",
          parameters: [
            {
              name: "oControlEvent",
              type: "sap.ui.base.Event",
              parameterProperties: {
                getSource: {
                  name: "getSource",
                  type: "sap.ui.base.EventProvider",
                  optional: false
                },
                getParameters: {
                  name: "getParameters",
                  type: "object",
                  optional: false
                }
              }
            }
          ],
          description: "This event is fired when the model and context are set."
        },
        {
          name: "manage",
          visibility: "public",
          parameters: [
            {
              name: "oControlEvent",
              type: "sap.ui.base.Event",
              parameterProperties: {
                getSource: {
                  name: "getSource",
                  type: "sap.ui.base.EventProvider",
                  optional: false
                },
                getParameters: {
                  name: "getParameters",
                  type: "object",
                  optional: false
                }
              }
            }
          ],
          description:
            "This event is fired when users apply changes to variants in the Manage Variants dialog."
        },
        {
          name: "save",
          visibility: "public",
          parameters: [
            {
              name: "oControlEvent",
              type: "sap.ui.base.Event",
              parameterProperties: {
                getSource: {
                  name: "getSource",
                  type: "sap.ui.base.EventProvider",
                  optional: false
                },
                getParameters: {
                  name: "getParameters",
                  type: "object",
                  optional: false,
                  parameterProperties: {
                    name: {
                      name: "name",
                      type: "string",
                      optional: false,
                      description: "The variant title"
                    },
                    overwrite: {
                      name: "overwrite",
                      type: "boolean",
                      optional: false,
                      description:
                        "Indicates if an existing variant is overwritten or if a new variant is created"
                    },
                    key: {
                      name: "key",
                      type: "string",
                      optional: false,
                      description: "The variant key"
                    },
                    execute: {
                      name: "execute",
                      type: "boolean",
                      optional: false,
                      description: "The Execute on Selection indicator"
                    },
                    def: {
                      name: "def",
                      type: "boolean",
                      optional: false,
                      description: "The default variant indicator"
                    }
                  }
                }
              }
            }
          ],
          description:
            "This event is fired when the Save Variant dialog is closed with OK for a variant."
        },
        {
          name: "select",
          visibility: "public",
          parameters: [
            {
              name: "oControlEvent",
              type: "sap.ui.base.Event",
              parameterProperties: {
                getSource: {
                  name: "getSource",
                  type: "sap.ui.base.EventProvider",
                  optional: false
                },
                getParameters: {
                  name: "getParameters",
                  type: "object",
                  optional: false,
                  parameterProperties: {
                    key: {
                      name: "key",
                      type: "string",
                      optional: false,
                      description: "The variant key"
                    }
                  }
                }
              }
            }
          ],
          description: "This event is fired when a new variant is selected."
        }
      ],
      methods: [
        {
          name: "addFor",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "vFor",
              type: "sap.ui.core.ID|sap.ui.core.Control",
              optional: false,
              description: "The for to add; if empty, nothing is inserted"
            }
          ],
          description: "Adds some for into the association {@link #getFor for}."
        },
        {
          name: "attachInitialized",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "oData",
              type: "object",
              optional: true,
              description:
                "An application-specific payload object that will be passed to the event handler along with the event object when firing the event"
            },
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object to call the event handler with. Defaults to this <code>sap.ui.fl.variants.VariantManagement</code> itself"
            }
          ],
          description:
            "Attaches event handler <code>fnFunction</code> to the {@link #event:initialized initialized} event of this <code>sap.ui.fl.variants.VariantManagement</code>.\n\nWhen called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, otherwise it will be bound to this <code>sap.ui.fl.variants.VariantManagement</code> itself.\n\nThis event is fired when the model and context are set."
        },
        {
          name: "attachManage",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "oData",
              type: "object",
              optional: true,
              description:
                "An application-specific payload object that will be passed to the event handler along with the event object when firing the event"
            },
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object to call the event handler with. Defaults to this <code>sap.ui.fl.variants.VariantManagement</code> itself"
            }
          ],
          description:
            "Attaches event handler <code>fnFunction</code> to the {@link #event:manage manage} event of this <code>sap.ui.fl.variants.VariantManagement</code>.\n\nWhen called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, otherwise it will be bound to this <code>sap.ui.fl.variants.VariantManagement</code> itself.\n\nThis event is fired when users apply changes to variants in the Manage Variants dialog."
        },
        {
          name: "attachSave",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "oData",
              type: "object",
              optional: true,
              description:
                "An application-specific payload object that will be passed to the event handler along with the event object when firing the event"
            },
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object to call the event handler with. Defaults to this <code>sap.ui.fl.variants.VariantManagement</code> itself"
            }
          ],
          description:
            "Attaches event handler <code>fnFunction</code> to the {@link #event:save save} event of this <code>sap.ui.fl.variants.VariantManagement</code>.\n\nWhen called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, otherwise it will be bound to this <code>sap.ui.fl.variants.VariantManagement</code> itself.\n\nThis event is fired when the Save Variant dialog is closed with OK for a variant."
        },
        {
          name: "attachSelect",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "oData",
              type: "object",
              optional: true,
              description:
                "An application-specific payload object that will be passed to the event handler along with the event object when firing the event"
            },
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object to call the event handler with. Defaults to this <code>sap.ui.fl.variants.VariantManagement</code> itself"
            }
          ],
          description:
            "Attaches event handler <code>fnFunction</code> to the {@link #event:select select} event of this <code>sap.ui.fl.variants.VariantManagement</code>.\n\nWhen called, the context of the event handler (its <code>this</code>) will be bound to <code>oListener</code> if specified, otherwise it will be bound to this <code>sap.ui.fl.variants.VariantManagement</code> itself.\n\nThis event is fired when a new variant is selected."
        },
        {
          name: "detachInitialized",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called, when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object on which the given function had to be called"
            }
          ],
          description:
            "Detaches event handler <code>fnFunction</code> from the {@link #event:initialized initialized} event of this <code>sap.ui.fl.variants.VariantManagement</code>.\n\nThe passed function and listener object must match the ones used for event registration."
        },
        {
          name: "detachManage",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called, when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object on which the given function had to be called"
            }
          ],
          description:
            "Detaches event handler <code>fnFunction</code> from the {@link #event:manage manage} event of this <code>sap.ui.fl.variants.VariantManagement</code>.\n\nThe passed function and listener object must match the ones used for event registration."
        },
        {
          name: "detachSave",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called, when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object on which the given function had to be called"
            }
          ],
          description:
            "Detaches event handler <code>fnFunction</code> from the {@link #event:save save} event of this <code>sap.ui.fl.variants.VariantManagement</code>.\n\nThe passed function and listener object must match the ones used for event registration."
        },
        {
          name: "detachSelect",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "fnFunction",
              type: "function",
              optional: false,
              description: "The function to be called, when the event occurs"
            },
            {
              name: "oListener",
              type: "object",
              optional: true,
              description:
                "Context object on which the given function had to be called"
            }
          ],
          description:
            "Detaches event handler <code>fnFunction</code> from the {@link #event:select select} event of this <code>sap.ui.fl.variants.VariantManagement</code>.\n\nThe passed function and listener object must match the ones used for event registration."
        },
        {
          name: "extend",
          visibility: "public",
          static: true,
          returnValue: {
            type: "function",
            description: "Created class / constructor function"
          },
          parameters: [
            {
              name: "sClassName",
              type: "string",
              optional: false,
              description: "Name of the class being created"
            },
            {
              name: "oClassInfo",
              type: "object",
              optional: true,
              description: "Object literal with information about the class"
            },
            {
              name: "FNMetaImpl",
              type: "function",
              optional: true,
              description:
                "Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>"
            }
          ],
          description:
            "Creates a new subclass of class sap.ui.fl.variants.VariantManagement with name <code>sClassName</code> and enriches it with the information contained in <code>oClassInfo</code>.\n\n<code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.core.Control.extend}."
        },
        {
          name: "fireInitialized",
          visibility: "protected",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: true,
              description: "Parameters to pass along with the event"
            }
          ],
          description:
            "Fires event {@link #event:initialized initialized} to attached listeners."
        },
        {
          name: "fireManage",
          visibility: "protected",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: true,
              description: "Parameters to pass along with the event"
            }
          ],
          description:
            "Fires event {@link #event:manage manage} to attached listeners."
        },
        {
          name: "fireSave",
          visibility: "protected",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: true,
              parameterProperties: {
                name: {
                  name: "name",
                  type: "string",
                  optional: true,
                  description: "The variant title"
                },
                overwrite: {
                  name: "overwrite",
                  type: "boolean",
                  optional: true,
                  description:
                    "Indicates if an existing variant is overwritten or if a new variant is created"
                },
                key: {
                  name: "key",
                  type: "string",
                  optional: true,
                  description: "The variant key"
                },
                execute: {
                  name: "execute",
                  type: "boolean",
                  optional: true,
                  description: "The Execute on Selection indicator"
                },
                def: {
                  name: "def",
                  type: "boolean",
                  optional: true,
                  description: "The default variant indicator"
                }
              },
              description: "Parameters to pass along with the event"
            }
          ],
          description:
            "Fires event {@link #event:save save} to attached listeners."
        },
        {
          name: "fireSelect",
          visibility: "protected",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "mParameters",
              type: "object",
              optional: true,
              parameterProperties: {
                key: {
                  name: "key",
                  type: "string",
                  optional: true,
                  description: "The variant key"
                }
              },
              description: "Parameters to pass along with the event"
            }
          ],
          description:
            "Fires event {@link #event:select select} to attached listeners."
        },
        {
          name: "getCurrentVariantKey",
          visibility: "public",
          returnValue: {
            type: "String",
            description:
              "The currently selected variant key. In case the model is yet not set <code>null</code> will be returned."
          },
          description: "Gets the currently selected variant key."
        },
        {
          name: "getEditable",
          visibility: "public",
          returnValue: {
            type: "boolean",
            description: "Value of property <code>editable</code>"
          },
          description:
            "Gets current value of property {@link #getEditable editable}.\n\nIndicates that the control is in edit state. If set to <code>false</code> the footer of the views list will be hidden.\n\nDefault value is <code>true</code>."
        },
        {
          name: "getFor",
          visibility: "public",
          returnValue: { type: "sap.ui.core.ID[]" },
          description:
            "Returns array of IDs of the elements which are the current targets of the association {@link #getFor for}."
        },
        {
          name: "getInErrorState",
          visibility: "public",
          returnValue: {
            type: "boolean",
            description: "Value of property <code>inErrorState</code>"
          },
          description:
            "Gets current value of property {@link #getInErrorState inErrorState}.\n\nIndicates that the control is in error state. If set to <code>true</code> error message will be displayed whenever the variant is opened.\n\nDefault value is <code>false</code>."
        },
        {
          name: "getManualVariantKey",
          visibility: "public",
          returnValue: {
            type: "boolean",
            description: "Value of property <code>manualVariantKey</code>"
          },
          description:
            "Gets current value of property {@link #getManualVariantKey manualVariantKey}.\n\nIf set to<code>true</code>, the key for a vendor variant will be added manually.<br> <b>Node:</b>This flag is only used internally in the app variant scenarios.\n\nDefault value is <code>false</code>."
        },
        {
          name: "getMetadata",
          visibility: "public",
          static: true,
          returnValue: {
            type: "sap.ui.base.Metadata",
            description: "Metadata object describing this class"
          },
          description:
            "Returns a metadata object for class sap.ui.fl.variants.VariantManagement."
        },
        {
          name: "getModelName",
          visibility: "public",
          returnValue: {
            type: "string",
            description: "Value of property <code>modelName</code>"
          },
          description:
            "Gets current value of property {@link #getModelName modelName}.\n\nDetermines the name of the model. The binding context will be defined by the current ID. <p> <b>Note:</b> In a UI adaptation scenario, this property is not used at all because the model name is <i>$FlexVariants</i>"
        },
        {
          name: "getShowExecuteOnSelection",
          visibility: "public",
          returnValue: {
            type: "boolean",
            description: "Value of property <code>showExecuteOnSelection</code>"
          },
          description:
            "Gets current value of property {@link #getShowExecuteOnSelection showExecuteOnSelection}.\n\nIndicates that Execute on Selection is visible in the Save Variant and the Manage Variants dialogs.\n\nDefault value is <code>false</code>."
        },
        {
          name: "getShowSetAsDefault",
          visibility: "public",
          returnValue: {
            type: "boolean",
            description: "Value of property <code>showSetAsDefault</code>"
          },
          description:
            "Gets current value of property {@link #getShowSetAsDefault showSetAsDefault}.\n\nIndicates that set as default is visible in the Save Variant and the Manage Variants dialogs.\n\nDefault value is <code>true</code>."
        },
        {
          name: "getTitle",
          visibility: "protected",
          returnValue: {
            type: "sap.m.Title",
            description: "title part of the VariantManagement control."
          },
          description:
            "Returns the title control of the VariantManagement. Usage in RTA scenario."
        },
        {
          name: "getUpdateVariantInURL",
          visibility: "public",
          returnValue: {
            type: "boolean",
            description: "Value of property <code>updateVariantInURL</code>"
          },
          description:
            "Gets current value of property {@link #getUpdateVariantInURL updateVariantInURL}.\n\nDetermines the intention of setting the current variant based on passed information. <p> <b>Note:</b> The VariantManagement control does not react in any way to this property.\n\nDefault value is <code>false</code>."
        },
        {
          name: "getVariants",
          visibility: "public",
          returnValue: {
            type: "array",
            description:
              "with all variants. In case the model is yet not set an empty array will be returned."
          },
          description: "Retrieves all variants."
        },
        {
          name: "openManagementDialog",
          visibility: "public",
          parameters: [
            {
              name: "bCreateAlways",
              type: "boolean",
              optional: false,
              description:
                "in case this is set to <code>true</code> the former dialog will be destroyed, before a new one is created."
            }
          ],
          description: "Opens the manage dialog."
        },
        {
          name: "removeAllFor",
          visibility: "public",
          returnValue: {
            type: "sap.ui.core.ID[]",
            description: "An array of the removed elements (might be empty)"
          },
          description:
            "Removes all the controls in the association named {@link #getFor for}."
        },
        {
          name: "removeFor",
          visibility: "public",
          returnValue: {
            type: "sap.ui.core.ID",
            description: "The removed for or <code>null</code>"
          },
          parameters: [
            {
              name: "vFor",
              type: "int|sap.ui.core.ID|sap.ui.core.Control",
              optional: false,
              description: "The for to be removed or its index or ID"
            }
          ],
          description:
            "Removes an for from the association named {@link #getFor for}."
        },
        {
          name: "setCurrentVariantKey",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "the current instance of {@link sap.ui.fl.variants.VariantManagement}."
          },
          parameters: [
            {
              name: "sKey",
              type: "String",
              optional: false,
              description: "the variant key which should be selected."
            }
          ],
          description: "Sets the new selected variant."
        },
        {
          name: "setEditable",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "bEditable",
              type: "boolean",
              optional: false,
              description: "New value for property <code>editable</code>"
            }
          ],
          description:
            "Sets a new value for property {@link #getEditable editable}.\n\nIndicates that the control is in edit state. If set to <code>false</code> the footer of the views list will be hidden.\n\nWhen called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.\n\nDefault value is <code>true</code>."
        },
        {
          name: "setInErrorState",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "bInErrorState",
              type: "boolean",
              optional: false,
              description: "New value for property <code>inErrorState</code>"
            }
          ],
          description:
            "Sets a new value for property {@link #getInErrorState inErrorState}.\n\nIndicates that the control is in error state. If set to <code>true</code> error message will be displayed whenever the variant is opened.\n\nWhen called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.\n\nDefault value is <code>false</code>."
        },
        {
          name: "setManualVariantKey",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "bManualVariantKey",
              type: "boolean",
              optional: false,
              description:
                "New value for property <code>manualVariantKey</code>"
            }
          ],
          description:
            "Sets a new value for property {@link #getManualVariantKey manualVariantKey}.\n\nIf set to<code>true</code>, the key for a vendor variant will be added manually.<br> <b>Node:</b>This flag is only used internally in the app variant scenarios.\n\nWhen called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.\n\nDefault value is <code>false</code>."
        },
        {
          name: "setModelName",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "sModelName",
              type: "string",
              optional: false,
              description: "New value for property <code>modelName</code>"
            }
          ],
          description:
            "Sets a new value for property {@link #getModelName modelName}.\n\nDetermines the name of the model. The binding context will be defined by the current ID. <p> <b>Note:</b> In a UI adaptation scenario, this property is not used at all because the model name is <i>$FlexVariants</i>\n\nWhen called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored."
        },
        {
          name: "setShowExecuteOnSelection",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "bShowExecuteOnSelection",
              type: "boolean",
              optional: false,
              description:
                "New value for property <code>showExecuteOnSelection</code>"
            }
          ],
          description:
            "Sets a new value for property {@link #getShowExecuteOnSelection showExecuteOnSelection}.\n\nIndicates that Execute on Selection is visible in the Save Variant and the Manage Variants dialogs.\n\nWhen called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.\n\nDefault value is <code>false</code>."
        },
        {
          name: "setShowSetAsDefault",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "bShowSetAsDefault",
              type: "boolean",
              optional: false,
              description:
                "New value for property <code>showSetAsDefault</code>"
            }
          ],
          description:
            "Sets a new value for property {@link #getShowSetAsDefault showSetAsDefault}.\n\nIndicates that set as default is visible in the Save Variant and the Manage Variants dialogs.\n\nWhen called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.\n\nDefault value is <code>true</code>."
        },
        {
          name: "setUpdateVariantInURL",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.variants.VariantManagement",
            description:
              "Reference to <code>this</code> in order to allow method chaining"
          },
          parameters: [
            {
              name: "bUpdateVariantInURL",
              type: "boolean",
              optional: false,
              description:
                "New value for property <code>updateVariantInURL</code>"
            }
          ],
          description:
            "Sets a new value for property {@link #getUpdateVariantInURL updateVariantInURL}.\n\nDetermines the intention of setting the current variant based on passed information. <p> <b>Note:</b> The VariantManagement control does not react in any way to this property.\n\nWhen called with a value of <code>null</code> or <code>undefined</code>, the default value of the property will be restored.\n\nDefault value is <code>false</code>."
        }
      ]
    },
    {
      kind: "class",
      name: "sap.ui.fl.variants.VariantModel",
      basename: "VariantModel",
      resource: "sap/ui/fl/variants/VariantModel.js",
      module: "sap/ui/fl/variants/VariantModel",
      export: "",
      static: true,
      visibility: "restricted",
      since: "1.50",
      extends: "sap.ui.model.json.JSONModel",
      description: "Variant Model implementation for JSON format",
      experimental: {
        since: "1.50",
        text:
          "This class is experimental and provides only limited functionality. Also the API might be changed in future."
      },
      "ui5-metadata": { stereotype: "object" },
      constructor: {
        visibility: "restricted",
        parameters: [
          {
            name: "oData",
            type: "object",
            optional: false,
            description:
              "either the URL where to load the JSON from or a JS object"
          },
          {
            name: "oFlexController",
            type: "object",
            optional: false,
            description:
              "the FlexController instance for the component which uses the variant model"
          },
          {
            name: "oComponent",
            type: "object",
            optional: false,
            description: "Component instance that is currently loading"
          },
          {
            name: "bObserve",
            type: "boolean",
            optional: false,
            description:
              "whether to observe the JSON data for property changes (experimental)"
          }
        ],
        description:
          "Constructor for a new sap.ui.fl.variants.VariantModel model."
      },
      methods: [
        {
          name: "extend",
          visibility: "public",
          static: true,
          returnValue: {
            type: "function",
            description: "Created class / constructor function"
          },
          parameters: [
            {
              name: "sClassName",
              type: "string",
              optional: false,
              description: "Name of the class being created"
            },
            {
              name: "oClassInfo",
              type: "object",
              optional: true,
              description: "Object literal with information about the class"
            },
            {
              name: "FNMetaImpl",
              type: "function",
              optional: true,
              description:
                "Constructor function for the metadata object; if not given, it defaults to <code>sap.ui.core.ElementMetadata</code>"
            }
          ],
          description:
            "Creates a new subclass of class sap.ui.fl.variants.VariantModel with name <code>sClassName</code> and enriches it with the information contained in <code>oClassInfo</code>.\n\n<code>oClassInfo</code> might contain the same kind of information as described in {@link sap.ui.model.json.JSONModel.extend}."
        },
        {
          name: "getCurrentVariantReference",
          visibility: "public",
          returnValue: {
            type: "string",
            description: "The current variant reference"
          },
          parameters: [
            {
              name: "sVariantManagementReference",
              type: "string",
              optional: false,
              description: "The variant management reference"
            }
          ],
          description:
            "Returns the current variant for a given variant management control"
        },
        {
          name: "getMetadata",
          visibility: "public",
          static: true,
          returnValue: {
            type: "sap.ui.base.Metadata",
            description: "Metadata object describing this class"
          },
          description:
            "Returns a metadata object for class sap.ui.fl.variants.VariantModel."
        },
        {
          name: "manageVariants",
          visibility: "public",
          returnValue: {
            type: "Promise",
            description:
              'Returns a promise which resolves when "manage" event is fired from the variant management control'
          },
          parameters: [
            {
              name: "oVariantManagementControl",
              type: "sap.ui.fl.variants.VariantManagement",
              optional: false,
              description: "Variant Management control"
            },
            {
              name: "sVariantManagementReference",
              type: "String",
              optional: false,
              description: "Variant Management reference"
            },
            {
              name: "sLayer",
              type: "String",
              optional: false,
              description: "Current layer"
            }
          ],
          description:
            "Opens the manage dialog. Returns a promise which resolves to changes made from the manage dialog, based on the parameters passed."
        },
        {
          name: "setVariantProperties",
          visibility: "public",
          returnValue: {
            type: "sap.ui.fl.Change|null",
            description:
              "Returns the created change object or null if no change is created"
          },
          parameters: [
            {
              name: "sVariantManagementReference",
              type: "sap.ui.fl.variants.VariantManagement",
              optional: false,
              description: "Variant Management reference"
            },
            {
              name: "mPropertyBag",
              type: "Object",
              optional: false,
              parameterProperties: {
                variantReference: {
                  name: "variantReference",
                  type: "String",
                  optional: false,
                  description:
                    "Variant Reference for which properties should be set"
                },
                changeType: {
                  name: "changeType",
                  type: "String",
                  optional: false,
                  description:
                    "Change type due to which properties are being set"
                },
                layer: {
                  name: "layer",
                  type: "String",
                  optional: false,
                  description: "Current layer"
                },
                appComponent: {
                  name: "appComponent",
                  type: "String",
                  optional: false,
                  description: "App Component instance"
                },
                title: {
                  name: "title",
                  type: "String",
                  optional: true,
                  description: 'App New title value for "setTitle" change type'
                },
                visible: {
                  name: "visible",
                  type: "boolean",
                  optional: true,
                  description: 'New visible value for "setVisible" change type'
                },
                favorite: {
                  name: "favorite",
                  type: "boolean",
                  optional: true,
                  description:
                    'New favorite value for "setFavorite" change type'
                },
                defaultVariant: {
                  name: "defaultVariant",
                  type: "String",
                  optional: true,
                  description:
                    'New default variant for "setDefault" change type'
                },
                change: {
                  name: "change",
                  type: "sap.ui.fl.Change",
                  optional: true,
                  description: "Change to be deleted"
                }
              }
            },
            {
              name: "bAddChange",
              type: "boolean",
              optional: true,
              description: "if change needs to be added"
            }
          ],
          description:
            "Sets the passed properties on a variant for the passed variant management reference. Also adds or removes a change depending upon the parameters passed."
        }
      ]
    }
  ]
};