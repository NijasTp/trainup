
export function sendOtpHtml(otp: string): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>TrainTribe OTP Verification</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap');
        
        body {
          font-family: 'Poppins', sans-serif;
          margin: 0;
          padding: 0;
          background-color: #f5f7fa;
          color: #333;
        }
        
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }
        
        .header {
          background: linear-gradient(135deg, #434343 0%, #000000 100%);
          padding: 30px 20px;
          text-align: center;
        }
        
        .logo {
          max-width: 180px;
          height: auto;
        }
        
        .content {
          padding: 30px;
        }
        
        h1 {
          color: #2c3e50;
          margin-top: 0;
          font-size: 28px;
          font-weight: 700;
          text-align: center;
        }
        
        .otp-container {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
          text-align: center;
          border: 1px dashed #dee2e6;
        }
        
        .otp-code {
          font-size: 42px;
          font-weight: 700;
          letter-spacing: 5px;
          color: #e74c3c;
          margin: 15px 0;
          animation: pulse 1.5s infinite;
        }
        
        .footer {
          background: #f8f9fa;
          padding: 20px;
          text-align: center;
          font-size: 12px;
          color: #7f8c8d;
        }
        
        .gym-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 20px;
          display: block;
        }
        
        .cta-button {
          display: inline-block;
          background: #e74c3c;
          color: white;
          padding: 12px 30px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 600;
          margin: 20px 0;
          transition: all 0.3s ease;
        }
        
        .cta-button:hover {
          background: #c0392b;
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(231, 76, 60, 0.3);
        }
        
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }
        
        .divider {
          height: 3px;
          background: linear-gradient(90deg, rgba(231,76,60,1) 0%, rgba(46,49,146,1) 100%);
          margin: 25px 0;
          border-radius: 3px;
        }
        
        .social-icons {
          margin: 20px 0;
          text-align: center;
        }
        
        .social-icon {
          width: 30px;
          height: 30px;
          margin: 0 10px;
          transition: all 0.3s ease;
        }
        
        .social-icon:hover {
          transform: translateY(-3px);
        }
        
        @media only screen and (max-width: 600px) {
          .content {
            padding: 20px;
          }
          
          .otp-code {
            font-size: 32px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <!-- Replace with your actual logo URL -->
          <img src="https://i.pinimg.com/736x/77/3a/ac/773aac7fdc85fdd64f1fdc8df7d7fd74.jpg" alt="TrainTribe Logo" class="logo">
        </div>
        
        <div class="content">
          <!-- Gym icon - replace with your actual icon -->
          <svg class="gym-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#e74c3c">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
          
          <h1>Your One-Time Password</h1>
          <p style="text-align: center;">To complete your verification, please use the following OTP code:</p>
          
          <div class="otp-container">
            <p style="margin: 0; color: #7f8c8d;">Verification Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 0; color: #7f8c8d;">Valid for 10 minutes only</p>
          </div>
          
          <p style="text-align: center;">If you didn't request this code, please ignore this email or contact support if you have concerns.</p>
          
          <div class="divider"></div>
          
          <div style="text-align: center;">
            <a href="https://traintribe.com" class="cta-button">Visit TrainTribe</a>
          </div>
          
          <div class="social-icons">
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/124/124010.png" class="social-icon" alt="Facebook"></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" class="social-icon" alt="Twitter"></a>
            <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" class="social-icon" alt="Instagram"></a>
          </div>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} TrainTribe. All rights reserved.</p>
          <p>123 Fitness Street, Gym City, 10001</p>
          <p>
            <a href="#" style="color: #7f8c8d; text-decoration: none;">Privacy Policy</a> | 
            <a href="#" style="color: #7f8c8d; text-decoration: none;">Terms of Service</a>
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
}

export function getReminderHtml(message: string): string {
    return `
        <div style="font-family: Arial, sans-serif;">
            <h2>Reminder</h2>
            <p>${message}</p>
        </div>
    `;
}

export function gymSubscriptionHtml(
  userName: string,
  gymName: string,
  planName: string,
  preferredTime: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4F46E5; text-align: center;">Congratulations, ${userName}! 🎉</h1>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  padding: 30px; border-radius: 10px; color: white; text-align: center; margin: 20px 0;">
        <h2>Welcome to ${gymName}!</h2>
        <p style="font-size: 18px;">Your ${planName} subscription is now active!</p>
      </div>

      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333;">Subscription Details:</h3>
        <ul style="list-style: none; padding: 0;">
          <li><strong>Gym:</strong> ${gymName}</li>
          <li><strong>Plan:</strong> ${planName}</li>
          <li><strong>Preferred Time:</strong> ${preferredTime}</li>
          <li><strong>Status:</strong> Active</li>
        </ul>
      </div>

      <div style="background-color: #e8f4f8; padding: 20px; border-radius: 8px;">
        <h3 style="color: #333;">What's Next? 💪</h3>
        <p>You'll receive daily workout reminders at your preferred time: <strong>${preferredTime}</strong></p>
        <p>Access your gym dashboard to view announcements, member list, and track your progress!</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/gyms/my-gym"
          style="background-color: #4F46E5; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block;">
          Access Your Gym Dashboard
        </a>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 40px;">
        <p>Thank you for choosing TrainUp!</p>
        <p>If you have any questions, feel free to contact us.</p>
      </div>
    </div>
  `;
}

export function dailyWorkoutReminderHtml(
  userName: string,
  gymName: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #4F46E5; text-align: center;">Good Morning, ${userName}! 🌅</h1>
      
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  padding: 30px; border-radius: 10px; color: white; text-align: center; margin: 20px 0;">
        <h2>It's Workout Time! 💪</h2>
        <p style="font-size: 18px;">Your daily fitness journey awaits at ${gymName}</p>
      </div>

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/gyms/my-gym"
          style="background-color: #4F46E5; color: white; padding: 12px 30px;
                 text-decoration: none; border-radius: 5px; display: inline-block;">
          Check Today's Plan
        </a>
      </div>

      <div style="text-align: center; color: #666; font-size: 14px; margin-top: 40px;">
        <p>Stay consistent, stay strong! 💪</p>
        <p>TrainUp Team</p>
      </div>
    </div>
  `;
}

