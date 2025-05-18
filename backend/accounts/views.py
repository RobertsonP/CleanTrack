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
        # Override to allow unauthenticated registration if needed
        # For now, only authenticated admins can register new users
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        # Check if the user is an admin
        if not self.request.user.role == 'admin':
            raise permissions.PermissionDenied("Only administrators can create new users")
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
        # Check if the user is an admin
        if self.request.user.role != 'admin':
            return User.objects.filter(pk=self.request.user.pk)
        return User.objects.all()