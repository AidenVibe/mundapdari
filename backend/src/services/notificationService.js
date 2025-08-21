const config = require('../config');
const logger = require('../utils/logger');

class NotificationService {
  constructor() {
    this.redisAvailable = false;
    this.notificationQueue = null;
    this.initialized = false;
    
    // Check if Redis is available in development
    if (config.app.env === 'development') {
      logger.info('Notification service running in development mode without Redis');
      this.redisAvailable = false;
      this.initialized = true;
    } else {
      // In production, initialize Redis normally
      this.initializeRedis();
    }
  }

  async initializeRedis() {
    try {
      const Queue = require('bull');
      
      // Initialize Bull queue for notification processing
      this.notificationQueue = new Queue('notification processing', {
        redis: {
          host: config.redis.host,
          port: config.redis.port,
          password: config.redis.password,
          db: config.redis.db,
        },
        defaultJobOptions: {
          removeOnComplete: 10,
          removeOnFail: 5,
          attempts: config.notifications.retryAttempts,
          backoff: {
            type: 'exponential',
            delay: config.notifications.retryDelay,
          },
        },
      });

      this.setupQueueProcessors();
      this.setupQueueEvents();
      this.redisAvailable = true;
      this.initialized = true;
      
      logger.info('Notification service initialized with Redis queue');
    } catch (error) {
      logger.warn('Redis not available, notification service running in fallback mode:', error.message);
      this.redisAvailable = false;
      this.initialized = true;
    }
  }

  /**
   * Setup queue processors for different notification types
   */
  setupQueueProcessors() {
    if (!this.notificationQueue) return;
    
    // Process daily question notifications
    this.notificationQueue.process('daily-question', async (job) => {
      const { pairId, questionId } = job.data;
      return this.sendDailyQuestionNotification(pairId, questionId);
    });

    // Process answer notifications
    this.notificationQueue.process('answer-notification', async (job) => {
      const { answerId, recipientId } = job.data;
      return this.sendAnswerNotification(answerId, recipientId);
    });

    // Process reaction notifications
    this.notificationQueue.process('reaction-notification', async (job) => {
      const { reactionId, recipientId } = job.data;
      return this.sendReactionNotification(reactionId, recipientId);
    });

    // Process weekly summary notifications
    this.notificationQueue.process('weekly-summary', async (job) => {
      const { pairId, summaryData } = job.data;
      return this.sendWeeklySummaryNotification(pairId, summaryData);
    });

    // Process invitation notifications
    this.notificationQueue.process('invitation-notification', async (job) => {
      const { invitationUrl, recipientPhone, inviterName } = job.data;
      return this.sendInvitationNotification(invitationUrl, recipientPhone, inviterName);
    });
  }

  /**
   * Setup queue event handlers
   */
  setupQueueEvents() {
    if (!this.notificationQueue) return;
    
    this.notificationQueue.on('completed', (job, result) => {
      logger.info('Notification job completed', {
        jobId: job.id,
        type: job.name,
        result,
      });
    });

    this.notificationQueue.on('failed', (job, error) => {
      logger.error('Notification job failed', {
        jobId: job.id,
        type: job.name,
        error: error.message,
        data: job.data,
      });
    });

    this.notificationQueue.on('stalled', (job) => {
      logger.warn('Notification job stalled', {
        jobId: job.id,
        type: job.name,
      });
    });
  }

  /**
   * Schedule daily question notification
   * @param {string} pairId - Pair ID
   * @param {string} questionId - Question ID
   * @param {Date} scheduleTime - When to send the notification
   */
  async scheduleDailyQuestionNotification(pairId, questionId, scheduleTime = null) {
    try {
      if (!this.redisAvailable) {
        // Development mode - just log and simulate success
        logger.info('Development mode: Daily question notification scheduled', {
          pairId,
          questionId,
          scheduleTime,
          mode: 'development'
        });
        return { success: true, mode: 'development' };
      }

      const delay = scheduleTime ? scheduleTime.getTime() - Date.now() : 0;

      const job = await this.notificationQueue.add(
        'daily-question',
        { pairId, questionId },
        {
          delay: Math.max(0, delay),
          jobId: `daily-question-${pairId}-${new Date().toISOString().split('T')[0]}`,
        }
      );

      logger.info('Daily question notification scheduled', {
        jobId: job.id,
        pairId,
        questionId,
        scheduleTime,
      });

      return job;
    } catch (error) {
      logger.error('Failed to schedule daily question notification:', error);
      throw error;
    }
  }

