from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

def send_property_analysis_email(share_data):
    """
    Send property analysis email to recipient
    
    Args:
        share_data (dict): Contains recipient_email, property_address, 
                          analysis_content, share_message, shared_by
    """
    try:
        recipient_email = share_data.get('email')
        property_address = share_data.get('propertyAddress')
        analysis_content = share_data.get('analysisContent')
        share_message = share_data.get('shareMessage')
        shared_by = share_data.get('sharedBy')
        share_link = share_data.get('shareLink')
        
        # Skip if this is a link-share (not actual email)
        if recipient_email == 'link-share':
            return True
            
        # Email subject
        subject = f"Property Analysis: {property_address}"
        
        # Create HTML content
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Property Analysis</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }}
                .message {{
                    background: #e3f2fd;
                    padding: 15px;
                    border-left: 4px solid #2196f3;
                    margin-bottom: 20px;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(90deg, #0066CC 0%, #00C4FF 100%);
                    color: white !important;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }}
                .analysis-preview {{
                    background: white;
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid #ddd;
                    margin: 15px 0;
                    max-height: 300px;
                    overflow-y: auto;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🏠 Property Analysis Report</h1>
            </div>
            
            <div class="content">
                <h2>{property_address}</h2>
                
                <div class="message">
                    <strong>Message from {shared_by}:</strong><br>
                    {share_message}
                </div>
                
                <p>Below is a preview of the property analysis. Click the button below to view the full report online.</p>
                
                <div class="analysis-preview">
                    {analysis_content[:500]}{'...' if len(analysis_content) > 500 else ''}
                </div>
                
                <a href="{share_link}" class="cta-button">View Full Analysis Report</a>
                
                <p><small>This link will take you to the complete property analysis with detailed insights and recommendations.</small></p>
            </div>
            
            <div class="footer">
                <p>This email was sent from the Real Estate Analysis Platform</p>
                <p>If you have any questions, please contact {shared_by}</p>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version
        text_content = strip_tags(html_content)
        
        # Create email
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[recipient_email]
        )
        
        email.attach_alternative(html_content, "text/html")
        
        # Send email
        email.send()
        
        logger.info(f"Property analysis email sent successfully to {recipient_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send property analysis email: {str(e)}")
        return False

def send_welcome_email(user_email, user_name):
    """
    Send welcome email to new users
    
    Args:
        user_email (str): User's email address
        user_name (str): User's name
    """
    try:
        subject = "Welcome to Real Estate Analysis Platform"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
            <style>
                body {{
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                }}
                .header {{
                    background: linear-gradient(90deg, #5B3DFF 0%, #00C4FF 100%);
                    color: white;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                    text-align: center;
                }}
                .content {{
                    background: #f9f9f9;
                    padding: 20px;
                    border-radius: 10px;
                    margin-bottom: 20px;
                }}
                .cta-button {{
                    display: inline-block;
                    background: linear-gradient(90deg, #0066CC 0%, #00C4FF 100%);
                    color: white !important;
                    padding: 12px 24px;
                    text-decoration: none;
                    border-radius: 6px;
                    font-weight: bold;
                    margin: 10px 0;
                }}
                .footer {{
                    text-align: center;
                    color: #666;
                    font-size: 12px;
                    margin-top: 30px;
                    padding-top: 20px;
                    border-top: 1px solid #eee;
                }}
            </style>
        </head>
        <body>
            <div class="header">
                <h1>🎉 Welcome to Real Estate Analysis Platform!</h1>
            </div>
            
            <div class="content">
                <h2>Hello {user_name},</h2>
                
                <p>Thank you for joining our Real Estate Analysis Platform! We're excited to help you create comprehensive property analysis reports.</p>
                
                <h3>What you can do:</h3>
                <ul>
                    <li>Generate detailed property analysis reports</li>
                    <li>Share reports with clients and colleagues</li>
                    <li>Track market insights and trends</li>
                    <li>Download reports as PDF</li>
                </ul>
                
                <a href="https://your-app-url.com" class="cta-button">Get Started</a>
                
                <p>If you have any questions or need assistance, don't hesitate to reach out to our support team.</p>
            </div>
            
            <div class="footer">
                <p>Real Estate Analysis Platform</p>
                <p>© 2024 All rights reserved</p>
            </div>
        </body>
        </html>
        """
        
        text_content = strip_tags(html_content)
        
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_content,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[user_email]
        )
        
        email.attach_alternative(html_content, "text/html")
        email.send()
        
        logger.info(f"Welcome email sent successfully to {user_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send welcome email: {str(e)}")
        return False 