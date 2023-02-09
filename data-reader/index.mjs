import { BriefcaseDb, BriefcaseManager, IModelHost } from "@itwin/core-backend";
import { IModelVersion } from "@itwin/core-common";
import { BackendIModelsAccess } from "@itwin/imodels-access-backend";
import { ServiceAuthorizationClient } from "@itwin/service-authorization";

class TestLambda {
  constructor() {
    this.config = {
      IMJS_ITWIN_ID: process.env.IMJS_ITWIN_ID,
      IMJS_IMODEL_ID: process.env.IMJS_IMODEL_ID,
    };
    console.log("CONFIG: ")
    console.log(JSON.stringify(this.config))
    this.oidcClient = new ServiceAuthorizationClient({
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scope: process.SCOPE,
    });
    this.hubAccess = new BackendIModelsAccess();
  }

  async initialize() {
    const hostConfig = {};

    hostConfig.hubAccess = this.hubAccess;
    await IModelHost.startup(hostConfig);
    const token = await this.oidcClient.getAccessToken();
    if (token) {
      console.log("Authorized...");
    } else {
      console.log("Unauthorized...");
    }
  }

  async run(version = IModelVersion.latest()) {
    // Download iModel
    const briefcaseProps = await BriefcaseManager.downloadBriefcase({
      accessToken: await this.oidcClient.getAccessToken(),
      iTwinId: this.config.IMJS_ITWIN_ID,
      iModelId: this.config.IMJS_IMODEL_ID,
      asOf: version.toJSON(),
    });

    // Open iModel
    const iModel = await BriefcaseDb.open({
      fileName: briefcaseProps.fileName,
      readonly: false,
    });

    const query =
      "SELECT UserLabel, ECInstanceId, Origin FROM bis.PhysicalElement LIMIT 10";
    for await (const row of iModel.query(query)) {
      console.log(row);
    }

    console.log(`iModel name: ${iModel.rootSubject.name}`);

    iModel.close();
  }
}

export const handler = async (event) => {
  try {
    console.log("The computer is starting")
    const l = new TestLambda();
    await l.initialize()
    await l.run();
  
    console.log("done");
    
    return {
        statusCode: 200,
        body: "all good... more to come ;)"
    }
  } catch (error) {
    console.log(error)
    
    return {
        statusCode: 500, 
        body: JSON.stringify(error)
    }
  }
};
