import {
  TwinMakerDataType,
  TwinMakerDataValue,
  TwinMakerLambdaEvent,
  TwinMakerLambdaResponse,
} from "./types";

export const TwinMakerResponse = {
  buildResponse(
    queryResponse: any,
    event: TwinMakerLambdaEvent
  ): TwinMakerLambdaResponse {
    const { selectedProperties, properties, entityId, componentName } = event;

    const results: TwinMakerLambdaResponse = {
      propertyValues: {},
    };

    selectedProperties.forEach((propertyName, index) => {
      const definition = properties[propertyName].definition;
      results.propertyValues[propertyName] = {
        propertyReference: {
          componentName,
          entityId,
          propertyName,
        },
        propertyValue: this.generateDataValue(
          definition.dataType,
          queryResponse.data[0][index]
        ),
      };
    });

    return results;
  },

  generateDataValue(
    dataType: TwinMakerDataType,
    value: any
  ): TwinMakerDataValue {
    if (dataType.type === "RELATIONSHIP") {
      throw new Error("RELATIONSHIP DataType not supported");
    }

    if (dataType.nestedType && dataType.type === "LIST") {
      throw new Error("LIST DataType is not supported");
    }

    // Has to be a Map, the only other nested dataType aside from LIST
    if (dataType.nestedType) {
      const mapValue = {};

      for (const mapKey in value) {
        mapValue[mapKey] = this.generateDataValue(
          dataType.nestedType,
          value[mapKey]
        );
      }

      return { mapValue };
    }

    if (dataType.type === "BOOLEAN") return { booleanValue: value };
    if (dataType.type === "STRING") return { stringValue: value };
    if (dataType.type === "LONG") return { longValue: value };
    if (dataType.type === "DOUBLE") return { doubleValue: value };
    if (dataType.type === "INTEGER") return { integerValue: value };
  },
};
