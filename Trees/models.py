from django.db import models
from django.conf import settings
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    username = models.TextField(default='')
    picture = models.ImageField(upload_to='',default='', blank=True, null=True)
    groups = models.ManyToManyField('Group')
    inbox = models.ManyToManyField(
        'Branch',
        blank = True,
        related_name='leaf_inbox',
    )
    selected = models.ManyToManyField(
        'Branch',
        blank = True,
        related_name='leaf_selected',
    )
    hidden = models.ManyToManyField(
        'Branch',
        blank = True,
        related_name='leaf_hidden',
    )
    issues = models.ManyToManyField(
        'Comment',
        blank = True,
    )
    friends = models.ManyToManyField(
        User,
        blank = True,
        related_name='friends',
    )
    profileTheme = models.ForeignKey(
        'colorTheme',
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )
    profileFont = models.TextField(default='')
    def __str__(self):
        return str(self.user.username)

class Branch(models.Model):
    ancestors = models.TextField(default='', blank=True, null=True)
    image_width = models.IntegerField(default=0)
    image_height = models.IntegerField(default=0)
    created_date = models.DateTimeField(auto_now_add=True)
    is_reference = models.BooleanField(default=False)
    is_embed = models.BooleanField(default=False)
    modified_date = models.DateTimeField(auto_now=True)
    source = models.TextField(default='', blank=True, null=True)
    text = models.TextField(default='')
    image = models.ImageField(default='', blank=True, null=True)
    thumbnail = models.ImageField(default='', blank=True, null=True)
    date = models.DateTimeField(auto_now_add=True, null=True)
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, blank=True, null=True)
    order = models.IntegerField(default=0)
    inbox = models.BooleanField(default=False)
    selected = models.BooleanField(default=False)
    hidden = models.BooleanField(default=False)
    important = models.BooleanField(default=False)
    references = models.TextField(default='', blank=True, null=True)
    reference_origin = models.ForeignKey(
        'Branch',
        on_delete=models.CASCADE,
        blank = True,
        default=None,
        null=True,
    )
    branch_folders = models.TextField(default='', blank=True, null=True)
    pdf_file = models.FileField(upload_to='', blank=True, null=True)
    video = models.TextField(default='', blank=True, null=True)
    style = models.CharField(max_length=10, default='None')
    pinned = models.BooleanField(default=False,null=True)
    unsolved = models.IntegerField(default=0)
    points = models.IntegerField(default=0)
    comments = models.IntegerField(default=0)
    leaves_count = models.IntegerField(default=0)
    focused = models.TextField(default='', blank=True, null=True)
    thumbnail_url = models.TextField(default='')
    studied_options = models.TextField(default='')
    leaf_parent = models.ForeignKey(
        'Branch',
        blank = True,
        on_delete=models.CASCADE,
        related_name='leaves',
        default=None,
        null=True,
    )
    bibliography = models.ManyToManyField(
        'Reference',
        blank = True,
    )
    tags = models.ManyToManyField(
        'Tag',
        blank = True,
    )
    def __str__(self):
        if self.group:
            return str(self.author) +' | '+str(self.id)+' | '+str(self.group)
        else:
            return str(self.author) + ' | ' +str(self.id)
    def erase(self):
        for i in self.leaves.all():
            i.erase()
        for c in self.comments.all():
            c.delete()
        self.delete()
    
    def hide(self):
        for i in self.leaves.all():
            i.hide()
        self.hidden = True
        self.save()

    def show(self):
        for i in self.leaves.all():
            i.hide()
        self.hidden = False
        self.save()
        
    def descendants(self):
        count = 0
        count += len(self.leaves.all())
        for descendant in self.leaves.all():
            count += descendant.descendants()
        return count
    def conexions(self):
        return len(self.leaves.all())+len(self.references.split('|'))+self.text.count('inline-link')
    def leaf_properties(self):
        return {
            'id':self.id,
            'style':self.style,
            'text' :self.text,
            'parent' :self.leaf_parent.id,
            'embed':self.reference_origin,
            'order':self.order,
            'selected':self.selected,
            'references':len(self.references.split('|')),
            'leaves':Branch.objects.filter(ancestors__icontains=self.id).exists(),
            'unsolved': len(tuple(filter(lambda x: x.is_issue and not x.issue_solved, self.comments.all()))),
            'comments':len(self.comments.all()),
        }
    def get_thumbnail(self):
        return self.thumbnail.url

class Comment(models.Model):
    text = models.TextField(default='')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True, related_name='author')
    created_date = models.DateTimeField(auto_now_add=True)
    modified_date = models.DateTimeField(auto_now=True)
    branch = models.ForeignKey(
        'Branch',
        blank = True,
        on_delete=models.CASCADE,
        related_name='issues',
        default=None,
        null=True,
    )
    tags = models.ManyToManyField(
        'Tag',
        blank = True,
    )
    assigned_to = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    state = models.TextField(default='Hacer')
    date = models.DateTimeField(null=True, blank=True)
    dismissed = models.IntegerField(default=0)
    def __str__(self):
        return str(self.author.username)+' | '+str(self.id)
class Group(models.Model):
    name = models.TextField()
    picture = models.ImageField(default='',blank=True,null=True)
    admins = models.ManyToManyField(User, related_name='admins',blank=True)
    verified = models.BooleanField(default=False, blank=True,null=True)
    group_font = models.TextField(default="HelveticaNeue-Thin")
    background_image = models.ImageField(default='', blank=True, null=True)
    readers = models.ManyToManyField(User, related_name='readers',blank=True)
    inbox = models.ManyToManyField(
        'Branch',
        blank = True,
        related_name='inbox',
    )
    issues = models.ManyToManyField(
        'Comment',
        blank = True,
    )
    editors = models.ManyToManyField(User, related_name='editors',blank=True)
    inbox = models.ManyToManyField(
        'Branch',
        blank = True,
        related_name='group_inbox',
    )
    issues = models.ManyToManyField(
        'Comment',
        blank = True,
    )
    profileTheme = models.ForeignKey(
        'colorTheme',
        null=True,
        blank=True,
        on_delete=models.CASCADE
    )
    def __str__(self):
        return str(self.name)
class Folder(models.Model):
    title = models.TextField()
    background = models.ImageField(default='')
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, null=True)
    branches = models.ManyToManyField('Branch')
    def __str__(self):
        return str(self.title)

class ColorTheme(models.Model):
    name = models.TextField(default='')
    background = models.TextField(default='')
    backgroundDark = models.TextField(default='')
    leaf = models.TextField(default='')
    text = models.TextField(default='')
    link = models.TextField(default='')
    hide = models.TextField(default='')
    inbox = models.TextField(default='')
    select = models.TextField(default='')
    shadow = models.TextField(default='')
    icolor = models.TextField(default='')
    box = models.TextField(default='')
    success = models.TextField(default='')
    def __str__(self):
        return str(self.name)

class Reference(models.Model):
    link = models.TextField(default='')
    name = models.TextField(default='')

class Tag(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, null=True)
    group = models.ForeignKey('Group', on_delete=models.CASCADE, null=True)
    name = models.TextField(default='')
    origin = models.TextField(default='')
    destin = models.TextField(default='')
    priority = models.IntegerField(default=0)
    color  = models.TextField(default='')