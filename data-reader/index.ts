/*global fetch*/
import { ServiceAuthorizationClient } from "@itwin/service-authorization";
import { config } from "dotenv";
import { ITwinSlimClient } from "./ITwinSlimClient";
import { TwinMakerLambdaEvent, ArgumentBindType, ChangeSetInfo } from "./types";
import { TwinMakerResponse } from "./TwinMakerResponse";

const AUTHORIZED_FIELDS = ["ecInstanceId", "origin", "userLabel"];

// lambda entrance
export const handler = async (event) => {
  try {
    const reader = new iTwinDataReaderConnector(event);
    await reader.initialize();

    const rows = await reader.queryEventProperties();
    return rows;
  } catch (error) {
    console.log(error);

    return {
      statusCode: 500,
      body: JSON.stringify(error),
    };
  }
};

class iTwinDataReaderConnector {
  private authClient: ServiceAuthorizationClient;
  private restClient: ITwinSlimClient;
  private iModelId: string;
  private iTwinId: string;
  private changeSet?: ChangeSetInfo;
  private key?: string;

  constructor(private event: TwinMakerLambdaEvent) {
    config();

    if (!process.env.ITWIN_ID || !process.env.IMODEL_ID)
      throw new Error("Please specify an iTwinId and iModelId");

    this.iModelId = process.env.IMODEL_ID;
    this.iTwinId = process.env.ITWIN_ID;

    if (
      !process.env.CLIENT_ID ||
      !process.env.CLIENT_SECRET ||
      !process.env.SCOPE
    )
      throw new Error("Please specify a CLIENT_ID, CLIENT_SECRET, and SCOPE");

    this.authClient = new ServiceAuthorizationClient({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scope: process.env.SCOPE,
      authority: "https://ims.bentley.com",
    });

    this.restClient = new ITwinSlimClient({
      baseUrl: "https://api.bentley.com",
      authorizationCallback: this.authClient.getAccessToken.bind(
        this.authClient
      ),
    });
  }

  async initialize() {
    this.changeSet = await this.restClient.getLatestChangeSet(this.iModelId);
    const connectionProps = await this.restClient.getConnectionProps(
      this.iTwinId,
      this.iModelId,
      this.changeSet
    );
    this.key = connectionProps.key;
  }

  async queryEventProperties() {
    const fields = this.authorizedFields(this.event.selectedProperties);
    const query = `SELECT ${fields.join(
      ", "
    )} FROM bis.GeometricElement3d WHERE EcInstanceId=:ecId LIMIT 1`;

    const args = {
      ecId: {
        value: this.event.entityId.split("_")[1],
        type: ArgumentBindType.Id,
      },
    };

    const json = await this.restClient.queryRows({
      query,
      changeSet: this.changeSet,
      iModelId: this.iModelId,
      iTwinId: this.iTwinId,
      key: this.key,
      args,
    });

    return TwinMakerResponse.buildResponse(json, this.event);
  }

  private authorizedFields(fields: string[]) {
    return fields.filter((f) => AUTHORIZED_FIELDS.includes(f));
  }
}
