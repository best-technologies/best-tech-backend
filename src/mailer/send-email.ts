import { deliverEmail } from './email-delivery';
import { otpVerificationCodeTemplate } from './email.template';
import { contactUsSubmissionTemplate } from './contact-us-submission';
import { CreateContactUsDto } from '../contact-us/dto/create-contact-us.dto';
import { welcomeEmailTemplate } from './welcome-email';
import { contactUsUserConfirmationTemplate } from './contact-us-user-confirmation';
import {
  newsletterSubscriptionAdminTemplate,
  newsletterWelcomeTemplate,
} from './newsletter-subscription';
import { newsletterEmailTemplate } from './newsletter-template';

export const sendOTPByEmail = async (
  email: string,
  otp: string,
): Promise<void> => {
  try {
    const otpExpiresAt = '5 minutes';
    const htmlContent = otpVerificationCodeTemplate(email, otp, otpExpiresAt);

    await deliverEmail({
      to: email,
      fromName: 'Best Technologies LTD',
      subject: `Sign In Confirmation Code: ${otp}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending otp email:', error);
    throw new Error('Failed to send OTP email');
  }
};

export const sendContactUsNotification = async (
  adminEmails: string[],
  submissionData: CreateContactUsDto,
  submissionId: string,
): Promise<void> => {
  try {
    const htmlContent = contactUsSubmissionTemplate(
      submissionData,
      submissionId,
    );

    await deliverEmail({
      to: adminEmails,
      fromName: 'Best Technologies LTD - Contact Us',
      subject: `🆕 New Contact Us Submission - ${submissionData.fullName}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending contact us notification email:', error);
    throw new Error('Failed to send contact us notification email');
  }
};

export const sendContactUsUserConfirmation = async (
  userEmail: string,
  submissionData: CreateContactUsDto,
  submissionId: string,
): Promise<void> => {
  try {
    const htmlContent = contactUsUserConfirmationTemplate(
      submissionData,
      submissionId,
    );

    await deliverEmail({
      to: userEmail,
      fromName: 'Best Technologies LTD - Support',
      subject: `✅ We Received Your Message — Reference ${submissionId}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending contact us user confirmation email:', error);
    throw new Error('Failed to send contact us user confirmation email');
  }
};

export const sendWelcomeEmail = async (
  email: string,
  firstName: string,
  lastName: string,
): Promise<void> => {
  try {
    const htmlContent = welcomeEmailTemplate(firstName, lastName, email);

    await deliverEmail({
      to: email,
      fromName: 'Best Technologies Limited',
      subject: `🎉 Welcome to Best Technologies Limited, ${firstName}!`,
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending welcome email:', error);
    throw new Error('Failed to send welcome email');
  }
};

export const sendNewsletterSubscriptionAdminNotification = async (
  adminEmails: string[],
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
): Promise<void> => {
  try {
    const htmlContent = newsletterSubscriptionAdminTemplate(
      subscriberEmail,
      subscriptionId,
      stats,
    );

    await deliverEmail({
      to: adminEmails,
      fromName: 'Best Technologies Limited - Newsletter',
      subject: `📧 New Newsletter Subscription - ${subscriberEmail}`,
      html: htmlContent,
    });
  } catch (error) {
    console.error(
      'Error sending newsletter subscription admin notification:',
      error,
    );
    throw new Error(
      'Failed to send newsletter subscription admin notification',
    );
  }
};

export const sendNewsletterWelcomeEmail = async (
  email: string,
): Promise<void> => {
  try {
    const htmlContent = newsletterWelcomeTemplate(email);

    await deliverEmail({
      to: email,
      fromName: 'Best Technologies Limited',
      subject: '🎉 Welcome to Our Newsletter!',
      html: htmlContent,
    });
  } catch (error) {
    console.error('Error sending newsletter welcome email:', error);
    throw new Error('Failed to send newsletter welcome email');
  }
};

interface NewsletterImage {
  publicId: string;
  secureUrl: string;
  alt?: string;
  caption?: string;
  order?: number;
}

export const sendNewsletterToSubscribers = async (
  subject: string,
  title: string,
  subtitle: string | null,
  body: string,
  images: NewsletterImage[] | null,
  subscriberEmails: string[],
  unsubscribeBaseUrl: string = 'http://localhost:3000/newsletter/unsubscribe',
): Promise<{ sent: number; failed: number }> => {
  let sentCount = 0;
  let failedCount = 0;

  for (const email of subscriberEmails) {
    try {
      const unsubscribeUrl = `${unsubscribeBaseUrl}?email=${encodeURIComponent(email)}`;
      const htmlContent = newsletterEmailTemplate(
        subject,
        title,
        subtitle,
        body,
        images,
        unsubscribeUrl,
      );

      await deliverEmail({
        to: email,
        fromName: 'Best Technologies Limited',
        subject,
        html: htmlContent,
      });

      sentCount++;
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error sending newsletter to ${email}:`, error);
      failedCount++;
    }
  }

  return { sent: sentCount, failed: failedCount };
};
