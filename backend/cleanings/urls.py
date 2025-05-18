# backend/cleanings/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, ChecklistItemViewSet, SubmissionViewSet, TaskRatingViewSet, PhotoViewSet

router = DefaultRouter()
router.register(r'locations', LocationViewSet)
router.register(r'checklist-items', ChecklistItemViewSet)
router.register(r'submissions', SubmissionViewSet, basename='submission')
router.register(r'task-ratings', TaskRatingViewSet)
router.register(r'photos', PhotoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]