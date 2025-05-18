from django.db import models
from django.conf import settings
import os
import uuid

def submission_photo_path(instance, filename):
    """
    Generate a unique path for uploaded photos.
    Format: submissions/YYYY-MM-DD/submission_id/uuid_filename.ext
    """
    ext = filename.split('.')[-1]
    unique_filename = f"{uuid.uuid4()}.{ext}"
    date_str = instance.task_rating.submission.date.strftime('%Y-%m-%d')
    return f'submissions/{date_str}/{instance.task_rating.submission.id}/{unique_filename}'

class Location(models.Model):
    """
    Represents a cleaning location (e.g., Departure Hall, Arrival Hall, etc.)
    """
    name = models.CharField(max_length=100)
    status = models.CharField(
        max_length=10,
        choices=[('active', 'Active'), ('inactive', 'Inactive')],
        default='active'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['name']

class ChecklistItem(models.Model):
    """
    Represents an item in the cleaning checklist for a specific location
    """
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='checklist_items')
    title_en = models.CharField(max_length=255)
    title_am = models.CharField(max_length=255, blank=True)
    title_ru = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.title_en
    
    class Meta:
        ordering = ['id']

class Submission(models.Model):
    """
    Represents a submission of cleaning status by a staff member
    """
    location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='submissions')
    staff = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='submissions')
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.location.name} - {self.date} by {self.staff.username}"
    
    class Meta:
        ordering = ['-date']
        # Ensure that there's only one submission per location/staff/date combination
        unique_together = ['location', 'staff', 'date']
    
    @property
    def completion_rate(self):
        """Calculate completion rate as a percentage of total possible points"""
        task_ratings = self.task_ratings.all()
        if not task_ratings:
            return 0
        
        total_possible = len(task_ratings) * 10
        total_actual = sum(tr.rating for tr in task_ratings)
        
        if total_possible == 0:
            return 0
        
        return int((total_actual / total_possible) * 100)

class TaskRating(models.Model):
    """
    Represents a rating for a specific checklist item in a submission
    """
    submission = models.ForeignKey(Submission, on_delete=models.CASCADE, related_name='task_ratings')
    checklist_item = models.ForeignKey(ChecklistItem, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(default=0)  # 0-10 rating scale
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.checklist_item.title_en}: {self.rating}/10"
    
    class Meta:
        ordering = ['checklist_item__id']
        unique_together = ['submission', 'checklist_item']

class Photo(models.Model):
    """
    Represents a photo attached to a task rating
    """
    task_rating = models.ForeignKey(TaskRating, on_delete=models.CASCADE, related_name='photos')
    image = models.ImageField(upload_to=submission_photo_path)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Photo for {self.task_rating}"
    
    def delete(self, *args, **kwargs):
        # Delete the image file when deleting the model instance
        if self.image:
            if os.path.isfile(self.image.path):
                os.remove(self.image.path)
        super().delete(*args, **kwargs)