// @generated by protobuf-ts 2.0.6
// @generated from protobuf file "explicit_content_pubsub.proto" (package "spotify.explicit_content.proto", syntax proto2)
// tslint:disable
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message spotify.explicit_content.proto.KeyValuePair
 */
export interface KeyValuePair {
    /**
     * @generated from protobuf field: string key = 1;
     */
    key: string;
    /**
     * @generated from protobuf field: string value = 2;
     */
    value: string;
}
/**
 * @generated from protobuf message spotify.explicit_content.proto.UserAttributesUpdate
 */
export interface UserAttributesUpdate {
    /**
     * @generated from protobuf field: repeated spotify.explicit_content.proto.KeyValuePair pairs = 1;
     */
    pairs: KeyValuePair[];
}
// @generated message type with reflection information, may provide speed optimized methods
class KeyValuePair$Type extends MessageType<KeyValuePair> {
    constructor() {
        super("spotify.explicit_content.proto.KeyValuePair", [
            { no: 1, name: "key", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "value", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message spotify.explicit_content.proto.KeyValuePair
 */
export const KeyValuePair = new KeyValuePair$Type();
// @generated message type with reflection information, may provide speed optimized methods
class UserAttributesUpdate$Type extends MessageType<UserAttributesUpdate> {
    constructor() {
        super("spotify.explicit_content.proto.UserAttributesUpdate", [
            { no: 1, name: "pairs", kind: "message", repeat: 2 /*RepeatType.UNPACKED*/, T: () => KeyValuePair }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message spotify.explicit_content.proto.UserAttributesUpdate
 */
export const UserAttributesUpdate = new UserAttributesUpdate$Type();
