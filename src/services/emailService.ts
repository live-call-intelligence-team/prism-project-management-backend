import nodemailer from 'nodemailer';

interface EmailOptions {
    to: string;
    subject: string;
    template: string;
    context: Record<string, any>;
}

class EmailServiceClass {
    private transporter: any;

    constructor() {
        // Configure transporter based on environment
        if (process.env.EMAIL_SERVICE === 'smtp') {
            this.transporter = nodemailer.createTransport({
                host: process.env.SMTP_HOST || 'smtp.gmail.com',
                port: parseInt(process.env.SMTP_PORT || '587'),
                secure: process.env.SMTP_SECURE === 'true',
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
            });
        } else {
            // Mock transporter for development
            console.log('Email service not configured - using mock mode');
            this.transporter = {
                sendMail: async (options: any) => {
                    console.log('📧 Mock Email Sent:', options.subject);
                    console.log('To:', options.to);
                    return { messageId: 'mock-' + Date.now() };
                },
            };
        }
    }

    async sendNotificationEmail(options: EmailOptions): Promise<void> {
        const { to, subject, template, context } = options;

        const html = this.getTemplate(template, context);

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'Project Management <noreply@example.com>',
                to,
                subject,
                html,
            });
        } catch (error) {
            console.error('Failed to send email:', error);
            // Don't throw - email failures shouldn't break the app
        }
    }

    private getTemplate(templateName: string, context: Record<string, any>): string {
        switch (templateName) {
            case 'task-approval-requested':
                return this.taskApprovalRequestedTemplate(context);
            case 'client-approval-decision':
                return this.clientApprovalDecisionTemplate(context);
            case 'milestone-completed':
                return this.milestoneCompletedTemplate(context);
            case 'notification':
            default:
                return this.genericNotificationTemplate(context);
        }
    }

    private taskApprovalRequestedTemplate(context: Record<string, any>): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Approval Requested</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔔 Approval Requested</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi ${context.userName},</p>
                            
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                                ${context.requestedBy} has requested your approval for a task:
                            </p>
                            
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 10px; font-weight: bold; color: #667eea;">${context.taskKey}</p>
                                <p style="margin: 0; font-size: 18px; color: #333;">${context.taskTitle}</p>
                                <p style="margin: 10px 0 0; font-size: 14px; color: #666;">Project: ${context.projectName}</p>
                            </div>
                            
                            <p style="font-size: 16px; color: #333; margin: 20px 0;">
                                Please log in to review and provide your decision.
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard" 
                                   style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    Review Task
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                This is an automated notification from your Project Management System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    private clientApprovalDecisionTemplate(context: Record<string, any>): string {
        const statusColors: Record<string, string> = {
            APPROVED: '#28a745',
            REJECTED: '#dc3545',
            CHANGES_REQUESTED: '#ffc107',
        };

        const statusText: Record<string, string> = {
            APPROVED: '✅ Approved',
            REJECTED: '❌ Rejected',
            CHANGES_REQUESTED: '💬 Changes Requested',
        };

        const color = statusColors[context.status] || '#667eea';
        const status = statusText[context.status] || context.status;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Client Decision</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background-color: ${color}; padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${status}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi ${context.userName},</p>
                            
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                                ${context.clientName} has reviewed and ${context.status === 'APPROVED' ? 'approved' : context.status === 'REJECTED' ? 'rejected' : 'requested changes for'} the following task:
                            </p>
                            
                            <div style="background-color: #f8f9fa; border-left: 4px solid ${color}; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 10px; font-weight: bold; color: ${color};">${context.taskKey}</p>
                                <p style="margin: 0; font-size: 18px; color: #333;">${context.taskTitle}</p>
                            </div>
                            
                            ${context.feedback ? `
                            <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 5px; font-weight: bold; color: #856404; font-size: 14px;">Client Feedback:</p>
                                <p style="margin: 0; color: #856404; font-style: italic;">"${context.feedback}"</p>
                            </div>
                            ` : ''}
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/issues/${context.taskKey}" 
                                   style="display: inline-block; padding: 14px 30px; background-color: ${color}; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    View Task
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                This is an automated notification from your Project Management System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    private milestoneCompletedTemplate(context: Record<string, any>): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Milestone Completed</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎯 Milestone Achieved!</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi ${context.userName},</p>
                            
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                                Great news! A milestone has been completed:
                            </p>
                            
                            <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0; font-size: 20px; color: #155724; font-weight: bold;">${context.milestoneName}</p>
                                <p style="margin: 10px 0 0; font-size: 14px; color: #155724;">Project: ${context.projectName}</p>
                                <p style="margin: 10px 0 0; font-size: 14px; color: #155724;">Completed by: ${context.completedBy}</p>
                            </div>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard" 
                                   style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    View Project
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                This is an automated notification from your Project Management System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    private genericNotificationTemplate(context: Record<string, any>): string {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${context.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">${context.title}</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi ${context.userName},</p>
                            
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px; white-space: pre-wrap;">
                                ${context.message}
                            </p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/client/dashboard" 
                                   style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    Go to Dashboard
                                </a>
                            </div>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                This is an automated notification from your Project Management System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        `;
    }

    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'Project Management <noreply@example.com>',
                to: email,
                subject: 'Welcome to Project Management System',
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Welcome to Project Management!</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi ${name},</p>
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                                Welcome to our Project Management System! Your account has been created successfully.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" 
                                   style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    Login to Your Account
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                This is an automated email from your Project Management System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                `,
            });
        } catch (error) {
            console.error('Failed to send welcome email:', error);
        }
    }

    async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'Project Management <noreply@example.com>',
                to: email,
                subject: 'Password Reset Request',
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔐 Password Reset</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi there,</p>
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                                We received a request to reset your password. Click the button below to create a new password:
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${resetUrl}" 
                                   style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    Reset Password
                                </a>
                            </div>
                            <p style="font-size: 14px; color: #666; margin: 20px 0;">
                                Or copy and paste this link into your browser:<br>
                                <a href="${resetUrl}" style="color: #667eea; word-break: break-all;">${resetUrl}</a>
                            </p>
                            <p style="font-size: 14px; color: #666; margin: 20px 0;">
                                This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                This is an automated email from your Project Management System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                `,
            });
        } catch (error) {
            console.error('Failed to send password reset email:', error);
        }
    }

    async sendIssueAssignmentEmail(to: string, userName: string, issueKey: string, issueTitle: string, assignedBy: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'Project Management <noreply@example.com>',
                to,
                subject: `You've been assigned to ${issueKey}`,
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Assignment</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">📋 New Task Assignment</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi ${userName},</p>
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                                ${assignedBy} has assigned you to a new task:
                            </p>
                            <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 4px;">
                                <p style="margin: 0 0 10px; font-weight: bold; color: #667eea;">${issueKey}</p>
                                <p style="margin: 0; font-size: 18px; color: #333;">${issueTitle}</p>
                            </div>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/issues/${issueKey}" 
                                   style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    View Task
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                This is an automated notification from your Project Management System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                `,
            });
        } catch (error) {
            console.error('Failed to send issue assignment email:', error);
        }
    }

    async sendMentionEmail(to: string, userName: string, issueKey: string, mentionedBy: string): Promise<void> {
        try {
            await this.transporter.sendMail({
                from: process.env.EMAIL_FROM || 'Project Management <noreply@example.com>',
                to,
                subject: `You were mentioned in ${issueKey}`,
                html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Mention</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <tr>
                        <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center;">
                            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">💬 You were mentioned</h1>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">Hi ${userName},</p>
                            <p style="font-size: 16px; color: #333; margin: 0 0 20px;">
                                ${mentionedBy} mentioned you in a comment on <strong>${issueKey}</strong>.
                            </p>
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/issues/${issueKey}" 
                                   style="display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
                                    View Comment
                                </a>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0; font-size: 12px; color: #6c757d;">
                                This is an automated notification from your Project Management System.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
                `,
            });
        } catch (error) {
            console.error('Failed to send mention email:', error);
        }
    }
}

export const EmailService = new EmailServiceClass();


