# Generated manually for agent description feature

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('authentication_handler', '0005_propertyanalysisshare_sharedanalysisview'),
    ]

    operations = [
        migrations.AddField(
            model_name='propertyanalysis',
            name='agent_description',
            field=models.TextField(blank=True, help_text='Generated agent description', null=True),
        ),
    ] 