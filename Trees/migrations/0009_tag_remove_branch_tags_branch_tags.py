# Generated by Django 4.1.4 on 2022-12-29 10:06

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Trees', '0008_alter_comment_is_issue'),
    ]

    operations = [
        migrations.CreateModel(
            name='Tag',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.TextField(default='')),
                ('origin', models.TextField(default='')),
                ('destin', models.TextField(default='')),
                ('priority', models.IntegerField(default=0)),
            ],
        ),
        migrations.RemoveField(
            model_name='branch',
            name='tags',
        ),
        migrations.AddField(
            model_name='branch',
            name='tags',
            field=models.ManyToManyField(blank=True, to='Trees.tag'),
        ),
    ]
