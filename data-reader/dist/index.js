"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = exports.iTwinDataReaderConnector = void 0;
/*global fetch*/
var service_authorization_1 = require("@itwin/service-authorization");
var dotenv_1 = require("dotenv");
var ITwinSlimClient_1 = require("./ITwinSlimClient");
var types_1 = require("./types");
var AUTHORIZED_FIELDS = ["ecInstanceId", "origin", "userLabel"];
var iTwinDataReaderConnector = /** @class */ (function () {
    function iTwinDataReaderConnector(event) {
        this.event = event;
        (0, dotenv_1.config)();
        console.log(event);
        console.log(event.properties);
        console.log(event.properties.origin.definition.dataType);
        if (!process.env.ITWIN_ID || !process.env.IMODEL_ID)
            throw new Error("Please specify an iTwinId and iModelId");
        this.iModelId = process.env.IMODEL_ID;
        this.iTwinId = process.env.ITWIN_ID;
        if (!process.env.CLIENT_ID ||
            !process.env.CLIENT_SECRET ||
            !process.env.SCOPE)
            throw new Error("Please specify a CLIENT_ID, CLIENT_SECRET, and SCOPE");
        this.authClient = new service_authorization_1.ServiceAuthorizationClient({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            scope: process.env.SCOPE,
            authority: "https://ims.bentley.com",
        });
        this.restClient = new ITwinSlimClient_1.ITwinSlimClient({
            baseUrl: "https://api.bentley.com",
            authorizationCallback: this.authClient.getAccessToken.bind(this.authClient),
        });
    }
    iTwinDataReaderConnector.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, connectionProps;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.restClient.getLatestChangeSet(this.iModelId)];
                    case 1:
                        _a.changeSet = _b.sent();
                        return [4 /*yield*/, this.restClient.getConnectionProps(this.iTwinId, this.iModelId, this.changeSet)];
                    case 2:
                        connectionProps = _b.sent();
                        this.key = connectionProps.key;
                        return [2 /*return*/];
                }
            });
        });
    };
    iTwinDataReaderConnector.prototype.queryEventProperties = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fields, query, args, json;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = this.authorizedFields(this.event.selectedProperties);
                        query = "SELECT ".concat(fields.join(", "), " FROM bis.GeometricElement3d WHERE EcInstanceId=:ecId LIMIT 1");
                        args = {
                            ecId: {
                                value: this.event.entityId.split("_")[1],
                                type: types_1.ArgumentBindType.Id,
                            },
                        };
                        return [4 /*yield*/, this.restClient.queryRows({
                                query: query,
                                changeSet: this.changeSet,
                                iModelId: this.iModelId,
                                iTwinId: this.iTwinId,
                                key: this.key,
                                args: args,
                            })];
                    case 1:
                        json = _a.sent();
                        return [2 /*return*/, buildResponse(json, this.event.selectedProperties, this.event.properties, this.event.entityId, this.event.componentName)];
                }
            });
        });
    };
    iTwinDataReaderConnector.prototype.authorizedFields = function (fields) {
        return fields.filter(function (f) { return AUTHORIZED_FIELDS.includes(f); });
    };
    return iTwinDataReaderConnector;
}());
exports.iTwinDataReaderConnector = iTwinDataReaderConnector;
var handler = function (event) { return __awaiter(void 0, void 0, void 0, function () {
    var reader, rows, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                reader = new iTwinDataReaderConnector(event);
                return [4 /*yield*/, reader.initialize()];
            case 1:
                _a.sent();
                return [4 /*yield*/, reader.queryEventProperties()];
            case 2:
                rows = _a.sent();
                console.log(rows);
                // format rows here to return something we can actually use
                return [2 /*return*/, rows];
            case 3:
                error_1 = _a.sent();
                console.log(error_1);
                return [2 /*return*/, {
                        statusCode: 500,
                        body: JSON.stringify(error_1),
                    }];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.handler = handler;
function buildResponse(queryResponse, eventsPropArray, // we need to use the array to ensure order is in sync with our query
eventProperties, entityId, componentName) {
    var results = {
        propertyValues: {},
    };
    eventsPropArray.forEach(function (propertyName, index) {
        var definition = eventProperties[propertyName].definition;
        results.propertyValues[propertyName] = {
            propertyReference: {
                componentName: componentName,
                entityId: entityId,
                propertyName: propertyName,
            },
            propertyValue: generateDataValue(definition.dataType, queryResponse.data[0][index]),
        };
    });
    return results;
}
function generateDataValue(dataType, value) {
    if (dataType.type === "RELATIONSHIP") {
        throw new Error("RELATIONSHIP DataType not supported");
    }
    if (dataType.nestedType && dataType.type === "LIST") {
        throw new Error("LIST DataType is not supported");
    }
    // MAP
    if (dataType.nestedType) {
        var mapValue = {};
        for (var mapKey in value) {
            mapValue[mapKey] = generateDataValue(dataType.nestedType, value[mapKey]); // { doubleValue: value[mapKey] }; // needs to be abstracted can make recursive without too much trouble, replace queryResponse with value
        }
        return { mapValue: mapValue };
    }
    if (dataType.type === "BOOLEAN")
        return { booleanValue: value };
    if (dataType.type === "STRING")
        return { stringValue: value };
    if (dataType.type === "LONG")
        return { longValue: value };
    if (dataType.type === "DOUBLE")
        return { doubleValue: value };
    if (dataType.type === "INTEGER")
        return { integerValue: value };
}
/**
 *
 *
 * userLabel: {
    definition: {
      dataType: [Object],
      isTimeSeries: false,
      isRequiredInEntity: false,
      isExternalId: false,
      isStoredExternally: true,
      isImported: true,
      isFinal: false,
      isInherited: false,
      imported: true,
      requiredInEntity: false,
      inherited: false,
      final: false,
      storedExternally: true,
      externalId: false,
      timeSeries: false
    }
  },
  ecInstanceId: {
    definition: {
      dataType: [Object],
      isTimeSeries: false,
      isRequiredInEntity: true,
      isExternalId: false,
      isStoredExternally: true,
      isImported: true,
      isFinal: false,
      isInherited: false,
      imported: true,
      requiredInEntity: true,
      inherited: false,
      final: false,
      storedExternally: true,
      externalId: false,
      timeSeries: false
    }
  },
  origin: {
    definition: {
      dataType: [Object],
      isTimeSeries: false,
      isRequiredInEntity: false,
      isExternalId: false,
      isStoredExternally: true,
      isImported: true,
      isFinal: false,
      isInherited: false,
      imported: true,
      requiredInEntity: false,
      inherited: false,
      final: false,
      storedExternally: true,
      externalId: false,
      timeSeries: false
    }
  }
}
 */
