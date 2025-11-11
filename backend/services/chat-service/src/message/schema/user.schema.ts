// src/chat/schemas/chat-room.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatRoomDocument = HydratedDocument<ChatRoom>;

@Schema({ timestamps: { updatedAt: true } })
export class ChatRoom {
  @Prop({ required: true, unique: true })
  roomId: string;

  @Prop({ required: true, default: false })
  isGroupChat: boolean;

  @Prop()
  groupId?: string;

  @Prop()
  workspaceId?: string;

  @Prop({ type: [String], required: true })
  members: string[];

  @Prop({ default: null })
  parentRoomId?: string;

  @Prop()
  lastMessage?: string;

  @Prop()
  updatedAt: Date;
}

export const ChatRoomSchema = SchemaFactory.createForClass(ChatRoom);
