from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register, name='register'),
    path('login/', views.login, name='login'),
    path('refresh/', views.refresh_token, name='refresh-token'),
    path('profile/', views.profile, name='profile'),
    path('perplexity/', views.perplexity_proxy, name='perplexity-proxy'),
    path('notion/format/', views.notion_format, name='notion-format'),
    
    # Property Analysis endpoints
    path('analyses/save/', views.save_property_analysis, name='save-property-analysis'),
    path('analyses/recent/', views.get_recent_analyses, name='get-recent-analyses'),
    path('analyses/<int:analysis_id>/', views.get_property_analysis, name='get-property-analysis'),
    path('analyses/<int:analysis_id>/delete/', views.delete_property_analysis, name='delete-property-analysis'),
    path('analyses/<int:analysis_id>/update/', views.update_property_analysis, name='update-property-analysis'),
    
    # Payment endpoints
    path('payments/create-payment-intent/', views.create_payment_intent, name='create-payment-intent'),
    path('payments/webhook/', views.stripe_webhook, name='stripe-webhook'),
    path('payments/history/', views.get_payment_history, name='payment-history'),
    
    # Sharing endpoints
    path('share/', views.share_analysis, name='share-analysis'),
    path('share/stats/', views.get_share_stats, name='share-stats'),
    # Note: View tracking is now handled automatically in get_shared_analysis
    # path('share/track-view/', views.track_shared_view, name='track-shared-view'),
    path('shared/<str:share_id>/', views.get_shared_analysis, name='get-shared-analysis'),
    path('debug/shares/', views.debug_shares, name='debug-shares'),
    path('test-email/', views.test_email, name='test-email'),
    path('reset-share-stats/', views.reset_share_stats, name='reset-share-stats'),
    path('generate-agent-description/', views.generate_agent_description, name='generate-agent-description'),
] 