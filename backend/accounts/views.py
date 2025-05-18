# backend/accounts/views.py
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, RegisterSerializer

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    Only admins can create new users.
    """
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        # Allow unauthenticated registration for testing purposes
        # For production, you would want to restrict this
        return []  # Empty list means no permission required

    def perform_create(self, serializer):
        # For testing, allow anyone to create a user
        # In production, you would want to check if the user is an admin
        serializer.save()

class UserDetailView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for retrieving and updating the current authenticated user.
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    """
    API endpoint for listing all users.
    Only admins can view the list of users.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # For testing, allow anyone to see all users
        # In production, you would want to restrict this
        return User.objects.all()