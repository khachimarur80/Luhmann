# Generated by Django 4.1.4 on 2022-12-31 05:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Trees', '0010_remove_comment_is_issue_remove_comment_issue_solved_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='comment',
            name='date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='comment',
            name='state',
            field=models.TextField(default='Hacer'),
        ),
    ]
