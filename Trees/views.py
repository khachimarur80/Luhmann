from django.shortcuts import render
from django.utils import timezone
from django.contrib.auth import login, authenticate, logout
from django.shortcuts import render, redirect
from .forms import SignUpForm
from .models import Branch, Comment, Profile, Group, Folder, ColorTheme, Reference, Tag
import re
from django.http import JsonResponse, HttpResponse
from xhtml2pdf import pisa
from io import BytesIO
from django.views.decorators.clickjacking import xframe_options_exempt
from django.template.loader import get_template
from django.contrib.auth.models import User
from django.core import serializers
from itertools import chain
from django.templatetags.static import static
from django.db.models import Q
import random
import itertools
import pprint
from datetime import timedelta
from django.conf import settings as conf_settings

def general(request):
    return render(request,'trees/introduction.html', context={})
    
def home(request, user):
    if not request.user.is_authenticated:
        return redirect('general')
    actual_user = user
    valid_profile = Profile.objects.filter(username=user).exists()
    user_profile = Profile.objects.get(user=request.user)
    valid_group = Group.objects.filter(name=user).exists()
    
    if valid_profile:
        if request.POST:
            if request.POST['method']=='delete_leaf':
                target_leaf = Branch.objects.get(id=request.POST['id'])
                target_leaf.delete()
                return JsonResponse({})

            elif request.POST['method']=='new_branch':
                if request.FILES:
                    file = request.FILES['file']
                    if '.md' in str(file):
                        new_branch = Branch(author=request.user, text=str(file))
                        new_branch.save()
                        last_tab = -1
                        md_leafs = [new_branch]
                        for line in file:
                            line = line.decode('UTF-8')
                            tabs = int((len(line)-len(line.lstrip(' ')))/4)
                            new_leaf = Branch(author=request.user, text=str(line))
                            if tabs>last_tab:
                                new_leaf.leaf_parent = md_leafs[-1]
                                new_leaf.ancestors = md_leafs[-1].ancestors + '|' + str(md_leafs[-1].id) + '|'

                                md_leafs[-1].leaves_count += 1
                                md_leafs[-1].save()
                            elif tabs==last_tab:
                                new_leaf.leaf_parent = md_leafs[-1].leaf_parent
                                new_leaf.ancestors = md_leafs[-1].ancestors

                                md_leafs[-1].leaf_parent.leaves_count += 1
                                md_leafs[-1].leaf_parent.save()
                            else:
                                the_parent = Branch.objects.get(id=md_leafs[-1].ancestors.strip('|').split('||')[tabs])
                                new_leaf.leaf_parent = the_parent
                                new_leaf.ancestors = '|'+'||'.join(md_leafs[-1].ancestors.strip('|').split('||')[:tabs+1])+'|'

                                the_parent.leaves_count += 1
                                the_parent.save()

                            last_tab = tabs
                            new_leaf.save()
                            md_leafs.append(new_leaf)
                        return JsonResponse({'id':new_branch.id})
                else:
                    new_branch = Branch(text=request.POST['title'], author=request.user)
                    if valid_group:
                        new_branch.group = Group.objects.get(name=user)
                    new_branch.save()
                return JsonResponse({'id':new_branch.id})

            elif request.POST['method']=='change_title':
                target = Branch.objects.get(id=request.POST['id'])
                target.text = request.POST['new_title']
                target.save()

            elif request.POST['method']=='change_thumbnail':
                target = Branch.objects.get(id=request.POST['id'])
                target.thumbnail = request.FILES['file']
                target.save()
                target.thumbnail_url = target.thumbnail.url
                target.save()

            elif request.POST['method']=='dismiss_issue':
                issue = Comment.objects.get(id=request.POST['issue'])
                issue.dismissed += 1
                issue.save()

            elif request.POST['method']=='change_issue_state':
                comment = Comment.objects.get(id=request.POST['id'])
                if comment.state == 'Hacer':
                    comment.state = 'Haciendo'
                    comment.assigned_to = request.user
                    comment.save()
                    user_profile.issues.add(comment)
                    user_profile.save()
                elif comment.state == 'Haciendo' and request.user==comment.assigned_to:
                    comment.state = 'Hecho'
                    comment.save()
                    user_profile.issues.remove(comment)
                    user_profile.save()
                return JsonResponse({})

        all_main_leafs = serializers.serialize('json',Branch.objects.filter(author=request.user,leaf_parent=None))
        all_pinned_leafs = serializers.serialize('json',Branch.objects.filter(author=request.user, pinned=True))
        time_threshold = timezone.now() - timedelta(hours=6)
        all_recent_leafs = serializers.serialize('json',Branch.objects.filter(author=request.user,leaf_parent=None).filter(modified_date__gte=time_threshold))
        all_issues = Comment.objects.filter(author=request.user).order_by('dismissed')
        context = {
            'all_recent_leafs': all_recent_leafs,
            'all_pinned_leafs': all_pinned_leafs,
            'all_main_leafs': all_main_leafs,
            'all_todo_issues': serializers.serialize('json',all_issues.filter(state='Hacer')),
            'all_doing_issues': serializers.serialize('json',all_issues.filter(state='Haciendo')),
            'todo': len(all_issues.filter(state='Hacer')),
            'doing': len(all_issues.filter(state='Haciendo')),
            'done': len(all_issues.filter(state='Hecho')),
            'all_groups': serializers.serialize('json',Profile.objects.get(user=request.user).groups.all()),
            'user': valid_group,
            'permissions': True,

        }
        return render(request, 'trees/home.html', context)

    elif valid_group:
        group = Group.objects.get(name=user)
        if request.POST:
            if request.POST['method']=='delete_leaf':
                target_leaf = Branch.objects.get(id=request.POST['id'])
                target_leaf.delete()
                return JsonResponse({})

            elif request.POST['method']=='new_branch':
                if request.FILES:
                    file = request.FILES['file']
                    if '.md' in str(file):
                        new_branch = Branch(author=request.user, text=str(file))
                        new_branch.save()
                        last_tab = -1
                        md_leafs = [new_branch]
                        for line in file:
                            line = line.decode('UTF-8')
                            tabs = int((len(line)-len(line.lstrip(' ')))/4)
                            new_leaf = Branch(author=request.user, text=str(line))
                            if tabs>last_tab:
                                new_leaf.leaf_parent = md_leafs[-1]
                                new_leaf.ancestors = md_leafs[-1].ancestors + '|' + str(md_leafs[-1].id) + '|'

                                md_leafs[-1].leaves_count += 1
                                md_leafs[-1].save()
                            elif tabs==last_tab:
                                new_leaf.leaf_parent = md_leafs[-1].leaf_parent
                                new_leaf.ancestors = md_leafs[-1].ancestors

                                md_leafs[-1].leaf_parent.leaves_count += 1
                                md_leafs[-1].leaf_parent.save()
                            else:
                                the_parent = Branch.objects.get(id=md_leafs[-1].ancestors.strip('|').split('||')[tabs])
                                new_leaf.leaf_parent = the_parent
                                new_leaf.ancestors = '|'+'||'.join(md_leafs[-1].ancestors.strip('|').split('||')[:tabs+1])+'|'

                                the_parent.leaves_count += 1
                                the_parent.save()

                            last_tab = tabs
                            new_leaf.save()
                            md_leafs.append(new_leaf)
                        return JsonResponse({'id':new_branch.id})
                else:
                    new_branch = Branch(text=request.POST['title'], author=request.user)
                    if valid_group:
                        new_branch.group = Group.objects.get(name=user)
                    new_branch.save()
                return JsonResponse({'id':new_branch.id})

            elif request.POST['method']=='change_title':
                target = Branch.objects.get(id=request.POST['id'])
                target.text = request.POST['new_title']
                target.save()

            elif request.POST['method']=='change_thumbnail':
                target = Branch.objects.get(id=request.POST['id'])
                target.thumbnail = request.FILES['file']
                target.save()
                target.thumbnail_url = target.thumbnail.url
                target.save()

            elif request.POST['method']=='dismiss_issue':
                issue = Comment.objects.get(id=request.POST['issue'])
                issue.dismissed += 1
                issue.save()

            elif request.POST['method']=='change_issue_state':
                comment = Comment.objects.get(id=request.POST['id'])
                if comment.state == 'Hacer':
                    comment.state = 'Haciendo'
                    comment.assigned_to = request.user
                    comment.save()
                    group.issues.add(comment)
                    group.save()
                elif comment.state == 'Haciendo' and request.user==comment.assigned_to:
                    comment.state = 'Hecho'
                    comment.save()
                    group.issues.remove(comment)
                    group.save()
                return JsonResponse({})

        all_main_leafs = serializers.serialize('json',Branch.objects.filter(group=group,leaf_parent=None))
        all_pinned_leafs = serializers.serialize('json',Branch.objects.filter(group=group, pinned=True))
        time_threshold = timezone.now() - timedelta(hours=6)
        all_recent_leafs = serializers.serialize('json',Branch.objects.filter(author=request.user,leaf_parent=None).filter(modified_date__gte=time_threshold))
        all_issues = group.issues.all().order_by('dismissed')
        context = {
            'all_recent_leafs': all_recent_leafs,
            'all_pinned_leafs': all_pinned_leafs,
            'all_main_leafs': all_main_leafs,
            'all_todo_issues': serializers.serialize('json',all_issues.filter(state='Hacer')),
            'all_doing_issues': serializers.serialize('json',all_issues.filter(state='Haciendo')),
            'todo': len(all_issues.filter(state='Hacer')),
            'doing': len(all_issues.filter(state='Haciendo')),
            'done': len(all_issues.filter(state='Hecho')),
            'group': valid_group,
            'group_name': group.name,
            'all_groups': serializers.serialize('json',Profile.objects.get(user=request.user).groups.all()),
            'permissions': (request.user in group.editors.all()) or (request.user in group.admins.all()),

        }
        return render(request, 'trees/home.html', context)
    
    else:
        return redirect('general')

