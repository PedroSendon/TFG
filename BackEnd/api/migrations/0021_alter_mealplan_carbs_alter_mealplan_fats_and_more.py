# Generated by Django 5.1.1 on 2024-11-13 15:00

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0020_alter_mealplan_calories'),
    ]

    operations = [
        migrations.AlterField(
            model_name='mealplan',
            name='carbs',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AlterField(
            model_name='mealplan',
            name='fats',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
        migrations.AlterField(
            model_name='mealplan',
            name='proteins',
            field=models.DecimalField(blank=True, decimal_places=2, max_digits=5, null=True),
        ),
    ]