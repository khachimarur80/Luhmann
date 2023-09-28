from django import template
from ..models import Profile
register = template.Library()

@register.filter    
def comment_image(comment):
    try:
        return Profile.objects.get(user=comment.author).picture.url
    except:
        return None