@xframe_options_exempt
def branch(request, branch_id):
    #Check if the branch exists, redirect home otherwise ----------------------------------------------------------------------------------#
    
    try:
        branch =  Branch.objects.get(id=branch_id)
    except:
        return redirect('home', user=request.user)
    
    #Prepare the variables to be filled ---------------------------------------------------------------------------------------------------#

    branch_reference = ''
    branch_references = []
    all_focus = {}
    references = []
    the_font = Profile.objects.get(user=request.user).profileFont
    actual_user = Profile.objects.get(user=request.user)
    user_profile = Profile.objects.get(user=request.user)

    #Post request handler  -----------------------------------------------------------------------------------------------------------------#

    if request.method == 'POST':

        #Creation of a new leaf  -----------------------------------------------------------------------------------------------------------#

        if request.POST['method']=='new_leaf':
            parent = Branch.objects.get(id=request.POST['parent'])
            new_leaf = Branch(text=request.POST['text'], order=request.POST['order'],leaf_parent=parent, ancestors=parent.ancestors+'|'+str(branch_id)+'|', author=request.user, group=branch.group)
            parent.leaves_count += 1
            parent.save()
            new_leaf.save()
            return JsonResponse({
                'id':new_leaf.id, 
            })

        #Move to trash a leaf  -------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='trash_leaf':
            target_leaf = Branch.objects.get(id=request.POST['id'])
            if target_leaf.hidden:
                target_leaf.hidden = False
                target_leaf.save()
                target_leaf.leaf_parent.leaves_count += 1
                target_leaf.leaf_parent.save()
            else:
                target_leaf.hidden = True
                target_leaf.save()
                target_leaf.leaf_parent.leaves_count -= 1
                target_leaf.leaf_parent.save()
            return JsonResponse({})

        #Move to trash a leaf  -------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='select_leaf':
            target_leaf = Branch.objects.get(id=request.POST['id'])
            user = Profile.objects.get(user=request.user)
            if target_leaf.selected:
                target_leaf.selected = False
                user.selected.remove(target_leaf)
                user.save()
            else:
                target_leaf.selected = True
                user.selected.add(target_leaf)
                user.save()
            target_leaf.save()
            return JsonResponse({})

        #Change the branches title  --------------------------------------------------------------------------------------------------------#
         
        elif request.POST.get('change'):
            branch.text = request.POST.get('change')
            branch.save()
            return JsonResponse({})

        #Save the changes of the leafs   ---------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='save_leaf':
            for leaf, text in request.POST.items():
                if leaf!='method' and Branch.objects.filter(id=leaf).exists():
                    branch = Branch.objects.get(id=leaf)
                    branch.text = text
                    branch.save()
            return JsonResponse({})
        
        #Change the leafs parent -----------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='change_parent':
            leaf = Branch.objects.get(id=request.POST['leaf'])
            new_parent =  Branch.objects.get(id=request.POST['parent'])
            old_parent = leaf.leaf_parent
            leaf.ancestors = leaf.ancestors.replace('|'+str(leaf.leaf_parent.id)+'|', '|'+str(new_parent.id)+'|')
            leaf.leaf_parent = new_parent
            leaf.save()
            old_parent.leaves_count -= 1
            old_parent.save()
            new_parent.leaves_count += 1
            new_parent.save()

        #Handle the comments of a leaf   ---------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='get_leaf_comments':
            leaf = Branch.objects.get(id=request.POST['id'])
            if leaf.issues.all():
                issues = serializers.serialize('json',leaf.issues.all())
            else:
                issues = {}
            return HttpResponse(issues)

        elif request.POST['method']=='get_leaf_references':
            leaf = Branch.objects.get(id=request.POST['id'])
            references = {}
            references['styling'] = leaf.style
            references['tags'] = list(leaf.tags.all().values('id','name'))
            for reference in leaf.references.split('|'):
                if reference!='' and Branch.objects.filter(id=reference).exists():
                    leaf = Branch.objects.get(id=reference)
                    if leaf.leaf_parent:
                        references[leaf.leaf_parent.id] = request.POST['id']+'|'+leaf.text
                    else:
                        references[leaf.id]  = request.POST['id']+'|'+leaf.text
            
            return JsonResponse(references)

        #Add new issue to a leaf -----------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='new_issue':
            if branch.group:
                group = branch.group
                leaf = Branch.objects.get(id=request.POST['leaf'])
                new_comment = Comment(text=request.POST['title'], branch=leaf, author=request.user, group=branch.group)
                new_comment.save()
                leaf.comments += 1
                leaf.unsolved += 1
                leaf.save()
                group.issues.add(new_comment)
                group.save()
                return JsonResponse({'id':new_comment.id})
            else:
                leaf = Branch.objects.get(id=request.POST['leaf'])
                new_comment = Comment(text=request.POST['title'], branch=leaf, author=request.user, group=branch.group)
                new_comment.save()
                leaf.comments += 1
                leaf.unsolved += 1
                leaf.save()
                return JsonResponse({'id':new_comment.id})
        
         #Do issues -------------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='do_issue':
            comment = Comment.objects.get(id=request.POST['id'])
            if comment.state == 'Hacer':
                comment.state = 'Haciendo'
                comment.assigned_to = request.user
                comment.save()
                user_profile.issues.add(comment)
                user_profile.save()
            elif comment.state == 'Haciendo' and request.user==comment.assigned_to:
                comment.state = 'Hecho'
                comment.save()
                user_profile.issues.remove(comment)
                user_profile.save()
            return JsonResponse({})

         #Change issues ---------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='change_issue':
            comment = Comment.objects.get(id=request.POST['id'])
            comment.text = request.POST['text']
            comment.save()
            return JsonResponse({})
        
        #Change issues date -----------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='change_issue_date':
            comment = Comment.objects.get(id=request.POST['id'])
            comment.date = request.POST['date']
            comment.save()
            return JsonResponse({})

        #Handle the leafs of a leaf   -------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='get_leafs':
            if '|' in request.POST['target_leaf']:
                querysets = []
                for i in request.POST['target_leaf'].split('|'):
                    if Branch.objects.filter(id=i).exists():
                        leaves = Branch.objects.get(id=i).leaves.all()
                        leaf_focused = leaves.exclude(focused='')
                        for leaf in leaf_focused:
                            leaf.focused = ''
                            leaf.save()
                        querysets.append(leaves)
                blocks = list(chain.from_iterable(querysets))
            else:
                if Branch.objects.filter(id=request.POST['target_leaf']).exists():
                    target_leaf = Branch.objects.get(id=request.POST['target_leaf'])
                    blocks = target_leaf.leaves.all()
                    blocks_focused = blocks.exclude(focused='')
                    for block in blocks_focused:
                        block.focused = ''
                        block.save()
            return HttpResponse(serializers.serialize('json',blocks))
        
        #Empty the trash --------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='empty_trash':
            branches = branch.leaves.all().filter(hidden=True)
            for branch in branches:
                branch.delete()
            return JsonResponse({})

        #Add PDF to branch ------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='change_pdf':
            pdf = request.FILES['file']
            branch.pdf_file = pdf
            branch.save()
            return JsonResponse({'pdf_url':branch.pdf_file.url})

        #Create a link ----------------------------------------------------------------------------------------------------------------------#
        
        elif request.POST['method']=='create_link':
            new_connections = 0
            text = request.POST['text']
            origins_id = [str(i) for i in branch.leaves.all().filter(text__icontains=text).values_list('id', flat=True)]
            targets = Branch.objects.filter(author=request.user).filter(text=text)
            if len(targets)==0:
                target = Branch(author=request.user, text=text, references='|'.join(origins_id))
                target.save()
                new_connections += len(origins_id)
                for i in origins_id:
                    leaf = Branch.objects.get(id=i)
                    leaf.text = re.sub(r"\b" + text + r"\b",f'<a contenteditable="false" href="/branch/{target.id}">{text}</a><span></span>', leaf.text)
                    leaf.save()
            else:
                target = targets[0]
                target.references = '|'.join(origins_id)
                target.save()
                new_connections += len(origins_id)
                for i in origins_id:
                    leaf = Branch.objects.get(id=i)
                    leaf.text = re.sub(r"\b" + text + r"\b", f'<a contenteditable="false" href="/branch/{target.id}">{text}</a><span></span>', leaf.text)
                    leaf.save()
            return JsonResponse({'connections':new_connections})
        
        #Pin branch -------------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='pin_branch':
            branch.pinned = not branch.pinned
            branch.save()
            return JsonResponse({})

        #Save tags --------------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='save_tags':
            print(request.POST['tags'])
            if request.POST['tags']:
                target = Branch.objects.get(id=request.POST['id'])
                for i in request.POST['tags'].split('|'):
                    tag = Tag.objects.get(id=i)
                    target.tags.add(tag)
                    target.save()
            return JsonResponse({})

        #Pin branch -------------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='set_style':
            target = Branch.objects.get(id=request.POST['id'])
            style = request.POST['style']
            target.style = style
            target.save()
            return JsonResponse({})

        #Insert image -----------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='insert_image':
            target = Branch.objects.get(id=request.POST['id'])
            image = request.FILES['image']
            target.image = image
            target.save()
            return JsonResponse({})

        #Change image size ------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='save_image_size':
            target = Branch.objects.get(id=request.POST['id'])
            target.image_width = request.POST['width']
            target.image_height = request.POST['height']
            target.save()
            print(target.image_height, target.image_height)
            return JsonResponse({})

        elif request.POST['method']=='get_regex':
            word = request.POST['word']
            results = Branch.objects.filter(text__icontains=word).values_list('id','text')
            return HttpResponse(results)
        
        #Create tag -------------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='create_tag':
            name = request.POST['name']
            tag = Tag(name=name, user=request.user)
            tag.save()
            return HttpResponse(serializers.serialize('json', [tag,]))

        #Delete tag -------------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='delete_tag':
            tag = Tag.objects.get(id=request.POST['tag'])
            tag.delete()

        elif request.POST['method']=='change_issue_tags':
            comment = Comment.objects.get(id=request.POST['id'])
            for i in request.POST['tags'].split('|'):
                tag = Tag.objects.get(id = i)
                comment.tags.add(tag)
                comment.save()
        
            return JsonResponse({})

        #Dump leafs -------------------------------------------------------------------------------------------------------------------------#

        elif request.POST['method']=='dump_selected':
            user = Profile.objects.get(user=request.user)
            for leaf in user.selected.all():
                pk = leaf.id
                clone = leaf
                clone.pk = None
                clone.selected = False
                clone.leaf_parent = branch
                clone.ancestors = branch.ancestors+'|'+str(branch.id)+'|'
                clone.is_embed = True
                clone.save()
                clone.reference_origin = Branch.objects.get(id=pk)
                clone.save()
            user.selected.set(())
        return JsonResponse({})

    #Prepare Branch descendants -------------------------------------------------------------------------------------------------------------#
    blocks = branch.leaves.all()

    blocks_focused = blocks.exclude(focused='')
    for block in blocks_focused:
        block.focused = ''
        block.save()

    descendants = serializers.serialize('json',blocks)

    #Prepare Branch comments ----------------------------------------------------------------------------------------------------------------#
    comments = branch.issues.all()
        
    all_comments = serializers.serialize('json',comments)

    #Determine if the user has permissions or not -------------------------------------------------------------------------------------------#

    editor_flag = False

    if branch.group:
        editor_flag = request.user in branch.group.editors.all() or request.user == branch.group.admins.all()

    if request.user == branch.author:
        editor_flag = True

    print(editor_flag)
    #Set the styling of the user or group ----------------------------------------------------------------------------------------------------#
    pdf_url = ''

    if branch.pdf_file:
        pdf_url = branch.pdf_file.url

    if branch.group:
        actual_user = branch.group
        the_font = branch.group.group_font
        if actual_user.profileTheme == None:
                actual_user.profileTheme = ColorTheme.objects.get(name='Default')
                actual_user.save()

    profile_pic = ''
    if actual_user.picture:
        profile_pic = actual_user.picture.url
        
    try:
        total_score = len(list(filter(lambda x: x.points>0, Branch.objects.filter(ancestors__icontains='|'+str(branch_id)+'|').filter(hidden=False))))
        total_score = int(total_score/len(Branch.objects.filter(ancestors__icontains='|'+str(branch_id)+'|').filter(hidden=False).filter(text__icontains='<span contenteditable="false" class="clothe" data-options'))*100)
    except:
        total_score = 0

    #Context ---------------------------------------------------------------------------------------------------------------------------------#
    context = {
        'branch': branch.text.replace('\n',' '),
        'branch_parent': branch.leaf_parent.id  if branch.leaf_parent else None,
        'id': branch_id,
        'all_leafs': descendants,
        'all_comments': all_comments,
        'editor_flag': editor_flag,
        'selected': list(user_profile.selected.all().values_list('id', flat=True)),
        'branch_selected': branch.selected and branch in user_profile.selected.all(),
        'pdf_viewer': static('trees/pdfjs/web/viewer.html')+'?file=',
        'branch_pdf': pdf_url,
        'branch_pinned': branch.pinned,
        'all_tags': list(Tag.objects.filter(user=request.user).values('id','name')),
        'media_url': conf_settings.MEDIA_URL,
        'all_groups': serializers.serialize('json',Profile.objects.get(user=request.user).groups.all()),
        'total_score': total_score,
    }
    return render(request, 'trees/branch.html', context)

