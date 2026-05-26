export const newsletterSubscriptionAdminTemplate = (
  subscriberEmail: string,
  subscriptionId: string,
  stats: {
    totalSubscribers: number;
    totalNewslettersSent: number;
    thisMonthSubscribers: number;
    thisWeekSubscribers: number;
    averageSubscribersPerMonth: number;
    topSubscriberDomains: string[];
  },
): string => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Newsletter Subscription</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .content {
            padding: 30px 20px;
        }
        
        .alert-box {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 25px;
        }
        
        .alert-box h3 {
            color: #155724;
            margin-bottom: 8px;
            font-size: 18px;
        }
        
        .alert-box p {
            color: #155724;
            font-size: 14px;
        }
        
        .subscription-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 25px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding-bottom: 15px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .detail-label {
            font-weight: 600;
            color: #495057;
            min-width: 120px;
            margin-right: 20px;
        }
        
        .detail-value {
            color: #212529;
            flex: 1;
            word-break: break-word;
        }
        
        .stats-info {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            border-radius: 4px;
            margin-top: 20px;
        }
        
        .stats-info h4 {
            color: #1976d2;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .stats-info p {
            color: #424242;
            line-height: 1.6;
            font-size: 14px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        
        .stat-card {
            background: #ffffff;
            border: 1px solid #e3f2fd;
            border-radius: 8px;
            padding: 15px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(33, 150, 243, 0.15);
        }
        
        .stat-icon {
            font-size: 24px;
            margin-bottom: 8px;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: 700;
            color: #1976d2;
            margin-bottom: 5px;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            font-weight: 500;
        }
        
        .stats-details {
            background: #f8f9fa;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        
        .stat-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #e9ecef;
        }
        
        .stat-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .stat-row .stat-label {
            font-weight: 600;
            color: #495057;
            font-size: 13px;
        }
        
        .stat-row .stat-value {
            color: #1976d2;
            font-weight: 600;
            font-size: 13px;
        }
        
        .growth-indicator {
            background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
            border-left: 4px solid #28a745;
            padding: 15px;
            border-radius: 4px;
        }
        
        .growth-indicator h5 {
            color: #155724;
            margin-bottom: 10px;
            font-size: 14px;
            font-weight: 600;
        }
        
        .growth-indicator p {
            color: #155724;
            font-size: 12px;
            margin-bottom: 5px;
        }
        
        .action-buttons {
            text-align: center;
            margin-top: 30px;
        }
        
        .btn {
            display: inline-block;
            padding: 12px 24px;
            margin: 0 10px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.3s ease;
        }
        
        .btn-primary {
            background-color: #28a745;
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #218838;
        }
        
        .btn-secondary {
            background-color: #6c757d;
            color: white;
        }
        
        .btn-secondary:hover {
            background-color: #545b62;
        }
        
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer p {
            color: #6c757d;
            font-size: 12px;
            margin-bottom: 5px;
        }
        
        .subscription-id {
            background-color: #e9ecef;
            padding: 8px 12px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
            font-size: 12px;
            color: #495057;
            display: inline-block;
            margin-top: 10px;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 4px;
            }
            
            .header {
                padding: 20px 15px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .content {
                padding: 20px 15px;
            }
            
            .detail-row {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .detail-label {
                margin-bottom: 5px;
                margin-right: 0;
            }
            
            .btn {
                display: block;
                margin: 10px 0;
                text-align: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 New Newsletter Subscription</h1>
            <p>A new subscriber has joined the newsletter</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h3>🎉 New Subscriber Alert</h3>
                <p>A new email address has been added to your newsletter subscription list. This subscriber will now receive all your newsletter updates and announcements.</p>
            </div>
            
            <div class="subscription-details">
                <h3 style="margin-bottom: 20px; color: #495057; font-size: 18px;">📝 Subscription Details</h3>
                
                <div class="detail-row">
                    <div class="detail-label">📧 Email Address:</div>
                    <div class="detail-value">${subscriberEmail}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">📅 Subscribed On:</div>
                    <div class="detail-value">${formatDate(new Date())}</div>
                </div>
            </div>
            
            <div class="stats-info">
                <h4>📊 Newsletter Statistics</h4>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📧</div>
                        <div class="stat-number">${stats.totalSubscribers}</div>
                        <div class="stat-label">Total Subscribers</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📤</div>
                        <div class="stat-number">${stats.totalNewslettersSent}</div>
                        <div class="stat-label">Newsletters Sent</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📅</div>
                        <div class="stat-number">${stats.thisMonthSubscribers}</div>
                        <div class="stat-label">This Month</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-number">${stats.thisWeekSubscribers}</div>
                        <div class="stat-label">This Week</div>
                    </div>
                </div>
                
                <div class="stats-details">
                    <div class="stat-row">
                        <div class="stat-label">📊 Average Subscribers per Month:</div>
                        <div class="stat-value">${stats.averageSubscribersPerMonth}</div>
                    </div>
                    <div class="stat-row">
                        <div class="stat-label">🌐 Top Subscriber Domains:</div>
                        <div class="stat-value">${stats.topSubscriberDomains.join(', ')}</div>
                    </div>
                </div>
                
                <div class="growth-indicator">
                    <h5>📈 Growth Insights</h5>
                    <p>• Newsletter engagement is growing steadily</p>
                    <p>• New subscribers are joining regularly</p>
                    <p>• Ready to send your next newsletter update</p>
                </div>
            </div>
            
            <div class="action-buttons">
                <a href="#" class="btn btn-primary">📊 View All Subscribers</a>
                <a href="#" class="btn btn-secondary">📧 Send Newsletter</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Best Technologies Limited</strong></p>
            <p>This is an automated notification. Please do not reply to this email.</p>
            <div class="subscription-id">Subscription ID: ${subscriptionId}</div>
            <p style="margin-top: 15px; font-size: 11px; color: #adb5bd;">
                Generated on ${formatDate(new Date())}
            </p>
        </div>
    </div>
</body>
</html>`;
};

export const newsletterWelcomeTemplate = (email: string): string => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short',
    }).format(date);
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Newsletter!</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8f9fa;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }
        
        .header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: float 6s ease-in-out infinite;
        }
        
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        .header h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 18px;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        
        .welcome-icon {
            font-size: 48px;
            margin-bottom: 20px;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .welcome-message {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .welcome-message h2 {
            color: #2c3e50;
            font-size: 24px;
            margin-bottom: 15px;
            font-weight: 600;
        }
        
        .welcome-message p {
            color: #555;
            font-size: 16px;
            line-height: 1.7;
        }
        
        .subscription-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #28a745;
        }
        
        .subscription-info h3 {
            color: #495057;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .info-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid #dee2e6;
        }
        
        .info-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        
        .info-label {
            font-weight: 600;
            color: #6c757d;
            min-width: 100px;
        }
        
        .info-value {
            color: #212529;
            font-weight: 500;
        }
        
        .benefits-section {
            margin-bottom: 30px;
        }
        
        .benefits-section h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 20px;
            text-align: center;
        }
        
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .benefit-card {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .benefit-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .benefit-icon {
            font-size: 32px;
            margin-bottom: 15px;
            display: block;
        }
        
        .benefit-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .benefit-description {
            color: #6c757d;
            font-size: 14px;
            line-height: 1.5;
        }
        
        .cta-section {
            text-align: center;
            margin-top: 30px;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(40, 167, 69, 0.4);
        }
        
        .unsubscribe-info {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 8px;
            padding: 20px;
            margin-top: 25px;
        }
        
        .unsubscribe-info h4 {
            color: #856404;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .unsubscribe-info p {
            color: #856404;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .footer {
            background-color: #2c3e50;
            color: white;
            padding: 30px 20px;
            text-align: center;
        }
        
        .footer h4 {
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .footer p {
            color: #bdc3c7;
            font-size: 14px;
            margin-bottom: 8px;
        }
        
        .social-links {
            margin-top: 20px;
        }
        
        .social-link {
            display: inline-block;
            margin: 0 10px;
            color: #bdc3c7;
            text-decoration: none;
            font-size: 16px;
            transition: color 0.3s ease;
        }
        
        .social-link:hover {
            color: #28a745;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 15px;
            }
            
            .header h1 {
                font-size: 28px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .benefits-grid {
                grid-template-columns: 1fr;
            }
            
            .info-row {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .info-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="welcome-icon">📧</div>
            <h1>Welcome to Our Newsletter!</h1>
            <p>You're now part of our exclusive community</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>🎉 You're Successfully Subscribed!</h2>
                <p>Thank you for subscribing to the Best Technologies Limited newsletter! You're now part of our exclusive community and will be the first to know about our latest updates, insights, and exciting developments.</p>
            </div>
            
            <div class="subscription-info">
                <h3>📋 Your Subscription Details</h3>
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value">${email}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Subscribed:</div>
                    <div class="info-value">${formatDate(new Date())}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Status:</div>
                    <div class="info-value">✅ Active</div>
                </div>
            </div>
            
            <div class="benefits-section">
                <h3>🎁 What You'll Receive</h3>
                <div class="benefits-grid">
                    <div class="benefit-card">
                        <span class="benefit-icon">📰</span>
                        <div class="benefit-title">Latest News</div>
                        <div class="benefit-description">Stay updated with our latest company news and announcements</div>
                    </div>
                    <div class="benefit-card">
                        <span class="benefit-icon">🚀</span>
                        <div class="benefit-title">Product Updates</div>
                        <div class="benefit-description">Be the first to know about new features and improvements</div>
                    </div>
                    <div class="benefit-card">
                        <span class="benefit-icon">💡</span>
                        <div class="benefit-title">Industry Insights</div>
                        <div class="benefit-description">Get valuable tips and insights from our experts</div>
                    </div>
                    <div class="benefit-card">
                        <span class="benefit-icon">🎯</span>
                        <div class="benefit-title">Exclusive Offers</div>
                        <div class="benefit-description">Access special promotions and discounts</div>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <a href="#" class="cta-button">🏠 Visit Our Website</a>
            </div>
            
            <div class="unsubscribe-info">
                <h4>🔔 Manage Your Subscription</h4>
                <p>• You can unsubscribe at any time by clicking the unsubscribe link in our emails</p>
                <p>• We respect your privacy and will never share your email with third parties</p>
                <p>• You can update your preferences anytime from your account settings</p>
            </div>
        </div>
        
        <div class="footer">
            <h4>Best Technologies Limited</h4>
            <p>Empowering businesses through innovative technology solutions</p>
            <p>📍 Oke-Ado, Molete, Ibadan, Oyo State, Nigeria</p>
            <p>📧 support@besttechnologies.com</p>
            <p>📞 +234 801 234 5678</p>
            
            <div class="social-links">
                <a href="https://web.facebook.com/btechltd/" class="social-link">📘 Facebook</a>
                <a href="https://x.com/besttech_ltd" class="social-link">🐦 X (Twitter)</a>
                <a href="https://www.instagram.com/besttechnologiesltd/" class="social-link">📷 Instagram</a>
            </div>
            
            <p style="margin-top: 20px; font-size: 12px; color: #95a5a6;">
                © 2025 Best Technologies Limited. All rights reserved.
            </p>
        </div>
    </div>
</body>
</html>`;
};
