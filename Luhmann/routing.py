from django.urls import path
from Trees import consumers

websocket_urlpatterns = [
    path('ws/socket-server',consumers.PracticeConsumer.as_asgi())
]