import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatRoomInfoDocument = HydratedDocument<ChatRoomInfo>;

@Schema({ timestamps: true })
export class ChatRoomInfo {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop({ required: true })
  isGroupChat: boolean;

  @Prop({
    type: {
      groupId: String,
      name: String,
      iconUrl: String,
      description: String,
    },
    default: null,
  })
  groupInfo?: {
    groupId: string;
    name: string;
    iconUrl?: string;
    description?: string;
  };

  @Prop({
    type: {
      workspaceId: String,
      name: String,
      plan: String,
      logoUrl: String,
    },
    default: null,
  })
  workspaceInfo?: {
    workspaceId: string;
    name: string;
    plan?: string;
    logoUrl?: string;
  };

  @Prop({
    type: [
      {
        userId: String,
        name: String,
        avatarUrl: String,
        status: String,
        isAdmin: Boolean,
      },
    ],
  })
  members?: {
    userId: string;
    name: string;
    avatarUrl?: string;
    status?: string;
    isAdmin?: boolean;
  }[];

  @Prop()
  lastMessage?: string;
}

export const ChatRoomInfoSchema = SchemaFactory.createForClass(ChatRoomInfo);
