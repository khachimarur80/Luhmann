from django import template
from ..models import Branch
register = template.Library()

@register.filter    
def issue(branch, query):
    comments = branch.comments.all()
    issues = [i for i in comments if i.is_issue]
    solved = [i for i in issues if i.issue_solved]
    if query=='all':
        return len(issues)
    else:
        return len(solved)