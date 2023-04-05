// @generated by protobuf-ts 2.0.6
// @generated from protobuf file "player.proto" (package "connectstate", syntax proto3)
// tslint:disable
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message connectstate.PlayerState
 */
export interface PlayerState {
    /**
     * @generated from protobuf field: int64 timestamp = 1;
     */
    timestamp: bigint;
    /**
     * @generated from protobuf field: string context_uri = 2;
     */
    contextUri: string;
    /**
     * @generated from protobuf field: string context_url = 3;
     */
    contextUrl: string;
    /**
     * @generated from protobuf field: connectstate.Restrictions context_restrictions = 4;
     */
    contextRestrictions?: Restrictions;
    /**
     * @generated from protobuf field: connectstate.PlayOrigin play_origin = 5;
     */
    playOrigin?: PlayOrigin;
    /**
     * @generated from protobuf field: connectstate.ContextIndex index = 6;
     */
    index?: ContextIndex;
    /**
     * @generated from protobuf field: connectstate.ProvidedTrack track = 7;
     */
    track?: ProvidedTrack;
    /**
     * @generated from protobuf field: string playback_id = 8;
     */
    playbackId: string;
    /**
     * @generated from protobuf field: double playback_speed = 9;
     */
    playbackSpeed: number;
    /**
     * @generated from protobuf field: int64 position_as_of_timestamp = 10;
     */
    positionAsOfTimestamp: bigint;
    /**
     * @generated from protobuf field: int64 duration = 11;
     */
    duration: bigint;
    /**
     * @generated from protobuf field: bool is_playing = 12;
     */
    isPlaying: boolean;
    /**
     * @generated from protobuf field: bool is_paused = 13;
     */
    isPaused: boolean;
    /**
     * @generated from protobuf field: bool is_buffering = 14;
     */
    isBuffering: boolean;
    /**
     * @generated from protobuf field: bool is_system_initiated = 15;
     */
    isSystemInitiated: boolean;
    /**
     * @generated from protobuf field: connectstate.ContextPlayerOptions options = 16;
     */
    options?: ContextPlayerOptions;
    /**
     * @generated from protobuf field: connectstate.Restrictions restrictions = 17;
     */
    restrictions?: Restrictions;
    /**
     * @generated from protobuf field: connectstate.Suppressions suppressions = 18;
     */
    suppressions?: Suppressions;
    /**
     * @generated from protobuf field: repeated connectstate.ProvidedTrack prev_tracks = 19;
     */
    prevTracks: ProvidedTrack[];
    /**
     * @generated from protobuf field: repeated connectstate.ProvidedTrack next_tracks = 20;
     */
    nextTracks: ProvidedTrack[];
    /**
     * @generated from protobuf field: map<string, string> context_metadata = 21;
     */
    contextMetadata: {
        [key: string]: string;
    };
    /**
     * @generated from protobuf field: map<string, string> page_metadata = 22;
     */
    pageMetadata: {
        [key: string]: string;
    };
    /**
     * @generated from protobuf field: string session_id = 23;
     */
    sessionId: string;
    /**
     * @generated from protobuf field: string queue_revision = 24;
     */
    queueRevision: string;
    /**
     * @generated from protobuf field: int64 position = 25;
     */
    position: bigint;
    /**
     * @generated from protobuf field: string entity_uri = 26;
     */
    entityUri: string;
    /**
     * @generated from protobuf field: repeated connectstate.ProvidedTrack reverse = 27;
     */
    reverse: ProvidedTrack[];
    /**
     * @generated from protobuf field: repeated connectstate.ProvidedTrack future = 28;
     */
    future: ProvidedTrack[];
    /**
     * @generated from protobuf field: connectstate.PlaybackQuality playback_quality = 32;
     */
    playbackQuality?: PlaybackQuality;
}
/**
 * @generated from protobuf message connectstate.ProvidedTrack
 */
export interface ProvidedTrack {
    /**
     * @generated from protobuf field: string uri = 1;
     */
    uri: string;
    /**
     * @generated from protobuf field: string uid = 2;
     */
    uid: string;
    /**
     * @generated from protobuf field: map<string, string> metadata = 3;
     */
    metadata: {
        [key: string]: string;
    };
    /**
     * @generated from protobuf field: repeated string removed = 4;
     */
    removed: string[];
    /**
     * @generated from protobuf field: repeated string blocked = 5;
     */
    blocked: string[];
    /**
     * @generated from protobuf field: string provider = 6;
     */
    provider: string;
    /**
     * @generated from protobuf field: connectstate.Restrictions restrictions = 7;
     */
    restrictions?: Restrictions;
    /**
     * @generated from protobuf field: string album_uri = 8;
     */
    albumUri: string;
    /**
     * @generated from protobuf field: repeated string disallow_reasons = 9;
     */
    disallowReasons: string[];
    /**
     * @generated from protobuf field: string artist_uri = 10;
     */
    artistUri: string;
    /**
     * @generated from protobuf field: repeated string disallow_undecided = 11;
     */
    disallowUndecided: string[];
}
/**
 * @generated from protobuf message connectstate.ContextIndex
 */
