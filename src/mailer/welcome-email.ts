export const welcomeEmailTemplate = (
  firstName: string,
  lastName: string,
  email: string,
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
    <title>Welcome to Best Technologies Limited</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
        
        .user-info {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            padding: 25px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        
        .user-info h3 {
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
        
        .features-section {
            margin-bottom: 30px;
        }
        
        .features-section h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 20px;
            text-align: center;
        }
        
        .features-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
        }
        
        .feature-card {
            background: #ffffff;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .feature-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .feature-icon {
            font-size: 32px;
            margin-bottom: 15px;
            display: block;
        }
        
        .feature-title {
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 8px;
            font-size: 16px;
        }
        
        .feature-description {
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: 600;
            font-size: 16px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
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
            color: #667eea;
        }
        
        .account-info {
            background-color: #e8f4fd;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 20px;
            margin-top: 25px;
        }
        
        .account-info h4 {
            color: #0c5460;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .account-info p {
            color: #0c5460;
            font-size: 14px;
            margin-bottom: 5px;
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
            
            .features-grid {
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
            <div class="welcome-icon">🎉</div>
            <h1>Welcome to Best Technologies Limited!</h1>
            <p>Your journey with us begins now</p>
        </div>
        
        <div class="content">
            <div class="welcome-message">
                <h2>Hello ${firstName} ${lastName}! 👋</h2>
                <p>Welcome to Best Technologies Limited! We're thrilled to have you join our community of innovators and technology enthusiasts. Your account has been successfully created and you're now ready to explore all the amazing features we have to offer.</p>
            </div>
            
            <div class="user-info">
                <h3>📋 Your Account Information</h3>
                <div class="info-row">
                    <div class="info-label">Name:</div>
                    <div class="info-value">${firstName} ${lastName}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value">${email}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Joined:</div>
                    <div class="info-value">${formatDate(new Date())}</div>
                </div>
            </div>
            
            <div class="features-section">
                <h3>🚀 What You Can Do</h3>
                <div class="features-grid">
                    <div class="feature-card">
                        <span class="feature-icon">💼</span>
                        <div class="feature-title">Manage Services</div>
                        <div class="feature-description">Create and manage your professional services with ease</div>
                    </div>
                    <div class="feature-card">
                        <span class="feature-icon">📊</span>
                        <div class="feature-title">Track Analytics</div>
                        <div class="feature-description">Monitor your performance and growth metrics</div>
                    </div>
                    <div class="feature-card">
                        <span class="feature-icon">🤝</span>
                        <div class="feature-title">Connect</div>
                        <div class="feature-description">Build relationships with clients and partners</div>
                    </div>
                    <div class="feature-card">
                        <span class="feature-icon">📱</span>
                        <div class="feature-title">Stay Updated</div>
                        <div class="feature-description">Receive notifications about important updates</div>
                    </div>
                </div>
            </div>
            
            <div class="cta-section">
                <a href="#" class="cta-button">🚀 Get Started Now</a>
            </div>
            
            <div class="account-info">
                <h4>🔐 Account Security</h4>
                <p>• Your account is protected with industry-standard security</p>
                <p>• You can change your password anytime from your profile settings</p>
                <p>• Enable two-factor authentication for enhanced security</p>
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
