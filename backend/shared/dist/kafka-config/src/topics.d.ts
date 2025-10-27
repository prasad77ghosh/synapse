export declare const KAFKA_TOPICS: {
    readonly USER_REGISTERED: "user.registered";
    readonly USER_EMAIL_VERIFIED: "user.email.verified";
    readonly USER_PHONE_VERIFIED: "user.phone.verified";
    readonly SEND_EMAIL: "notification.email.send";
    readonly SEND_SMS: "notification.sms.send";
};
export declare const TOPIC_CONFIGS: {
    "user.registered": {
        partitions: number;
        replicationFactor: number;
        retentionMs: number;
    };
    "notification.email.send": {
        partitions: number;
        replicationFactor: number;
        retentionMs: number;
    };
    "notification.sms.send": {
        partitions: number;
        replicationFactor: number;
        retentionMs: number;
    };
};
