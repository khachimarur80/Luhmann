from django import template
from ..models import Branch, Profile
register = template.Library()

@register.filter    
def embed(origin):
    try:
        return Profile.objects.get(user=Branch.objects.get(id=origin).author).profileTheme.backgroundDark
    except:
        return '#000'