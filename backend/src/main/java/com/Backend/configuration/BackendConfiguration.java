package com.Backend.configuration;

import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.repository.UserRepository;
import com.Backend.features.authentication.utils.Encoder;
import com.Backend.features.quizes.entity.Question;
import com.Backend.features.quizes.entity.Quiz;
import com.Backend.features.quizes.repository.QuestionRepository;
import com.Backend.features.quizes.repository.QuizRepository;
import com.github.javafaker.Faker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.*;

@Configuration
public class BackendConfiguration {

    private final Encoder encoder;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private static final Logger log = LoggerFactory.getLogger(BackendConfiguration.class);

    public BackendConfiguration(Encoder encoder, QuizRepository quizRepository, QuestionRepository questionRepository) {
        this.encoder = encoder;
        this.quizRepository = quizRepository;
        this.questionRepository = questionRepository;
    }

    @Bean
    public CommandLineRunner initDatabase(UserRepository userRepository) {
        return args -> {
            Faker faker = new Faker(new Random(42)); // reproducible
            List<String> allHobbies = new ArrayList<>(List.of("🎮 Gaming", "🎵 Music", "✈️ Travel", "📚 Reading", "🎨 Art", "🏃 Running"));

            // 🟢 Create Users (as before)
            for (int i = 1; i <= 2; i++) {
                String firstName = faker.name().firstName();
                String lastName = faker.name().lastName();
                String email = (firstName + "." + lastName + i + "@mail.com").toLowerCase();

                if (userRepository.findByEmail(email).isEmpty()) {
                    User user = new User(email, encoder.encode("user123"));
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    user.setEmailVerified(true);
                    user.setNativeLanguage(faker.country().name());
                    Collections.shuffle(allHobbies);
                    user.setHobbies(new ArrayList<>(allHobbies.subList(0, faker.number().numberBetween(2, 4))));
                    user.setPoints(faker.number().numberBetween(0, 5001));
                    user.setProfilePicture("https://api.dicebear.com/7.x/adventurer/svg?seed=" + firstName + i);
                    user.setBio(faker.company().catchPhrase());
                    user.updateProfileComplete();
                    userRepository.save(user);

                    log.info("✅ Created user: {} {} ({}) | 🏆 Points: {} | 🌐 Language: {} | 🎯 Hobbies: {}",
                            firstName, lastName, email, user.getPoints(), user.getNativeLanguage(), user.getHobbies());
                } else {
                    log.info("⚠️ Skipping existing email: {}", email);
                }
            }

            // 🟢 Create 20 Grammar Quiz Sets
            if (quizRepository.count() == 0) {
                log.info("📝 Creating 20 grammar quiz sets...");

                List<QuizData> grammarQuizzes = createGrammarQuizData();

                for (int i = 0; i < grammarQuizzes.size(); i++) {
                    QuizData quizData = grammarQuizzes.get(i);
                    Quiz quiz = new Quiz();
                    quiz.setPhotoUrl(quizData.getPhotoUrl());
                    quiz.setCaption(quizData.getCaption());

                    List<Question> questions = new ArrayList<>();
                    for (QuestionData qData : quizData.getQuestions()) {
                        Question question = new Question();
                        question.setQuestionText(qData.getQuestionText());
                        question.setOptionA(qData.getOptionA());
                        question.setOptionB(qData.getOptionB());
                        question.setOptionC(qData.getOptionC());
                        question.setOptionD(qData.getOptionD());
                        question.setCorrectOption(qData.getCorrectOption());
                        question.setExplanation(qData.getExplanation());
                        question.setQuiz(quiz);
                        questions.add(question);
                    }

                    quiz.setQuestions(questions);
                    quizRepository.save(quiz);

                    log.info("✅ Created Grammar Quiz Set {}: {}", (i + 1), quizData.getCaption());
                }

                log.info("🎉 Successfully created 20 grammar quiz sets (200 questions total)");
            } else {
                log.info("🟡 Quiz data already exists. Skipping grammar quiz creation.");
            }
        };
    }

