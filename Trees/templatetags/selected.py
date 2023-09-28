from django import template
from ..models import Profile

register = template.Library()

@register.filter    
def selected(leaf, user):
    return (leaf.selected) and (leaf in Profile.objects.get(user=user).selected.all())
