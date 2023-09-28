from django import template
register = template.Library()

# Method 1 for django queryset (Better)
@register.filter    
def unsolved(queryset1):
    return len([x for x in queryset1 if (x.is_issue) and (not x.issue_solved)])
