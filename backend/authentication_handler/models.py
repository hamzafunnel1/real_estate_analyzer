from django.db import models
from django.contrib.auth.models import User
import os

def agent_headshot_path(instance, filename):
    """Generate upload path for agent headshots"""
    ext = filename.split('.')[-1]
    filename = f"agent_{instance.user.id}_headshot.{ext}"
    return os.path.join('agent_headshots', filename)

def company_logo_path(instance, filename):
    """Generate upload path for company logos"""
    ext = filename.split('.')[-1]
    filename = f"agent_{instance.user.id}_logo.{ext}"
    return os.path.join('company_logos', filename)

class AgentProfile(models.Model):
    """Extended profile for real estate agents"""
    
    # Link to Django User model
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='agent_profile')
    
    # Basic Professional Info
    phone = models.CharField(max_length=20, blank=True)
    company_name = models.CharField(max_length=200)
    license_number = models.CharField(max_length=50, blank=True)
    
    # Experience & Credibility
    years_experience = models.CharField(max_length=50, blank=True, help_text="Years of experience in real estate (e.g., '5 years', '10+ years')")
    
    awards = models.TextField(blank=True, help_text="Notable awards, certifications, or citations")
    
    specialty = models.CharField(max_length=100, blank=True, choices=[
        ('', 'Select specialty'),
        ('first_time_buyers', 'First-time Home Buyers'),
        ('luxury_homes', 'Luxury Homes'),
        ('investment_properties', 'Investment Properties'),
        ('downsizing', 'Downsizing/Senior Living'),
        ('new_construction', 'New Construction'),
        ('commercial', 'Commercial Real Estate'),
        ('rural_farm', 'Rural/Farm Properties'),
        ('foreclosures', 'Foreclosures/REO'),
        ('relocation', 'Relocation Services'),
        ('military_va', 'Military/VA Loans'),
    ])
    
    # Performance Statistics
    shortest_sale = models.CharField(max_length=100, blank=True, help_text="Shortest time to sell a listing (e.g., '7 days')")
    highest_sale = models.CharField(max_length=100, blank=True, help_text="Highest sale closed (e.g., '$2.5M')")
    avg_days_on_market = models.CharField(max_length=100, blank=True, help_text="Average days on market for listings")
    
    # Personal Brand & Philosophy
    mission = models.TextField(blank=True, help_text="Mission or 'Why' for doing real estate")
    value_proposition = models.TextField(blank=True, help_text="Unique value proposition")
    
    selling_style = models.CharField(max_length=50, blank=True, choices=[
        ('', 'Select selling style'),
        ('consultative', 'Consultative Approach'),
        ('aggressive_marketing', 'Aggressive Marketing'),
        ('white_glove', 'White-Glove Service'),
        ('data_driven', 'Data-Driven Strategy'),
        ('relationship_focused', 'Relationship-Focused'),
        ('technology_forward', 'Technology-Forward'),
        ('full_service', 'Full-Service Support'),
    ])
    
    testimonial_1 = models.TextField(blank=True, help_text="Client testimonial or success quote")
    testimonial_2 = models.TextField(blank=True, help_text="Second client testimonial or success quote")
    testimonial_3 = models.TextField(blank=True, help_text="Third client testimonial or success quote")
    
    # Community Involvement
    community_ties = models.TextField(blank=True, help_text="Neighborhood ties and community involvement")
    
    # Media Files
    headshot = models.ImageField(upload_to=agent_headshot_path, blank=True, null=True)
    logo = models.ImageField(upload_to=company_logo_path, blank=True, null=True)
    
    # Meta information
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    profile_completed = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Agent Profile"
        verbose_name_plural = "Agent Profiles"
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.company_name}"
    
    def get_specialty_display_name(self):
        """Get human-readable specialty name"""
        specialty_dict = dict(self._meta.get_field('specialty').choices)
        return specialty_dict.get(self.specialty, '')
    
    def get_selling_style_display_name(self):
        """Get human-readable selling style name"""
        style_dict = dict(self._meta.get_field('selling_style').choices)
        return style_dict.get(self.selling_style, '')
    
    def get_experience_display_name(self):
        """Get human-readable experience name"""
        return self.years_experience or ''
    
    def mark_profile_complete(self):
        """Mark profile as completed if essential fields are filled"""
        essential_fields = [
            self.company_name,
            self.user.first_name,
            self.user.last_name,
            self.user.email,
        ]
        
        # Check if at least one performance stat is provided
        has_performance_stat = any([
            self.shortest_sale,
            self.highest_sale,
            self.avg_days_on_market
        ])
        
        if all(essential_fields) and has_performance_stat:
            self.profile_completed = True
            self.save()
            return True
        return False


