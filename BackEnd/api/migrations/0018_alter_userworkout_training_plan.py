# Generated by Django 5.1.1 on 2024-11-12 19:54

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_alter_workoutexercise_reps_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userworkout',
            name='training_plan',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='user_workouts', to='api.trainingplan'),
        ),
    ]