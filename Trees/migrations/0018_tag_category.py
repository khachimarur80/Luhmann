# Generated by Django 4.1.4 on 2023-01-02 18:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Trees', '0017_tag_color'),
    ]

    operations = [
        migrations.AddField(
            model_name='tag',
            name='category',
            field=models.TextField(default=''),
        ),
    ]