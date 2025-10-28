import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;
  private subscriber: Redis;
  private publisher: Redis;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisConfig = {
      host: this.configService.get<string>('REDIS_HOST', 'localhost'),
      port: this.configService.get<number>('REDIS_PORT', 6379),
      password: this.configService.get<string>('REDIS_PASSWORD'),
      db: this.configService.get<number>('REDIS_DB', 0),
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3,
    };

    // Main client for get/set operations
    this.client = new Redis(redisConfig);

    // Separate clients for pub/sub (recommended)
    this.subscriber = new Redis(redisConfig);
    this.publisher = new Redis(redisConfig);

    this.client.on('connect', () => {
      this.logger.log('✅ Redis client connected');
    });

    this.client.on('error', (error) => {
      this.logger.error('❌ Redis client error:', error);
    });

    await this.client.ping();
    this.logger.log('🔥 Redis is ready!');
  }

  async onModuleDestroy() {
    await this.client.quit();
    await this.subscriber.quit();
    await this.publisher.quit();
    this.logger.log('❌ Redis connections closed');
  }

  // ==========================================
  // BASIC OPERATIONS
  // ==========================================

  /**
   * Set a key-value pair
   */
  async set(
    key: string,
    value: string | number | object,
    ttlSeconds?: number,
  ): Promise<void> {
    const stringValue =
      typeof value === 'object' ? JSON.stringify(value) : String(value);

    if (ttlSeconds) {
      await this.client.setex(key, ttlSeconds, stringValue);
    } else {
      await this.client.set(key, stringValue);
    }
  }

  /**
   * Get a value by key
   */
  async get(key: string): Promise<string | null> {
    return await this.client.get(key);
  }

  /**
   * Get and parse JSON
   */
  async getJson<T>(key: string): Promise<T | null> {
    const value = await this.get(key);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return value ? JSON.parse(value) : null;
  }

  /**
   * Delete a key
   */
  async del(key: string): Promise<number> {
    return await this.client.del(key);
  }

  /**
   * Delete multiple keys
   */
  async delMany(keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return await this.client.del(...keys);
  }

  /**
   * Check if key exists
   */
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  /**
   * Set expiry on existing key
   */
  async expire(key: string, seconds: number): Promise<boolean> {
    const result = await this.client.expire(key, seconds);
    return result === 1;
  }

  /**
   * Get TTL of a key
   */
  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // ==========================================
  // HASH OPERATIONS (Perfect for objects)
  // ==========================================

  /**
   * Set hash field
   */
  async hSet(
    key: string,
    field: string,
    value: string | number,
  ): Promise<number> {
    return await this.client.hset(key, field, String(value));
  }

  /**
   * Get hash field
   */
  async hGet(key: string, field: string): Promise<string | null> {
    return await this.client.hget(key, field);
  }

  /**
   * Get all hash fields
   */
  async hGetAll(key: string): Promise<Record<string, string>> {
    return await this.client.hgetall(key);
  }

  /**
   * Delete hash field
   */
  async hDel(key: string, field: string): Promise<number> {
    return await this.client.hdel(key, field);
  }

  /**
   * Check if hash field exists
   */
  async hExists(key: string, field: string): Promise<boolean> {
    const result = await this.client.hexists(key, field);
    return result === 1;
  }

  /**
   * Increment hash field
   */
  async hIncrBy(
    key: string,
    field: string,
    increment: number,
  ): Promise<number> {
    return await this.client.hincrby(key, field, increment);
  }

  // ==========================================
  // SET OPERATIONS (Perfect for unique lists)
  // ==========================================

  /**
   * Add member to set
   */
  async sAdd(key: string, member: string): Promise<number> {
    return await this.client.sadd(key, member);
  }

  /**
   * Remove member from set
   */
  async sRem(key: string, member: string): Promise<number> {
    return await this.client.srem(key, member);
  }

  /**
   * Get all set members
   */
  async sMembers(key: string): Promise<string[]> {
    return await this.client.smembers(key);
  }

  /**
   * Check if member exists in set
   */
  async sIsMember(key: string, member: string): Promise<boolean> {
    const result = await this.client.sismember(key, member);
    return result === 1;
  }

  /**
   * Get set size
   */
  async sCard(key: string): Promise<number> {
    return await this.client.scard(key);
  }

  // ==========================================
  // SORTED SET OPERATIONS (Perfect for leaderboards, rankings)
  // ==========================================

  /**
   * Add member to sorted set with score
   */
  async zAdd(key: string, score: number, member: string): Promise<number> {
    return await this.client.zadd(key, score, member);
  }

  /**
   * Remove member from sorted set
   */
  async zRem(key: string, member: string): Promise<number> {
    return await this.client.zrem(key, member);
  }

  /**
   * Get members by score range (ascending)
   */
  async zRangeByScore(
    key: string,
    min: number,
    max: number,
  ): Promise<string[]> {
    return await this.client.zrangebyscore(key, min, max);
  }

  /**
   * Get top N members (descending)
   */
  async zRevRange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.zrevrange(key, start, stop);
  }

  /**
   * Get member score
   */
  async zScore(key: string, member: string): Promise<string | null> {
    return await this.client.zscore(key, member);
  }

  // ==========================================
  // LIST OPERATIONS (Perfect for queues)
  // ==========================================

  /**
   * Push to list (left/right)
   */
  async lPush(key: string, value: string): Promise<number> {
    return await this.client.lpush(key, value);
  }

  async rPush(key: string, value: string): Promise<number> {
    return await this.client.rpush(key, value);
  }

  /**
   * Pop from list
   */
  async lPop(key: string): Promise<string | null> {
    return await this.client.lpop(key);
  }

  async rPop(key: string): Promise<string | null> {
    return await this.client.rpop(key);
  }

  /**
   * Get list length
   */
  async lLen(key: string): Promise<number> {
    return await this.client.llen(key);
  }

  /**
   * Get list range
   */
  async lRange(key: string, start: number, stop: number): Promise<string[]> {
    return await this.client.lrange(key, start, stop);
  }

  // ==========================================
  // PUB/SUB OPERATIONS (Real-time messaging)
  // ==========================================

  /**
   * Publish message to channel
   */
  async publish(channel: string, message: string | object): Promise<number> {
    const stringMessage =
      typeof message === 'object' ? JSON.stringify(message) : message;
    return await this.publisher.publish(channel, stringMessage);
  }

  /**
   * Subscribe to channel
   */
  async subscribe(
    channel: string,
    callback: (message: string) => void,
  ): Promise<void> {
    await this.subscriber.subscribe(channel);
    this.subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
  }

  /**
   * Unsubscribe from channel
   */
  async unsubscribe(channel: string): Promise<void> {
    await this.subscriber.unsubscribe(channel);
  }

  // ==========================================
  // ADVANCED OPERATIONS
  // ==========================================

  /**
   * Increment counter
   */
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  /**
   * Increment by value
   */
  async incrBy(key: string, increment: number): Promise<number> {
    return await this.client.incrby(key, increment);
  }

  /**
   * Decrement counter
   */
  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  /**
   * Get multiple keys at once
   */
  async mGet(keys: string[]): Promise<(string | null)[]> {
    return await this.client.mget(...keys);
  }

  /**
   * Set multiple keys at once
   */
  async mSet(keyValues: Record<string, string>): Promise<string> {
    const args: string[] = [];
    Object.entries(keyValues).forEach(([key, value]) => {
      args.push(key, value);
    });
    return await this.client.mset(...args);
  }

  /**
   * Get keys matching pattern
   */
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  /**
   * Scan keys with cursor (better than keys for production)
   */
  async scan(
    cursor: string,
    pattern?: string,
    count?: number,
  ): Promise<[string, string[]]> {
    if (pattern && count !== undefined) {
      return await this.client.scan(cursor, 'MATCH', pattern, 'COUNT', count);
    }
    if (pattern) {
      return await this.client.scan(cursor, 'MATCH', pattern);
    }
    if (count !== undefined) {
      return await this.client.scan(cursor, 'COUNT', count);
    }
    return await this.client.scan(cursor);
  }

  /**
   * Flush all keys in current database
   */
  async flushDb(): Promise<string> {
    return await this.client.flushdb();
  }

  /**
   * Get Redis info
   */
  async info(): Promise<string> {
    return await this.client.info();
  }

  /**
   * Ping Redis
   */
  async ping(): Promise<string> {
    return await this.client.ping();
  }

  // ==========================================
  // UTILITY METHODS
  // ==========================================

  /**
   * Get raw Redis client (for advanced operations)
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Execute raw Redis command
   */
  async executeCommand(command: string, ...args: any[]): Promise<any> {
    return await this.client.call(command, ...args);
  }
}
