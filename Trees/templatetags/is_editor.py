from django import template
from ..models import Profile
register = template.Library()

@register.filter    
def is_editor(user, group):
    return (user in group.editors.all()) or (Profile.objects.get(user=user).id==group.owner)