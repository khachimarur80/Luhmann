from django.contrib import admin
from .models import Branch, Comment, Profile, Group, ColorTheme, Reference, Folder, Tag

from import_export import resources
from import_export.admin import ImportExportActionModelAdmin
from .resources import BranchResource, CommentResource, ColorThemeResource, GroupResource, ProfileResource, FolderResource

@admin.register(Branch)
class BranchAdmin(ImportExportActionModelAdmin):
    resource_class = BranchResource
    search_help_text = 'wtf'

@admin.register(Comment)
class CommentAdmin(ImportExportActionModelAdmin):
    resource_class = CommentResource
    search_help_text = 'wtf'

@admin.register(ColorTheme)
class ColorThemeAdmin(ImportExportActionModelAdmin):
    resource_class = ColorThemeResource
    search_help_text = 'wtf'

@admin.register(Group)
class GrouphAdmin(ImportExportActionModelAdmin):
    resource_class = GroupResource
    search_help_text = 'wtf'

@admin.register(Folder)
class FoldertAdmin(ImportExportActionModelAdmin):
    resource_class = FolderResource
    search_help_text = 'wtf'

@admin.register(Profile)
class ProfileAdmin(ImportExportActionModelAdmin):
    resource_class = ProfileResource
    search_help_text = 'wtf'

admin.site.register(Reference)
admin.site.register(Tag)