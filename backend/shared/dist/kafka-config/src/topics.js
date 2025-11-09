"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOPIC_CONFIGS = exports.KAFKA_TOPICS = void 0;
exports.KAFKA_TOPICS = {
    //===============USER REGISTER TPOC ==================??
    USER_REGISTERED: "user.registered",
    //=============GOURP AND WORK SPACE TOPICS===============//
    WORKSPACE_EVENT: "workspace.events",
};
exports.TOPIC_CONFIGS = {
    [exports.KAFKA_TOPICS.USER_REGISTERED]: {
        partitions: 3,
        replicationFactor: 2,
        retentionMs: 604800000,
    },
};
