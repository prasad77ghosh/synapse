export interface SendEmailEvent {
  to: string;
  subject: string;
  template: "verification" | "welcome" | "password-reset" | "notification";
  data: Record<string, any>;
  priority: "high" | "normal" | "low";
  scheduledFor?: string;
}

export interface SendSMSEvent {
  to: string;
  message: string;
  template?: string;
  priority: "high" | "normal" | "low";
}
