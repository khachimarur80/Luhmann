from django import template
from ..models import Profile
register = template.Library()

@register.filter    
def profile_pic(user):
    profile = Profile.objects.get(user=user)
    try:
        return profile.picture.url
    except:
        return None