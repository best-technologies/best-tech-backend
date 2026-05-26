import { CreateContactUsDto } from '../contact-us/dto/create-contact-us.dto';

export const contactUsSubmissionTemplate = (
  submissionData: CreateContactUsDto,
  submissionId: string,
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

  const formatBudget = (budget: string) => {
    return budget.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatTimeline = (timeline: string) => {
    return timeline.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const formatSubject = (subject: string) => {
    return subject.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Us Submission</title>
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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 25px;
        }
        
        .alert-box h3 {
            color: #856404;
            margin-bottom: 8px;
            font-size: 18px;
        }
        
        .alert-box p {
            color: #856404;
            font-size: 14px;
        }
        
        .submission-details {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 25px;
            margin-bottom: 25px;
        }
        
        .detail-row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
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
        
        .project-details {
            background-color: #e3f2fd;
            border-left: 4px solid #2196f3;
            padding: 20px;
            border-radius: 4px;
            margin-top: 20px;
        }
        
        .project-details h4 {
            color: #1976d2;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .project-details p {
            color: #424242;
            line-height: 1.6;
            font-size: 14px;
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
            background-color: #007bff;
            color: white;
        }
        
        .btn-primary:hover {
            background-color: #0056b3;
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
        
        .submission-id {
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
            <h1>🆕 New Contact Us Submission</h1>
            <p>A new project inquiry has been submitted</p>
        </div>
        
        <div class="content">
            <div class="alert-box">
                <h3>📋 Submission Received</h3>
                <p>A new contact us submission has been received and requires your attention. Please review the details below and take appropriate action.</p>
            </div>
            
            <div class="submission-details">
                <h3 style="margin-bottom: 20px; color: #495057; font-size: 18px;">📝 Submission Details</h3>
                
                <div class="detail-row">
                    <div class="detail-label">👤 Full Name:</div>
                    <div class="detail-value">${submissionData.fullName}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">📧 Email:</div>
                    <div class="detail-value">${submissionData.email}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">📞 Phone:</div>
                    <div class="detail-value">${submissionData.phoneNumber}</div>
                </div>
                
                ${
                  submissionData.companyName
                    ? `
                <div class="detail-row">
                    <div class="detail-label">🏢 Company:</div>
                    <div class="detail-value">${submissionData.companyName}</div>
                </div>
                `
                    : ''
                }
                
                <div class="detail-row">
                    <div class="detail-label">📋 Subject:</div>
                    <div class="detail-value">${formatSubject(submissionData.subject)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">💰 Budget:</div>
                    <div class="detail-value">${formatBudget(submissionData.proposedBudget)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">⏰ Timeline:</div>
                    <div class="detail-value">${formatTimeline(submissionData.projectTimeline)}</div>
                </div>
            </div>
            
            <div class="project-details">
                <h4>📋 Project Details</h4>
                <p>${submissionData.projectDetails}</p>
            </div>
            
            <div class="action-buttons">
                <a href="#" class="btn btn-primary">✅ Review Submission</a>
                <a href="#" class="btn btn-secondary">📞 Contact Client</a>
            </div>
        </div>
        
        <div class="footer">
            <p><strong>Best Technologies Limited</strong></p>
            <p>This is an automated notification. Please do not reply to this email.</p>
            <div class="submission-id">Submission ID: ${submissionId}</div>
            <p style="margin-top: 15px; font-size: 11px; color: #adb5bd;">
                Generated on ${formatDate(new Date())}
            </p>
        </div>
    </div>
</body>
</html>`;
};
