from django import template
from ..models import Branch
register = template.Library()

@register.filter    
def header(branch):
    return branch.style == 'header'