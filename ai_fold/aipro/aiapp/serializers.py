from rest_framework import serializers
from .models import*
from django.contrib.auth.models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


class GameHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = GameHistory
        fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username", required=False)
    email = serializers.CharField(source="user.email", required=False)
    avatar = serializers.ImageField(allow_null=True, required=False)

    class Meta:
        model = Profile
        fields = ['username', 'email', 'avatar', 'current_streak', 'best_streak']
        read_only_fields = ['current_streak', 'best_streak']

    def update(self, instance, validated_data):
        # Update user fields
        user_data = validated_data.pop('user', {})
        user = instance.user
        if 'username' in user_data:
            user.username = user_data['username']
        if 'email' in user_data:
            user.email = user_data['email']
        user.save()

        # Update profile fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
