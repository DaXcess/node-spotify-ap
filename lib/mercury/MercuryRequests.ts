import JsonMercuryRequest from "./JsonMercuryRequest";
import JsonWrapper from "./JsonWrapper";
import RawMercuryRequest from "./RawMercuryRequest";

export default class MercuryRequests {
  public static readonly KEYMASTER_CLIENT_ID =
    "65b708073fc0480ea92a077233ca87bd";

  public static requestToken(deviceId: string, scope: string) {
    return new JsonMercuryRequest(
      RawMercuryRequest.get(
        `hm://keymaster/token/authenticated?scope=${scope}&client_id=${MercuryRequests.KEYMASTER_CLIENT_ID}&device_id=${deviceId}`
      ),
      MercuryRequests.GenericJson
    );
  }

  public static readonly GenericJson = class extends JsonWrapper {
    public constructor(obj: any) {
      super(obj);
    }
  };
}