class PropertyAnalysis(models.Model):
    """Store property analysis results for users"""
    
    # Link to User who generated the analysis
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='property_analyses')
    
    # Property Information
    address = models.CharField(max_length=500, help_text="Property address")
    package_name = models.CharField(max_length=100, default='Professional')
    
    # Analysis Data
    analysis_content = models.TextField(help_text="HTML content of the analysis")
    analysis_model = models.CharField(max_length=50, default='sonar')
    agent_description = models.TextField(blank=True, null=True, help_text="Generated agent description")
    
    # Perplexity API Response (for reference)
    api_response = models.JSONField(help_text="Full API response from Perplexity")
    
    # Payment Information
    payment_intent_id = models.CharField(max_length=200, blank=True, null=True, 
                                        help_text="Stripe payment intent ID")
    
    # Meta information
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Property Analysis"
        verbose_name_plural = "Property Analyses"
        ordering = ['-created_at']  # Most recent first
    
    def __str__(self):
        return f"{self.address} - {self.user.get_full_name()} ({self.created_at.strftime('%Y-%m-%d')})"
    
    def get_short_address(self):
        """Get a shortened version of the address for display"""
        if len(self.address) > 50:
            return self.address[:50] + "..."
        return self.address


class PropertyAnalysisShare(models.Model):
    """Track property analysis shares and views"""
    
    # Link to the property analysis that was shared
    property_analysis = models.ForeignKey(PropertyAnalysis, on_delete=models.CASCADE, related_name='shares')
    
    # Who shared it
    shared_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='shared_analyses')
    shared_by_name = models.CharField(max_length=200, help_text="Full name of person who shared")
    
    # Who it was shared with
    recipient_email = models.EmailField(help_text="Email address of recipient")
    
    # Share details
    share_message = models.TextField(blank=True, help_text="Personal message included with share")
    share_link = models.URLField(help_text="Generated shareable link")
    
    # Tracking
    times_shared = models.PositiveIntegerField(default=1, help_text="Number of times shared to this email")
    times_viewed = models.PositiveIntegerField(default=0, help_text="Number of times viewed by this recipient")
    
    # Timestamps
    first_shared_at = models.DateTimeField(auto_now_add=True)
    last_shared_at = models.DateTimeField(auto_now=True)
    last_viewed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Property Analysis Share"
        verbose_name_plural = "Property Analysis Shares"
        ordering = ['-last_shared_at']
        unique_together = ['property_analysis', 'recipient_email']  # One record per analysis-email combo
    
    def __str__(self):
        return f"{self.property_analysis.address} shared with {self.recipient_email}"


class SharedAnalysisView(models.Model):
    """Track individual views of shared analyses"""
    
    # Link to the share record
    share = models.ForeignKey(PropertyAnalysisShare, on_delete=models.CASCADE, related_name='views')
    
    # View details
    viewed_at = models.DateTimeField(auto_now_add=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    
    class Meta:
        verbose_name = "Shared Analysis View"
        verbose_name_plural = "Shared Analysis Views"
        ordering = ['-viewed_at']
    
    def __str__(self):
        return f"View of {self.share.property_analysis.address} at {self.viewed_at}"
