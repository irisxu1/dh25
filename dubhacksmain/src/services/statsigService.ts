import Statsig from 'statsig-js';

class StatsigService {
  private isInitialized = false;

  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Initialize Statsig with your client key
      await Statsig.initialize(
        'client-your-statsig-key-here', // Replace with your actual Statsig client key
        {
          userID: 'anonymous-user', // You can customize this based on user session
        }
      );
      this.isInitialized = true;
      console.log('Statsig initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Statsig:', error);
    }
  }

  async getFeatureFlag(flagName: string): Promise<boolean> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      return Statsig.checkGate(flagName);
    } catch (error) {
      console.error(`Error checking feature flag ${flagName}:`, error);
      return false;
    }
  }

  async getConfig(configName: string): Promise<any> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    try {
      return Statsig.getConfig(configName);
    } catch (error) {
      console.error(`Error getting config ${configName}:`, error);
      return null;
    }
  }

  logEvent(eventName: string, value?: any, metadata?: Record<string, any>) {
    if (!this.isInitialized) {
      console.warn('Statsig not initialized, cannot log event');
      return;
    }
    
    try {
      Statsig.logEvent(eventName, value, metadata);
    } catch (error) {
      console.error(`Error logging event ${eventName}:`, error);
    }
  }

  // Interview-specific events
  logInterviewStart(questionType: string) {
    this.logEvent('interview_started', null, { question_type: questionType });
  }

  logInterviewComplete(duration: number, score: number) {
    this.logEvent('interview_completed', score, { duration });
  }

  logFeedbackViewed(feedbackType: string) {
    this.logEvent('feedback_viewed', null, { feedback_type: feedbackType });
  }
}

export const statsigService = new StatsigService();
