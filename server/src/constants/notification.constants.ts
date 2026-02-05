export const NOTIFICATION_MESSAGES = {
  // User Notifications
  USER: {
    WORKOUT_TIME: "Time for your workout session: {workoutName}",
    MEAL_TIME: "Time to eat: {mealName}",
    TRAINER_SUBSCRIBED: "You have successfully subscribed to trainer {trainerName}",
    GYM_SUBSCRIBED: "You have successfully subscribed to {gymName} with {planName} plan",
    SESSION_REQUEST_SENT: "Your session request has been sent to {trainerName}",
    SESSION_ACCEPTED: "Your session request has been accepted by {trainerName}",
    SESSION_REJECTED: "Your session request has been rejected by {trainerName}. Reason: {reason}",
    SUBSCRIPTION_CANCELLED: "Your trainer subscription has been cancelled",
    SUBSCRIPTION_EXPIRING_SOON: "Your subscription to {trainerName} is expiring soon on {expiryDate}",
    TRAINER_WORKOUT_ASSIGNED: "New workout assigned by your trainer: {workoutName}",
    WEIGHT_REMINDER: "Don't forget to log your daily weight!",
    WORKOUT_INACTIVITY: "You haven't worked out in 5 days. Time to get back on track!",
    GYM_ATTENDANCE_REMINDER: "You haven't visited the gym in 5 days. Your gym misses you!",
    GYM_ANNOUNCEMENT: "New announcement from {gymName}: {title}",
    DIET_ASSIGNED: "New diet plan assigned by your trainer",
    VIDEO_CALL_REMINDER: "Your video call session with {trainerName} starts in 15 minutes",
    STREAK_MILESTONE: "Congratulations! You've reached a {days} day streak!",
    GOAL_ACHIEVEMENT: "You've achieved your goal: {goalName}",
    WORKOUT_COMPLETED: "Great job completing your workout!",
  },

  // Trainer Notifications  
  TRAINER: {
    NEW_SUBSCRIBER: "New user {userName} has subscribed to your training",
    WORKOUT_REMINDER: "Reminder: Assign workouts to {userName} who doesn't have current sessions",
    VIDEO_CALL_TIME: "Your video call session with {userName} starts in 10 minutes",
    SESSION_REQUEST: "New session request from {userName}",
    CLIENT_WORKOUT_COMPLETED: "{userName} completed their workout: {workoutName}",
    CLIENT_DIET_LOGGED: "{userName} has logged their meal",
    CLIENT_MILESTONE: "Your client {userName} achieved a milestone!",
    CLIENT_INACTIVE: "Your client {userName} has been inactive for 5 days",
    PAYMENT_RECEIVED: "Payment received from {userName} for {planName} plan",
    WEEKLY_SCHEDULE_REMINDER: "Please set your weekly schedule for better client bookings",
    CLIENT_CANCELLED: "{userName} has cancelled their subscription",
  },

  // Gym Notifications
  GYM: {
    NEW_MEMBER: "New member {userName} joined your gym with {planName} plan",
    MEMBER_ATTENDANCE_WARNING: "Member {userName} hasn't visited in 4 days",
    SUBSCRIPTION_EXPIRED: "{userName}'s subscription will expire soon",
    PAYMENT_RECEIVED: "Payment received from {userName} for {planName}",
    LOW_ATTENDANCE_ALERT: "Overall gym attendance is below average this week",
    MEMBER_CANCELLED: "{userName} has cancelled their gym membership",
    PLAN_POPULAR: "Your {planName} plan is getting popular! {count} new subscribers this week",
    REVENUE_MILESTONE: "Congratulations! You've reached ₹{amount} in monthly revenue",
  },

  // Admin Notifications
  ADMIN: {
    TRAINER_APPLICATIONS: "{count} new trainer applications pending approval",
    GYM_APPLICATIONS: "{count} new gym applications pending approval",
    USER_REGISTRATIONS: "{count} new users registered today",
    PLATFORM_MILESTONE: "Platform milestone: {count} total users!",
    REVENUE_UPDATE: "Platform revenue update: ₹{amount} this month",
    SYSTEM_ACTIVITY: "High system activity: {count} active sessions",
    PENDING_VERIFICATIONS: "{trainerCount} trainers and {gymCount} gyms pending verification",
    MONTHLY_REPORT: "Monthly platform report is ready for review",
    USER_REPORTS: "{count} user reports pending review",
    CONTENT_MODERATION: "{count} content items need moderation review",
  },

  // Common
  COMMON: {
    WELCOME: "Welcome to TrainUp! Let's start your fitness journey",
    SYSTEM_MAINTENANCE: "Scheduled system maintenance in 30 minutes",
    FEATURE_UPDATE: "New feature available: {featureName}",
    SECURITY_ALERT: "New login detected from {location}",
    BACKUP_COMPLETE: "Daily backup completed successfully",
    ERROR_OCCURRED: "An error occurred in the system",
  }
};

export const NOTIFICATION_TYPES = {
  USER: {
    WORKOUT_TIME: 'user_workout_time',
    MEAL_TIME: 'user_meal_time',
    TRAINER_SUBSCRIBED: 'user_trainer_subscribed',
    GYM_SUBSCRIBED: 'user_gym_subscribed',
    SESSION_REQUEST_SENT: 'user_session_request_sent',
    SESSION_ACCEPTED: 'user_session_accepted',
    SESSION_REJECTED: 'user_session_rejected',
    SUBSCRIPTION_CANCELLED: 'user_subscription_cancelled',
    TRAINER_WORKOUT_ASSIGNED: 'user_trainer_workout_assigned',
    WEIGHT_REMINDER: 'user_weight_reminder',
    WORKOUT_INACTIVITY: 'user_workout_inactivity',
    GYM_ATTENDANCE_REMINDER: 'user_gym_attendance_reminder',
    GYM_ANNOUNCEMENT: 'user_gym_announcement',
    DIET_ASSIGNED: 'user_diet_assigned',
    VIDEO_CALL_REMINDER: 'user_video_call_reminder',
    SUBSCRIPTION_EXPIRING_SOON: 'user_subscription_expiring_soon',
  },

  TRAINER: {
    NEW_SUBSCRIBER: 'trainer_new_subscriber',
    WORKOUT_REMINDER: 'trainer_workout_reminder',
    VIDEO_CALL_TIME: 'trainer_video_call_time',
    SESSION_REQUEST: 'trainer_session_request',
    CLIENT_WORKOUT_COMPLETED: 'trainer_client_workout_completed',
    CLIENT_DIET_LOGGED: 'trainer_client_diet_logged',
    CLIENT_MILESTONE: 'trainer_client_milestone',
    CLIENT_INACTIVE: 'trainer_client_inactive',
    PAYMENT_RECEIVED: 'trainer_payment_received',
  },

  GYM: {
    NEW_MEMBER: 'gym_new_member',
    MEMBER_ATTENDANCE_WARNING: 'gym_member_attendance_warning',
    SUBSCRIPTION_EXPIRED: 'gym_subscription_expired',
    PAYMENT_RECEIVED: 'gym_payment_received',
    LOW_ATTENDANCE_ALERT: 'gym_low_attendance_alert',
  },

  ADMIN: {
    TRAINER_APPLICATIONS: 'admin_trainer_applications',
    GYM_APPLICATIONS: 'admin_gym_applications',
    USER_REGISTRATIONS: 'admin_user_registrations',
    PLATFORM_MILESTONE: 'admin_platform_milestone',
    PENDING_VERIFICATIONS: 'admin_pending_verifications',
  }
};