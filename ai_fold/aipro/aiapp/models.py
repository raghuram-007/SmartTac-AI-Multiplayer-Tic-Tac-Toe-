from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

# Create your models here.
class GameHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    result = models.CharField(max_length=10)  # 'Win', 'Loss', 'Draw'
    player_symbol = models.CharField(max_length=1, default='X')
    ai_symbol = models.CharField(max_length=1, default='O')
    moves_count = models.IntegerField(default=0)
    duration = models.FloatField(default=0.0)  # seconds
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.result} ({self.created_at.date()})"


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    avatar = models.ImageField(upload_to="avatars/", null=True, blank=True)
    # optional persisted streak fields (you can compute on the fly instead)
    current_streak = models.IntegerField(default=0)
    best_streak = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username} Profile"

# Create Profile automatically
@receiver(post_save, sender=User)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)
    else:
        instance.profile.save()
        
  
# 🧠 Q-Learning Memory Model
# ------------------------------
class QLearningState(models.Model):
    """
    Stores Q-values for each board state and AI move.
    Helps AI 'learn' over time.
    """
    state = models.CharField(max_length=200)  # Encoded board (e.g. "X,O,,X,...")
    action = models.IntegerField()                         # Cell index 0–8
    q_value = models.FloatField(default=0.0)               # Q-value (reward score)

    def __str__(self):
        return f"{self.state[:9]}... → {self.action} ({self.q_value:.2f})"



class DailyHintUsage(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField(default=timezone.now)
    count = models.IntegerField(default=0)

    class Meta:
        unique_together = ('user', 'date')
    
    def __str__(self):
        return f"{self.user.username} - {self.date} ({self.count})"