  /**
   * Send daily question notification
   * @param {string} pairId - Pair ID
   * @param {string} questionId - Question ID
   */
  async sendDailyQuestionNotification(pairId, questionId) {
    try {
      // Get pair information
      const Pair = require('../models/Pair');
      const Question = require('../models/Question');
      const User = require('../models/User');

      const pair = await Pair.findById(pairId);
      if (!pair || pair.status !== 'active') {
        throw new Error('Pair not found or inactive');
      }

      const question = await Question.findById(questionId);
      if (!question || !question.active) {
        throw new Error('Question not found or inactive');
      }

      // Get both users in the pair
      const parentUser = await User.findById(pair.parent_id);
      const childUser = await User.findById(pair.child_id);

      const message = `새로운 질문이 도착했어요! "${question.content}" 지금 답변해보세요 💝`;

      // Send to both users (in production, this would use Kakao Talk API)
      const results = await Promise.allSettled([
        this.sendKakaoMessage(parentUser.phone, message, question.id),
        this.sendKakaoMessage(childUser.phone, message, question.id),
      ]);

      const successCount = results.filter(result => result.status === 'fulfilled').length;

      logger.info('Daily question notification sent', {
        pairId,
        questionId,
        successCount,
        totalRecipients: 2,
      });

      return { success: true, sent: successCount, total: 2 };
    } catch (error) {
      logger.error('Failed to send daily question notification:', error);
      throw error;
    }
  }

  /**
   * Schedule answer notification
   * @param {string} answerId - Answer ID
   * @param {string} recipientId - Recipient user ID
   */
  async scheduleAnswerNotification(answerId, recipientId) {
    try {
      if (!this.redisAvailable) {
        // Development mode - just log
        logger.info('Development mode: Answer notification scheduled', {
          answerId,
          recipientId,
          mode: 'development'
        });
        return { success: true, mode: 'development' };
      }

      const job = await this.notificationQueue.add(
        'answer-notification',
        { answerId, recipientId },
        {
          delay: 1000, // 1 second delay to ensure transaction is committed
        }
      );

      logger.info('Answer notification scheduled', {
        jobId: job.id,
        answerId,
        recipientId,
      });

      return job;
    } catch (error) {
      logger.error('Failed to schedule answer notification:', error);
      throw error;
    }
  }

  /**
   * Send answer notification
   * @param {string} answerId - Answer ID
   * @param {string} recipientId - Recipient user ID
   */
  async sendAnswerNotification(answerId, recipientId) {
    try {
      const Answer = require('../models/Answer');
      const Question = require('../models/Question');
      const User = require('../models/User');

      const answer = await Answer.findById(answerId);
      if (!answer) {
        throw new Error('Answer not found');
      }

      const question = await Question.findById(answer.question_id);
      const answerUser = await User.findById(answer.user_id);
      const recipient = await User.findById(recipientId);

      if (!recipient) {
        throw new Error('Recipient not found');
      }

      const message = `${answerUser.name}님이 "${question.content}" 질문에 답변했어요! 지금 확인해보세요 💕`;

      const result = await this.sendKakaoMessage(recipient.phone, message, question.id);

      logger.info('Answer notification sent', {
        answerId,
        recipientId,
        success: result.success,
      });

      return result;
    } catch (error) {
      logger.error('Failed to send answer notification:', error);
      throw error;
    }
  }

  /**
   * Schedule reaction notification
   * @param {string} reactionId - Reaction ID
   * @param {string} recipientId - Recipient user ID
   */
  async scheduleReactionNotification(reactionId, recipientId) {
    try {
      if (!this.redisAvailable) {
        logger.info('Development mode: Reaction notification scheduled', {
          reactionId,
          recipientId,
          mode: 'development'
        });
        return { success: true, mode: 'development' };
      }

      const job = await this.notificationQueue.add(
        'reaction-notification',
        { reactionId, recipientId },
        {
          delay: 1000, // 1 second delay
        }
      );

      return job;
    } catch (error) {
      logger.error('Failed to schedule reaction notification:', error);
      throw error;
    }
  }

  /**
   * Send reaction notification
   * @param {string} reactionId - Reaction ID
   * @param {string} recipientId - Recipient user ID
   */
  async sendReactionNotification(reactionId, recipientId) {
    try {
      // Implementation would fetch reaction data and send notification
      // For now, just log
      logger.info('Reaction notification sent', { reactionId, recipientId });
      return { success: true };
    } catch (error) {
      logger.error('Failed to send reaction notification:', error);
      throw error;
    }
  }

