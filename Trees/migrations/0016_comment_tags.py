# Generated by Django 4.1.4 on 2023-01-02 16:40

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Trees', '0015_tag_group_tag_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='tags',
            field=models.ManyToManyField(blank=True, to='Trees.tag'),
        ),
    ]