// @generated by protobuf-ts 2.0.6
// @generated from protobuf file "playplay.proto" (package "spotify.playplay.proto", syntax proto2)
// tslint:disable
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message spotify.playplay.proto.PlayPlayLicenseRequest
 */
export interface PlayPlayLicenseRequest {
    /**
     * @generated from protobuf field: optional int32 version = 1;
     */
    version?: number;
    /**
     * @generated from protobuf field: optional bytes token = 2;
     */
    token?: Uint8Array;
    /**
     * @generated from protobuf field: optional bytes cache_id = 3;
     */
    cacheId?: Uint8Array;
    /**
     * @generated from protobuf field: optional spotify.playplay.proto.Interactivity interactivity = 4;
     */
    interactivity?: Interactivity;
    /**
     * @generated from protobuf field: optional spotify.playplay.proto.ContentType content_type = 5;
     */
    contentType?: ContentType;
    /**
     * @generated from protobuf field: optional int64 timestamp = 6;
     */
    timestamp?: bigint;
}
/**
 * @generated from protobuf message spotify.playplay.proto.PlayPlayLicenseResponse
 */
export interface PlayPlayLicenseResponse {
    /**
     * @generated from protobuf field: optional bytes obfuscated_key = 1;
     */
    obfuscatedKey?: Uint8Array;
}
/**
 * @generated from protobuf enum spotify.playplay.proto.Interactivity
 */
export enum Interactivity {
    /**
     * @generated from protobuf enum value: UNKNOWN_INTERACTIVITY = 0;
     */
    UNKNOWN_INTERACTIVITY = 0,
    /**
     * @generated from protobuf enum value: INTERACTIVE = 1;
     */
    INTERACTIVE = 1,
    /**
     * @generated from protobuf enum value: DOWNLOAD = 2;
     */
    DOWNLOAD = 2
}
/**
 * @generated from protobuf enum spotify.playplay.proto.ContentType
 */
export enum ContentType {
    /**
     * @generated from protobuf enum value: UNKNOWN_CONTENT_TYPE = 0;
     */
    UNKNOWN_CONTENT_TYPE = 0,
    /**
     * @generated from protobuf enum value: AUDIO_TRACK = 1;
     */
    AUDIO_TRACK = 1,
    /**
     * @generated from protobuf enum value: AUDIO_EPISODE = 2;
     */
    AUDIO_EPISODE = 2,
    /**
     * @generated from protobuf enum value: AUDIO_ADD = 3;
     */
    AUDIO_ADD = 3
}
// @generated message type with reflection information, may provide speed optimized methods
class PlayPlayLicenseRequest$Type extends MessageType<PlayPlayLicenseRequest> {
    constructor() {
        super("spotify.playplay.proto.PlayPlayLicenseRequest", [
            { no: 1, name: "version", kind: "scalar", opt: true, T: 5 /*ScalarType.INT32*/ },
            { no: 2, name: "token", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "cache_id", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ },
            { no: 4, name: "interactivity", kind: "enum", opt: true, T: () => ["spotify.playplay.proto.Interactivity", Interactivity] },
            { no: 5, name: "content_type", kind: "enum", opt: true, T: () => ["spotify.playplay.proto.ContentType", ContentType] },
            { no: 6, name: "timestamp", kind: "scalar", opt: true, T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message spotify.playplay.proto.PlayPlayLicenseRequest
 */
export const PlayPlayLicenseRequest = new PlayPlayLicenseRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PlayPlayLicenseResponse$Type extends MessageType<PlayPlayLicenseResponse> {
    constructor() {
        super("spotify.playplay.proto.PlayPlayLicenseResponse", [
            { no: 1, name: "obfuscated_key", kind: "scalar", opt: true, T: 12 /*ScalarType.BYTES*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message spotify.playplay.proto.PlayPlayLicenseResponse
 */
export const PlayPlayLicenseResponse = new PlayPlayLicenseResponse$Type();
