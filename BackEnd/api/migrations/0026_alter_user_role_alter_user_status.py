# Generated by Django 5.1.3 on 2024-12-03 10:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0025_alter_user_profile_photo_alter_userdetails_height'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(choices=[('cliente', 'Cliente'), ('administrador', 'Administrador'), ('entrenador', 'Entrenador'), ('nutricionista', 'Nutricionista')], default='cliente', max_length=50),
        ),
        migrations.AlterField(
            model_name='user',
            name='status',
            field=models.CharField(choices=[('awaiting_assignment', 'Awaiting Assignment'), ('assigned', 'Assigned'), ('training_only', 'Training Plan Assigned Only'), ('nutrition_only', 'Nutrition Plan Assigned Only')], default='awaiting_assignment', max_length=50),
        ),
    ]
