from django import template
from ..models import Branch

register = template.Library()

@register.filter    
def references(branch):
    references = 0
    for i in branch.references.split('|'):
        if i!='':
            if Branch.objects.filter(id=i).exists():
                references += 1
    return references