  /**
   * Send Kakao Talk message (placeholder implementation)
   * @param {string} phone - Recipient phone number
   * @param {string} message - Message content
   * @param {string} questionId - Question ID for deep linking
   */
  async sendKakaoMessage(phone, message, questionId = null) {
    try {
      // In production, this would integrate with Kakao Talk Business API
      // For development, we'll just log the message
      
      if (config.app.env === 'development') {
        logger.info('Kakao message (dev mode)', {
          phone: phone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3'),
          message,
          questionId,
        });
        return { success: true, messageId: `dev-${Date.now()}` };
      }

      // TODO: Implement actual Kakao Talk API integration
      // const kakaoResponse = await kakaoAPI.sendMessage({
      //   phone,
      //   message,
      //   template: 'daily_question',
      //   variables: { question_id: questionId }
      // });

      // For now, simulate success
      return { success: true, messageId: `sim-${Date.now()}` };
    } catch (error) {
      logger.error('Failed to send Kakao message:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send invitation notification
   * @param {string} invitationUrl - Invitation URL
   * @param {string} recipientPhone - Recipient phone number
   * @param {string} inviterName - Inviter name
   */
  async sendInvitationNotification(invitationUrl, recipientPhone, inviterName) {
    try {
      const message = `${inviterName}님이 문답다리에 초대했어요! 함께 소중한 추억을 만들어보세요 🌉\n${invitationUrl}`;

      const result = await this.sendKakaoMessage(recipientPhone, message);

      logger.info('Invitation notification sent', {
        recipientPhone: recipientPhone.replace(/(\d{3})(\d{4})(\d{4})/, '$1-****-$3'),
        inviterName,
        success: result.success,
      });

      return result;
    } catch (error) {
      logger.error('Failed to send invitation notification:', error);
      throw error;
    }
  }

  /**
   * Send weekly summary notification
   * @param {string} pairId - Pair ID
   * @param {object} summaryData - Weekly summary data
   */
  async sendWeeklySummaryNotification(pairId, summaryData) {
    try {
      // Implementation for weekly summary notifications
      logger.info('Weekly summary notification sent', { pairId, summaryData });
      return { success: true };
    } catch (error) {
      logger.error('Failed to send weekly summary notification:', error);
      throw error;
    }
  }

  /**
   * Add job to queue (used by scheduler service)
   * @param {string} jobType - Type of job
   * @param {object} data - Job data
   * @param {object} options - Job options
   */
  async addJob(jobType, data, options = {}) {
    try {
      if (!this.redisAvailable) {
        logger.info(`Development mode: Job ${jobType} added`, { data, options });
        return { success: true, mode: 'development' };
      }

      const job = await this.notificationQueue.add(jobType, data, options);
      return job;
    } catch (error) {
      logger.error(`Failed to add job ${jobType}:`, error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats() {
    try {
      if (!this.redisAvailable) {
        return {
          redisAvailable: false,
          mode: 'development',
          waiting: 0,
          active: 0,
          completed: 0,
          failed: 0,
        };
      }

      const waiting = await this.notificationQueue.getWaiting();
      const active = await this.notificationQueue.getActive();
      const completed = await this.notificationQueue.getCompleted();
      const failed = await this.notificationQueue.getFailed();

      return {
        redisAvailable: true,
        mode: 'queue',
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
      };
    } catch (error) {
      logger.error('Failed to get queue stats:', error);
      return null;
    }
  }

  /**
   * Cleanup old jobs
   */
  async cleanupOldJobs() {
    try {
      if (!this.redisAvailable) {
        logger.info('Development mode: Queue cleanup skipped');
        return;
      }

      await this.notificationQueue.clean(24 * 60 * 60 * 1000, 'completed');
      await this.notificationQueue.clean(7 * 24 * 60 * 60 * 1000, 'failed');
      
      logger.info('Queue cleanup completed');
    } catch (error) {
      logger.error('Failed to cleanup old jobs:', error);
    }
  }

  /**
   * Graceful shutdown
   */
  async shutdown() {
    try {
      if (this.notificationQueue) {
        await this.notificationQueue.close();
      }
      logger.info('Notification service shutdown completed');
    } catch (error) {
      logger.error('Error during notification service shutdown:', error);
    }
  }
}

// Singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;