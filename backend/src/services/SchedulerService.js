const cron = require('node-cron');
const config = require('../config');
const logger = require('../utils/logger');
const notificationService = require('./NotificationService');
const Question = require('../models/Question');
const Pair = require('../models/Pair');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  /**
   * Start all scheduled jobs
   */
  start() {
    if (this.isRunning) {
      logger.warn('Scheduler service is already running');
      return;
    }

    this.setupDailyQuestionJob();
    this.setupCleanupJobs();
    this.setupWeeklyJobs();
    this.setupHealthCheckJobs();

    this.isRunning = true;
    logger.info('Scheduler service started');
  }

  /**
   * Stop all scheduled jobs
   */
  stop() {
    this.jobs.forEach((job, name) => {
      job.stop();
      logger.info(`Stopped scheduled job: ${name}`);
    });

    this.jobs.clear();
    this.isRunning = false;
    logger.info('Scheduler service stopped');
  }

  /**
   * Setup daily question notification job
   * Runs every day at 9:00 AM KST
   */
  setupDailyQuestionJob() {
    const job = cron.schedule('0 9 * * *', async () => {
      try {
        logger.info('Starting daily question notification job');
        await this.sendDailyQuestionNotifications();
      } catch (error) {
        logger.error('Daily question notification job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul',
    });

    this.jobs.set('daily-questions', job);
    logger.info('Daily question job scheduled for 9:00 AM KST');
  }

  /**
   * Setup cleanup jobs
   */
  setupCleanupJobs() {
    // Clean up expired invitations daily at 2:00 AM
    const cleanupInvitationsJob = cron.schedule('0 2 * * *', async () => {
      try {
        logger.info('Starting invitation cleanup job');
        const cleanedCount = await Pair.cleanupExpiredInvitations();
        logger.info(`Cleaned up ${cleanedCount} expired invitations`);
      } catch (error) {
        logger.error('Invitation cleanup job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul',
    });

    // Clean up notification queue daily at 3:00 AM
    const cleanupQueueJob = cron.schedule('0 3 * * *', async () => {
      try {
        logger.info('Starting queue cleanup job');
        await notificationService.cleanupOldJobs();
      } catch (error) {
        logger.error('Queue cleanup job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul',
    });

    this.jobs.set('cleanup-invitations', cleanupInvitationsJob);
    this.jobs.set('cleanup-queue', cleanupQueueJob);
    logger.info('Cleanup jobs scheduled');
  }

  /**
   * Setup weekly jobs
   */
  setupWeeklyJobs() {
    // Generate weekly summaries every Sunday at 8:00 PM
    const weeklySummaryJob = cron.schedule('0 20 * * 0', async () => {
      try {
        logger.info('Starting weekly summary generation job');
        await this.generateWeeklySummaries();
      } catch (error) {
        logger.error('Weekly summary generation job failed:', error);
      }
    }, {
      scheduled: true,
      timezone: 'Asia/Seoul',
    });

    this.jobs.set('weekly-summaries', weeklySummaryJob);
    logger.info('Weekly summary job scheduled for Sundays at 8:00 PM KST');
  }

  /**
   * Setup health check jobs
   */
  setupHealthCheckJobs() {
    // Health check every 5 minutes
    const healthCheckJob = cron.schedule('*/5 * * * *', async () => {
      try {
        await this.performHealthCheck();
      } catch (error) {
        logger.error('Health check job failed:', error);
      }
    }, {
      scheduled: true,
    });

    this.jobs.set('health-check', healthCheckJob);
    logger.info('Health check job scheduled every 5 minutes');
  }

  /**
   * Send daily question notifications to all active pairs
   */
  async sendDailyQuestionNotifications() {
    try {
      // Get all active pairs
      const activePairs = await Pair.find({ status: 'active' });
      
      if (activePairs.length === 0) {
        logger.info('No active pairs found for daily question notifications');
        return;
      }

      // Get today's question (we'll use the same logic as the API)
      const todaysQuestion = await Question.getTodaysQuestion();
      
      if (!todaysQuestion) {
        logger.warn('No question available for today');
        return;
      }

      // Schedule notifications for all active pairs
      const notificationJobs = activePairs.map(pair => 
        notificationService.scheduleDailyQuestionNotification(
          pair.id, 
          todaysQuestion.id
        )
      );

      const results = await Promise.allSettled(notificationJobs);
      const successCount = results.filter(result => result.status === 'fulfilled').length;

      logger.info('Daily question notifications scheduled', {
        totalPairs: activePairs.length,
        successCount,
        failureCount: activePairs.length - successCount,
        questionId: todaysQuestion.id,
      });

    } catch (error) {
      logger.error('Failed to send daily question notifications:', error);
      throw error;
    }
  }

  /**
   * Generate weekly summaries for all active pairs
   */
  async generateWeeklySummaries() {
    try {
      const activePairs = await Pair.find({ status: 'active' });
      
      if (activePairs.length === 0) {
        logger.info('No active pairs found for weekly summary generation');
        return;
      }

      // Calculate week boundaries (Sunday to Saturday)
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - now.getDay()); // Go to Sunday
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Go to Saturday
      weekEnd.setHours(23, 59, 59, 999);

      const summaryJobs = activePairs.map(pair => 
        this.generatePairWeeklySummary(pair.id, weekStart, weekEnd)
      );

      const results = await Promise.allSettled(summaryJobs);
      const successCount = results.filter(result => result.status === 'fulfilled').length;

      logger.info('Weekly summaries generated', {
        totalPairs: activePairs.length,
        successCount,
        failureCount: activePairs.length - successCount,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
      });

    } catch (error) {
      logger.error('Failed to generate weekly summaries:', error);
      throw error;
    }
  }

  /**
   * Generate weekly summary for a specific pair
   * @param {string} pairId - Pair ID
   * @param {Date} weekStart - Start of the week
   * @param {Date} weekEnd - End of the week
   */
  async generatePairWeeklySummary(pairId, weekStart, weekEnd) {
    try {
      const Answer = require('../models/Answer');
      
      // Get answers for this pair during the week
      const answers = await Answer.find({ 
        pair_id: pairId 
      }, {
        // In production, add date filtering in SQL
        orderBy: 'answered_at ASC'
      });

      // Filter answers by date (simplified version)
      const weekAnswers = answers.filter(answer => {
        const answerDate = new Date(answer.answered_at);
        return answerDate >= weekStart && answerDate <= weekEnd;
      });

      if (weekAnswers.length === 0) {
        logger.info(`No answers found for pair ${pairId} this week`);
        return;
      }

      // Generate summary data
      const summaryData = {
        pairId,
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        totalAnswers: weekAnswers.length,
        questionsAnswered: new Set(weekAnswers.map(a => a.question_id)).size,
        averageAnswerLength: weekAnswers.reduce((sum, a) => sum + a.content.length, 0) / weekAnswers.length,
        topCategories: this.getTopCategories(weekAnswers),
        highlights: this.getWeekHighlights(weekAnswers),
      };

      // In production, save to weekly_summaries table
      // await WeeklySummary.create(summaryData);

      // Schedule notification
      await notificationService.addJob(
        'weekly-summary',
        { pairId, summaryData },
        { delay: Math.random() * 30000 } // Random delay up to 30 seconds
      );

      logger.info('Weekly summary generated for pair', { pairId, totalAnswers: weekAnswers.length });

    } catch (error) {
      logger.error(`Failed to generate weekly summary for pair ${pairId}:`, error);
      throw error;
    }
  }

  /**
   * Get top categories from answers
   * @param {Array} answers - Array of answers
   * @returns {Array} - Top categories
   */
  getTopCategories(answers) {
    const categories = {};
    
    answers.forEach(answer => {
      if (answer.question_category) {
        categories[answer.question_category] = (categories[answer.question_category] || 0) + 1;
      }
    });

    return Object.entries(categories)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([category, count]) => ({ category, count }));
  }

  /**
   * Get week highlights from answers
   * @param {Array} answers - Array of answers
   * @returns {Array} - Week highlights
   */
  getWeekHighlights(answers) {
    // Simple implementation - get longest answers
    return answers
      .sort((a, b) => b.content.length - a.content.length)
      .slice(0, 3)
      .map(answer => ({
        content: answer.content.substring(0, 100) + (answer.content.length > 100 ? '...' : ''),
        date: answer.answered_at,
        userName: answer.user_name,
      }));
  }

  /**
   * Perform system health check
   */
  async performHealthCheck() {
    try {
      // Check notification queue health
      const queueStats = await notificationService.getQueueStats();
      
      // Log warnings if queue is backing up
      if (queueStats && queueStats.waiting > 100) {
        logger.warn('Notification queue backing up', queueStats);
      }

      if (queueStats && queueStats.failed > 50) {
        logger.warn('High number of failed notification jobs', queueStats);
      }

      // Additional health checks can be added here
      // e.g., database connection, external service availability

    } catch (error) {
      logger.error('Health check failed:', error);
    }
  }

  /**
   * Get status of all scheduled jobs
   */
  getJobsStatus() {
    const status = {};
    
    this.jobs.forEach((job, name) => {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled,
      };
    });

    return {
      isRunning: this.isRunning,
      totalJobs: this.jobs.size,
      jobs: status,
    };
  }

  /**
   * Manually trigger a specific job (for testing/admin purposes)
   * @param {string} jobName - Name of the job to trigger
   */
  async triggerJob(jobName) {
    try {
      switch (jobName) {
        case 'daily-questions':
          await this.sendDailyQuestionNotifications();
          break;
        case 'weekly-summaries':
          await this.generateWeeklySummaries();
          break;
        case 'cleanup-invitations':
          await Pair.cleanupExpiredInvitations();
          break;
        case 'cleanup-queue':
          await notificationService.cleanupOldJobs();
          break;
        default:
          throw new Error(`Unknown job: ${jobName}`);
      }
      
      logger.info(`Manually triggered job: ${jobName}`);
    } catch (error) {
      logger.error(`Failed to manually trigger job ${jobName}:`, error);
      throw error;
    }
  }
}

// Singleton instance
const schedulerService = new SchedulerService();

module.exports = schedulerService;