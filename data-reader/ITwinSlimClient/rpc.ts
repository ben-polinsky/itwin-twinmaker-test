export const RpcInterfaces = {
  IModelReadRpcInterface: {
    version: "3.5.0",
    name: "IModelReadRpcInterface",
    value: function () {
      return `${this.name}-${this.version}`;
    },
    operations: {
      getConnectionProps: "getConnectionProps",
      queryRows: "queryRows",
    },
  },
};
