from django import template
register = template.Library()

@register.filter    
def completed(leaf):
    issues = [comment for comment in leaf.comments.all() if comment.is_issue and not comment.issue_solved]
    return False if len(issues)!=0 or len(leaf.comments.all())==0 else True
    