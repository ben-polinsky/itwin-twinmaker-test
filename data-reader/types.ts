export interface ITwinThinClientOptions {
  baseUrl: string;
  authorizationCallback: () => Promise<string>;
}

export interface ChangeSetInfo {
  index: number;
  id: string;
}

export interface IModelRpcReadQueryParametersToEncode {
  iTwinId: string;
  iModelId: string;
  changeSet: ChangeSetInfo;
}

export interface TwinMakerLambdaEvent {
  workspaceId: string;
  entityId: string; // entity id is a name-ecInstanceId
  componentName: string;
  properties: Record<string, { definition: any }>;
  selectedProperties: string[];
  maxResults: number;
}

export interface RpcGetOptions {
  rpcInterface: string;
  operation: string;
  iTwinId: string;
  iModelId: string;
  changeSetId: string;
  parameters?: string;
}

export interface RpcPostOptions {
  rpcInterface: string;
  operation: string;
  query: string;
  body: any;
  iTwinId: string;
  iModelId: string;
  changeSetId: string;
}

export interface QueryRowsOptions {
  key: string;
  iTwinId: string;
  iModelId: string;
  changeSet: ChangeSetInfo;
  query: string;
  rowFormat?: QueryRowFormat;
  kind?: RequestKind;
  valueFormat?: DbValueFormat;
  limit?: {
    offset: number;
    count: number;
  };
  args?: Record<string, { type: ArgumentBindType; value: string | number }>;
}

export enum ArgumentBindType {
  Boolean,
  Double,
  Id,
  _3,
  Int,
  _4,
  _5,
  _6,
  _7,
  _8,
  String,
}

// bool == 0
// double == 1
// int === 4
// id == 2
// string === : 9,
export enum QueryRowFormat {
  /** Each row is an object in which each non-null column value can be accessed by its name as defined in the ECSql.
   * Null values are omitted.
   */
  UseECSqlPropertyNames,
  /** Each row is an array of values accessed by an index corresponding to the property's position in the ECSql SELECT statement.
   * Null values are included if they are followed by a non-null column, but trailing null values at the end of the array are omitted.
   */
  UseECSqlPropertyIndexes,
  /** Each row is an object in which each non-null column value can be accessed by a [remapped property name]($docs/learning/ECSqlRowFormat.md).
   * This format is backwards-compatible with the format produced by iTwin.js 2.x. Null values are omitted.
   */
  UseJsPropertyNames,
}

export enum RequestKind {
  BlobIO = 0,
  ECSql = 1,
}

export enum DbValueFormat {
  ECSqlNames = 0,
  JsNames = 1,
}

export type TwinMakerDataTypes =
  | "RELATIONSHIP"
  | "STRING"
  | "LONG"
  | "BOOLEAN"
  | "INTEGER"
  | "DOUBLE"
  | "LIST"
  | "MAP";

export type TwinMakerDataType = {
  type: TwinMakerDataTypes;
  nestedType?: { type: TwinMakerDataTypes };
};

export type TwinMakerEventPropertyDefinition = {
  dataType: TwinMakerDataType;
  isTimeSeries: boolean;
  isRequiredInEntity: boolean;
  isExternalId: boolean;
  isStoredExternally: boolean;
  isImported: boolean;
  isFinal: boolean;
  isInherited: boolean;
  imported: boolean;
  requiredInEntity: boolean;
  inherited: boolean;
  final: boolean;
  storedExternally: boolean;
  externalId: boolean;
  timeSeries: boolean;
};

export type TwinMakerEntityPropertyReference = {
  propertyName: string;
  componentName?: string;
  entityId?: string;
};

export type TwinMakerDataValue = {
  booleanValue?: boolean;
  doubleValue?: number;
  integerValue?: number;
  longValue?: number;
  stringValue?: string;
  listValue?: TwinMakerDataValue[];
  mapValue?: Record<string, TwinMakerDataValue>;
  relationshipValue?: any; //eh
  expression?: string;
};

export type TwinMakerPropertyValueEntry = {
  propertyReference: TwinMakerEntityPropertyReference;
  propertyValue: TwinMakerDataValue;
};

export type TwinMakerLambdaResponse = {
  propertyValues: Record<string, TwinMakerPropertyValueEntry>;
};

export type TwinMakerEventProperties = Record<
  string,
  { definition: TwinMakerEventPropertyDefinition }
>;
