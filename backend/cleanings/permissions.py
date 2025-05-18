# backend/cleanings/permissions.py
from rest_framework import permissions

class IsAdminUserOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow admin users to edit objects.
    Read permissions are allowed to any authenticated user.
    """
    
    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated user
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions are only allowed to admin users
        return request.user and request.user.is_authenticated and request.user.role == 'admin'

class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Custom permission to only allow owners of a submission or admins to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Admin users can do anything
        if request.user.is_authenticated and request.user.role == 'admin':
            return True
        
        # Determine the owner based on the object type
        if hasattr(obj, 'staff'):  # Submission
            return obj.staff == request.user
        elif hasattr(obj, 'submission'):  # TaskRating
            return obj.submission.staff == request.user
        elif hasattr(obj, 'task_rating'):  # Photo
            return obj.task_rating.submission.staff == request.user
        
        # Default to deny permission
        return False