def signup(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            profile = Profile(user=request.user, username=username, profileFont='HelveticaNeue-Thin', profileTheme=ColorTheme.objects.all()[0])
            profile.save()
            if '@edu.uah.es' in str(form.cleaned_data.get('email')):
                profile.groups.add(Group.objects.get(name='ElSevier'))
                profile.save()
                ElSevier = Group.objects.get(name='ElSevier')
                ElSevier.readers.add(user)
                ElSevier.save()
            return redirect('home', user=profile)
    else:
        form = SignUpForm()
    return render(request, 'trees/signup.html',{'form':form})

def folder(request, folder_id):
    folder = Folder.objects.get(id=folder_id)
    if request.method == 'POST':
        if request.POST.get('new_branch'):
            new_branch = Branch(text=request.POST.get('new_branch'), author=request.user)
            new_branch.save()
            leaf = Branch(order=0, leaf_parent=new_branch.id, author=request.user)
            leaf.save()
            new_branch.leaves.add(leaf)
            new_branch.branch_folders += '|'+str(folder.id)
            new_branch.save()
            folder.branches.add(new_branch)
            folder.save()
            return redirect('folder', folder_id=folder.id)
        elif request.POST.get('dump'):
            actual_profile = Profile.objects.get(user=request.user)
            for i in  actual_profile.selected.all():
                folder.branches.add(i)
                folder.save()
                actual_profile.selected.remove(i)
                actual_profile.save()
                i.selected = False
                i.save()
            return redirect('folder', folder_id=folder.id)
        elif request.POST.get('removefolder'):
            branch = Branch.objects.get(id=request.POST.get('removefolder'))
            folder.branches.remove(branch)
            folder.save()
            branch.branch_folders = branch.branch_folders.replace('|'+str(folder.id),'')
            branch.save()
            return redirect('folder', folder_id=folder.id)
    actual_user = Profile.objects.get(user=folder.author)
    if folder.group:
        actual_user = folder.group
        if actual_user.profileTheme == None:
                actual_user.profileTheme = ColorTheme.objects.get(name='Default')
                actual_user.save()
    context = {
        'folder':folder,
        'user': Profile.objects.get(user=request.user),
        'font':Profile.objects.get(user=request.user).profileFont,
        'profile': Profile.objects.get(user=request.user),
        'folders': Folder.objects.filter(author=request.user),
        'all_items': [i for i in Branch.objects.all() if i.author==request.user or actual_user==i.group],
        'friends': [i for i in Profile.objects.all() if i!=Profile.objects.get(user=request.user)],
        'groups': Profile.objects.get(user=request.user).groups.all(),
        'background':actual_user.profileTheme.background,
        'backgroundDark':actual_user.profileTheme.backgroundDark,
        'leaf':actual_user.profileTheme.leaf,
        'link':actual_user.profileTheme.link,
        'text':actual_user.profileTheme.text,
        'inbox':actual_user.profileTheme.inbox,
        'hide':actual_user.profileTheme.hide,
        'select':actual_user.profileTheme.select,
        'shadow':actual_user.profileTheme.shadow,
        'icolor':actual_user.profileTheme.icolor,
        'success':actual_user.profileTheme.success,
        'box':actual_user.profileTheme.box,
    }
    return render(request,'trees/folder.html', context=context)

def create_group(request):
    if request.method == 'POST':
        print(request.POST)
        if request.POST.get('name'):
            user = Profile.objects.get(user=request.user)
            name = request.POST.get('name')
            group = Group(name=name)
            group.save()
            group.admins.add(request.user)
            if request.FILES.get('picture'):
                group.picture = request.FILES.get('picture')
            group.save()
            user.groups.add(group)
            user.save()
            return redirect('/home/'+group.name)

    context = {
        'context': Group.objects.all(),
        'all_groups':serializers.serialize('json',Profile.objects.get(user=request.user).groups.all()),
        'all_groups_names': list(Profile.objects.get(user=request.user).groups.all().values_list('name',flat=True)),
    }
    return render(request, 'trees/creategroup.html', context)    

def login_user(request):
    if request.POST:
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect('/home/'+username)
    context = {}
    return render(request, 'trees/login.html', context)

def logout_user(request):
    if request.user.is_authenticated:
        logout(request)
        return redirect('general')
    return redirect('general')

def group_profile(request, group):
    group = Group.objects.get(name=group)
    if request.POST:
        if request.POST['method']=='add_reader':
            user = Profile.objects.get(username=request.POST['user'])
            group.readers.add(user.user)
            group.save()
            user.groups.add(group)
            user.save()
            return HttpResponse(serializers.serialize('json',group.readers.all()))
        elif request.POST['method']=='make_editor':
            user = User.objects.get(id=request.POST['id'])
            group.readers.remove(user)
            group.editors.add(user)
            group.save()
            return JsonResponse({})
        elif request.POST['method']=='make_admin':
            user = User.objects.get(id=request.POST['id'])
            group.editors.remove(user)
            group.admins.add(user)
            group.save()
            return JsonResponse({})

    group_users = list(group.editors.all().values_list('username',flat=True))
    group_users.extend(list(group.readers.all().values_list('username',flat=True)))
    group_users.extend(list(group.admins.all().values_list('username',flat=True)))
    staff = request.user in group.admins.all()
    context = {
        'editors': serializers.serialize('json',group.editors.all()),
        'readers': serializers.serialize('json',group.readers.all()),
        'admins': serializers.serialize('json',group.admins.all()),
        'users': list(set(Profile.objects.all().values_list('username',flat=True))-set(group_users)),
        'all_groups': serializers.serialize('json',Profile.objects.get(user=request.user).groups.all()),
        'staff': staff,
    }
    return render(request, 'trees/group_profile.html', context)

def settings(request):
    if request.POST:
        if request.POST.get('theme'):
            profile = Profile.objects.get(user=request.user)
            profile.profileTheme = ColorTheme.objects.get(id=request.POST.get('theme'))
            profile.save()
        elif request.POST.get('font'):
            profile = Profile.objects.get(user=request.user)
            profile.profileFont = request.POST.get('font')
            profile.save()
        return redirect('settings')
    context = {
        'all_groups': serializers.serialize('json',Profile.objects.get(user=request.user).groups.all()),
        'permissions': True,
    }
    return render(request, 'trees/settings.html', context)

def search(request,search_query=''):
    context = {
        'all_results': serializers.serialize('json',Branch.objects.filter(text__icontains=search_query)),
        'search_word': search_query,
        'all_users': serializers.serialize('json',Profile.objects.all()),
        'all_groups': serializers.serialize('json',Group.objects.all()),
        'all_sidebar_groups': serializers.serialize('json',Profile.objects.get(user=request.user).groups.all()),
        'all_tags': serializers.serialize('json',Tag.objects.all()),
    }
    return render(request, 'trees/lookup.html', context)

@xframe_options_exempt
def exam(request, branch_id):
    try:
        branch =  Branch.objects.get(id=branch_id)
    except:
        return redirect('home', user=request.user)

    if request.POST:
        if request.POST['method'] == 'check_answers':
            success = request.POST['success']=='true'
            for i in request.POST:
                if not (i in ['success', 'method']):
                    leaf = Branch.objects.get(id=i)
                    leaf.studied_options += '|'+request.POST[i]
                    if success:
                        leaf.points += 1
                    else:
                        leaf.points -= 1
                    leaf.save()

                    alias_count = leaf.text.count('<span contenteditable="false" class="clothe" data-options')

                    all_possible_options = [''.join(i) for i in set(itertools.permutations(['V']*alias_count+['F']*alias_count, alias_count))]

                    if sorted(leaf.studied_options[1:].split('|'))==sorted(all_possible_options):
                        leaf.studied_options = ''
                        leaf.save()

    return render(request, 'trees/exam.html', {'branch':branch})

def question(request, branch_id):
    try:
        branch =  Branch.objects.get(id=branch_id)
    except:
        return redirect('home', user=request.user)
        
    blocks = Branch.objects.filter(Q(ancestors__icontains=branch_id) & Q(text__icontains='<span contenteditable="false" class="clothe" data-options')).order_by('-studied_options','points')

    random_bool = random.randint(0,1)==1

    question_titles = []
    question_options = []
    id_options = []
    scores = []
    n = 0
    options_count = random.randint(3,4)

    while len(question_options)!=options_count:
        option = blocks[n].text

        alias_count = blocks[n].text.count('<span contenteditable="false" class="clothe" data-options')

        all_possible_options = [''.join(i) for i in set(itertools.permutations(['V']*alias_count+['F']*alias_count, alias_count))]

        blocks[n].studied_options = ''
        blocks[n].save()

        used_options = blocks[n].studied_options[1:].split('|')+[''.join(i[1]) for i in question_options if i[0]==option]
        total_options = list(filter(lambda x: ''.join(list(x)) not in used_options, all_possible_options))
        
        selected_option = total_options[random.randint(0, len(total_options))-1]

        if blocks[n].leaf_parent:
            if blocks[n].leaf_parent.image:
                question_titles.append(blocks[n].leaf_parent.image.url)
            else:
                question_titles.append(blocks[n].leaf_parent.text)
        else:
            question_titles.append('')

        question_options.append([option, selected_option])
        id_options.append([blocks[n].id, selected_option])
        scores.append(blocks[n].points)

        if n<(len(blocks)-1):
            if random_bool and len(total_options)>1:
                continue
            else:
                n += 1
        else:
            break
    if list(set(question_titles))*len(question_options)==question_titles:
        question_title = question_titles[0]
    else:
        question_title = ''
    return JsonResponse({'question':question_title,'options':question_options,'id_options':id_options,'scores':scores})


def journal(request):
    context = {
        'user':Profile.objects.get(user=request.user),
        'themes':ColorTheme.objects.all(),
        'background':Profile.objects.get(user=request.user).profileTheme.background,
        'backgroundDark':Profile.objects.get(user=request.user).profileTheme.backgroundDark,
        'leaf':Profile.objects.get(user=request.user).profileTheme.leaf,
        'link':Profile.objects.get(user=request.user).profileTheme.link,
        'text':Profile.objects.get(user=request.user).profileTheme.text,
        'inbox':Profile.objects.get(user=request.user).profileTheme.inbox,
        'hide':Profile.objects.get(user=request.user).profileTheme.hide,
        'select':Profile.objects.get(user=request.user).profileTheme.select,
        'shadow':Profile.objects.get(user=request.user).profileTheme.shadow,
        'icolor':Profile.objects.get(user=request.user).profileTheme.icolor,
    }
    return render(request, 'trees/journal.html', context)

def download(request, branch_id):
    branch = Branch.objects.get(id=branch_id)
    title = branch.text
    childs = list(branch.leaves.all())
    blocks = []
    while childs!=[]:
        blocks.append(childs[0])
        more = list(blocks[-1].leaves.all())
        childs = more + childs[1:]

    template = get_template('trees/download.html')
    context_dict = {
		'blocks': blocks,
		'title': title.capitalize(),
	}
    html  = template.render(context_dict)
    result = BytesIO()
    pdf = pisa.pisaDocument(BytesIO(html.encode("utf8")), result)
    if not pdf.err:
        response = HttpResponse(result.getvalue(), content_type='application/pdf')
        response['Content-Disposition'] = 'attachment; filename=%s.pdf'%(branch.text)
        return response
    return None
