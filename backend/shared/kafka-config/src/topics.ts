export const KAFKA_TOPICS = {
  //===============USER REGISTER TPOC ==================??
  USER_REGISTERED: "user.registered",

  //=============GOURP AND WORK SPACE TOPICS===============//
  WORKSPACE_EVENT: "workspace.events",
} as const;

export const TOPIC_CONFIGS = {
  [KAFKA_TOPICS.USER_REGISTERED]: {
    partitions: 3,
    replicationFactor: 2,
    retentionMs: 604800000,
  },
};
