interface NewsletterImage {
  publicId: string;
  secureUrl: string;
  alt?: string;
  caption?: string;
  order?: number;
}

export const newsletterEmailTemplate = (
  subject: string,
  title: string,
  subtitle: string | null,
  body: string,
  images: NewsletterImage[] | null,
  unsubscribeUrl: string,
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
    <title>${subject}</title>
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
            padding: 40px 30px;
            text-align: center;
            position: relative;
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
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            font-size: 16px;
            opacity: 0.95;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .newsletter-images {
            margin-bottom: 30px;
        }
        
        .newsletter-image {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .newsletter-image img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .image-caption {
            margin-top: 8px;
            font-size: 14px;
            color: #6c757d;
            font-style: italic;
        }
        
        .newsletter-title {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .newsletter-title h2 {
            color: #2c3e50;
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .newsletter-subtitle {
            text-align: center;
            margin-bottom: 30px;
        }
        
        .newsletter-subtitle p {
            color: #6c757d;
            font-size: 16px;
            font-style: italic;
        }
        
        .newsletter-body {
            color: #333;
            font-size: 16px;
            line-height: 1.7;
            margin-bottom: 30px;
        }
        
        .newsletter-body h1, .newsletter-body h2, .newsletter-body h3 {
            color: #2c3e50;
            margin-bottom: 15px;
        }
        
        .newsletter-body p {
            margin-bottom: 15px;
        }
        
        .newsletter-body ul, .newsletter-body ol {
            margin-bottom: 15px;
            padding-left: 20px;
        }
        
        .newsletter-body li {
            margin-bottom: 5px;
        }
        
        .newsletter-body a {
            color: #667eea;
            text-decoration: none;
        }
        
        .newsletter-body a:hover {
            text-decoration: underline;
        }
        
        .cta-section {
            text-align: center;
            margin: 30px 0;
            padding: 25px;
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 10px;
            border-left: 4px solid #667eea;
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
        
        .unsubscribe-section {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .unsubscribe-link {
            color: #6c757d;
            text-decoration: none;
            font-size: 12px;
        }
        
        .unsubscribe-link:hover {
            text-decoration: underline;
        }
        
        @media (max-width: 600px) {
            .container {
                margin: 10px;
                border-radius: 8px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .newsletter-title h2 {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📧 Best Technologies Newsletter</h1>
            <p>${formatDate(new Date())}</p>
        </div>
        
        <div class="content">
            ${
              images && images.length > 0
                ? `
            <div class="newsletter-images">
                ${images
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map(
                    (image) => `
                    <div class="newsletter-image">
                        <img src="${image.secureUrl}" alt="${image.alt || 'Newsletter Image'}" />
                        ${image.caption ? `<p class="image-caption">${image.caption}</p>` : ''}
                    </div>
                  `,
                  )
                  .join('')}
            </div>
            `
                : ''
            }
            
            <div class="newsletter-title">
                <h2>${title}</h2>
            </div>
            
            ${
              subtitle
                ? `
            <div class="newsletter-subtitle">
                <p>${subtitle}</p>
            </div>
            `
                : ''
            }
            
            <div class="newsletter-body">
                ${body}
            </div>
            
            <div class="cta-section">
                <a href="#" class="cta-button">🚀 Learn More</a>
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
        
        <div class="unsubscribe-section">
            <a href="${unsubscribeUrl}" class="unsubscribe-link">
                📧 Unsubscribe from this newsletter
            </a>
        </div>
    </div>
</body>
</html>`;
};
