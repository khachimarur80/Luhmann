from django.urls import path
from . import views

urlpatterns = [
	path('', views.general, name='general'),
	path('home/<str:user>', views.home, name='home'),
	path('search/', views.search, name='search'),
	path('search/<str:search_query>', views.search, name='search'),
	path('create_group', views.create_group, name='group'),
	path('branch/<int:branch_id>', views.branch, name='branch'),
	path('comments/<int:leaf_id>', views.branch, name='comments'),
	path('folder/<int:folder_id>', views.folder, name='folder'),
	path('signup/', views.signup, name='signup'),
	path('settings/', views.settings, name='settings'),
	path('group_profile/<str:group>', views.group_profile, name='profile'),
	path('login/', views.login_user, name='login'),
	path('logout/', views.logout_user, name='logout'),
	path('journal/', views.journal, name='journal'),
	path('download/<int:branch_id>', views.download, name='download'),
	path('exam/<int:branch_id>', views.exam, name='examn'),
	path('question/<int:branch_id>', views.question, name='question'),  
]
