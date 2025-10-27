import { Kafka } from 'kafkajs';

const kafkaBrokers = [process.env.KAFKA_BROKERS || 'kafka:9092'];

console.log(`🔌 Kafka configured with brokers: ${kafkaBrokers.join(', ')}`);

export const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || 'default-client',
  brokers: kafkaBrokers,
  connectionTimeout: 30000, // Increased timeout
  authenticationTimeout: 30000,
  retry: {
    initialRetryTime: 1000, // Increased initial retry
    retries: 20, // More retries
    maxRetryTime: 30000,
    restartOnFailure: async (error) => {
      console.log('🔄 Kafka connection failed, restarting...', error.message);
      return true;
    }
  }
});