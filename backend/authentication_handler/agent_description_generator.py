import os
import requests
import logging
from typing import Dict, Optional

logger = logging.getLogger(__name__)

class AgentDescriptionGenerator:
    """Generates personalized agent descriptions using AI"""
    
    def __init__(self):
        self.api_key = os.getenv('PERPLEXITY_API_KEY')
        print("=======>>>>> PERPLEXITY_API_KEY ========<<<<<<<<", self.api_key)
        if not self.api_key:
            raise ValueError("PERPLEXITY_API_KEY environment variable is required")
        
        self.api_url = 'https://api.perplexity.ai/chat/completions'
        self.headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'accept': 'application/json',
        }
    
    def generate_agent_description(self, agent_profile_data: Dict) -> Optional[str]:
        """
        Generate a personalized "About Agent" description using AI
        
        Args:
            agent_profile_data: Dictionary containing agent profile information
            
        Returns:
            Generated agent description or None if generation fails
        """
        try:
            # Prepare the prompt with agent data
            prompt = self._build_agent_description_prompt(agent_profile_data)
            
            # Call Perplexity API
            payload = {
                'model': 'sonar',
                'messages': [
                    {
                        'role': 'system',
                        'content': 'You are a professional real estate marketing expert. Generate compelling, personalized agent descriptions that highlight the agent\'s unique value proposition and experience.'
                    },
                    {
                        'role': 'user',
                        'content': prompt
                    }
                ]
            }
            
            response = requests.post(
                self.api_url, 
                headers=self.headers, 
                json=payload,
                timeout=30
            )
            
            if response.status_code != 200:
                logger.error(f"Perplexity API error: {response.status_code} - {response.text}")
                return None
            
            data = response.json()
            choices = data.get('choices', [])
            
            if not choices:
                logger.error("No choices returned from Perplexity API")
                return None
            
            # Extract the generated description
            description = choices[0].get('message', {}).get('content', '')
            
            if not description:
                logger.error("Empty description returned from Perplexity API")
                return None
            
            return description.strip()
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error during agent description generation: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error during agent description generation: {str(e)}")
            return None
    
    def _build_agent_description_prompt(self, agent_data: Dict) -> str:
        """
        Build the prompt for generating agent description
        
        Args:
            agent_data: Dictionary containing agent profile information
            
        Returns:
            Formatted prompt string
        """
        # Extract relevant data with fallbacks
        first_name = agent_data.get('first_name', '')
        last_name = agent_data.get('last_name', '')
        company_name = agent_data.get('company_name', '')
        years_experience = agent_data.get('years_experience', '')
        specialty = agent_data.get('specialty', '')
        awards = agent_data.get('awards', '')
        mission = agent_data.get('mission', '')
        value_proposition = agent_data.get('value_proposition', '')
        selling_style = agent_data.get('selling_style', '')
        shortest_sale = agent_data.get('shortest_sale', '')
        highest_sale = agent_data.get('highest_sale', '')
        avg_days_on_market = agent_data.get('avg_days_on_market', '')
        testimonial_1 = agent_data.get('testimonial_1', '')
        testimonial_2 = agent_data.get('testimonial_2', '')
        testimonial_3 = agent_data.get('testimonial_3', '')
        community_ties = agent_data.get('community_ties', '')
        
        # Build the prompt
        prompt = f"""
Create a concise, professional agent description for a real estate agent. 
This will appear at the top of a property analysis as a "Welcome" section.

The description should be similar in style to this example:

"Hi, I'm Austin Southern, Team Lead and Executive Vice President at Monumental, powered by PLACE.
As your professional real estate advisor, my mission is simple: exceed expectations and ensure complete satisfaction. With years of industry experience, I'm equipped to guide you through every step of your home sale — from preparation and pricing to negotiation and closing."

Use the following agent information to create a personalized description:

Agent Name: {first_name} {last_name}
Company: {company_name}
Years of Experience: {years_experience}
Specialty: {specialty}
Awards/Certifications: {awards}
Mission: {mission}
Value Proposition: {value_proposition}
Selling Style: {selling_style}
Performance Highlights:
- Shortest Sale: {shortest_sale}
- Highest Sale: {highest_sale}
- Average Days on Market: {avg_days_on_market}

Client Testimonials:
- {testimonial_1}
- {testimonial_2}
- {testimonial_3}

Community Involvement: {community_ties}

Requirements:
1. Start with a warm, welcoming greeting using the agent's name
2. Include their role/position and company name
3. Highlight their experience and expertise in a positive way
4. Mention their mission or value proposition
5. Keep it professional yet warm and approachable
6. Make it sound authentic and personalized
7. Keep the total length to 1-2 paragraphs maximum (100-150 words)
8. Focus on what makes them unique and trustworthy
9. End with a commitment to client satisfaction
10. Use welcoming, positive language throughout
11. Make it feel like a personal introduction, not a sales pitch
12. Be concise and impactful - every word should matter

Generate a compelling, welcoming description that makes potential clients feel confident and comfortable working with this agent.
"""
        
        return prompt.strip()

# Convenience function for easy integration
def generate_agent_description(agent_profile_data: Dict) -> Optional[str]:
    """
    Convenience function to generate agent description
    
    Args:
        agent_profile_data: Dictionary containing agent profile information
        
    Returns:
        Generated agent description or None if generation fails
    """
    try:
        generator = AgentDescriptionGenerator()
        return generator.generate_agent_description(agent_profile_data)
    except Exception as e:
        logger.error(f"Failed to create agent description generator: {str(e)}")
        return None 