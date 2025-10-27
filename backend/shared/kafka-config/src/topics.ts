export const KAFKA_TOPICS = {
  USER_REGISTERED: "user.registered",
  USER_EMAIL_VERIFIED: "user.email.verified",
  USER_PHONE_VERIFIED: "user.phone.verified",

  SEND_EMAIL: "notification.email.send",
  SEND_SMS: "notification.sms.send",
} as const;

export const TOPIC_CONFIGS = {
  [KAFKA_TOPICS.USER_REGISTERED]: {
    partitions: 3,
    replicationFactor: 2,
    retentionMs: 604800000,
  },
  [KAFKA_TOPICS.SEND_EMAIL]: {
    partitions: 3,
    replicationFactor: 2,
    retentionMs: 259200000,
  },
  [KAFKA_TOPICS.SEND_SMS]: {
    partitions: 3,
    replicationFactor: 2,
    retentionMs: 259200000,
  },
};
