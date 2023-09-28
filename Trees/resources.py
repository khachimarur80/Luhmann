from import_export import resources
from .models import Branch, Comment, ColorTheme, Group, Group, Folder

class BranchResource(resources.ModelResource):
    class Meta:
        model = Branch

class CommentResource(resources.ModelResource):
    class Meta:
        model = Comment

class ColorThemeResource(resources.ModelResource):
    class Meta:
        model = ColorTheme

class GroupResource(resources.ModelResource):
    class Meta:
        model = Group
class ProfileResource(resources.ModelResource):
    class Meta:
        model = Group
class FolderResource(resources.ModelResource):
    class Meta:
        model = Folder