    private List<QuizData> createGrammarQuizData() {
        List<QuizData> quizzes = new ArrayList<>();

        // Quiz Set 1: Articles (The, A, An)
        quizzes.add(new QuizData(
                "https://ibb.co/Gfk3jQCH",
                "Articles: 'The' is used before unique things or well-known objects.",
                Arrays.asList(
                        new QuestionData("Why is it correct to say 'The Moon is bright tonight'?",
                                "Because 'Moon' is a common noun.", "Because 'Moon' is a unique object we all know.",
                                "Because it is a big object.", "Because it is far away.", "b",
                                "'The' is used before something unique or already known to everyone, like the Moon."),
                        new QuestionData("Why is 'The Pacific Ocean is the largest' correct?",
                                "Because 'Pacific Ocean' is unique and well-known.", "Because it is a proper noun.",
                                "Because 'largest' needs 'the'.", "All of the above.", "d",
                                "It's correct because the Pacific Ocean is unique, it's a proper noun, and superlatives like 'largest' require 'the'."),
                        new QuestionData("Which is correct?",
                                "I saw a moon last night.", "I saw the moon last night.",
                                "I saw moon last night.", "I saw an moon last night.", "b",
                                "Use 'the' with the moon because there is only one moon that we all know about."),
                        new QuestionData("Complete: '__ sun rises in the east.'",
                                "A", "An", "The", "No article needed", "c",
                                "Use 'the' with 'sun' because there is only one sun in our solar system."),
                        new QuestionData("Which sentence is correct?",
                                "She is a best student in class.", "She is the best student in class.",
                                "She is best student in class.", "She is an best student in class.", "b",
                                "Use 'the' with superlatives like 'best', 'worst', 'tallest', etc."),
                        new QuestionData("Choose the correct article: 'I need __ umbrella.'",
                                "a", "an", "the", "no article", "b",
                                "Use 'an' before words that start with a vowel sound, like 'umbrella'."),
                        new QuestionData("Which is correct?",
                                "I have a hour to finish.", "I have an hour to finish.",
                                "I have the hour to finish.", "I have hour to finish.", "b",
                                "Use 'an' before 'hour' because 'h' is silent and it starts with a vowel sound."),
                        new QuestionData("Complete: '__ Amazon River is the longest river.'",
                                "A", "An", "The", "No article", "c",
                                "Use 'the' with names of rivers, oceans, and mountain ranges."),
                        new QuestionData("Which is correct?",
                                "I saw a European man.", "I saw an European man.",
                                "I saw the European man.", "Both a and c are possible.", "d",
                                "Use 'a' before 'European' because it starts with a consonant sound, or 'the' if referring to a specific person."),
                        new QuestionData("Choose the correct sentence:",
                                "Dogs are a loyal animals.", "Dogs are the loyal animals.",
                                "Dogs are loyal animals.", "A dogs are loyal animals.", "c",
                                "No article is needed when making general statements about plural nouns.")
                )
        ));

        // Quiz Set 2: Indefinite Articles (A/An)
        quizzes.add(new QuizData(
                "https://ibb.co/sdvrQpyX",
                "Indefinite Articles: 'A' and 'An' are used for non-specific things.",
                Arrays.asList(
                        new QuestionData("Why do we say 'I saw a cat' instead of 'I saw the cat'?",
                                "Because it's about any cat, not a specific one.", "Because cats are animals.",
                                "Because 'cat' starts with a consonant.", "Because 'the' is wrong.", "a",
                                "'A' is used when mentioning something for the first time or when it's not specific."),
                        new QuestionData("Why is 'An apple a day keeps the doctor away' correct?",
                                "Because 'apple' starts with a vowel sound.", "Because it's a proverb.",
                                "Because it's healthy advice.", "Because 'apple' is plural.", "a",
                                "We use 'an' before words starting with a vowel sound, like 'apple'."),
                        new QuestionData("Which is correct?",
                                "She is a honest person.", "She is an honest person.",
                                "She is honest person.", "She is the honest person.", "b",
                                "Use 'an' before 'honest' because the 'h' is silent and it starts with a vowel sound."),
                        new QuestionData("Complete: 'He bought __ new car yesterday.'",
                                "a", "an", "the", "no article", "a",
                                "Use 'a' before 'new' because it starts with a consonant sound."),
                        new QuestionData("Which sentence is correct?",
                                "I need a information about this.", "I need an information about this.",
                                "I need the information about this.", "I need information about this.", "d",
                                "'Information' is an uncountable noun, so it doesn't take 'a' or 'an'."),
                        new QuestionData("Choose the correct article: 'It was __ unusual day.'",
                                "a", "an", "the", "no article", "b",
                                "Use 'an' before 'unusual' because it starts with a vowel sound."),
                        new QuestionData("Which is correct?",
                                "I have a university degree.", "I have an university degree.",
                                "I have the university degree.", "Both a and c are possible.", "d",
                                "Use 'a' because 'university' starts with a consonant sound, or 'the' if referring to a specific degree."),
                        new QuestionData("Complete: 'She wants to be __ engineer.'",
                                "a", "an", "the", "no article", "b",
                                "Use 'an' before 'engineer' because it starts with a vowel sound."),
                        new QuestionData("Which sentence is correct?",
                                "I saw a one-eyed pirate.", "I saw an one-eyed pirate.",
                                "I saw the one-eyed pirate.", "Both a and c are possible.", "d",
                                "Use 'a' because 'one' starts with a consonant sound, or 'the' if referring to a specific pirate."),
                        new QuestionData("Choose the correct article: 'He is __ FBI agent.'",
                                "a", "an", "the", "no article", "b",
                                "Use 'an' before 'FBI' because 'F' is pronounced 'ef' which starts with a vowel sound.")
                )
        ));

        // Quiz Set 3: Comparatives and Superlatives
        quizzes.add(new QuizData(
                "https://ibb.co/0pKGbrQs",
                "Comparatives compare two things, superlatives show the highest degree.",
                Arrays.asList(
                        new QuestionData("Why is 'Mount Everest is the highest mountain' correct?",
                                "Because 'highest' is a superlative and needs 'the'.", "Because Everest is in Asia.",
                                "Because mountains are tall.", "Because of geography rules.", "a",
                                "Superlatives like 'highest', 'best', 'largest' usually require 'the'."),
                        new QuestionData("Why do we say 'This book is better than that one'?",
                                "Because 'better' compares two things.", "Because 'better' is a superlative.",
                                "Because 'book' is singular.", "Because 'than' means 'different'.", "a",
                                "Comparatives like 'better', 'smaller', 'faster' are used when comparing two items."),
                        new QuestionData("Which is correct?",
                                "She is the most intelligent than her sister.", "She is more intelligent than her sister.",
                                "She is most intelligent than her sister.", "She is the more intelligent than her sister.", "b",
                                "Use 'more + adjective + than' for comparatives with longer adjectives."),
                        new QuestionData("Complete: 'This is __ interesting book I've ever read.'",
                                "more", "most", "the most", "the more", "c",
                                "Use 'the most' for superlatives with longer adjectives."),
                        new QuestionData("Which sentence is correct?",
                                "John is taller of the two brothers.", "John is the taller of the two brothers.",
                                "John is tallest of the two brothers.", "John is the tallest of the two brothers.", "b",
                                "When comparing two people or things, use 'the' + comparative form."),
                        new QuestionData("Choose the correct form: 'Today is __ than yesterday.'",
                                "hot", "hotter", "hottest", "the hottest", "b",
                                "Use the comparative form 'hotter' when comparing two things."),
                        new QuestionData("Which is correct?",
                                "This is the better solution of all.", "This is the best solution of all.",
                                "This is better solution of all.", "This is best solution of all.", "b",
                                "Use superlative 'best' when comparing more than two things."),
                        new QuestionData("Complete: 'She runs __ in the team.'",
                                "fast", "faster", "fastest", "the fastest", "d",
                                "Use 'the fastest' for superlative with short adjectives."),
                        new QuestionData("Which sentence is correct?",
                                "He is as tall than his father.", "He is as tall as his father.",
                                "He is so tall than his father.", "He is so tall as his father.", "b",
                                "Use 'as...as' for equal comparisons, not 'as...than'."),
                        new QuestionData("Choose the correct form: 'This problem is __ difficult.'",
                                "much more", "much most", "very more", "very most", "a",
                                "Use 'much more' to emphasize comparatives, not 'very more'.")
                )
        ));

        // Quiz Set 4: Present Simple Tense
        quizzes.add(new QuizData(
                "https://ibb.co/0RGHrvVR",
                "Present Simple: Used for habits, facts, and routines.",
                Arrays.asList(
                        new QuestionData("Why is 'She plays tennis every Sunday' correct?",
                                "Because it describes a habit.", "Because 'plays' is in past tense.",
                                "Because 'Sunday' is a noun.", "Because 'tennis' is a sport.", "a",
                                "The present simple tense is used to describe habits or regular actions."),
                        new QuestionData("Why do we say 'Water boils at 100°C'?",
                                "Because it's a scientific fact.", "Because water is hot.",
                                "Because of grammar tradition.", "Because water is a noun.", "a",
                                "The present simple is used for facts that are always true, like scientific facts."),
                        new QuestionData("Which is correct?",
                                "He go to work by bus.", "He goes to work by bus.",
                                "He going to work by bus.", "He is go to work by bus.", "b",
                                "Third person singular (he/she/it) needs 's' or 'es' in present simple."),
                        new QuestionData("Complete: 'The sun __ in the east.'",
                                "rise", "rises", "rising", "is rise", "b",
                                "Use 'rises' because 'sun' is third person singular and it's a general fact."),
                        new QuestionData("Which sentence is correct?",
                                "Do she like chocolate?", "Does she like chocolate?",
                                "Does she likes chocolate?", "Do she likes chocolate?", "b",
                                "Use 'does' for third person singular questions, and the base verb 'like'."),
                        new QuestionData("Choose the correct form: 'They __ English very well.'",
                                "speaks", "speak", "speaking", "are speak", "b",
                                "Use base form 'speak' for plural subjects in present simple."),
                        new QuestionData("Which is correct?",
                                "I am not understanding this lesson.", "I don't understand this lesson.",
                                "I not understand this lesson.", "I doesn't understand this lesson.", "b",
                                "Use 'don't' + base verb for negative present simple with I/you/we/they."),
                        new QuestionData("Complete: 'She __ to school every day.'",
                                "walk", "walks", "walking", "is walk", "b",
                                "Third person singular 'she' requires 's' ending in present simple."),
                        new QuestionData("Which sentence is correct?",
                                "How often do you goes to the gym?", "How often does you go to the gym?",
                                "How often do you go to the gym?", "How often you go to the gym?", "c",
                                "Use 'do' + base verb for questions with 'you' in present simple."),
                        new QuestionData("Choose the correct negative form: 'He __ coffee.'",
                                "don't drink", "doesn't drink", "not drink", "doesn't drinks", "b",
                                "Use 'doesn't' + base verb for negative third person singular.")
                )
        ));

        // Quiz Set 5: Past Simple Tense
        quizzes.add(new QuizData(
                "https://ibb.co/LDqZK5WF",
                "Past Simple: Used for actions completed in the past.",
                Arrays.asList(
                        new QuestionData("Why is 'I visited Paris last year' correct?",
                                "Because the action is finished.", "Because Paris is a city.",
                                "Because 'visited' is a long word.", "Because it's about travel.", "a",
                                "The past simple describes an action completed at a specific time in the past."),
                        new QuestionData("Why is 'She studied hard for the exam' correct?",
                                "Because the studying is in the past.", "Because 'exam' is singular.",
                                "Because she passed.", "Because 'studied' is a short word.", "a",
                                "Past simple tense is used for actions that are already finished."),
                        new QuestionData("Which is correct?",
                                "I go to the store yesterday.", "I went to the store yesterday.",
                                "I going to the store yesterday.", "I was go to the store yesterday.", "b",
                                "Use past simple 'went' for completed actions in the past."),
                        new QuestionData("Complete: 'They __ the movie last night.'",
                                "watch", "watched", "watching", "were watch", "b",
                                "Regular verbs form past simple by adding '-ed' to the base form."),
                        new QuestionData("Which sentence is correct?",
                                "Did you saw the accident?", "Did you see the accident?",
                                "Were you saw the accident?", "Do you saw the accident?", "b",
                                "Use 'did' + base verb for past simple questions."),
                        new QuestionData("Choose the correct form: 'She __ her homework yesterday.'",
                                "finish", "finished", "finishes", "finishing", "b",
                                "Use past simple 'finished' for completed actions in the past."),
                        new QuestionData("Which is correct?",
                                "I didn't went to work yesterday.", "I didn't go to work yesterday.",
                                "I not went to work yesterday.", "I wasn't go to work yesterday.", "b",
                                "Use 'didn't' + base verb for negative past simple."),
                        new QuestionData("Complete: 'He __ his keys at home.'",
                                "leave", "left", "leaves", "leaving", "b",
                                "'Leave' is irregular - its past simple form is 'left'."),
                        new QuestionData("Which sentence is correct?",
                                "When did you arrived?", "When did you arrive?",
                                "When you arrived?", "When were you arrived?", "b",
                                "Use 'did' + base verb in past simple questions."),
                        new QuestionData("Choose the correct negative: 'We __ the meeting.'",
                                "didn't attended", "didn't attend", "not attended", "weren't attended", "b",
                                "Use 'didn't' + base verb for negative past simple statements.")
                )
        ));

        // Quiz Set 6: Present Continuous/Progressive
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Present Continuous: Used for actions happening now or temporary situations.",
                Arrays.asList(
                        new QuestionData("When do we use 'I am reading a book right now'?",
                                "For actions happening at this moment.", "For daily habits.",
                                "For completed actions.", "For future plans only.", "a",
                                "Present continuous shows actions in progress at the time of speaking."),
                        new QuestionData("Which is correct?",
                                "She is work in the garden.", "She working in the garden.",
                                "She is working in the garden.", "She works in the garden now.", "c",
                                "Present continuous uses 'be' + verb + '-ing' for ongoing actions."),
                        new QuestionData("Complete: 'They __ for the bus.'",
                                "wait", "waits", "are waiting", "were waiting", "c",
                                "Use 'are waiting' for actions happening now with plural subjects."),
                        new QuestionData("Which sentence shows present continuous correctly?",
                                "I am loving this song.", "I love this song.",
                                "I am love this song.", "I loving this song.", "b",
                                "Stative verbs like 'love' are not usually used in continuous tenses."),
                        new QuestionData("Choose the correct form: 'What __ you __ ?'",
                                "do/doing", "are/doing", "do/do", "are/do", "b",
                                "Use 'are' + 'doing' for present continuous questions."),
                        new QuestionData("Which is correct?",
                                "He doesn't working today.", "He isn't working today.",
                                "He not working today.", "He don't working today.", "b",
                                "Use 'isn't' + verb + '-ing' for negative present continuous."),
                        new QuestionData("Complete: 'The children __ in the park.'",
                                "play", "plays", "are playing", "playing", "c",
                                "Present continuous with plural subjects uses 'are' + verb + '-ing'."),
                        new QuestionData("Which sentence is correct?",
                                "I am understanding the lesson now.", "I understand the lesson now.",
                                "I am understand the lesson now.", "I understanding the lesson now.", "b",
                                "Mental state verbs like 'understand' are rarely used in continuous form."),
                        new QuestionData("Choose the correct present continuous: 'She __ dinner.'",
                                "cook", "cooks", "is cooking", "cooking", "c",
                                "Third person singular uses 'is' + verb + '-ing' in present continuous."),
                        new QuestionData("Which is correct for temporary situations?",
                                "I live with my parents this month.", "I am living with my parents this month.",
                                "I lived with my parents this month.", "I was living with my parents this month.", "b",
                                "Present continuous is used for temporary situations happening around now.")
                )
        ));

        // Quiz Set 7: Present Perfect
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Present Perfect: Connects past actions to the present moment.",
                Arrays.asList(
                        new QuestionData("When do we say 'I have lived here for 5 years'?",
                                "For actions starting in the past and continuing now.", "For completed past actions.",
                                "For future plans.", "For daily routines.", "a",
                                "Present perfect shows actions that started in the past and continue to the present."),
                        new QuestionData("Which is correct?",
                                "I have saw that movie.", "I have seen that movie.",
                                "I have see that movie.", "I saw that movie already.", "b",
                                "Present perfect uses 'have/has' + past participle ('seen', not 'saw')."),
                        new QuestionData("Complete: 'She __ her homework yet.'",
                                "didn't finish", "hasn't finished", "haven't finished", "doesn't finish", "b",
                                "Use 'hasn't' + past participle for negative present perfect with third person singular."),
                        new QuestionData("Which sentence shows experience correctly?",
                                "Have you ever been to Japan?", "Did you ever go to Japan?",
                                "Are you ever going to Japan?", "Do you ever go to Japan?", "a",
                                "Use present perfect with 'ever' to ask about life experiences."),
                        new QuestionData("Choose the correct form: 'They __ just __ home.'",
                                "have/arrived", "has/arrived", "have/arrive", "are/arrived", "a",
                                "Use 'have' + past participle with plural subjects and 'just'."),
                        new QuestionData("Which is correct?",
                                "I have went to the store.", "I have gone to the store.",
                                "I have go to the store.", "I went to the store already.", "b",
                                "The past participle of 'go' is 'gone', not 'went'."),
                        new QuestionData("Complete: 'How long __ you __ English?'",
                                "do/study", "are/studying", "have/studied", "did/study", "c",
                                "Use present perfect with 'How long' for duration from past to present."),
                        new QuestionData("Which sentence is correct?",
                                "I have been to Paris last year.", "I went to Paris last year.",
                                "I have gone to Paris last year.", "I am going to Paris last year.", "b",
                                "Don't use present perfect with specific past time expressions like 'last year'."),
                        new QuestionData("Choose the correct form: 'We __ never __ this before.'",
                                "have/done", "has/done", "have/did", "are/doing", "a",
                                "Use 'have' + past participle with 'never' for negative experience."),
                        new QuestionData("Which is correct for recent past?",
                                "I just finished my work.", "I have just finished my work.",
                                "I am just finishing my work.", "I was just finishing my work.", "b",
                                "Present perfect with 'just' shows very recent completed actions.")
                )
        ));

        // Quiz Set 8: Modal Verbs (Can, Could, Should, Must)
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Modal Verbs: Express ability, possibility, advice, and obligation.",
                Arrays.asList(
                        new QuestionData("Which modal shows ability?",
                                "I must swim well.", "I should swim well.",
                                "I can swim well.", "I would swim well.", "c",
                                "'Can' expresses ability or skill in the present."),
                        new QuestionData("What does 'You should exercise more' express?",
                                "Obligation", "Advice", "Ability", "Permission", "b",
                                "'Should' is used to give advice or recommendations."),
                        new QuestionData("Which is correct for strong obligation?",
                                "You can wear a seatbelt.", "You should wear a seatbelt.",
                                "You must wear a seatbelt.", "You could wear a seatbelt.", "c",
                                "'Must' expresses strong obligation or necessity."),
                        new QuestionData("Complete: '__ I use your phone?'",
                                "Must", "Should", "Can", "Would", "c",
                                "Use 'Can' to ask for permission politely."),
                        new QuestionData("Which sentence shows past ability?",
                                "I can speak French when I was young.", "I could speak French when I was young.",
                                "I should speak French when I was young.", "I must speak French when I was young.", "b",
                                "'Could' is the past form of 'can' for past abilities."),
                        new QuestionData("Choose the correct modal: 'You __ be careful while driving.'",
                                "can", "could", "should", "would", "c",
                                "'Should' gives advice about being careful."),
                        new QuestionData("Which is correct for prohibition?",
                                "You can't smoke here.", "You shouldn't smoke here.",
                                "You couldn't smoke here.", "You wouldn't smoke here.", "a",
                                "'Can't' expresses prohibition or things that are not allowed."),
                        new QuestionData("Complete: 'It __ rain tomorrow.'",
                                "must", "should", "might", "can", "c",
                                "'Might' expresses possibility or uncertainty about the future."),
                        new QuestionData("Which sentence shows logical deduction?",
                                "He can be at home now.", "He should be at home now.",
                                "He must be at home now.", "He could be at home now.", "c",
                                "'Must' expresses logical deduction when we're almost certain."),
                        new QuestionData("Choose the polite request: '__ you help me?'",
                                "Can", "Could", "Should", "Must", "b",
                                "'Could' is more polite than 'can' for making requests.")
                )
        ));

        // Quiz Set 9: Passive Voice
        quizzes.add(new QuizData(
                "https://ibb.co/ycNK6W",
                "Passive Voice: Used when the action is more important than who does it.",
                Arrays.asList(
                        new QuestionData("Why use 'The book was written by Shakespeare'?",
                                "To emphasize the book, not the author.", "Because it's shorter.",
                                "Because Shakespeare is famous.", "Because books are important.", "a",
                                "Passive voice emphasizes the receiver of the action rather than the doer."),
                        new QuestionData("Which is the correct passive form of 'They built the house'?",
                                "The house built by them.", "The house was built by them.",
                                "The house is built by them.", "The house has built by them.", "b",
                                "Past passive uses 'was/were' + past participle."),
                        new QuestionData("Complete: 'English __ all over the world.'",
                                "speaks", "is spoke", "is spoken", "speaking", "c",
                                "Present passive uses 'is/am/are' + past participle."),
                        new QuestionData("Which sentence is in passive voice?",
                                "The teacher explained the lesson.", "The lesson was explained by the teacher.",
                                "The teacher is explaining the lesson.", "The teacher has explained the lesson.", "b",
                                "Passive voice uses 'be' + past participle, focusing on what receives the action."),
                        new QuestionData("Choose the correct passive: 'Someone stole my bike.'",
                                "My bike stole by someone.", "My bike was stolen by someone.",
                                "My bike is stolen by someone.", "My bike has stolen by someone.", "b",
                                "Past passive uses 'was/were' + past participle for completed actions."),
                        new QuestionData("Which is correct?",
                                "The report will written tomorrow.", "The report will be written tomorrow.",
                                "The report will write tomorrow.", "The report will writing tomorrow.", "b",
                                "Future passive uses 'will be' + past participle."),
                        new QuestionData("Complete: 'The car __ by my father every week.'",
                                "washes", "is washed", "washed", "washing", "b",
                                "Present passive for regular actions uses 'is/am/are' + past participle."),
                        new QuestionData("Which sentence shows present perfect passive?",
                                "The work has been completed.", "The work is completed.",
                                "The work was completed.", "The work will be completed.", "a",
                                "Present perfect passive uses 'has/have been' + past participle."),
                        new QuestionData("Choose the correct passive: 'They are building a new school.'",
                                "A new school builds by them.", "A new school is built by them.",
                                "A new school is being built by them.", "A new school was built by them.", "c",
                                "Present continuous passive uses 'is/am/are being' + past participle."),
                        new QuestionData("Which is correct for general truths?",
                                "Coffee grows in Brazil.", "Coffee is grown in Brazil.",
                                "Coffee was grown in Brazil.", "Coffee has grown in Brazil.", "b",
                                "Use present passive for general facts about what happens to something.")
                )
        ));

        // Quiz Set 10: Prepositions of Time (at, in, on)
        quizzes.add(new QuizData(
                "https://ibb.co/q319CDQ2",
                "Prepositions of Time: 'At' for specific times, 'In' for months/years, 'On' for days.",
                Arrays.asList(
                        new QuestionData("Which preposition: 'I wake up __ 7 o'clock.'",
                                "at", "in", "on", "by", "a",
                                "Use 'at' with specific times like 7 o'clock, noon, midnight."),
                        new QuestionData("Complete: 'She was born __ May.'",
                                "at", "in", "on", "by", "b",
                                "Use 'in' with months, years, seasons, and longer periods."),
                        new QuestionData("Which is correct: 'The meeting is __ Monday.'",
                                "at", "in", "on", "by", "c",
                                "Use 'on' with days of the week and specific dates."),
                        new QuestionData("Choose the right preposition: 'I'll see you __ Christmas.'",
                                "at", "in", "on", "by", "a",
                                "Use 'at' with holidays and festivals like Christmas, Easter."),
                        new QuestionData("Complete: 'He graduated __ 2020.'",
                                "at", "in", "on", "by", "b",
                                "Use 'in' with years and longer time periods."),
                        new QuestionData("Which is correct: 'The party is __ Saturday night.'",
                                "at", "in", "on", "by", "c",
                                "Use 'on' with specific days, even when combined with parts of the day."),
                        new QuestionData("Choose the preposition: 'I study __ the morning.'",
                                "at", "in", "on", "by", "b",
                                "Use 'in' with parts of the day: morning, afternoon, evening."),
                        new QuestionData("Which is correct: 'We'll meet __ noon.'",
                                "at", "in", "on", "by", "a",
                                "Use 'at' with specific times like noon, midnight, dawn, dusk."),
                        new QuestionData("Complete: 'My birthday is __ July 15th.'",
                                "at", "in", "on", "by", "c",
                                "Use 'on' with specific dates including day and month."),
                        new QuestionData("Choose the right preposition: 'I'll finish __ the weekend.'",
                                "at", "in", "on", "by", "a",
                                "Use 'at' with 'the weekend' (British) or 'on' (American).")
                )
        ));

        // Quiz Set 11: Prepositions of Place (at, in, on)
        quizzes.add(new QuizData(
                "https://ibb.co/q319CDQ2",
                "Prepositions of Place: 'At' for points, 'In' for enclosed spaces, 'On' for surfaces.",
                Arrays.asList(
                        new QuestionData("Which preposition: 'I'm __ home.'",
                                "at", "in", "on", "by", "a",
                                "Use 'at' with 'home', 'work', 'school' as general locations."),
                        new QuestionData("Complete: 'The book is __ the table.'",
                                "at", "in", "on", "under", "c",
                                "Use 'on' for objects resting on surfaces."),
                        new QuestionData("Which is correct: 'She lives __ New York.'",
                                "at", "in", "on", "by", "b",
                                "Use 'in' with cities, countries, and enclosed spaces."),
                        new QuestionData("Choose the preposition: 'Meet me __ the bus stop.'",
                                "at", "in", "on", "by", "a",
                                "Use 'at' for specific points or locations."),
                        new QuestionData("Complete: 'The keys are __ my pocket.'",
                                "at", "in", "on", "by", "b",
                                "Use 'in' for things inside enclosed spaces."),
                        new QuestionData("Which is correct: 'There's a picture __ the wall.'",
                                "at", "in", "on", "by", "c",
                                "Use 'on' for things attached to or touching surfaces."),
                        new QuestionData("Choose the preposition: 'I work __ a bank.'",
                                "at", "in", "on", "by", "a",
                                "Use 'at' when referring to the place as a point of activity."),
                        new QuestionData("Complete: 'She's sitting __ the chair.'",
                                "at", "in", "on", "by", "c",
                                "Use 'on' for sitting on chairs, benches, stools."),
                        new QuestionData("Which is correct: 'The plane is __ the sky.'",
                                "at", "in", "on", "by", "b",
                                "Use 'in' for things within a three-dimensional space."),
                        new QuestionData("Choose the preposition: 'Turn left __ the corner.'",
                                "at", "in", "on", "by", "a",
                                "Use 'at' for specific points like corners, intersections.")
                )
        ));

        // Quiz Set 12: Subject-Verb Agreement
        quizzes.add(new QuizData(
                "" +
                        "",
                "Subject-Verb Agreement: Singular subjects take singular verbs, plural subjects take plural verbs.",
                Arrays.asList(
                        new QuestionData("Which is correct?",
                                "The dog run in the park.", "The dog runs in the park.",
                                "The dog running in the park.", "The dogs runs in the park.", "b",
                                "Singular subjects like 'dog' need singular verbs like 'runs'."),
                        new QuestionData("Complete: 'Everyone __ happy about the news.'",
                                "is", "are", "were", "being", "a",
                                "'Everyone' is singular, so it takes singular verb 'is'."),
                        new QuestionData("Which is correct?",
                                "The books on the shelf is heavy.", "The books on the shelf are heavy.",
                                "The books on the shelf was heavy.", "The books on the shelf be heavy.", "b",
                                "Plural subject 'books' requires plural verb 'are'."),
                        new QuestionData("Choose the correct verb: 'Neither John nor Mary __ here.'",
                                "is", "are", "were", "be", "a",
                                "With 'neither...nor', the verb agrees with the subject closer to it."),
                        new QuestionData("Complete: 'The team __ playing well this season.'",
                                "is", "are", "was", "were", "a",
                                "Collective nouns like 'team' are usually treated as singular."),
                        new QuestionData("Which is correct?",
                                "There is two cats in the garden.", "There are two cats in the garden.",
                                "There was two cats in the garden.", "There be two cats in the garden.", "b",
                                "With 'there are/is', the verb agrees with what follows it."),
                        new QuestionData("Choose the verb: 'Each of the students __ a book.'",
                                "have", "has", "having", "are having", "b",
                                "'Each' is singular, so it takes singular verb 'has'."),
                        new QuestionData("Complete: 'The news __ very important.'",
                                "is", "are", "were", "being", "a",
                                "'News' looks plural but is actually singular."),
                        new QuestionData("Which is correct?",
                                "Either the teacher or the students is wrong.", "Either the teacher or the students are wrong.",
                                "Either the teacher or the students was wrong.", "Either the teacher or the students be wrong.", "b",
                                "With 'either...or', the verb agrees with the nearest subject ('students')."),
                        new QuestionData("Choose the verb: 'Mathematics __ my favorite subject.'",
                                "is", "are", "were", "being", "a",
                                "School subjects ending in 's' like 'mathematics' are singular.")
                )
        ));

        // Quiz Set 13: Conditional Sentences (If clauses)
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Conditionals: Express hypothetical situations and their consequences.",
                Arrays.asList(
                        new QuestionData("Which is First Conditional?",
                                "If I have time, I will help you.", "If I had time, I would help you.",
                                "If I have had time, I will have helped you.", "If I am having time, I help you.", "a",
                                "First Conditional uses 'if + present simple, will + base verb' for likely futures."),
                        new QuestionData("Complete the Second Conditional: 'If I __ rich, I __ travel the world.'",
                                "am/will", "were/would", "was/will", "am/would", "b",
                                "Second Conditional uses 'if + past simple, would + base verb' for unreal situations."),
                        new QuestionData("Which expresses an unreal past situation?",
                                "If I studied harder, I would pass.", "If I had studied harder, I would have passed.",
                                "If I study harder, I will pass.", "If I am studying harder, I pass.", "b",
                                "Third Conditional uses 'if + past perfect, would have + past participle' for unreal past."),
                        new QuestionData("Choose the correct Zero Conditional: 'If you heat water to 100°C, it __.'",
                                "will boil", "would boil", "boils", "boiled", "c",
                                "Zero Conditional uses present simple in both clauses for general truths."),
                        new QuestionData("Which is correct for advice?",
                                "If I am you, I will study more.", "If I were you, I would study more.",
                                "If I was you, I will study more.", "If I be you, I would study more.", "b",
                                "Use 'were' (not 'was') with all persons in Second Conditional advice."),
                        new QuestionData("Complete: 'If it __ tomorrow, we'll cancel the picnic.'",
                                "rains", "rained", "will rain", "would rain", "a",
                                "First Conditional uses present simple in the 'if' clause, even for future meaning."),
                        new QuestionData("Which shows regret about the past?",
                                "If I don't go, I will regret it.", "If I didn't go, I would regret it.",
                                "If I hadn't gone, I would have regretted it.", "If I won't go, I will regret it.", "c",
                                "Third Conditional expresses regret about past actions that cannot be changed."),
                        new QuestionData("Choose the correct form: 'What would you do if you __ a million dollars?'",
                                "win", "won", "will win", "have won", "b",
                                "Second Conditional uses past simple in the 'if' clause for hypothetical situations."),
                        new QuestionData("Complete: 'If I __ earlier, I wouldn't have missed the train.'",
                                "leave", "left", "had left", "will leave", "c",
                                "Third Conditional uses past perfect in the 'if' clause for unreal past situations."),
                        new QuestionData("Which is Mixed Conditional?",
                                "If I had studied medicine, I would be a doctor now.", "If I study medicine, I will be a doctor.",
                                "If I studied medicine, I would be a doctor.", "If I am studying medicine, I will be a doctor.", "a",
                                "Mixed Conditional combines past condition with present result.")
                )
        ));

        // Quiz Set 14: Reported Speech
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Reported Speech: How to report what someone else said without using direct quotes.",
                Arrays.asList(
                        new QuestionData("Change to reported speech: 'I am tired,' she said.",
                                "She said that she was tired.", "She said that she is tired.",
                                "She said that I am tired.", "She said that I was tired.", "a",
                                "Change present to past and adjust pronouns when reporting speech."),
                        new QuestionData("Report: 'I will call you tomorrow,' he said.",
                                "He said he will call me tomorrow.", "He said he would call me tomorrow.",
                                "He said he would call me the next day.", "He said he will call me the next day.", "c",
                                "Change 'will' to 'would' and 'tomorrow' to 'the next day' in reported speech."),
                        new QuestionData("Change to reported speech: 'Where do you live?' she asked.",
                                "She asked where do I live.", "She asked where I lived.",
                                "She asked where did I live.", "She asked where I live.", "b",
                                "In reported questions, use statement word order and change tense."),
                        new QuestionData("Report: 'Can you help me?' he asked.",
                                "He asked if I can help him.", "He asked if I could help him.",
                                "He asked can I help him.", "He asked could I help him.", "b",
                                "Use 'if' for yes/no questions and change 'can' to 'could' in reported speech."),
                        new QuestionData("Change to reported speech: 'I have finished my work,' she said.",
                                "She said she has finished her work.", "She said she had finished her work.",
                                "She said she have finished her work.", "She said she finished her work.", "b",
                                "Change present perfect to past perfect in reported speech."),
                        new QuestionData("Report: 'Don't go there!' he warned.",
                                "He warned me to not go there.", "He warned me not to go there.",
                                "He warned me don't go there.", "He warned me to don't go there.", "b",
                                "Use 'not to + infinitive' for negative imperatives in reported speech."),
                        new QuestionData("Change to reported speech: 'I saw the movie yesterday,' he said.",
                                "He said he saw the movie yesterday.", "He said he had seen the movie the day before.",
                                "He said he sees the movie yesterday.", "He said he has seen the movie yesterday.", "b",
                                "Change past simple to past perfect and 'yesterday' to 'the day before'."),
                        new QuestionData("Report: 'Are you coming to the party?' she asked.",
                                "She asked if I am coming to the party.", "She asked if I was coming to the party.",
                                "She asked am I coming to the party.", "She asked was I coming to the party.", "b",
                                "Use 'if' and change present continuous to past continuous."),
                        new QuestionData("Change to reported speech: 'I must leave now,' he said.",
                                "He said he must leave then.", "He said he had to leave then.",
                                "He said he must leave now.", "He said he has to leave now.", "b",
                                "Change 'must' to 'had to' and 'now' to 'then' in reported speech."),
                        new QuestionData("Report: 'What time is it?' she asked.",
                                "She asked what time is it.", "She asked what time it was.",
                                "She asked what time was it.", "She asked what time it is.", "b",
                                "Use statement word order and change present to past in reported questions.")
                )
        ));

        // Quiz Set 15: Gerunds and Infinitives
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Gerunds vs Infinitives: Some verbs are followed by -ing, others by 'to + verb'.",
                Arrays.asList(
                        new QuestionData("Which is correct?",
                                "I enjoy to read books.", "I enjoy reading books.",
                                "I enjoy read books.", "I enjoy to reading books.", "b",
                                "'Enjoy' is followed by gerund (-ing form), not infinitive."),
                        new QuestionData("Complete: 'She decided __ to the party.'",
                                "going", "to go", "go", "went", "b",
                                "'Decide' is followed by infinitive (to + base verb)."),
                        new QuestionData("Which is correct?",
                                "I can't stand to wait in long queues.", "I can't stand waiting in long queues.",
                                "I can't stand wait in long queues.", "I can't stand to waiting in long queues.", "b",
                                "'Can't stand' is followed by gerund (-ing form)."),
                        new QuestionData("Choose the correct form: 'He promised __ me tomorrow.'",
                                "calling", "to call", "call", "called", "b",
                                "'Promise' is followed by infinitive (to + base verb)."),
                        new QuestionData("Which is correct?",
                                "I'm looking forward to see you.", "I'm looking forward to seeing you.",
                                "I'm looking forward see you.", "I'm looking forward seeing you.", "b",
                                "'Look forward to' is followed by gerund, not infinitive."),
                        new QuestionData("Complete: 'She suggested __ a movie.'",
                                "to watch", "watching", "watch", "watched", "b",
                                "'Suggest' is followed by gerund (-ing form)."),
                        new QuestionData("Which is correct?",
                                "I want learning Spanish.", "I want to learn Spanish.",
                                "I want learn Spanish.", "I want to learning Spanish.", "b",
                                "'Want' is followed by infinitive (to + base verb)."),
                        new QuestionData("Choose the form: 'He avoided __ about the problem.'",
                                "to talk", "talking", "talk", "talked", "b",
                                "'Avoid' is followed by gerund (-ing form)."),
                        new QuestionData("Which is correct?",
                                "She hopes visiting Paris next year.", "She hopes to visit Paris next year.",
                                "She hopes visit Paris next year.", "She hopes to visiting Paris next year.", "b",
                                "'Hope' is followed by infinitive (to + base verb)."),
                        new QuestionData("Complete: 'I don't mind __ here.'",
                                "to wait", "waiting", "wait", "waited", "b",
                                "'Mind' is followed by gerund (-ing form).")
                )
        ));

        // Quiz Set 16: Question Formation
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Question Formation: How to form different types of questions correctly.",
                Arrays.asList(
                        new QuestionData("Which is the correct yes/no question?",
                                "Do you like coffee?", "You like coffee?",
                                "Like you coffee?", "You do like coffee?", "a",
                                "Use 'do/does' + subject + base verb for yes/no questions in present simple."),
                        new QuestionData("Form a question: 'She lives in Paris.'",
                                "Where does she lives?", "Where does she live?",
                                "Where she lives?", "Where do she live?", "b",
                                "Use 'does' with third person singular and base form of the main verb."),
                        new QuestionData("Which is correct for 'He is studying'?",
                                "What does he studying?", "What is he studying?",
                                "What he is studying?", "What does he study?", "b",
                                "With continuous tenses, move the auxiliary verb 'is' before the subject."),
                        new QuestionData("Form a question: 'They have been waiting for two hours.'",
                                "How long they have been waiting?", "How long have they been waiting?",
                                "How long do they have been waiting?", "How long are they been waiting?", "b",
                                "With present perfect continuous, move 'have/has' before the subject."),
                        new QuestionData("Which is the correct question?",
                                "What time does the train leaves?", "What time does the train leave?",
                                "What time the train leaves?", "What time do the train leave?", "b",
                                "Use 'does' + base form of verb for third person singular questions."),
                        new QuestionData("Form a tag question: 'You can swim,'",
                                "can you?", "can't you?", "do you?", "don't you?", "b",
                                "Positive statement takes negative tag with the same auxiliary verb."),
                        new QuestionData("Which is correct for past simple?",
                                "Where did you went yesterday?", "Where did you go yesterday?",
                                "Where you went yesterday?", "Where do you went yesterday?", "b",
                                "Use 'did' + base form of verb for past simple questions."),
                        new QuestionData("Complete the question: '__ students are in your class?'",
                                "How much", "How many", "How long", "How often", "b",
                                "Use 'How many' with countable nouns like 'students'."),
                        new QuestionData("Which tag is correct: 'She doesn't like pizza,'",
                                "doesn't she?", "does she?", "is she?", "isn't she?", "b",
                                "Negative statement takes positive tag with the same auxiliary."),
                        new QuestionData("Form a question about frequency: 'He plays tennis twice a week.'",
                                "How much does he play tennis?", "How often does he play tennis?",
                                "How long does he play tennis?", "How many does he play tennis?", "b",
                                "Use 'How often' to ask about frequency of actions.")
                )
        ));

        // Quiz Set 17: Relative Clauses (Who, Which, That)
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Relative Clauses: Connect sentences using who, which, that, where, when.",
                Arrays.asList(
                        new QuestionData("Which relative pronoun: 'The man __ lives next door is a teacher.'",
                                "who", "which", "that", "Both a and c", "d",
                                "Use 'who' or 'that' for people as subjects of relative clauses."),
                        new QuestionData("Complete: 'The book __ I bought yesterday is interesting.'",
                                "who", "which", "that", "Both b and c", "d",
                                "Use 'which' or 'that' for things; 'that' is more common in object position."),
                        new QuestionData("Which is correct?",
                                "The woman which called you is my sister.", "The woman who called you is my sister.",
                                "The woman that called you is my sister.", "Both b and c are correct.", "d",
                                "'Who' and 'that' can both refer to people as subjects."),
                        new QuestionData("Choose the correct: 'This is the house __ I grew up.'",
                                "where", "which", "that", "when", "a",
                                "Use 'where' for places in relative clauses."),
                        new QuestionData("Complete: 'I remember the day __ we first met.'",
                                "where", "which", "that", "when", "d",
                                "Use 'when' for time references in relative clauses."),
                        new QuestionData("Which is correct?",
                                "The car who is parked outside is mine.", "The car which is parked outside is mine.",
                                "The car where is parked outside is mine.", "The car when is parked outside is mine.", "b",
                                "Use 'which' for things, never 'who' for objects."),
                        new QuestionData("Choose: 'The people __ live here are very friendly.'",
                                "who", "which", "where", "when", "a",
                                "Use 'who' for people as subjects of relative clauses."),
                        new QuestionData("Complete: 'Is this the restaurant __ you recommended?'",
                                "who", "which", "where", "that", "d",
                                "Use 'that' for things in restrictive relative clauses (can omit in object position)."),
                        new QuestionData("Which is correct non-defining clause?",
                                "My brother, that lives in London, is a doctor.", "My brother, who lives in London, is a doctor.",
                                "My brother, which lives in London, is a doctor.", "My brother, where lives in London, is a doctor.", "b",
                                "Use 'who' (not 'that') in non-defining relative clauses with commas."),
                        new QuestionData("Choose: 'The reason __ he left is unclear.'",
                                "who", "which", "why", "when", "c",
                                "Use 'why' for reasons in relative clauses.")
                )
        ));

        // Quiz Set 18: Quantifiers (some, any, much, many, few, little)
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Quantifiers: Words that express quantity - some, any, much, many, few, little.",
                Arrays.asList(
                        new QuestionData("Which is correct in negative sentences?",
                                "I don't have some money.", "I don't have any money.",
                                "I don't have many money.", "I don't have much moneys.", "b",
                                "Use 'any' in negative sentences and questions."),
                        new QuestionData("Complete: 'How __ students are in your class?'",
                                "much", "many", "few", "little", "b",
                                "Use 'many' with countable nouns in questions."),
                        new QuestionData("Which is correct with uncountable nouns?",
                                "I don't have many time.", "I don't have much time.",
                                "I don't have few time.", "I don't have little times.", "b",
                                "Use 'much' with uncountable nouns like 'time', 'money', 'water'."),
                        new QuestionData("Choose: 'There are __ apples in the basket.'",
                                "much", "little", "few", "a few", "d",
                                "Use 'a few' (positive meaning) with countable nouns."),
                        new QuestionData("Complete: 'I have __ money left.'",
                                "few", "a few", "little", "a little", "d",
                                "Use 'a little' (positive) with uncountable nouns."),
                        new QuestionData("Which is correct in questions?",
                                "Do you have some sugar?", "Do you have any sugar?",
                                "Do you have many sugar?", "Do you have much sugars?", "b",
                                "Use 'any' in questions with both countable and uncountable nouns."),
                        new QuestionData("Choose: 'Very __ people came to the party.'",
                                "little", "few", "much", "many", "b",
                                "Use 'few' (negative meaning) with countable nouns."),
                        new QuestionData("Complete: 'There's __ milk in the fridge.'",
                                "few", "a few", "little", "a little", "c",
                                "Use 'little' (negative meaning) with uncountable nouns."),
                        new QuestionData("Which is correct for offers?",
                                "Would you like any coffee?", "Would you like some coffee?",
                                "Would you like few coffee?", "Would you like much coffee?", "b",
                                "Use 'some' in offers and requests, even though they're questions."),
                        new QuestionData("Choose: 'I need __ information about this topic.'",
                                "many", "few", "some", "much", "c",
                                "Use 'some' in positive statements with both countable and uncountable nouns.")
                )
        ));

        // Quiz Set 19: Phrasal Verbs
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg","Phrasal Verbs: Verbs combined with prepositions or adverbs that create new meanings.",
                Arrays.asList(
                        new QuestionData("What does 'give up' mean?",
                                "To give something to someone", "To stop trying",
                                "To give more", "To give back", "b",
                                "'Give up' means to stop trying or quit doing something."),
                        new QuestionData("Which is correct: 'I need to __ this problem.'",
                                "look at", "look for", "look into", "look up", "c",
                                "'Look into' means to investigate or examine something carefully."),
                        new QuestionData("Complete: 'Please __ your shoes before entering.'",
                                "take off", "take on", "take up", "take out", "a",
                                "'Take off' means to remove something, especially clothing or shoes."),
                        new QuestionData("What does 'run out of' mean?",
                                "To run outside", "To have no more of something",
                                "To run quickly", "To run away", "b",
                                "'Run out of' means to use all of something so there's none left."),
                        new QuestionData("Choose: 'I __ my old friend at the mall yesterday.'",
                                "ran into", "ran out", "ran up", "ran over", "a",
                                "'Run into' means to meet someone unexpectedly."),
                        new QuestionData("Complete: 'Can you __ the music? It's too loud.'",
                                "turn on", "turn off", "turn up", "turn down", "d",
                                "'Turn down' means to reduce the volume or intensity."),
                        new QuestionData("What does 'put off' mean?",
                                "To wear something", "To postpone",
                                "To extinguish", "To place somewhere", "b",
                                "'Put off' means to delay or postpone something."),
                        new QuestionData("Choose: 'I need to __ this word in the dictionary.'",
                                "look up", "look down", "look over", "look through", "a",
                                "'Look up' means to search for information, especially in a reference book."),
                        new QuestionData("Complete: 'The meeting was __ until next week.'",
                                "called off", "called up", "called on", "called out", "a",
                                "'Call off' means to cancel something that was planned."),
                        new QuestionData("What does 'get along with' mean?",
                                "To arrive with someone", "To have a good relationship",
                                "To go somewhere together", "To bring something", "b",
                                "'Get along with' means to have a good relationship with someone.")
                )
        ));

        // Quiz Set 20: Common Grammar Mistakes
        quizzes.add(new QuizData(
                "https://images.pexels.com/photos/5428830/pexels-photo-5428830.jpeg",
                "Common Mistakes: Frequently confused words and grammar errors to avoid.",
                Arrays.asList(
                        new QuestionData("Which is correct?",
                                "Your welcome!", "You're welcome!",
                                "Youre welcome!", "Your'e welcome!", "b",
                                "'You're' is the contraction of 'you are'. 'Your' shows possession."),
                        new QuestionData("Choose the correct: 'I have __ books than you.'",
                                "less", "fewer", "little", "few", "b",
                                "Use 'fewer' with countable nouns, 'less' with uncountable nouns."),
                        new QuestionData("Which is correct?",
                                "It's raining outside.", "Its raining outside.",
                                "Its' raining outside.", "It's' raining outside.", "a",
                                "'It's' is the contraction of 'it is'. 'Its' shows possession."),
                        new QuestionData("Complete: 'The effect __ his health was serious.'",
                                "on", "in", "at", "for", "a",
                                "'Effect on' is the correct preposition. Don't confuse 'affect' (verb) with 'effect' (noun)."),
                        new QuestionData("Which is correct?",
                                "I could care less about that.", "I couldn't care less about that.",
                                "I could care fewer about that.", "I couldn't care fewer about that.", "b",
                                "'Couldn't care less' means you don't care at all (correct meaning)."),
                        new QuestionData("Choose: 'Between you and __.'",
                                "I", "me", "myself", "mine", "b",
                                "Use 'me' after prepositions like 'between'. 'Between you and me' is correct."),
                        new QuestionData("Which is correct?",
                                "Who's book is this?", "Whose book is this?",
                                "Who book is this?", "Whos book is this?", "b",
                                "'Whose' shows possession. 'Who's' is the contraction of 'who is'."),
                        new QuestionData("Complete: 'I feel __ today.'",
                                "good", "well", "goodly", "wellness", "a",
                                "Use 'good' (adjective) after linking verbs like 'feel', 'look', 'seem'."),
                        new QuestionData("Which is correct?",
                                "There house is beautiful.", "Their house is beautiful.",
                                "They're house is beautiful.", "Theyr house is beautiful.", "b",
                                "'Their' shows possession. 'There' indicates place. 'They're' means 'they are'."),
                        new QuestionData("Choose: 'Can you __ me that book?'",
                                "borrow", "lend", "loan", "Both b and c", "d",
                                "'Lend' and 'loan' mean to give temporarily. 'Borrow' means to take temporarily.")
                )
        ));

        return quizzes;
    }

    // Helper classes for quiz data structure
    private static class QuizData {
        private String photoUrl;
        private String caption;
        private List<QuestionData> questions;

        public QuizData(String photoUrl, String caption, List<QuestionData> questions) {
            this.photoUrl = photoUrl;
            this.caption = caption;
            this.questions = questions;
        }

        public String getPhotoUrl() { return photoUrl; }
        public String getCaption() { return caption; }
        public List<QuestionData> getQuestions() { return questions; }
    }

    private static class QuestionData {
        private String questionText;
        private String optionA;
        private String optionB;
        private String optionC;
        private String optionD;
        private String correctOption;
        private String explanation;

        public QuestionData(String questionText, String optionA, String optionB, String optionC,
                            String optionD, String correctOption, String explanation) {
            this.questionText = questionText;
            this.optionA = optionA;
            this.optionB = optionB;
            this.optionC = optionC;
            this.optionD = optionD;
            this.correctOption = correctOption;
            this.explanation = explanation;
        }

        public String getQuestionText() { return questionText; }
        public String getOptionA() { return optionA; }
        public String getOptionB() { return optionB; }
        public String getOptionC() { return optionC; }
        public String getOptionD() { return optionD; }
        public String getCorrectOption() { return correctOption; }
        public String getExplanation() { return explanation; }
    }
}