export interface ContextIndex {
    /**
     * @generated from protobuf field: uint32 page = 1;
     */
    page: number;
    /**
     * @generated from protobuf field: uint32 track = 2;
     */
    track: number;
}
/**
 * @generated from protobuf message connectstate.Restrictions
 */
export interface Restrictions {
    /**
     * @generated from protobuf field: repeated string disallow_pausing_reasons = 1;
     */
    disallowPausingReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_resuming_reasons = 2;
     */
    disallowResumingReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_seeking_reasons = 3;
     */
    disallowSeekingReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_peeking_prev_reasons = 4;
     */
    disallowPeekingPrevReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_peeking_next_reasons = 5;
     */
    disallowPeekingNextReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_skipping_prev_reasons = 6;
     */
    disallowSkippingPrevReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_skipping_next_reasons = 7;
     */
    disallowSkippingNextReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_toggling_repeat_context_reasons = 8;
     */
    disallowTogglingRepeatContextReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_toggling_repeat_track_reasons = 9;
     */
    disallowTogglingRepeatTrackReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_toggling_shuffle_reasons = 10;
     */
    disallowTogglingShuffleReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_set_queue_reasons = 11;
     */
    disallowSetQueueReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_interrupting_playback_reasons = 12;
     */
    disallowInterruptingPlaybackReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_transferring_playback_reasons = 13;
     */
    disallowTransferringPlaybackReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_remote_control_reasons = 14;
     */
    disallowRemoteControlReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_inserting_into_next_tracks_reasons = 15;
     */
    disallowInsertingIntoNextTracksReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_inserting_into_context_tracks_reasons = 16;
     */
    disallowInsertingIntoContextTracksReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_reordering_in_next_tracks_reasons = 17;
     */
    disallowReorderingInNextTracksReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_reordering_in_context_tracks_reasons = 18;
     */
    disallowReorderingInContextTracksReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_removing_from_next_tracks_reasons = 19;
     */
    disallowRemovingFromNextTracksReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_removing_from_context_tracks_reasons = 20;
     */
    disallowRemovingFromContextTracksReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_updating_context_reasons = 21;
     */
    disallowUpdatingContextReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_playing_reasons = 22;
     */
    disallowPlayingReasons: string[];
    /**
     * @generated from protobuf field: repeated string disallow_stopping_reasons = 23;
     */
    disallowStoppingReasons: string[];
}
/**
 * @generated from protobuf message connectstate.PlayOrigin
 */
export interface PlayOrigin {
    /**
     * @generated from protobuf field: string feature_identifier = 1;
     */
    featureIdentifier: string;
    /**
     * @generated from protobuf field: string feature_version = 2;
     */
    featureVersion: string;
    /**
     * @generated from protobuf field: string view_uri = 3;
     */
    viewUri: string;
    /**
     * @generated from protobuf field: string external_referrer = 4;
     */
    externalReferrer: string;
    /**
     * @generated from protobuf field: string referrer_identifier = 5;
     */
    referrerIdentifier: string;
    /**
     * @generated from protobuf field: string device_identifier = 6;
     */
    deviceIdentifier: string;
    /**
     * @generated from protobuf field: repeated string feature_classes = 7;
     */
    featureClasses: string[];
}
/**
 * @generated from protobuf message connectstate.ContextPlayerOptions
 */
export interface ContextPlayerOptions {
    /**
     * @generated from protobuf field: bool shuffling_context = 1;
     */
    shufflingContext: boolean;
    /**
     * @generated from protobuf field: bool repeating_context = 2;
     */
    repeatingContext: boolean;
    /**
     * @generated from protobuf field: bool repeating_track = 3;
     */
    repeatingTrack: boolean;
}
/**
 * @generated from protobuf message connectstate.Suppressions
 */
export interface Suppressions {
    /**
     * @generated from protobuf field: repeated string providers = 1;
     */
    providers: string[];
}
/**
 * @generated from protobuf message connectstate.PlaybackQuality
 */
