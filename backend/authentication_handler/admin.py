from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import AgentProfile

class AgentProfileInline(admin.StackedInline):
    """Inline admin for AgentProfile to show with User"""
    model = AgentProfile
    can_delete = False
    verbose_name_plural = 'Agent Profile'
    fields = (
        ('phone', 'company_name', 'license_number'),
        ('years_experience', 'specialty'),
        ('awards',),
        ('shortest_sale', 'highest_sale', 'avg_days_on_market'),
        ('mission',),
        ('value_proposition',),
        ('selling_style',),
        ('testimonial_1',),
        ('testimonial_2',),
        ('community_ties',),
        ('headshot', 'logo'),
        ('profile_completed',),
    )

class CustomUserAdmin(UserAdmin):
    """Custom User admin with AgentProfile inline"""
    inlines = (AgentProfileInline,)

@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    """Admin interface for AgentProfile"""
    list_display = (
        'get_full_name',
        'company_name',
        'license_number',
        'specialty_display',
        'years_experience_display',
        'profile_completed',
        'created_at',
    )
    
    list_filter = (
        'profile_completed',
        'specialty',
        'years_experience',
        'selling_style',
        'created_at',
    )
    
    search_fields = (
        'user__first_name',
        'user__last_name',
        'user__email',
        'company_name',
        'license_number',
    )
    
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user',)
        }),
        ('Basic Professional Info', {
            'fields': ('phone', 'company_name', 'license_number')
        }),
        ('Experience & Credibility', {
            'fields': (
                'years_experience',
                'specialty',
                'awards',
                ('shortest_sale', 'highest_sale', 'avg_days_on_market'),
            ),
            'classes': ('collapse',),
        }),
        ('Personal Brand & Philosophy', {
            'fields': (
                'mission',
                'value_proposition',
                'selling_style',
                'testimonial_1',
                'testimonial_2',
            ),
            'classes': ('collapse',),
        }),
        ('Community & Media', {
            'fields': (
                'community_ties',
                'headshot',
                'logo',
            ),
            'classes': ('collapse',),
        }),
        ('Profile Status', {
            'fields': ('profile_completed', 'created_at', 'updated_at'),
        }),
    )
    
    def get_full_name(self, obj):
        """Get the full name of the user"""
        return obj.user.get_full_name() or obj.user.username
    get_full_name.short_description = 'Agent Name'
    
    def specialty_display(self, obj):
        """Get human-readable specialty"""
        return obj.get_specialty_display_name() or 'Not specified'
    specialty_display.short_description = 'Specialty'
    
    def years_experience_display(self, obj):
        """Get human-readable experience"""
        return obj.get_experience_display_name() or 'Not specified'
    years_experience_display.short_description = 'Experience'

# Unregister the default User admin and register our custom one
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)
