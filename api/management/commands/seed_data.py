from django.core.management.base import BaseCommand
from api.models import Group, Word, StudyActivity, StudySession
from django.utils import timezone


class Command(BaseCommand):
    help = 'Seed the database with sample Twi learning data'

    def handle(self, *args, **options):
        self.stdout.write('Seeding data...')

        # Create Groups
        groups_data = [
            {'name': 'Greetings', 'description': 'Common greetings and polite expressions'},
            {'name': 'Food & Market', 'description': 'Food items and market vocabulary'},
            {'name': 'Family', 'description': 'Family members and relationships'},
            {'name': 'Everyday Verbs', 'description': 'Common action verbs'},
        ]

        groups = {}
        for g in groups_data:
            group, created = Group.objects.get_or_create(
                name=g['name'],
                defaults={'description': g['description']}
            )
            groups[group.name] = group
            self.stdout.write(f'{"Created" if created else "Existing"} group: {group.name}')

        # Create Words
        words_data = [
            # Greetings
            {'word': 'Akwaaba', 'language': 'twi', 'translation': 'Welcome', 'pronunciation': 'ah-kwaa-bah', 'example_sentence': 'Akwaaba wo ha', 'example_translation': 'Welcome here', 'groups': ['Greetings']},
            {'word': 'Maakye', 'language': 'twi', 'translation': 'Good morning', 'pronunciation': 'maa-chi', 'example_sentence': 'Maakye, wo ho te sɛn?', 'example_translation': 'Good morning, how are you?', 'groups': ['Greetings']},
            {'word': 'Mema wo akye', 'language': 'twi', 'translation': 'Good morning (reply)', 'pronunciation': 'meh-ma wo a-chi', 'example_sentence': 'Mema wo akye', 'example_translation': 'Good morning to you too', 'groups': ['Greetings']},
            {'word': 'Medaase', 'language': 'twi', 'translation': 'Thank you', 'pronunciation': 'meh-daa-seh', 'example_sentence': 'Medaase kɛseɛ', 'example_translation': 'Thank you very much', 'groups': ['Greetings']},
            {'word': 'Wo ho te sɛn?', 'language': 'twi', 'translation': 'How are you?', 'pronunciation': 'wo ho teh sen', 'example_sentence': 'Wo ho te sɛn?', 'example_translation': 'How are you?', 'groups': ['Greetings']},
            {'word': 'Me ho yɛ', 'language': 'twi', 'translation': 'I am fine', 'pronunciation': 'meh ho yeh', 'example_sentence': 'Me ho yɛ, na wo ho nso yɛ', 'example_translation': 'I am fine, and you too?', 'groups': ['Greetings']},
            
            # Food & Market
            {'word': 'Aburoo', 'language': 'twi', 'translation': 'Yam', 'pronunciation': 'ah-bu-ro', 'example_sentence': 'Mebɔ aburoo', 'example_translation': 'I want to buy yam', 'groups': ['Food & Market']},
            {'word': 'Bankye', 'language': 'twi', 'translation': 'Cassava', 'pronunciation': 'ban-chi', 'example_sentence': 'Bankye yɛ aduane', 'example_translation': 'Cassava is food', 'groups': ['Food & Market']},
            {'word': 'Mankani', 'language': 'twi', 'translation': 'Plantain', 'pronunciation': 'man-ka-ni', 'example_sentence': 'Mankani a ɔyɛ dɔ', 'example_translation': 'Ripe plantain', 'groups': ['Food & Market']},
            {'word': 'Nkate', 'language': 'twi', 'translation': 'Peanut', 'pronunciation': 'n-ka-teh', 'example_sentence': 'Nkate gu nkyene', 'example_translation': 'Peanuts with salt', 'groups': ['Food & Market']},
            {'word': 'Anwa', 'language': 'twi', 'translation': 'Palm oil', 'pronunciation': 'an-wa', 'example_sentence': 'Medi anwa kɔɔ aduanan', 'example_translation': 'I took palm oil to the kitchen', 'groups': ['Food & Market']},
            
            # Family
            {'word': 'Ɛna', 'language': 'twi', 'translation': 'Mother', 'pronunciation': 'eh-na', 'example_sentence': 'Ɛna me yɛ', 'example_translation': 'My mother', 'groups': ['Family']},
            {'word': 'Agya', 'language': 'twi', 'translation': 'Father', 'pronunciation': 'ah-gya', 'example_sentence': 'Agya me yɛ', 'example_translation': 'My father', 'groups': ['Family']},
            {'word': 'Abɔfra', 'language': 'twi', 'translation': 'Child', 'pronunciation': 'ah-bu-fra', 'example_sentence': 'Abɔfra no yɛ ɔbarima', 'example_translation': 'The child is a boy', 'groups': ['Family']},
            {'word': 'Nana', 'language': 'twi', 'translation': 'Grandparent/Chief', 'pronunciation': 'na-na', 'example_sentence': 'Nana me yɛ', 'example_translation': 'My grandparent', 'groups': ['Family']},
            {'word': 'Onua', 'language': 'twi', 'translation': 'Sibling', 'pronunciation': 'o-nua', 'example_sentence': 'Onua me yɛ', 'example_translation': 'My sibling', 'groups': ['Family']},
            
            # Everyday Verbs
            {'word': 'Kɔ', 'language': 'twi', 'translation': 'Go', 'pronunciation': 'ko', 'example_sentence': 'Mekɔ sukuu', 'example_translation': 'I am going to school', 'groups': ['Everyday Verbs']},
            {'word': 'Bra', 'language': 'twi', 'translation': 'Come', 'pronunciation': 'bra', 'example_sentence': 'Bra ha', 'example_translation': 'Come here', 'groups': ['Everyday Verbs']},
            {'word': 'Di', 'language': 'twi', 'translation': 'Eat', 'pronunciation': 'di', 'example_sentence': 'Medi aduane', 'example_translation': 'I am eating food', 'groups': ['Everyday Verbs']},
            {'word': 'Nom', 'language': 'twi', 'translation': 'Drink', 'pronunciation': 'nom', 'example_sentence': 'Menom nsuo', 'example_translation': 'I am drinking water', 'groups': ['Everyday Verbs']},
            {'word': 'Kasa', 'language': 'twi', 'translation': 'Speak/Talk', 'pronunciation': 'ka-sa', 'example_sentence': 'Kasa Twi kɛseɛ', 'example_translation': 'Speak Twi well', 'groups': ['Everyday Verbs']},
            {'word': 'Te', 'language': 'twi', 'translation': 'Listen', 'pronunciation': 'teh', 'example_sentence': 'Te me kasa no', 'example_translation': 'Listen to what I say', 'groups': ['Everyday Verbs']},
            {'word': 'Hu', 'language': 'twi', 'translation': 'See', 'pronunciation': 'hu', 'example_sentence': 'Mehu no', 'example_translation': 'I see it', 'groups': ['Everyday Verbs']},
            {'word': 'Dwuma', 'language': 'twi', 'translation': 'Work', 'pronunciation': 'dwoo-ma', 'example_sentence': 'Medwuma adwuma', 'example_translation': 'I am working', 'groups': ['Everyday Verbs']},
        ]

        for w in words_data:
            word, created = Word.objects.get_or_create(
                word=w['word'],
                defaults={
                    'language': w['language'],
                    'translation': w['translation'],
                    'pronunciation': w.get('pronunciation', ''),
                    'example_sentence': w.get('example_sentence', ''),
                    'example_translation': w.get('example_translation', ''),
                }
            )
            # Add to groups
            for group_name in w['groups']:
                if group_name in groups:
                    word.groups.add(groups[group_name])
            self.stdout.write(f'{"Created" if created else "Existing"} word: {word.word} ({word.translation})')

        # Create Study Activities
        activities_data = [
            {'name': 'Flashcards', 'activity_type': 'flashcards', 'groups': ['Greetings', 'Food & Market']},
            {'name': 'Listening Quiz', 'activity_type': 'quiz', 'groups': ['Family', 'Everyday Verbs']},
            {'name': 'Matching Game', 'activity_type': 'matching', 'groups': ['Greetings', 'Family']},
        ]

        activities = []
        for a in activities_data:
            activity, created = StudyActivity.objects.get_or_create(
                name=a['name'],
                defaults={'activity_type': a['activity_type']}
            )
            # Add groups
            for group_name in a['groups']:
                if group_name in groups:
                    activity.groups.add(groups[group_name])
            activities.append(activity)
            self.stdout.write(f'{"Created" if created else "Existing"} activity: {activity.name}')

        # Create Study Sessions
        import random
        from datetime import timedelta

        for i in range(5):
            activity = random.choice(activities)
            session = StudySession.objects.create(
                activity=activity,
                started_at=timezone.now() - timedelta(days=random.randint(1, 10), hours=random.randint(1, 23)),
                completed_at=timezone.now() - timedelta(days=random.randint(1, 10), hours=random.randint(1, 23)),
                score=random.randint(60, 100),
                total_questions=random.randint(10, 20),
                correct_answers=random.randint(7, 18)
            )
            self.stdout.write(f'Created session: {session.activity.name} - Score: {session.score}')

        self.stdout.write(self.style.SUCCESS('Data seeded successfully!'))
