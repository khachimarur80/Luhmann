from django import template
register = template.Library()

@register.filter    
def leaf_margin(ancestors):
    return (len(ancestors.split('||'))-1)*16