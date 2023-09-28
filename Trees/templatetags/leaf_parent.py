from django import template
from ..models import Branch
register = template.Library()

@register.filter    
def leaf_parent(id):
    try:
        branch = Branch.objects.get(id=id)
        if branch.leaf_parent:
            return branch.leaf_parent
        return id
    except:
        return ''