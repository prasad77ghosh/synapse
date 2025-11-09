export declare const KAFKA_TOPICS: {
    readonly USER_REGISTERED: "user.registered";
    readonly WORKSPACE_EVENT: "workspace.events";
};
export declare const TOPIC_CONFIGS: {
    "user.registered": {
        partitions: number;
        replicationFactor: number;
        retentionMs: number;
    };
};
