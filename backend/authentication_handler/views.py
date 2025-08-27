from django.shortcuts import render
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from .models import AgentProfile, PropertyAnalysis, PropertyAnalysisShare, SharedAnalysisView
import json
import os
import requests
import stripe
import logging

logger = logging.getLogger(__name__)

# Configure Stripe
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

# Create your views here.

@api_view(['POST'])
def register(request):
    """Enhanced registration with complete agent profile"""
    
    # Extract user data
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    
    # Extract profile data
    phone = request.data.get('phone', '')
    company_name = request.data.get('company_name', '')
    license_number = request.data.get('license_number', '')
    years_experience = request.data.get('years_experience', '')
    awards = request.data.get('awards', '')
    specialty = request.data.get('specialty', '')
    shortest_sale = request.data.get('shortest_sale', '')
    highest_sale = request.data.get('highest_sale', '')
    avg_days_on_market = request.data.get('avg_days_on_market', '')
    mission = request.data.get('mission', '')
    value_proposition = request.data.get('value_proposition', '')
    selling_style = request.data.get('selling_style', '')
    testimonial_1 = request.data.get('testimonial_1', '')
    testimonial_2 = request.data.get('testimonial_2', '')
    testimonial_3 = request.data.get('testimonial_3', '')
    community_ties = request.data.get('community_ties', '')
    
    # Extract files
    headshot = request.FILES.get('headshot')
    logo = request.FILES.get('logo')
    
    # Basic validation
    if not username or not email or not password:
        return Response({'error': 'Username, email, and password are required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if not company_name or not company_name.strip():
        return Response({'error': 'Company/Brokerage name is required.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        # Create user
        user = User.objects.create_user(
            username=username, 
            email=email, 
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Create agent profile
        agent_profile = AgentProfile.objects.create(
            user=user,
            phone=phone,
            company_name=company_name,
            license_number=license_number,
            years_experience=years_experience,
            awards=awards,
            specialty=specialty,
            shortest_sale=shortest_sale,
            highest_sale=highest_sale,
            avg_days_on_market=avg_days_on_market,
            mission=mission,
            value_proposition=value_proposition,
            selling_style=selling_style,
            testimonial_1=testimonial_1,
            testimonial_2=testimonial_2,
            testimonial_3=testimonial_3,
            community_ties=community_ties,
            headshot=headshot,
            logo=logo
        )
        
        # Mark profile as complete if essential fields are filled
        agent_profile.mark_profile_complete()
        
        # Send welcome email
        try:
            from .email_utils import send_welcome_email
            user_name = f"{user.first_name} {user.last_name}".strip() or user.username
            send_welcome_email(user.email, user_name)
        except Exception as e:
            logger.warning(f"Failed to send welcome email: {str(e)}")
        
        # Generate tokens for automatic login after registration
        refresh = RefreshToken.for_user(user)
        
        # Prepare response data with complete profile
        profile_data = {
            'companyName': agent_profile.company_name,
            'licenseNumber': agent_profile.license_number,
            'phone': agent_profile.phone,
            'yearsExperience': agent_profile.years_experience,
            'yearsExperienceDisplay': agent_profile.get_experience_display_name(),
            'awards': agent_profile.awards,
            'specialty': agent_profile.specialty,
            'specialtyDisplay': agent_profile.get_specialty_display_name(),
            'shortestSale': agent_profile.shortest_sale,
            'highestSale': agent_profile.highest_sale,
            'avgDaysOnMarket': agent_profile.avg_days_on_market,
            'mission': agent_profile.mission,
            'valueProposition': agent_profile.value_proposition,
            'sellingStyle': agent_profile.selling_style,
            'sellingStyleDisplay': agent_profile.get_selling_style_display_name(),
            'testimonial1': agent_profile.testimonial_1,
            'testimonial2': agent_profile.testimonial_2,
            'testimonial3': agent_profile.testimonial_3,
            'communityTies': agent_profile.community_ties,
            'headshot': agent_profile.headshot.url if agent_profile.headshot else None,
            'logo': agent_profile.logo.url if agent_profile.logo else None,
            'profileCompleted': agent_profile.profile_completed,
            'createdAt': agent_profile.created_at.isoformat(),
        }
        
        return Response({
            'message': 'User registered successfully.',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile': profile_data
            }
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        # Clean up if profile creation fails
        if 'user' in locals():
            user.delete()
        return Response({
            'error': f'Registration failed: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def login(request):
    """Enhanced login with profile data"""
    username = request.data.get('username')
    password = request.data.get('password')
    user = authenticate(username=username, password=password)
    
    if user is not None:
        refresh = RefreshToken.for_user(user)
        
        # Get agent profile; do not auto-create anymore. Profile creation is enforced at registration.
        try:
            agent_profile = AgentProfile.objects.get(user=user)
        except AgentProfile.DoesNotExist:
            # Commented out: auto-creation of profile with default company name is no longer allowed.
            # agent_profile, created = AgentProfile.objects.get_or_create(
            #     user=user,
            #     defaults={'company_name': 'Default Company'}
            # )
            return Response({'error': 'Profile not found. Please contact support.'}, status=status.HTTP_404_NOT_FOUND)
        
        # Prepare profile data
        profile_data = {
            'companyName': agent_profile.company_name,
            'licenseNumber': agent_profile.license_number,
            'phone': agent_profile.phone,
            'yearsExperience': agent_profile.years_experience,
            'yearsExperienceDisplay': agent_profile.get_experience_display_name(),
            'awards': agent_profile.awards,
            'specialty': agent_profile.specialty,
            'specialtyDisplay': agent_profile.get_specialty_display_name(),
            'shortestSale': agent_profile.shortest_sale,
            'highestSale': agent_profile.highest_sale,
            'avgDaysOnMarket': agent_profile.avg_days_on_market,
            'mission': agent_profile.mission,
            'valueProposition': agent_profile.value_proposition,
            'sellingStyle': agent_profile.selling_style,
            'sellingStyleDisplay': agent_profile.get_selling_style_display_name(),
            'testimonial1': agent_profile.testimonial_1,
            'testimonial2': agent_profile.testimonial_2,
            'testimonial3': agent_profile.testimonial_3,
            'communityTies': agent_profile.community_ties,
            'headshot': agent_profile.headshot.url if agent_profile.headshot else None,
            'logo': agent_profile.logo.url if agent_profile.logo else None,
            'profileCompleted': agent_profile.profile_completed,
        }
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile': profile_data
            }
        })
    else:
        return Response({'error': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def profile(request):
    """Get or update agent profile"""
    
    try:
        agent_profile = request.user.agent_profile
    except AgentProfile.DoesNotExist:
        if request.method == 'GET':
            return Response({'error': 'Profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Create profile if updating
        # agent_profile = AgentProfile.objects.create(
        #     user=request.user,
        #     company_name=request.data.get('company_name', 'Default Company')
        # )

    if request.method == 'GET':
        # Return current profile data
        profile_data = {
            'companyName': agent_profile.company_name,
            'licenseNumber': agent_profile.license_number,
            'phone': agent_profile.phone,
            'yearsExperience': agent_profile.years_experience,
            'yearsExperienceDisplay': agent_profile.get_experience_display_name(),
            'awards': agent_profile.awards,
            'specialty': agent_profile.specialty,
            'specialtyDisplay': agent_profile.get_specialty_display_name(),
            'shortestSale': agent_profile.shortest_sale,
            'highestSale': agent_profile.highest_sale,
            'avgDaysOnMarket': agent_profile.avg_days_on_market,
            'mission': agent_profile.mission,
            'valueProposition': agent_profile.value_proposition,
            'sellingStyle': agent_profile.selling_style,
            'sellingStyleDisplay': agent_profile.get_selling_style_display_name(),
            'testimonial1': agent_profile.testimonial_1,
            'testimonial2': agent_profile.testimonial_2,
            'testimonial3': agent_profile.testimonial_3,
            'communityTies': agent_profile.community_ties,
            'headshot': agent_profile.headshot.url if agent_profile.headshot else None,
            'logo': agent_profile.logo.url if agent_profile.logo else None,
            'profileCompleted': agent_profile.profile_completed,
        }
        
        return Response({
            'user': {
                'id': request.user.id,
                'username': request.user.username,
                'email': request.user.email,
                'first_name': request.user.first_name,
                'last_name': request.user.last_name,
                'profile': profile_data
            }
        })
    
    elif request.method == 'PUT':
        # Update profile
        user = request.user

        # Helper function to check if a value is not empty or null
        def is_valid(value):
            return value is not None and str(value).strip() != ''

        # Update user fields
        if is_valid(request.data.get('first_name')):
            user.first_name = request.data.get('first_name')
        if is_valid(request.data.get('last_name')):
            user.last_name = request.data.get('last_name')
        if is_valid(request.data.get('email')):
            user.email = request.data.get('email')
        user.save()

        # Update profile fields with proper field mapping
        field_mapping = {
            'phone': 'phone',
            'companyName': 'company_name',
            'licenseNumber': 'license_number',
            'yearsExperience': 'years_experience',
            'awards': 'awards',
            'specialty': 'specialty',
            'shortestSale': 'shortest_sale',
            'highestSale': 'highest_sale',
            'avgDaysOnMarket': 'avg_days_on_market',
            'mission': 'mission',
            'valueProposition': 'value_proposition',
            'sellingStyle': 'selling_style',
            'testimonial1': 'testimonial_1',
            'testimonial2': 'testimonial_2',
            'testimonial3': 'testimonial_3',
            'communityTies': 'community_ties'
        }
        
        for frontend_field, backend_field in field_mapping.items():
            value = request.data.get(frontend_field)
            if is_valid(value):
                setattr(agent_profile, backend_field, value)

        # Handle file uploads
        if 'headshot' in request.FILES:
            agent_profile.headshot = request.FILES['headshot']
        if 'logo' in request.FILES:
            agent_profile.logo = request.FILES['logo']

        agent_profile.save()
        agent_profile.mark_profile_complete()

        # Return updated profile data
        updated_profile_data = {
            'companyName': agent_profile.company_name,
            'licenseNumber': agent_profile.license_number,
            'phone': agent_profile.phone,
            'yearsExperience': agent_profile.years_experience,
            'yearsExperienceDisplay': agent_profile.get_experience_display_name(),
            'awards': agent_profile.awards,
            'specialty': agent_profile.specialty,
            'specialtyDisplay': agent_profile.get_specialty_display_name(),
            'shortestSale': agent_profile.shortest_sale,
            'highestSale': agent_profile.highest_sale,
            'avgDaysOnMarket': agent_profile.avg_days_on_market,
            'mission': agent_profile.mission,
            'valueProposition': agent_profile.value_proposition,
            'sellingStyle': agent_profile.selling_style,
            'sellingStyleDisplay': agent_profile.get_selling_style_display_name(),
            'testimonial1': agent_profile.testimonial_1,
            'testimonial2': agent_profile.testimonial_2,
            'testimonial3': agent_profile.testimonial_3,
            'communityTies': agent_profile.community_ties,
            'headshot': agent_profile.headshot.url if agent_profile.headshot else None,
            'logo': agent_profile.logo.url if agent_profile.logo else None,
            'profileCompleted': agent_profile.profile_completed,
        }

        return Response({
            'message': 'Profile updated successfully.',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'profile': updated_profile_data
            }
        })

@api_view(['POST'])
def perplexity_proxy(request):
    api_key = os.getenv('PERPLEXITY_API_KEY')
    if not api_key:
        return Response({'error': 'API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    url = 'https://api.perplexity.ai/chat/completions'
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
        'accept': 'application/json',
    }

    if not request.data:
        return Response({'error': 'No data provided in the request.'}, status=status.HTTP_400_BAD_REQUEST)

    # Allow frontend to specify model, default to 'sonar' if not provided
    model = request.data.get('model', 'sonar')
    messages = request.data.get('messages')

    if not messages:
        return Response({'error': 'Field "messages" is required.'}, status=status.HTTP_400_BAD_REQUEST)

    payload = {
        'model': model,
        'messages': messages
    }

    try:
        resp = requests.post(url, headers=headers, json=payload)
        # If Perplexity returns a non-200 status, include details for debugging
        if resp.status_code != 200:
            try:
                error_data = resp.json()
            except Exception:
                error_data = {'details': resp.text}
            return Response({'error': 'Failed to get a valid response from Perplexity API', **error_data}, status=resp.status_code)
        try:
            data = resp.json()
        except ValueError:
            return Response({'error': 'Perplexity API did not return JSON data', 'content': resp.text}, status=resp.status_code)
        return Response(data, status=resp.status_code)
    except requests.exceptions.RequestException as e:
        return Response({'error': f'Error occurred during the API call: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def notion_proxy(request):
    # Get the Notion API key from environment variables
    api_key = os.getenv('NOTION_API_KEY')
    if not api_key:
        return Response({'error': 'Notion API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Ensure Notion URL and payload are provided
    notion_url = request.data.get('url')
    if not notion_url:
        return Response({'error': 'No Notion API URL provided.'}, status=status.HTTP_400_BAD_REQUEST)

    payload = request.data.get('payload')
    if not payload:
        return Response({'error': 'No payload data provided.'}, status=status.HTTP_400_BAD_REQUEST)

    # Define the request headers for Notion API
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Notion-Version': '2021-05-13',  # Update to the most recent version as required
        'Content-Type': 'application/json',
    }

    try:
        # Forward the POST request to the Notion API
        resp = requests.post(notion_url, headers=headers, json=payload, timeout=30)  # Added timeout to prevent hanging requests

        # Handle Notion API response
        if resp.status_code != 200:
            try:
                error_data = resp.json()  # Attempt to parse the JSON error message
            except Exception:
                error_data = {'details': resp.text}  # If not JSON, return raw response text
            return Response({'error': 'Failed to get a valid response from Notion API', **error_data}, status=resp.status_code)

        # Try to parse the JSON response from Notion
        try:
            data = resp.json()
        except ValueError:
            return Response({'error': 'Notion API did not return JSON data', 'content': resp.text}, status=resp.status_code)

        return Response(data, status=resp.status_code)

    except requests.exceptions.RequestException as e:
        # Handle network-related errors (e.g., connection issues, timeouts, etc.)
        return Response({'error': f'Error occurred during the API call: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def notion_format(request):
    """
    Accepts Perplexity API result, sends it to Notion API to create a formatted Notion page, and returns the Notion response.
    """
    # Get the Notion API key from environment variables
    api_key = os.getenv('NOTION_API_KEY')
    if not api_key:
        return Response({'error': 'Notion API key not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Get Perplexity data from request
    perplexity_data = request.data.get('perplexity_data')
    if not perplexity_data:
        return Response({'error': 'No Perplexity data provided.'}, status=status.HTTP_400_BAD_REQUEST)

    # Notion API endpoint for creating a page (update as needed)
    notion_url = 'https://api.notion.com/v1/pages'

    # Example: Format Perplexity data into Notion page properties (customize as needed)
    # This assumes you have a Notion database to add the page to
    NOTION_DATABASE_ID = os.getenv('NOTION_DATABASE_ID')
    if not NOTION_DATABASE_ID:
        return Response({'error': 'Notion database ID not configured.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    # Example: instruct Notion to create a formatted page
    # You may want to adjust the properties and content structure based on your Notion database schema
    title = perplexity_data.get('title', 'Perplexity Result')
    content = perplexity_data.get('content', str(perplexity_data))

    payload = {
        "parent": {"database_id": NOTION_DATABASE_ID},
        "properties": {
            "Name": {
                "title": [
                    {"text": {"content": title}}
                ]
            }
        },
        "children": [
            {
                "object": "block",
                "type": "paragraph",
                "paragraph": {
                    "rich_text": [
                        {"type": "text", "text": {"content": content}}
                    ]
                }
            }
        ]
    }

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
    }

    try:
        resp = requests.post(notion_url, headers=headers, json=payload, timeout=30)
        if resp.status_code != 200:
            try:
                error_data = resp.json()
            except Exception:
                error_data = {'details': resp.text}
            return Response({'error': 'Failed to create Notion page', **error_data}, status=resp.status_code)
        try:
            data = resp.json()
        except ValueError:
            return Response({'error': 'Notion API did not return JSON data', 'content': resp.text}, status=resp.status_code)
        return Response(data, status=resp.status_code)
    except requests.exceptions.RequestException as e:
        return Response({'error': f'Error occurred during the API call: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def save_property_analysis(request):
    """Save property analysis results for logged-in users"""
    try:
        # Extract data from request
        address = request.data.get('address')
        package_name = request.data.get('package_name', 'Professional')
        analysis_content = request.data.get('analysis_content')
        analysis_model = request.data.get('analysis_model', 'sonar')
        api_response = request.data.get('api_response', {})
        agent_description = request.data.get('agent_description', '')

        # Validate required fields
        if not address or not analysis_content:
            return Response({'error': 'Address and analysis content are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Create PropertyAnalysis record
        analysis = PropertyAnalysis.objects.create(
            user=request.user,
            address=address,
            package_name=package_name,
            analysis_content=analysis_content,
            analysis_model=analysis_model,
            api_response=api_response,
            agent_description=agent_description,
            payment_intent_id=request.data.get('payment_intent_id')
        )

        # Get agent profile for headshot and logo
        try:
            agent_profile = request.user.agent_profile
            headshot_url = agent_profile.headshot.url if agent_profile.headshot else None
            logo_url = agent_profile.logo.url if agent_profile.logo else None
        except AgentProfile.DoesNotExist:
            headshot_url = None
            logo_url = None

        return Response({
            'message': 'Property analysis saved successfully.',
            'analysis_id': analysis.id,
            'created_at': analysis.created_at.isoformat(),
            'headshot': headshot_url,
            'logo': logo_url
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response({'error': f'Error saving analysis: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_analyses(request):
    """Get recent property analyses for logged-in users"""
    try:
        # Get recent analyses for the logged-in user (limit to 10)
        analyses = PropertyAnalysis.objects.filter(user=request.user)[:10]
        # Get agent profile for headshot and logo
        try:
            agent_profile = request.user.agent_profile
            headshot_url = agent_profile.headshot.url if agent_profile.headshot else None
            logo_url = agent_profile.logo.url if agent_profile.logo else None
        except AgentProfile.DoesNotExist:
            headshot_url = None
            logo_url = None
        # Prepare response data
        analyses_data = []
        for analysis in analyses:
            analyses_data.append({
                'id': analysis.id,
                'address': analysis.address,
                'short_address': analysis.get_short_address(),
                'package_name': analysis.package_name,
                'analysis_model': analysis.analysis_model,
                'created_at': analysis.created_at.isoformat(),
                'updated_at': analysis.updated_at.isoformat(),
                'headshot': headshot_url,
                'logo': logo_url
            })

        return Response({
            'analyses': analyses_data,
            'total_count': PropertyAnalysis.objects.filter(user=request.user).count(),
            'headshot': headshot_url,
            'logo': logo_url
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error fetching analyses: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_property_analysis(request, analysis_id):
    """Get a specific property analysis by ID"""
    try:
        # Get the analysis for the logged-in user
        analysis = PropertyAnalysis.objects.get(id=analysis_id, user=request.user)
        # Get agent profile for headshot and logo
        try:
            agent_profile = request.user.agent_profile
            headshot_url = agent_profile.headshot.url if agent_profile.headshot else None
            logo_url = agent_profile.logo.url if agent_profile.logo else None
        except AgentProfile.DoesNotExist:
            headshot_url = None
            logo_url = None
        # Prepare response data
        analysis_data = {
            'id': analysis.id,
            'address': analysis.address,
            'package_name': analysis.package_name,
            'analysis_content': analysis.analysis_content,
            'analysis_model': analysis.analysis_model,
            'api_response': analysis.api_response,
            'agent_description': analysis.agent_description,
            'created_at': analysis.created_at.isoformat(),
            'updated_at': analysis.updated_at.isoformat(),
            'headshot': headshot_url,
            'logo': logo_url
        }

        return Response(analysis_data, status=status.HTTP_200_OK)

    except PropertyAnalysis.DoesNotExist:
        return Response({'error': 'Analysis not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error fetching analysis: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def delete_property_analysis(request, analysis_id):
    """Delete a specific property analysis by ID"""
    try:
        # Get the analysis for the logged-in user
        analysis = PropertyAnalysis.objects.get(id=analysis_id, user=request.user)
        analysis.delete()

        return Response({'message': 'Analysis deleted successfully.'}, status=status.HTTP_200_OK)

    except PropertyAnalysis.DoesNotExist:
        return Response({'error': 'Analysis not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error deleting analysis: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_property_analysis(request, analysis_id):
    """Update a specific property analysis by ID"""
    try:
        # Get the analysis for the logged-in user
        analysis = PropertyAnalysis.objects.get(id=analysis_id, user=request.user)
        
        # Update the analysis content
        analysis_content = request.data.get('analysis_content')
        if analysis_content is not None:
            analysis.analysis_content = analysis_content
            analysis.save()

        return Response({
            'message': 'Analysis updated successfully.',
            'analysis_id': analysis.id,
            'updated_at': analysis.updated_at.isoformat()
        }, status=status.HTTP_200_OK)

    except PropertyAnalysis.DoesNotExist:
        return Response({'error': 'Analysis not found.'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({'error': f'Error updating analysis: {str(e)}'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Stripe Payment Endpoints

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """Create a Stripe payment intent for property analysis packages"""
    try:
        # Extract payment data
        amount = request.data.get('amount')  # Amount in cents
        currency = request.data.get('currency', 'usd')
        package_id = request.data.get('package_id')
        package_name = request.data.get('package_name')
        address = request.data.get('address')
        customer_name = request.data.get('customer_name')
        customer_email = request.data.get('customer_email')

        # Validate required fields
        if not amount or not package_id or not package_name:
            return Response({'error': 'Amount, package_id, and package_name are required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Create payment intent with Stripe
        intent = stripe.PaymentIntent.create(
            amount=int(amount),
            currency=currency,
            payment_method_types=['card'],
            metadata={
                'user_id': request.user.id,
                'user_email': request.user.email,
                'package_id': package_id,
                'package_name': package_name,
                'address': address or '',
                'customer_name': customer_name or '',
                'customer_email': customer_email or request.user.email,
            },
            description=f'{package_name} Package - Property Analysis for {address}',
        )

        return Response({
            'client_secret': intent.client_secret,
            'payment_intent_id': intent.id,
        }, status=status.HTTP_200_OK)

    except stripe.error.StripeError as e:
        return Response({'error': f'Stripe error: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': f'Error creating payment intent: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def stripe_webhook(request):
    """Handle Stripe webhook events"""
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = os.getenv('STRIPE_WEBHOOK_SECRET')

    try:
        # Verify webhook signature
        event = stripe.Webhook.construct_event(
            payload, sig_header, endpoint_secret
        )
    except ValueError:
        # Invalid payload
        return Response({'error': 'Invalid payload'}, status=status.HTTP_400_BAD_REQUEST)
    except stripe.error.SignatureVerificationError:
        # Invalid signature
        return Response({'error': 'Invalid signature'}, status=status.HTTP_400_BAD_REQUEST)

    # Handle the event
    try:
        if event['type'] == 'payment_intent.succeeded':
            payment_intent = event['data']['object']
            
            # Get metadata
            metadata = payment_intent.get('metadata', {})
            user_id = metadata.get('user_id')
            package_name = metadata.get('package_name')
            address = metadata.get('address')
            
            # Log successful payment
            print(f"Payment succeeded for user {user_id}: {package_name} package for {address}")
            
            # You can add additional logic here, such as:
            # - Sending confirmation emails
            # - Updating user subscriptions
            # - Triggering property analysis
            
        elif event['type'] == 'payment_intent.payment_failed':
            payment_intent = event['data']['object']
            metadata = payment_intent.get('metadata', {})
            user_id = metadata.get('user_id')
            
            # Log failed payment
            print(f"Payment failed for user {user_id}")
            
        else:
            print(f'Unhandled event type: {event["type"]}')

        return Response({'status': 'success'}, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Webhook error: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_payment_history(request):
    """Get payment history for the authenticated user"""
    try:
        # Get property analyses with payment information
        analyses = PropertyAnalysis.objects.filter(user=request.user).order_by('-created_at')
        
        payment_history = []
        for analysis in analyses:
            # Extract payment info from api_response if available
            api_response = analysis.api_response or {}
            payment_intent_id = api_response.get('payment_intent_id')
            
            payment_history.append({
                'id': analysis.id,
                'address': analysis.address,
                'package_name': analysis.package_name,
                'created_at': analysis.created_at.isoformat(),
                'payment_intent_id': payment_intent_id,
                'status': 'completed' if analysis.analysis_content else 'pending'
            })

        return Response({
            'payment_history': payment_history,
            'total_count': len(payment_history)
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error fetching payment history: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Sharing Endpoints

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def share_analysis(request):
    """Share a property analysis via email"""
    try:
        # Extract share data
        recipient_email = request.data.get('email')
        property_address = request.data.get('propertyAddress')
        analysis_content = request.data.get('analysisContent')
        share_message = request.data.get('shareMessage', '')
        share_link = request.data.get('shareLink', '')
        shared_by_name = request.data.get('sharedBy', '')

        # Validate required fields
        if not recipient_email or not property_address:
            return Response({'error': 'Email and property address are required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Find the corresponding property analysis
        try:
            property_analysis = PropertyAnalysis.objects.filter(
                user=request.user,
                address=property_address
            ).first()
            
            if not property_analysis:
                # Create a temporary analysis record if it doesn't exist
                property_analysis = PropertyAnalysis.objects.create(
                    user=request.user,
                    address=property_address,
                    package_name='Shared Analysis',
                    analysis_content=analysis_content or '',
                    analysis_model='shared',
                    api_response={}
                )
        except Exception as e:
            return Response({'error': f'Error finding property analysis: {str(e)}'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        # For link sharing, check if a share record already exists with this share_link
        if recipient_email == 'link-share':
            share_record = PropertyAnalysisShare.objects.filter(
                property_analysis=property_analysis,
                share_link=share_link
            ).first()
            
            if share_record:
                # Update existing share record
                share_record.times_shared += 1
                share_record.share_message = share_message
                share_record.save()
            else:
                # Create new share record for link sharing
                share_record = PropertyAnalysisShare.objects.create(
                    property_analysis=property_analysis,
                    recipient_email=recipient_email,
                    shared_by=request.user,
                    shared_by_name=shared_by_name or f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email,
                    share_message=share_message,
                    share_link=share_link,
                    times_shared=1,
                )
        else:
            # Regular email sharing
            share_record, created = PropertyAnalysisShare.objects.get_or_create(
                property_analysis=property_analysis,
                recipient_email=recipient_email,
                defaults={
                    'shared_by': request.user,
                    'shared_by_name': shared_by_name or f"{request.user.first_name} {request.user.last_name}".strip() or request.user.email,
                    'share_message': share_message,
                    'share_link': share_link,
                    'times_shared': 1,
                }
            )
            
            if not created:
                # Update existing share record
                share_record.times_shared += 1
                share_record.share_message = share_message
                share_record.share_link = share_link
                share_record.save()

        # Send email with the analysis
        from .email_utils import send_property_analysis_email
        
        email_sent = send_property_analysis_email({
            'email': recipient_email,
            'propertyAddress': property_address,
            'analysisContent': analysis_content,
            'shareMessage': share_message,
            'sharedBy': shared_by_name,
            'shareLink': share_link
        })
        
        if not email_sent:
            logger.warning(f"Failed to send email to {recipient_email}")
        
        return Response({
            'message': 'Analysis shared successfully',
            'share_id': share_record.id,
            'times_shared': share_record.times_shared
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error sharing analysis: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_share_stats(request):
    """Get sharing statistics for a property"""
    try:
        property_address = request.GET.get('address')
        if not property_address:
            return Response({'error': 'Property address is required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Find the property analysis
        property_analysis = PropertyAnalysis.objects.filter(
            user=request.user,
            address=property_address
        ).first()

        if not property_analysis:
            # Return empty stats if no analysis found
            return Response({
                'totalShares': 0,
                'totalViews': 0,
                'emailStats': []
            })

        # Get all shares for this analysis
        shares = PropertyAnalysisShare.objects.filter(
            property_analysis=property_analysis
        ).select_related('shared_by')

        # Calculate totals
        total_shares = sum(share.times_shared for share in shares)
        total_views = sum(share.times_viewed for share in shares)
        
        logger.info(f"Share stats for {property_address}: total_shares={total_shares}, total_views={total_views}")
        for share in shares:
            logger.info(f"Share record: email={share.recipient_email}, shared={share.times_shared}, viewed={share.times_viewed}")

        # Prepare email stats
        email_stats = []
        for share in shares:
            email_stats.append({
                'email': share.recipient_email,
                'shares': share.times_shared,
                'views': share.times_viewed,
                'lastShared': share.last_shared_at.isoformat(),
                'lastViewed': share.last_viewed_at.isoformat() if share.last_viewed_at else None
            })

        return Response({
            'totalShares': total_shares,
            'totalViews': total_views,
            'emailStats': email_stats
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error getting share stats: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def track_shared_view(request):
    """Track when someone views a shared analysis (public endpoint)"""
    try:
        from django.utils import timezone
        
        share_link = request.data.get('shareLink')
        if not share_link:
            return Response({'error': 'Share link is required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Find the share record by link
        share_record = PropertyAnalysisShare.objects.filter(share_link=share_link).first()
        
        if not share_record:
            # Try to extract share_id from the link and find by that
            import re
            share_id_match = re.search(r'/shared/([^/]+)', share_link)
            if share_id_match:
                share_id = share_id_match.group(1)
                share_record = PropertyAnalysisShare.objects.filter(
                    share_link__contains=share_id
                ).first()
        
        if not share_record:
            return Response({'error': 'Invalid share link.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Update view count
        share_record.times_viewed += 1
        share_record.last_viewed_at = timezone.now()
        share_record.save()

        # Create view record
        SharedAnalysisView.objects.create(
            share=share_record,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )

        return Response({
            'message': 'View tracked successfully',
            'analysis': {
                'address': share_record.property_analysis.address,
                'content': share_record.property_analysis.analysis_content,
                'sharedBy': share_record.shared_by_name,
                'shareMessage': share_record.share_message
            }
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error tracking view: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def get_shared_analysis(request, share_id):
    """Get shared analysis data by share ID (public endpoint)"""
    try:
        from django.utils import timezone
        
        # Find the share record by share ID
        # The share_link contains the full URL, so we need to check if it contains the share_id
        share_record = PropertyAnalysisShare.objects.filter(
            share_link__contains=share_id
        ).first()
        
        if not share_record:
            # Try alternative lookup methods
            # 1. Try exact match with the full URL
            full_url = f"https://{request.get_host()}/shared/{share_id}"
            share_record = PropertyAnalysisShare.objects.filter(
                share_link=full_url
            ).first()
            
            if not share_record:
                # 2. Try with http
                full_url_http = f"http://{request.get_host()}/shared/{share_id}"
                share_record = PropertyAnalysisShare.objects.filter(
                    share_link=full_url_http
                ).first()
                
                if not share_record:
                    # 3. Try with production URL
                    full_url_production = f"https://real-estate-platform-wj7s.onrender.com/shared/{share_id}"
                    share_record = PropertyAnalysisShare.objects.filter(
                        share_link=full_url_production
                    ).first()
        
        if not share_record:
            return Response({'error': 'Shared analysis not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Track the view
        logger.info(f"Tracking view for share_id: {share_id}, current views: {share_record.times_viewed}")
        share_record.times_viewed += 1
        share_record.last_viewed_at = timezone.now()
        share_record.save()
        logger.info(f"Updated view count to: {share_record.times_viewed}")

        # Create view record
        SharedAnalysisView.objects.create(
            share=share_record,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        logger.info(f"Created view record for share_id: {share_id}")

        # Return the analysis data
        return Response({
            'address': share_record.property_analysis.address,
            'content': share_record.property_analysis.analysis_content,
            'agent_description': share_record.property_analysis.agent_description,
            'sharedBy': share_record.shared_by_name,
            'shareMessage': share_record.share_message,
            'sharedAt': share_record.first_shared_at.isoformat(),
            'timesViewed': share_record.times_viewed
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error fetching shared analysis: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def refresh_token(request):
    """Refresh JWT token using refresh token"""
    try:
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Use Django REST framework's built-in token refresh
        refresh_view = TokenRefreshView.as_view()
        response = refresh_view(request._request)
        
        if response.status_code == 200:
            return Response({
                'access': response.data.get('access'),
                'refresh': response.data.get('refresh', refresh_token)
            }, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid refresh token.'}, 
                          status=status.HTTP_401_UNAUTHORIZED)
            
    except Exception as e:
        return Response({'error': f'Error refreshing token: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def debug_shares(request):
    """Debug endpoint to see all share records (remove in production)"""
    try:
        shares = PropertyAnalysisShare.objects.all().select_related('property_analysis', 'shared_by')
        share_data = []
        
        for share in shares:
            share_data.append({
                'id': share.id,
                'address': share.property_analysis.address,
                'share_link': share.share_link,
                'recipient_email': share.recipient_email,
                'shared_by': share.shared_by_name,
                'times_shared': share.times_shared,
                'times_viewed': share.times_viewed,
                'created_at': share.first_shared_at.isoformat()
            })
        
        return Response({
            'total_shares': len(share_data),
            'shares': share_data
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        return Response({'error': f'Error fetching shares: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def test_email(request):
    """Test email functionality (remove in production)"""
    try:
        from .email_utils import send_welcome_email
        
        test_email = request.data.get('email', 'wasimranjha@angularquantum.com')
        test_name = request.data.get('name', 'Test User')
        
        email_sent = send_welcome_email(test_email, test_name)
        
        if email_sent:
            return Response({
                'message': 'Test email sent successfully!',
                'to': test_email
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Failed to send test email'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({'error': f'Error sending test email: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def reset_share_stats(request):
    """Reset share stats for testing (remove in production)"""
    try:
        property_address = request.data.get('address')
        if not property_address:
            return Response({'error': 'Property address is required.'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Find the property analysis
        property_analysis = PropertyAnalysis.objects.filter(
            user=request.user,
            address=property_address
        ).first()

        if not property_analysis:
            return Response({'error': 'Property analysis not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Reset all share records for this analysis
        shares = PropertyAnalysisShare.objects.filter(property_analysis=property_analysis)
        for share in shares:
            share.times_viewed = 0
            share.last_viewed_at = None
            share.save()
        
        # Delete all view records
        SharedAnalysisView.objects.filter(share__property_analysis=property_analysis).delete()

        return Response({
            'message': 'Share stats reset successfully',
            'shares_reset': shares.count()
        }, status=status.HTTP_200_OK)

    except Exception as e:
        return Response({'error': f'Error resetting share stats: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_agent_description(request):
    """Generate personalized agent description using AI"""
    try:
        # Get the user's agent profile
        try:
            agent_profile = request.user.agent_profile
        except AgentProfile.DoesNotExist:
            return Response({'error': 'Agent profile not found. Please complete your profile first.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Import the agent description generator
        from .agent_description_generator import generate_agent_description
        
        # Prepare agent data for the generator
        agent_data = {
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
            'company_name': agent_profile.company_name,
            'years_experience': agent_profile.years_experience,
            'specialty': agent_profile.specialty,
            'awards': agent_profile.awards,
            'mission': agent_profile.mission,
            'value_proposition': agent_profile.value_proposition,
            'selling_style': agent_profile.selling_style,
            'shortest_sale': agent_profile.shortest_sale,
            'highest_sale': agent_profile.highest_sale,
            'avg_days_on_market': agent_profile.avg_days_on_market,
            'testimonial_1': agent_profile.testimonial_1,
            'testimonial_2': agent_profile.testimonial_2,
            'testimonial_3': agent_profile.testimonial_3,
            'community_ties': agent_profile.community_ties,
        }
        
        # Generate the agent description
        description = generate_agent_description(agent_data)
        
        if not description:
            return Response({'error': 'Failed to generate agent description. Please try again.'}, 
                          status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        return Response({
            'agent_description': description,
            'message': 'Agent description generated successfully'
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        logger.error(f"Error generating agent description: {str(e)}")
        return Response({'error': f'Error generating agent description: {str(e)}'}, 
                       status=status.HTTP_500_INTERNAL_SERVER_ERROR)
