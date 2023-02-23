import { RpcInterfaces } from "./rpc";
import {
  ITwinThinClientOptions,
  ChangeSetInfo,
  QueryRowsOptions,
  QueryRowFormat,
  RpcGetOptions,
  RpcPostOptions,
  IModelRpcReadQueryParametersToEncode,
  RequestKind,
  DbValueFormat,
} from "../types";

// split on the idea of each client owning an imodel and itwin id...
// could have overrides in each method...

export class ITwinSlimClient {
  private baseUrl: string;
  private authorizationCallback: () => Promise<string>;

  constructor(options: ITwinThinClientOptions) {
    this.baseUrl = options.baseUrl;
    this.authorizationCallback = options.authorizationCallback;
  }

  async getLatestChangeSet(iModelId: string): Promise<ChangeSetInfo> {
    const res = await fetch(
      `${this.baseUrl}/imodels/${iModelId}/namedversions?$top=1&$orderBy=changesetIndex%20desc`,
      {
        headers: {
          authorization: await this.authorizationCallback(),
        },
      }
    );

    const json = await res.json();
    console.log("latest changeset");
    console.log(json.namedVersions[0]);

    return {
      id: json.namedVersions[0].changesetId,
      index: json.namedVersions[0].changesetIndex,
    };
  }

  async getConnectionProps(
    iTwinId: string,
    iModelId: string,
    changeSet: ChangeSetInfo
  ) {
    const res = await this.rpcGet({
      rpcInterface: RpcInterfaces.IModelReadRpcInterface.value(),
      operation:
        RpcInterfaces.IModelReadRpcInterface.operations.getConnectionProps,
      parameters: this.encodeParameters({ iTwinId, iModelId, changeSet }),
      iTwinId,
      iModelId,
      changeSetId: changeSet.id,
    });

    return res.json();
  }

  async queryRows(queryRowsOptions: QueryRowsOptions) {
    const {
      changeSet,
      key,
      iTwinId,
      iModelId,
      query,
      rowFormat,
      kind,
      valueFormat,
      limit,
      args,
    } = queryRowsOptions;

    const queryBody = [
      {
        key,
        iTwinId,
        iModelId,
        changeset: changeSet,
      },
      {
        rowFormat: rowFormat || QueryRowFormat.UseECSqlPropertyNames,
        kind: kind || RequestKind.ECSql,
        valueFormat: valueFormat || DbValueFormat.ECSqlNames,
        query,
        args: args || {},
        includeMetaData: true,
        limit: limit || {
          offset: 0,
          count: -1,
        },
      },
    ];

    const res = await this.rpcPost({
      rpcInterface: RpcInterfaces.IModelReadRpcInterface.value(),
      operation: RpcInterfaces.IModelReadRpcInterface.operations.queryRows,
      body: queryBody,
      iTwinId,
      iModelId,
      changeSetId: changeSet.id,
      query,
    });

    const json = await res.json();

    console.log("El query: ");
    console.log(json);
    return json;
  }

  private async rpcGet(options: RpcGetOptions) {
    const {
      rpcInterface,
      operation,
      parameters,
      iTwinId,
      iModelId,
      changeSetId,
    } = options;
    let url = `${this.baseUrl}/imodel/rpc/mode/1/context/${iTwinId}/imodel/${iModelId}/changeset/${changeSetId}/${rpcInterface}-${operation}`;

    if (parameters) url += `?parameters=${parameters}`;

    return fetch(url, {
      headers: {
        authorization: await this.authorizationCallback(),
      },
    });
  }

  private async rpcPost(options: RpcPostOptions) {
    const { rpcInterface, operation, iTwinId, iModelId, changeSetId, body } =
      options;

    const req = fetch(
      `${this.baseUrl}/imodel/rpc/v3.0/mode/1/context/${iTwinId}/imodel/${iModelId}/changeset/${changeSetId}/${rpcInterface}-${operation}`,
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          authorization: await this.authorizationCallback(),
        },
      }
    );

    return await req;
  }

  private encodeParameters(
    parameters: IModelRpcReadQueryParametersToEncode
  ): string {
    return Buffer.from(JSON.stringify([parameters]), "utf8").toString("base64");
  }
}

// TO add
// async getPagedContent() {
//   if (!this.changeSet.id || !this.key) {
//     throw new Error(
//       "Cannot fetch paged content without a changeset id and key (did you call getConnectionProps and getChangeSet?)"
//     );
//   }

//   const body = [
//     {
//       key: this.key,
//       iTwinId: this.iTwinId,
//       iModelId: this.iModelId,
//       changeset: { id: this.changeSet.id, index: `${this.changeSet.index}` },
//     },
//     {
//       locale: "en-US",
//       rulesetOrId: {
//         id: "presentation-components/DefaultPropertyGridContent",
//         rules: [
//           {
//             ruleType: "Content",
//             onlyIfNotHandled: true,
//             specifications: [
//               {
//                 specType: "SelectedNodeInstances",
//               },
//             ],
//           },
//         ],
//       },
//       descriptor: {
//         displayType: "PropertyPane",
//         contentFlags: 12,
//       },
//       keys: {
//         instanceKeys: [["Generic:PhysicalObject", "+9FF+3+2"]],
//         nodeKeys: [],
//       },
//       paging: {
//         start: 0,
//         size: 0,
//       },
//       rulesetVariables: [],
//     },
//   ];

//   const res = await this.rpcPostViz(
//     "PresentationRpcInterface-3.2.0",
//     "getPagedContent",
//     body
//   );

//   const json = await res.json();
//   console.log(json);
// }

//   // eh have to abstract better
//   private async rpcPostViz(rpcInterface, operation, body) {
//     const req = fetch(
//       `https://api.bentley.com/imodeljs/visualization/v3.0/mode/1/context/${this.iTwinId}/imodel/${this.iModelId}/changeset/${this.changeSet.id}/${rpcInterface}-${operation}`,
//       {
//         method: "POST",
//         body: JSON.stringify(body),
//         headers: {
//           authorization: await this.client.getAccessToken(),
//         },
//       }
//     );

//     return await req;
//   }
