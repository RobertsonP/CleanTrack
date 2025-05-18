# backend/cleanings/serializers.py
from rest_framework import serializers
from .models import Location, ChecklistItem, Submission, TaskRating, Photo
from django.contrib.auth import get_user_model
from django.db import transaction

User = get_user_model()

class PhotoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Photo
        fields = ('id', 'image', 'created_at')
        read_only_fields = ('created_at',)

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ('id', 'location', 'title_en', 'title_am', 'title_ru', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')

class LocationSerializer(serializers.ModelSerializer):
    checklist_items = ChecklistItemSerializer(many=True, read_only=True)
    checklist_items_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = ('id', 'name', 'status', 'checklist_items', 'checklist_items_count', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')
    
    def get_checklist_items_count(self, obj):
        return obj.checklist_items.count()

class TaskRatingSerializer(serializers.ModelSerializer):
    photos = PhotoSerializer(many=True, read_only=True)
    uploaded_images = serializers.ListField(
        child=serializers.ImageField(max_length=1000000, allow_empty_file=False, use_url=False),
        write_only=True,
        required=False
    )
    checklist_item_title = serializers.SerializerMethodField()
    
    class Meta:
        model = TaskRating
        fields = ('id', 'submission', 'checklist_item', 'checklist_item_title', 'rating', 'notes', 'photos', 'uploaded_images')
    
    def get_checklist_item_title(self, obj):
        language = self.context.get('language', 'en')
        if language == 'am' and obj.checklist_item.title_am:
            return obj.checklist_item.title_am
        elif language == 'ru' and obj.checklist_item.title_ru:
            return obj.checklist_item.title_ru
        return obj.checklist_item.title_en
    
    def create(self, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        task_rating = TaskRating.objects.create(**validated_data)
        
        for image in uploaded_images:
            Photo.objects.create(task_rating=task_rating, image=image)
        
        return task_rating
    
    def update(self, instance, validated_data):
        uploaded_images = validated_data.pop('uploaded_images', [])
        
        # Update TaskRating instance
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Add new photos
        for image in uploaded_images:
            Photo.objects.create(task_rating=instance, image=image)
        
        return instance

class SubmissionSerializer(serializers.ModelSerializer):
    task_ratings = TaskRatingSerializer(many=True, read_only=True)
    task_ratings_data = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )
    staff_username = serializers.ReadOnlyField(source='staff.username')
    location_name = serializers.ReadOnlyField(source='location.name')
    completion_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Submission
        fields = ('id', 'location', 'location_name', 'staff', 'staff_username', 
                  'date', 'task_ratings', 'task_ratings_data', 'completion_rate',
                  'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')
    
    @transaction.atomic
    def create(self, validated_data):
        task_ratings_data = validated_data.pop('task_ratings_data', [])
        submission = Submission.objects.create(**validated_data)
        
        for task_data in task_ratings_data:
            checklist_item_id = task_data.pop('checklist_item')
            uploaded_images = task_data.pop('uploaded_images', [])
            
            task_rating = TaskRating.objects.create(
                submission=submission,
                checklist_item_id=checklist_item_id,
                **task_data
            )
            
            for image in uploaded_images:
                Photo.objects.create(task_rating=task_rating, image=image)
        
        return submission
    
    @transaction.atomic
    def update(self, instance, validated_data):
        task_ratings_data = validated_data.pop('task_ratings_data', [])
        
        # Update submission fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Handle task ratings updates and additions
        for task_data in task_ratings_data:
            checklist_item_id = task_data.pop('checklist_item')
            uploaded_images = task_data.pop('uploaded_images', [])
            
            task_rating, created = TaskRating.objects.update_or_create(
                submission=instance,
                checklist_item_id=checklist_item_id,
                defaults=task_data
            )
            
            # Add new photos
            for image in uploaded_images:
                Photo.objects.create(task_rating=task_rating, image=image)
        
        return instance

class SubmissionListSerializer(serializers.ModelSerializer):
    """A simplified serializer for list views"""
    staff_username = serializers.ReadOnlyField(source='staff.username')
    location_name = serializers.ReadOnlyField(source='location.name')
    completion_rate = serializers.ReadOnlyField()
    
    class Meta:
        model = Submission
        fields = ('id', 'location', 'location_name', 'staff', 'staff_username', 
                  'date', 'completion_rate', 'created_at')