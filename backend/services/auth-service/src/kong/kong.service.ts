import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';

interface Consumer {
  id: string;
  username: string;
  // Add more fields if needed
}

interface JwtCredential {
  id: string;
  key: string;
  secret: string;
  algorithm?: string;
  created_at?: number;
  // Add more fields if needed
}

interface JwtCredentialsResponse {
  data: JwtCredential[];
  next: string | null;
}

@Injectable()
export class KongService {
  private kongAdminUrl = 'http://localhost:8001';

  async createConsumer(username: string): Promise<Consumer> {
    try {
      const response: AxiosResponse<Consumer> = await axios.post(
        `${this.kongAdminUrl}/consumers`,
        {
          username,
        },
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        const res: AxiosResponse<Consumer> = await axios.get(
          `${this.kongAdminUrl}/consumers/${username}`,
        );
        return res.data;
      }
      throw error;
    }
  }

  async createJwtCredential(consumerUsername: string): Promise<JwtCredential> {
    const response: AxiosResponse<JwtCredential> = await axios.post(
      `${this.kongAdminUrl}/consumers/${consumerUsername}/jwt`,
      {},
    );
    return response.data;
  }

  async registerFrontendClient(
    username: string,
  ): Promise<{ consumer: Consumer; jwtCredential: JwtCredential }> {
    const consumer = await this.createConsumer(username);
    const jwtCredential = await this.createJwtCredential(username);

    console.log({
      consumer,
      jwtCredential,
    });

    return { consumer, jwtCredential };
  }

  async getJwtCredentials(consumerUsername: string): Promise<JwtCredential[]> {
    const response: AxiosResponse<JwtCredentialsResponse> = await axios.get(
      `${this.kongAdminUrl}/consumers/${consumerUsername}/jwt`,
    );
    return response.data.data || [];
  }
}
