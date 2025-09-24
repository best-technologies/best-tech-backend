export interface MarketingEmailTemplateData {
  subject: string;
  title: string;
  subtitle?: string;
  content: string;
  ctaText?: string;
  ctaUrl?: string;
  companyName?: string;
  companyLogo?: string;
  unsubscribeUrl?: string;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
  };
}

export function marketingEmailTemplate(data: MarketingEmailTemplateData): string {
  const {
    subject,
    title,
    subtitle,
    content,
    ctaText = 'Learn More',
    ctaUrl,
    companyName = 'Best Technologies Limited',
    companyLogo,
    unsubscribeUrl,
    socialLinks = {},
  } = data;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .container {
            background-color: #ffffff;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .header {
            background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 20px;
        }
        .title {
            font-size: 28px;
            margin: 0 0 10px 0;
            font-weight: bold;
        }
        .subtitle {
            font-size: 16px;
            margin: 0;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
            font-size: 16px;
        }
        .cta {
            text-align: center;
            margin: 30px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
            transition: transform 0.3s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #eee;
        }
        .social-links {
            margin: 20px 0;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #007bff;
            text-decoration: none;
            font-size: 18px;
        }
        .social-links a:hover {
            color: #0056b3;
        }
        .unsubscribe {
            margin-top: 15px;
            font-size: 12px;
            color: #666;
        }
        .unsubscribe a {
            color: #007bff;
            text-decoration: none;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .title {
                font-size: 24px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
            <h1 class="title">${title}</h1>
            ${subtitle ? `<p class="subtitle">${subtitle}</p>` : ''}
        </div>
        
        <div class="content">
            ${content}
            
            ${ctaUrl ? `
                <div class="cta">
                    <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
                </div>
            ` : ''}
        </div>
        
        <div class="footer">
            <p><strong>${companyName}</strong></p>
            <p>Thank you for choosing us!</p>
            
            ${Object.keys(socialLinks).length > 0 ? `
                <div class="social-links">
                    ${socialLinks.facebook ? `<a href="${socialLinks.facebook}">📘</a>` : ''}
                    ${socialLinks.twitter ? `<a href="${socialLinks.twitter}">🐦</a>` : ''}
                    ${socialLinks.linkedin ? `<a href="${socialLinks.linkedin}">💼</a>` : ''}
                    ${socialLinks.instagram ? `<a href="${socialLinks.instagram}">📷</a>` : ''}
                </div>
            ` : ''}
            
            ${unsubscribeUrl ? `
                <div class="unsubscribe">
                    <p><a href="${unsubscribeUrl}">Unsubscribe</a> from these emails</p>
                </div>
            ` : ''}
        </div>
    </div>
</body>
</html>
  `.trim();
}