export interface PlaybackQuality {
    /**
     * @generated from protobuf field: connectstate.BitrateLevel bitrate_level = 1;
     */
    bitrateLevel: BitrateLevel;
    /**
     * @generated from protobuf field: connectstate.BitrateStrategy strategy = 2;
     */
    strategy: BitrateStrategy;
    /**
     * @generated from protobuf field: connectstate.BitrateLevel target_bitrate_level = 3;
     */
    targetBitrateLevel: BitrateLevel;
    /**
     * @generated from protobuf field: bool target_bitrate_available = 4;
     */
    targetBitrateAvailable: boolean;
    /**
     * @generated from protobuf field: connectstate.HiFiStatus hifi_status = 5;
     */
    hifiStatus: HiFiStatus;
}
/**
 * @generated from protobuf enum connectstate.BitrateLevel
 */
export enum BitrateLevel {
    /**
     * @generated from protobuf enum value: unknown = 0;
     */
    unknown = 0,
    /**
     * @generated from protobuf enum value: low = 1;
     */
    low = 1,
    /**
     * @generated from protobuf enum value: normal = 2;
     */
    normal = 2,
    /**
     * @generated from protobuf enum value: high = 3;
     */
    high = 3,
    /**
     * @generated from protobuf enum value: veryhigh = 4;
     */
    veryhigh = 4,
    /**
     * @generated from protobuf enum value: normalized = 5;
     */
    normalized = 5
}
/**
 * @generated from protobuf enum connectstate.BitrateStrategy
 */
export enum BitrateStrategy {
    /**
     * @generated from protobuf enum value: unknown_strategy = 0;
     */
    unknown_strategy = 0,
    /**
     * @generated from protobuf enum value: best_matching = 1;
     */
    best_matching = 1,
    /**
     * @generated from protobuf enum value: backend_advised = 2;
     */
    backend_advised = 2,
    /**
     * @generated from protobuf enum value: offlined_file = 3;
     */
    offlined_file = 3,
    /**
     * @generated from protobuf enum value: cached_file = 4;
     */
    cached_file = 4,
    /**
     * @generated from protobuf enum value: local_file = 5;
     */
    local_file = 5
}
/**
 * @generated from protobuf enum connectstate.HiFiStatus
 */
