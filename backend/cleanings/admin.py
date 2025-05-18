# backend/cleanings/admin.py
from django.contrib import admin
from .models import Location, ChecklistItem, Submission, TaskRating, Photo

class ChecklistItemInline(admin.TabularInline):
    """
    Inline admin for ChecklistItem model.
    Allows adding/editing checklist items directly from the Location admin page.
    """
    model = ChecklistItem
    extra = 1
    fields = ('title_en', 'title_am', 'title_ru')

@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    """
    Admin interface for Location model.
    """
    list_display = ('name', 'status', 'checklist_items_count', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name',)
    inlines = [ChecklistItemInline]
    
    def checklist_items_count(self, obj):
        return obj.checklist_items.count()
    checklist_items_count.short_description = 'Checklist Items'

@admin.register(ChecklistItem)
class ChecklistItemAdmin(admin.ModelAdmin):
    """
    Admin interface for ChecklistItem model.
    """
    list_display = ('id', 'title_en', 'location', 'created_at')
    list_filter = ('location', 'created_at')
    search_fields = ('title_en', 'title_am', 'title_ru')

class TaskRatingInline(admin.TabularInline):
    """
    Inline admin for TaskRating model.
    Allows viewing/editing task ratings directly from the Submission admin page.
    """
    model = TaskRating
    extra = 0
    fields = ('checklist_item', 'rating', 'notes')
    readonly_fields = ('created_at',)
    
    def has_delete_permission(self, request, obj=None):
        # Prevent deletion from inline view to maintain data integrity
        return False

class PhotoInline(admin.TabularInline):
    """
    Inline admin for Photo model.
    Allows viewing photos directly from the TaskRating admin page.
    """
    model = Photo
    extra = 0
    fields = ('image', 'created_at')
    readonly_fields = ('created_at',)
    
    def has_delete_permission(self, request, obj=None):
        # Allow deletion from inline view
        return True

@admin.register(Submission)
class SubmissionAdmin(admin.ModelAdmin):
    """
    Admin interface for Submission model.
    """
    list_display = ('id', 'location', 'staff', 'date', 'completion_rate', 'created_at')
    list_filter = ('location', 'staff', 'date', 'created_at')
    search_fields = ('location__name', 'staff__username')
    inlines = [TaskRatingInline]
    
    def completion_rate(self, obj):
        return f"{obj.completion_rate}%"
    completion_rate.short_description = 'Completion Rate'

@admin.register(TaskRating)
class TaskRatingAdmin(admin.ModelAdmin):
    """
    Admin interface for TaskRating model.
    """
    list_display = ('id', 'submission', 'checklist_item', 'rating', 'created_at')
    list_filter = ('submission__location', 'rating', 'created_at')
    search_fields = ('submission__location__name', 'checklist_item__title_en', 'notes')
    inlines = [PhotoInline]
    
    def get_queryset(self, request):
        """
        Optimize queryset by prefetching related objects.
        """
        return super().get_queryset(request).select_related('submission', 'checklist_item')

@admin.register(Photo)
class PhotoAdmin(admin.ModelAdmin):
    """
    Admin interface for Photo model.
    """
    list_display = ('id', 'task_rating', 'created_at')
    list_filter = ('created_at', 'task_rating__submission__location')
    search_fields = ('task_rating__submission__location__name',)
    
    def get_queryset(self, request):
        """
        Optimize queryset by prefetching related objects.
        """
        return super().get_queryset(request).select_related('task_rating', 'task_rating__submission')