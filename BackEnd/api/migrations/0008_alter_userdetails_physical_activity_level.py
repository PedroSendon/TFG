# Generated by Django 5.1.1 on 2024-10-26 10:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_alter_userdetails_weight_goal'),
    ]

    operations = [
        migrations.AlterField(
            model_name='userdetails',
            name='physical_activity_level',
            field=models.CharField(choices=[('sedentary', 'Sedentario'), ('light', 'Ligera'), ('moderate', 'Moderada'), ('intense', 'Intensa')], max_length=20),
        ),
    ]
