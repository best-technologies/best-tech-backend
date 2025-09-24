export interface BasicEmailTemplateData {
  subject: string;
  title: string;
  content: string;
  companyName?: string;
  companyLogo?: string;
  unsubscribeUrl?: string;
  footerText?: string;
}

export function basicEmailTemplate(data: BasicEmailTemplateData): string {
  const {
    subject,
    title,
    content,
    companyName = 'Best Technologies Limited',
    companyLogo,
    unsubscribeUrl,
    footerText = 'Thank you for choosing Best Technologies Limited',
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
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #007bff;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin-bottom: 15px;
        }
        .title {
            color: #007bff;
            font-size: 24px;
            margin: 0;
        }
        .content {
            margin: 20px 0;
            font-size: 16px;
        }
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 14px;
            color: #666;
        }
        .unsubscribe {
            margin-top: 15px;
        }
        .unsubscribe a {
            color: #007bff;
            text-decoration: none;
        }
        .unsubscribe a:hover {
            text-decoration: underline;
        }
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            .container {
                padding: 20px;
            }
            .title {
                font-size: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            ${companyLogo ? `<img src="${companyLogo}" alt="${companyName}" class="logo">` : ''}
            <h1 class="title">${title}</h1>
        </div>
        
        <div class="content">
            ${content}
        </div>
        
        <div class="footer">
            <p>${footerText}</p>
            <p><strong>${companyName}</strong></p>
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
