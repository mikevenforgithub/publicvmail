# Generated by Django 3.1.2 on 2021-04-30 19:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('mail', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Logo',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=150)),
                ('logo', models.FileField(upload_to='media/images')),
            ],
        ),
    ]