export enum HiFiStatus {
    /**
     * @generated from protobuf enum value: none = 0;
     */
    none = 0,
    /**
     * @generated from protobuf enum value: off = 1;
     */
    off = 1,
    /**
     * @generated from protobuf enum value: on = 2;
     */
    on = 2
}
// @generated message type with reflection information, may provide speed optimized methods
class PlayerState$Type extends MessageType<PlayerState> {
    constructor() {
        super("connectstate.PlayerState", [
            { no: 1, name: "timestamp", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 2, name: "context_uri", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "context_url", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "context_restrictions", kind: "message", T: () => Restrictions },
            { no: 5, name: "play_origin", kind: "message", T: () => PlayOrigin },
            { no: 6, name: "index", kind: "message", T: () => ContextIndex },
            { no: 7, name: "track", kind: "message", T: () => ProvidedTrack },
            { no: 8, name: "playback_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 9, name: "playback_speed", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/ },
            { no: 10, name: "position_as_of_timestamp", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 11, name: "duration", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 12, name: "is_playing", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 13, name: "is_paused", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 14, name: "is_buffering", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 15, name: "is_system_initiated", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 16, name: "options", kind: "message", T: () => ContextPlayerOptions },
            { no: 17, name: "restrictions", kind: "message", T: () => Restrictions },
            { no: 18, name: "suppressions", kind: "message", T: () => Suppressions },
            { no: 19, name: "prev_tracks", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ProvidedTrack },
            { no: 20, name: "next_tracks", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ProvidedTrack },
            { no: 21, name: "context_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } },
            { no: 22, name: "page_metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } },
            { no: 23, name: "session_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 24, name: "queue_revision", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 25, name: "position", kind: "scalar", T: 3 /*ScalarType.INT64*/, L: 0 /*LongType.BIGINT*/ },
            { no: 26, name: "entity_uri", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 27, name: "reverse", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ProvidedTrack },
            { no: 28, name: "future", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => ProvidedTrack },
            { no: 32, name: "playback_quality", kind: "message", T: () => PlaybackQuality }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message connectstate.PlayerState
 */
export const PlayerState = new PlayerState$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ProvidedTrack$Type extends MessageType<ProvidedTrack> {
    constructor() {
        super("connectstate.ProvidedTrack", [
            { no: 1, name: "uri", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "uid", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "metadata", kind: "map", K: 9 /*ScalarType.STRING*/, V: { kind: "scalar", T: 9 /*ScalarType.STRING*/ } },
            { no: 4, name: "removed", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "blocked", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "provider", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "restrictions", kind: "message", T: () => Restrictions },
            { no: 8, name: "album_uri", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 9, name: "disallow_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 10, name: "artist_uri", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 11, name: "disallow_undecided", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message connectstate.ProvidedTrack
 */
export const ProvidedTrack = new ProvidedTrack$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ContextIndex$Type extends MessageType<ContextIndex> {
    constructor() {
        super("connectstate.ContextIndex", [
            { no: 1, name: "page", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 2, name: "track", kind: "scalar", T: 13 /*ScalarType.UINT32*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message connectstate.ContextIndex
 */
export const ContextIndex = new ContextIndex$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Restrictions$Type extends MessageType<Restrictions> {
    constructor() {
        super("connectstate.Restrictions", [
            { no: 1, name: "disallow_pausing_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "disallow_resuming_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "disallow_seeking_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "disallow_peeking_prev_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "disallow_peeking_next_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "disallow_skipping_prev_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "disallow_skipping_next_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 8, name: "disallow_toggling_repeat_context_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 9, name: "disallow_toggling_repeat_track_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 10, name: "disallow_toggling_shuffle_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 11, name: "disallow_set_queue_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 12, name: "disallow_interrupting_playback_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 13, name: "disallow_transferring_playback_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 14, name: "disallow_remote_control_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 15, name: "disallow_inserting_into_next_tracks_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 16, name: "disallow_inserting_into_context_tracks_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 17, name: "disallow_reordering_in_next_tracks_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 18, name: "disallow_reordering_in_context_tracks_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 19, name: "disallow_removing_from_next_tracks_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 20, name: "disallow_removing_from_context_tracks_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 21, name: "disallow_updating_context_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 22, name: "disallow_playing_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ },
            { no: 23, name: "disallow_stopping_reasons", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message connectstate.Restrictions
 */
export const Restrictions = new Restrictions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PlayOrigin$Type extends MessageType<PlayOrigin> {
    constructor() {
        super("connectstate.PlayOrigin", [
            { no: 1, name: "feature_identifier", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "feature_version", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "view_uri", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "external_referrer", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 5, name: "referrer_identifier", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "device_identifier", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "feature_classes", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message connectstate.PlayOrigin
 */
export const PlayOrigin = new PlayOrigin$Type();
// @generated message type with reflection information, may provide speed optimized methods
class ContextPlayerOptions$Type extends MessageType<ContextPlayerOptions> {
    constructor() {
        super("connectstate.ContextPlayerOptions", [
            { no: 1, name: "shuffling_context", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 2, name: "repeating_context", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 3, name: "repeating_track", kind: "scalar", T: 8 /*ScalarType.BOOL*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message connectstate.ContextPlayerOptions
 */
export const ContextPlayerOptions = new ContextPlayerOptions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Suppressions$Type extends MessageType<Suppressions> {
    constructor() {
        super("connectstate.Suppressions", [
            { no: 1, name: "providers", kind: "scalar", repeat: 2 /*RepeatType.UNPACKED*/, T: 9 /*ScalarType.STRING*/ }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message connectstate.Suppressions
 */
export const Suppressions = new Suppressions$Type();
// @generated message type with reflection information, may provide speed optimized methods
class PlaybackQuality$Type extends MessageType<PlaybackQuality> {
    constructor() {
        super("connectstate.PlaybackQuality", [
            { no: 1, name: "bitrate_level", kind: "enum", T: () => ["connectstate.BitrateLevel", BitrateLevel] },
            { no: 2, name: "strategy", kind: "enum", T: () => ["connectstate.BitrateStrategy", BitrateStrategy] },
            { no: 3, name: "target_bitrate_level", kind: "enum", T: () => ["connectstate.BitrateLevel", BitrateLevel] },
            { no: 4, name: "target_bitrate_available", kind: "scalar", T: 8 /*ScalarType.BOOL*/ },
            { no: 5, name: "hifi_status", kind: "enum", T: () => ["connectstate.HiFiStatus", HiFiStatus] }
        ]);
    }
}
/**
 * @generated MessageType for protobuf message connectstate.PlaybackQuality
 */
export const PlaybackQuality = new PlaybackQuality$Type();