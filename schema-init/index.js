// schema-init function
exports.handler = async (event) => {
  let result = {
    properties: {
      ecInstanceId: {
        definition: {
          dataType: {
            type: "STRING",
          },
          isTimeSeries: false,
          isRequiredInEntity: true
        },
      },
      userLabel: {
        definition: {
          dataType: {
            type: "STRING",
          },
          isTimeSeries: false,
        },
      },
      origin: {
        definition: {
          dataType: {
            type: "MAP",
            nestedType: {
                type: "DOUBLE"
            }
          },
          isTimeSeries: false,
        },
      },
    },
  };

  return result;
};
