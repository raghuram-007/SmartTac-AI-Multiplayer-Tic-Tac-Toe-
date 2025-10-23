from django.urls import path
from . import views
from .views import ai_move

urlpatterns = [
    path('ai-move/', ai_move),
    path('register/', views.register),
    path('login/', views.login),
    path('game/save/', views.save_game_result),
    path('user/stats/', views.user_stats),
    path('profile/', views.profile_view),
     path('hint_move/', views.hint_move, name='hint-move'),
]