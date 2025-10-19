package com.Backend.configuration;

import com.Backend.features.authentication.model.User;
import com.Backend.features.authentication.repository.UserRepository;
import com.Backend.features.authentication.utils.Encoder;
import com.Backend.features.quizes.entity.Question;
import com.Backend.features.quizes.entity.Quiz;
import com.Backend.features.quizes.repository.QuestionRepository;
import com.Backend.features.quizes.repository.QuizRepository;
import com.cloudinary.Cloudinary;
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

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", "talksyimages");
        config.put("api_key", "936115345826783");
        config.put("api_secret", "DBJoqxG0BaNe6T-V0zKaLpzPnzI");
        return new Cloudinary(config);
    }


    private List<QuizData> createGrammarQuizData() {
        List<QuizData> quizzes = new ArrayList<>();

        // Quiz Set 1: Articles (The, A, An)
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtG_O_TgAvytvOHeel4MPWkby5-GZdrKPOtg&s",
                "Articles: Mastering 'A', 'An', and 'The' – the tiny words that make you sound like a grammar genius 😎",
                Arrays.asList(
                        new QuestionData(
                                "Why is it correct to say 'The Moon is bright tonight'?",
                                "Because 'Moon' is a common noun.",
                                "Because 'Moon' is a unique object we all know.",
                                "Because it is a big object.",
                                "Because it is far away.",
                                "b",
                                "✨ Tip: 'The' loves uniqueness! There’s only *one* Moon we all share — unless you’re living on another planet 🌕👽."
                        ),
                        new QuestionData(
                                "Why is 'The Pacific Ocean is the largest' correct?",
                                "Because 'Pacific Ocean' is unique and well-known.",
                                "Because it is a proper noun.",
                                "Because 'largest' needs 'the'.",
                                "All of the above.",
                                "d",
                                "💡 Fun fact: The Pacific Ocean is *so big*, it needs all the grammar rules at once! 😂 It’s unique 🌊, it’s a proper noun 🌍, and 'largest' (a superlative) always demands 'the'."
                        ),
                        new QuestionData(
                                "Which is correct?",
                                "I saw a moon last night.",
                                "I saw the moon last night.",
                                "I saw moon last night.",
                                "I saw an moon last night.",
                                "b",
                                "🌝 Memory hack: You can only see *one* moon in your sky (unless you stayed up too late studying 🤪). Use 'the'!"
                        ),
                        new QuestionData(
                                "Complete: '__ sun rises in the east.'",
                                "A", "An", "The", "No article needed",
                                "c",
                                "☀️ Rule of the universe: There’s only one sun in our solar system — so it deserves 'the' like a celebrity 🌟."
                        ),
                        new QuestionData(
                                "Which sentence is correct?",
                                "She is a best student in class.",
                                "She is the best student in class.",
                                "She is best student in class.",
                                "She is an best student in class.",
                                "b",
                                "🏆 Use 'the' before superlatives like 'best', 'worst', or 'tallest' — because there can be only *one* at the top (like the final boss in a video game 🎮)."
                        ),
                        new QuestionData(
                                "Choose the correct article: 'I need __ umbrella.'",
                                "a", "an", "the", "no article",
                                "b",
                                "☔ Use 'an' before vowel sounds! You don’t want your sentence to sound like hiccups — 'an umbrella' flows better than 'a umbrella' 😂."
                        ),
                        new QuestionData(
                                "Which is correct?",
                                "I have a hour to finish.",
                                "I have an hour to finish.",
                                "I have the hour to finish.",
                                "I have hour to finish.",
                                "b",
                                "🕒 Tricky one! 'Hour' starts with a *vowel sound* because 'h' is silent 🤫 — so we say 'an hour'. English pronunciation: 1, logic: 0 😅."
                        ),
                        new QuestionData(
                                "Complete: '__ Amazon River is the longest river.'",
                                "A", "An", "The", "No article",
                                "c",
                                "🌊 Geography secret: Use 'the' before names of rivers, oceans, and mountain ranges. They’re like VIPs of the natural world — no entry without 'the' pass! 🎫"
                        ),
                        new QuestionData(
                                "Which is correct?",
                                "I saw a European man.",
                                "I saw an European man.",
                                "I saw the European man.",
                                "Both a and c are possible.",
                                "d",
                                "🇪🇺 Sneaky sound trap! 'European' starts with a *'you'* sound (a consonant), so we use 'a'. But if you mean a *specific* guy, go with 'the'. Context is king 👑!"
                        ),
                        new QuestionData(
                                "Choose the correct sentence:",
                                "Dogs are a loyal animals.",
                                "Dogs are the loyal animals.",
                                "Dogs are loyal animals.",
                                "A dogs are loyal animals.",
                                "c",
                                "🐶 Rule: When talking about things in general (like 'Dogs are loyal animals'), no article is needed. Because all dogs are good bois ❤️."
                        )
                )
        ));

// 🧠 Quiz Set 3: Comparatives and Superlatives — Grammar’s Olympics Edition 🏅
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQGj6SpZHMt5ehJ7qhsco7jaDnC-IxQXbjp5Q&s",
                "Comparatives compare two things 🆚, superlatives show the ultimate champion 🏆 (the highest degree).",
                Arrays.asList(

                        new QuestionData(
                                "Why is 'Mount Everest is the highest mountain' correct?",
                                "Because 'highest' is a superlative and needs 'the'.",
                                "Because Everest is in Asia.",
                                "Because mountains are tall.",
                                "Because of geography rules.",
                                "a",
                                "🏔️ Rule: Superlatives like 'highest', 'best', or 'largest' always wear the crown 👑 — and that crown is 'the'! (Everest earned it fair and square 😂)"
                        ),

                        new QuestionData(
                                "Why do we say 'This book is better than that one'?",
                                "Because 'better' compares two things.",
                                "Because 'better' is a superlative.",
                                "Because 'book' is singular.",
                                "Because 'than' means 'different'.",
                                "a",
                                "📘 Comparative alert: 'Better' is the special comparative of 'good'. We use comparatives when it’s a *1v1 situation* — your book vs mine 😎."
                        ),

                        new QuestionData(
                                "Which is correct?",
                                "She is the most intelligent than her sister.",
                                "She is more intelligent than her sister.",
                                "She is most intelligent than her sister.",
                                "She is the more intelligent than her sister.",
                                "b",
                                "🧠 Memory hack: For longer adjectives (like 'intelligent'), use 'more + adjective + than'. Think of 'more' as your grammar helper carrying long words 😂."
                        ),

                        new QuestionData(
                                "Complete: 'This is __ interesting book I've ever read.'",
                                "more", "most", "the most", "the more",
                                "c",
                                "🤓 Superlative zone! When you hit the extreme end (like the *most interesting* book ever), go for 'the most'. Without 'the', it sounds half-baked 🍞."
                        ),

                        new QuestionData(
                                "Which sentence is correct?",
                                "John is taller of the two brothers.",
                                "John is the taller of the two brothers.",
                                "John is tallest of the two brothers.",
                                "John is the tallest of the two brothers.",
                                "b",
                                "👬 When comparing *two* people, use 'the' + comparative ('the taller'). No 'tallest' here — that’s for three or more, not sibling duels 😅."
                        ),

                        new QuestionData(
                                "Choose the correct form: 'Today is __ than yesterday.'",
                                "hot", "hotter", "hottest", "the hottest",
                                "b",
                                "🔥 Double the fun, double the 't'! Short adjectives like 'hot' get an extra letter in comparatives: 'hot → hotter'. English loves drama! 😆"
                        ),

                        new QuestionData(
                                "Which is correct?",
                                "This is the better solution of all.",
                                "This is the best solution of all.",
                                "This is better solution of all.",
                                "This is best solution of all.",
                                "b",
                                "🏁 Grammar rule: 'Better' is for two, 'best' is for everyone! So among all possible answers, *this one’s the best* 😜."
                        ),

                        new QuestionData(
                                "Complete: 'She runs __ in the team.'",
                                "fast", "faster", "fastest", "the fastest",
                                "d",
                                "🏃‍♀️💨 Use 'the fastest' for superlatives — it means she’s the Usain Bolt of the team! No one beats her speed 🥇."
                        ),

                        new QuestionData(
                                "Which sentence is correct?",
                                "He is as tall than his father.",
                                "He is as tall as his father.",
                                "He is so tall than his father.",
                                "He is so tall as his father.",
                                "b",
                                "📏 Equality vibes ✌️ — use 'as...as' for equal comparisons. Never mix 'than' with it unless you want grammar chaos 🤯."
                        ),

                        new QuestionData(
                                "Choose the correct form: 'This problem is __ difficult.'",
                                "much more", "much most", "very more", "very most",
                                "a",
                                "⚙️ Booster mode: Use 'much more' to add emphasis! 'Very more' sounds like your grammar is buffering 😅 — let’s keep it 'much more difficult'."
                        )
                )
        ));

// 🌞 Quiz Set 4: Present Simple Tense — The Routine Reality Show 📺
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrOSpmTdtlrDdt3PFICTXeIQcCF8im6EdjVA&s",
                "Present Simple: Used for habits 🏃‍♂️, routines ⏰, and universal truths 🌍.",
                Arrays.asList(

                        new QuestionData(
                                "Why is 'She plays tennis every Sunday' correct?",
                                "Because it describes a habit.",
                                "Because 'plays' is in past tense.",
                                "Because 'Sunday' is a noun.",
                                "Because 'tennis' is a sport.",
                                "a",
                                "🎾 Present Simple = habits and routines! If she does it *every Sunday*, that’s her weekly workout and grammar perfection combo 😎."
                        ),

                        new QuestionData(
                                "Why do we say 'Water boils at 100°C'?",
                                "Because it's a scientific fact.",
                                "Because water is hot.",
                                "Because of grammar tradition.",
                                "Because water is a noun.",
                                "a",
                                "💧 Rule: We use Present Simple for *facts that never change*! Like gravity, taxes, and your phone dying at 1% 🔋😂."
                        ),

                        new QuestionData(
                                "Which is correct?",
                                "He go to work by bus.",
                                "He goes to work by bus.",
                                "He going to work by bus.",
                                "He is go to work by bus.",
                                "b",
                                "🚌 Third-person rule! When the subject is he/she/it, just add ‘s’ or ‘es’. Think of it as giving them a little *S*wag 😉."
                        ),

                        new QuestionData(
                                "Complete: 'The sun __ in the east.'",
                                "rise", "rises", "rising", "is rise",
                                "b",
                                "☀️ This is a *fact of nature*! The sun always 'rises' (not ‘rise’) because 'sun' = he/she/it → add that 's'. Grammar’s gravity rule! 🌅"
                        ),

                        new QuestionData(
                                "Which sentence is correct?",
                                "Do she like chocolate?",
                                "Does she like chocolate?",
                                "Does she likes chocolate?",
                                "Do she likes chocolate?",
                                "b",
                                "🍫 Remember: ‘Does’ already carries the ‘s’! So the main verb stays simple — like our love for chocolate ❤️."
                        ),

                        new QuestionData(
                                "Choose the correct form: 'They __ English very well.'",
                                "speaks", "speak", "speaking", "are speak",
                                "b",
                                "🗣️ Plural subjects (I/you/we/they) don’t need extra ‘s’. One person = 'speaks', many people = 'speak' — easy as group chat grammar 😅."
                        ),

                        new QuestionData(
                                "Which is correct?",
                                "I am not understanding this lesson.",
                                "I don't understand this lesson.",
                                "I not understand this lesson.",
                                "I doesn't understand this lesson.",
                                "b",
                                "🤯 ‘Understand’ is a *stative verb* — it talks about the mind, not action! So no ‘am’ or ‘-ing’ — just plain 'don’t understand'. 🧘‍♂️"
                        ),

                        new QuestionData(
                                "Complete: 'She __ to school every day.'",
                                "walk", "walks", "walking", "is walk",
                                "b",
                                "🚶‍♀️ Routine alert! She does it every day — Present Simple with an 's' because she’s ‘she’. If she had no ‘s’, it’d sound like you skipped school grammar! 😆"
                        ),

                        new QuestionData(
                                "Which sentence is correct?",
                                "How often do you goes to the gym?",
                                "How often does you go to the gym?",
                                "How often do you go to the gym?",
                                "How often you go to the gym?",
                                "c",
                                "💪 Rule: For ‘you’, always use ‘do’ (not ‘does’). So if you ever say 'does you', may your gym membership be revoked 🏋️‍♂️😂."
                        ),

                        new QuestionData(
                                "Choose the correct negative form: 'He __ coffee.'",
                                "don't drink", "doesn't drink", "not drink", "doesn't drinks",
                                "b",
                                "☕ Grammar caffeine tip: ‘He’ needs ‘doesn’t’, but no extra ‘s’ after it. 'Doesn't drink' keeps your English strong — just like espresso ☕🔥."
                        )
                )
        ));

// 🕰️ Quiz Set 5: Past Simple Tense — The Time Traveler’s Grammar Guide 🚀
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb6UPuLQbU_w2lMsZtm3vUMLH_9Vf49TA1dQ&s",
                "Past Simple: Used for actions that are done and dusted ✅ in the past. (Aka: yesterday’s business!)",
                Arrays.asList(

                        new QuestionData(
                                "Why is 'I visited Paris last year' correct?",
                                "Because the action is finished.",
                                "Because Paris is a city.",
                                "Because 'visited' is a long word.",
                                "Because it's about travel.",
                                "a",
                                "🗼 The moment you add 'last year', your sentence hops into the past! Past Simple marks finished actions — like your Paris trip 🧳🇫🇷."
                        ),

                        new QuestionData(
                                "Why is 'She studied hard for the exam' correct?",
                                "Because the studying is in the past.",
                                "Because 'exam' is singular.",
                                "Because she passed.",
                                "Because 'studied' is a short word.",
                                "a",
                                "📚 She *studied* = it’s done. The past simple tense is your go-to when the action has already packed its bags and left 🧠💨."
                        ),

                        new QuestionData(
                                "Which is correct?",
                                "I go to the store yesterday.",
                                "I went to the store yesterday.",
                                "I going to the store yesterday.",
                                "I was go to the store yesterday.",
                                "b",
                                "🛒 You can’t ‘go’ yesterday — you already ‘went’! 'Go' is present, 'went' is its time-travelled version 🚀 (irregular verb alert!)."
                        ),

                        new QuestionData(
                                "Complete: 'They __ the movie last night.'",
                                "watch", "watched", "watching", "were watch",
                                "b",
                                "🎬 Add '-ed' to regular verbs to go back in time! 'Watch' becomes 'watched' — because that movie night is ancient history now 🍿📺."
                        ),

                        new QuestionData(
                                "Which sentence is correct?",
                                "Did you saw the accident?",
                                "Did you see the accident?",
                                "Were you saw the accident?",
                                "Do you saw the accident?",
                                "b",
                                "🚓 Use 'did' + base form (no past again). You already used your past power with 'did', so keep the main verb in base form. No double time travel! 🕳️⏳"
                        ),

                        new QuestionData(
                                "Choose the correct form: 'She __ her homework yesterday.'",
                                "finish", "finished", "finishes", "finishing",
                                "b",
                                "📝 'Yesterday' screams past tense! Add '-ed' → 'finished'. Once the homework’s done, it’s officially grammar-approved ✅😅."
                        ),

                        new QuestionData(
                                "Which is correct?",
                                "I didn't went to work yesterday.",
                                "I didn't go to work yesterday.",
                                "I not went to work yesterday.",
                                "I wasn't go to work yesterday.",
                                "b",
                                "🚫 'Didn’t' already pulls your verb into the past, so the main verb chills in base form — 'didn’t go'. (Double past = grammar overload 💥)"
                        ),

                        new QuestionData(
                                "Complete: 'He __ his keys at home.'",
                                "leave", "left", "leaves", "leaving",
                                "b",
                                "🔑 'Leave' → 'left' — one of those irregular verbs that refuses the '-ed' trend. He *left* his keys, and now he’s locked out 😂."
                        ),

                        new QuestionData(
                                "Which sentence is correct?",
                                "When did you arrived?",
                                "When did you arrive?",
                                "When you arrived?",
                                "When were you arrived?",
                                "b",
                                "🕐 Grammar detective mode: 'Did' takes care of the past, so 'arrive' stays simple. No need for ‘arrived’ again — grammar hates time loops ⏳😆."
                        ),

                        new QuestionData(
                                "Choose the correct negative: 'We __ the meeting.'",
                                "didn't attended", "didn't attend", "not attended", "weren't attended",
                                "b",
                                "📅 'Didn’t' + base verb = perfect past negative! 'Didn’t attend' = we skipped it 😬 (maybe Netflix was more important 📺)."
                        )
                )
        ));

        // 🌟 QUIZ SET 6: Present Continuous – “The Grammar of the Now!”
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_kNL5ySa3TqCDUn7jDL_pG50ssvnfqJU9cw&s",
                "🎬 Present Continuous: Used for actions happening right now, or temporary situations. Think of it as the 'live broadcast' tense 📺",
                Arrays.asList(
                        new QuestionData(
                                "Why do we say 'I am reading a book right now'?",
                                "For actions happening at this moment.", "For daily habits.",
                                "For completed actions.", "For future plans only.", "a",
                                "📖 Imagine you’re mid-chapter — the action’s *in progress*! Present continuous = something that’s *happening live!* 🎥"
                        ),
                        new QuestionData(
                                "Which is correct?",
                                "She is work in the garden.", "She working in the garden.",
                                "She is working in the garden.", "She works in the garden now.", "c",
                                "🌱 'is/am/are' + verb + '-ing' = perfect combo! Grammar’s little recipe for ongoing action 🍲"
                        ),
                        new QuestionData(
                                "Complete: 'They __ for the bus.'",
                                "wait", "waits", "are waiting", "were waiting", "c",
                                "🚌 They’re literally standing there right now checking their phones for bus timings 😂 — so 'are waiting' fits perfectly!"
                        ),
                        new QuestionData(
                                "Which sentence shows present continuous correctly?",
                                "I am loving this song.", "I love this song.",
                                "I am love this song.", "I loving this song.", "b",
                                "💘 Some verbs like 'love', 'know', 'believe' are *stative* — they describe states, not actions. You don’t 'actively love' every second… or do you? 😏"
                        ),
                        new QuestionData(
                                "Choose the correct form: 'What __ you __ ?'",
                                "do/doing", "are/doing", "do/do", "are/do", "b",
                                "🕵️‍♂️ Question mode! Present continuous question = 'are/is/am' + subject + verb-ing. Example: 'What are you doing scrolling quizzes at 2 a.m.? 😜'"
                        ),
                        new QuestionData(
                                "Which is correct?",
                                "He doesn't working today.", "He isn't working today.",
                                "He not working today.", "He don't working today.", "b",
                                "💼 When you’re chilling and your boss thinks you’re 'working', remember: 'He isn’t working today' 😎"
                        ),
                        new QuestionData(
                                "Complete: 'The children __ in the park.'",
                                "play", "plays", "are playing", "playing", "c",
                                "🏃‍♂️ Kids rarely sit still — so we say 'are playing' because it’s happening *right now*! 🎈"
                        ),
                        new QuestionData(
                                "Which sentence is correct?",
                                "I am understanding the lesson now.", "I understand the lesson now.",
                                "I am understand the lesson now.", "I understanding the lesson now.", "b",
                                "🧠 You don’t *actively* understand — it’s a state. So we use 'understand' (simple present). If only math worked like that too 😅"
                        ),
                        new QuestionData(
                                "Choose the correct present continuous: 'She __ dinner.'",
                                "cook", "cooks", "is cooking", "cooking", "c",
                                "🍳 Chef mode activated 👩‍🍳 'is cooking' — because the action is sizzling *right now* 🔥"
                        ),
                        new QuestionData(
                                "Which is correct for temporary situations?",
                                "I live with my parents this month.", "I am living with my parents this month.",
                                "I lived with my parents this month.", "I was living with my parents this month.", "b",
                                "🏠 'I am living...' shows something *temporary*. You’re not stuck forever (hopefully 😅)."
                        )
                )
        ));


// 🌈 QUIZ SET 7: Present Perfect – “The Bridge Between Past and Present ⏳”
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSsUARF8jrFDUP1rh3q19HfTAmP8Ueo_iXfEg&s",
                "🕰️ Present Perfect: Connects your *past actions* to your *current life*. Like your 'experience resume' in grammar 💼",
                Arrays.asList(
                        new QuestionData(
                                "When do we say 'I have lived here for 5 years'?",
                                "For actions starting in the past and continuing now.", "For completed past actions.",
                                "For future plans.", "For daily routines.", "a",
                                "🏡 Started in the past, still true now — that’s the present perfect *vibe*. It’s the tense that doesn’t let go 😂"
                        ),
                        new QuestionData(
                                "Which is correct?",
                                "I have saw that movie.", "I have seen that movie.",
                                "I have see that movie.", "I saw that movie already.", "b",
                                "🎬 Present perfect = 'have/has' + past participle. 'Seen' not 'saw' — even your grammar wants spoilers 😆"
                        ),
                        new QuestionData(
                                "Complete: 'She __ her homework yet.'",
                                "didn't finish", "hasn't finished", "haven't finished", "doesn't finish", "b",
                                "📚 Use 'hasn't finished' for 3rd person. Because she’s *still pretending* to study 😜"
                        ),
                        new QuestionData(
                                "Which sentence shows experience correctly?",
                                "Have you ever been to Japan?", "Did you ever go to Japan?",
                                "Are you ever going to Japan?", "Do you ever go to Japan?", "a",
                                "🎒 Use 'have you ever' to talk about *life experiences*. (Even if your biggest adventure was surviving Monday 😩)"
                        ),
                        new QuestionData(
                                "Choose the correct form: 'They __ just __ home.'",
                                "have/arrived", "has/arrived", "have/arrive", "are/arrived", "a",
                                "🚪 'Have arrived' — they’re home now! The tense that connects *then* and *now*. 🕰️"
                        ),
                        new QuestionData(
                                "Which is correct?",
                                "I have went to the store.", "I have gone to the store.",
                                "I have go to the store.", "I went to the store already.", "b",
                                "🛒 Grammar twist: 'Gone' is the past participle. 'Went' retired long ago 😅"
                        ),
                        new QuestionData(
                                "Complete: 'How long __ you __ English?'",
                                "do/study", "are/studying", "have/studied", "did/study", "c",
                                "🎓 'Have studied' — perfect when your learning started in the past and still continues (like your never-ending journey with grammar 🫠)"
                        ),
                        new QuestionData(
                                "Which sentence is correct?",
                                "I have been to Paris last year.", "I went to Paris last year.",
                                "I have gone to Paris last year.", "I am going to Paris last year.", "b",
                                "🗼 Never use present perfect with *specific past times* like 'last year'. Time travel grammar isn’t allowed yet ⏳"
                        ),
                        new QuestionData(
                                "Choose the correct form: 'We __ never __ this before.'",
                                "have/done", "has/done", "have/did", "are/doing", "a",
                                "🧩 'Have never done' — that’s how you confess grammar crimes you’ve never committed 😅"
                        ),
                        new QuestionData(
                                "Which is correct for recent past?",
                                "I just finished my work.", "I have just finished my work.",
                                "I am just finishing my work.", "I was just finishing my work.", "b",
                                "⏰ Present perfect + 'just' = something done a few moments ago — like you *just* understood this concept 😎"
                        )
                )
        ));


// 💪 QUIZ SET 8: Modal Verbs – “The Superpower Words 🦸‍♂️”
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLeZmPaOrV9bxH6GeV0oxkbxw638LVWqLm5Q&s",
                "⚡ Modal Verbs: These words show power — ability, advice, possibility, and rules. Think of them as your grammar Avengers 🦸‍♀️",
                Arrays.asList(
                        new QuestionData(
                                "Which modal shows ability?",
                                "I must swim well.", "I should swim well.",
                                "I can swim well.", "I would swim well.", "c",
                                "💪 'Can' = ability. You can swim, dance, code, or eat an entire pizza — all proudly with 'can' 🍕"
                        ),
                        new QuestionData(
                                "What does 'You should exercise more' express?",
                                "Obligation", "Advice", "Ability", "Permission", "b",
                                "🏋️‍♂️ 'Should' gives advice — your grammar coach saying, 'Come on, do one more rep!' 😅"
                        ),
                        new QuestionData(
                                "Which is correct for strong obligation?",
                                "You can wear a seatbelt.", "You should wear a seatbelt.",
                                "You must wear a seatbelt.", "You could wear a seatbelt.", "c",
                                "🚗 'Must' = serious rule. Not optional. Unless you’re Superman… but even he wears one 😎"
                        ),
                        new QuestionData(
                                "Complete: '__ I use your phone?'",
                                "Must", "Should", "Can", "Would", "c",
                                "📱 'Can I...?' is casual permission — but please don’t forget to ask before borrowing my charger again 🔌😂"
                        ),
                        new QuestionData(
                                "Which sentence shows past ability?",
                                "I can speak French when I was young.", "I could speak French when I was young.",
                                "I should speak French when I was young.", "I must speak French when I was young.", "b",
                                "🗣️ 'Could' = past form of 'can'. Back when you were young and fearless 😎"
                        ),
                        new QuestionData(
                                "Choose the correct modal: 'You __ be careful while driving.'",
                                "can", "could", "should", "would", "c",
                                "🚦 'Should' = advice mode. Like your mom’s favorite sentence: 'You should drive slower!' 😂"
                        ),
                        new QuestionData(
                                "Which is correct for prohibition?",
                                "You can't smoke here.", "You shouldn't smoke here.",
                                "You couldn't smoke here.", "You wouldn't smoke here.", "a",
                                "🚫 'Can't' = strict rule! The sign literally says 'NO SMOKING 🚷'"
                        ),
                        new QuestionData(
                                "Complete: 'It __ rain tomorrow.'",
                                "must", "should", "might", "can", "c",
                                "🌧️ 'Might' means maybe! So if you forget your umbrella, blame grammar, not me 😅"
                        ),
                        new QuestionData(
                                "Which sentence shows logical deduction?",
                                "He can be at home now.", "He should be at home now.",
                                "He must be at home now.", "He could be at home now.", "c",
                                "🕵️‍♀️ 'Must be' = 99% sure. Like when you smell food and say, 'Mom must be cooking!' 🍛"
                        ),
                        new QuestionData(
                                "Choose the polite request: '__ you help me?'",
                                "Can", "Could", "Should", "Must", "b",
                                "🙏 'Could you...' is polite and classy. Grammar-approved manners ✨"
                        )
                )
        ));

// 🌟 QUIZ SET 9: Passive Voice — “When the doer takes a nap, but the action shines!” 😴➡️💪
        quizzes.add(new QuizData(
                        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRo2yGXqZAknY8Glq-4Vaid8BSYihgqVAdw4w&s",
                        "Passive Voice: When the *action* is the hero and the doer quietly chills backstage 🎭.",
                        Arrays.asList(
                                new QuestionData(
                                        "Why use 'The book was written by Shakespeare'?",
                                        "To emphasize the book, not the author.", "Because it's shorter.",
                                        "Because Shakespeare is famous.", "Because books are important.", "a",
                                        "📚 Passive voice focuses on *what was done*, not *who did it*. It’s like saying, “Let’s talk about the masterpiece, not the guy holding the quill!” ✒️"
                                ),
                                new QuestionData(
                                        "Which is the correct passive form of 'They built the house'?",
                                        "The house built by them.", "The house was built by them.",
                                        "The house is built by them.", "The house has built by them.", "b",
                                        "🏠 Rule: Past Passive = 'was/were' + past participle.If it sounds like ‘The house built itself’ — nope, that’s haunted grammar 👻."
                        ),
                        new QuestionData(
                                "Complete: 'English __ all over the world.'",
                                "speaks", "is spoke", "is spoken", "speaking", "c",
                                "🌍 Present passive = 'is/am/are' + past participle.    So yes, English *is spoken* globally (even when it’s totally mispronounced by us sometimes 😅)."
                        ),
                        new QuestionData(
                                "Which sentence is in passive voice?",
                                "The teacher explained the lesson.", "The lesson was explained by the teacher.",
                                "The teacher is explaining the lesson.", "The teacher has explained the lesson.", "b",
                                "👩‍🏫 Tip: Passive = 'be' + past participle.    So instead of focusing on the teacher, we’re shining the light on *the lesson* (which deserves it, honestly)."
                ),
                new QuestionData(
                        "Choose the correct passive: 'Someone stole my bike.'",
                        "My bike stole by someone.", "My bike was stolen by someone.",
                        "My bike is stolen by someone.", "My bike has stolen by someone.", "b",
                        "🚴‍♂️ Past passive again! 'Was/were' + past participle.   Sadly, the thief is gone — but your grammar accuracy is here to stay 😎."
        ),
                new QuestionData(
                        "Which is correct?",
                        "The report will written tomorrow.", "The report will be written tomorrow.",
                        "The report will write tomorrow.", "The report will writing tomorrow.", "b",
                        "🕒 Future passive = 'will be' + past participle.  Because reports don’t write themselves (unless ChatGPT helps 😏)."
                ),
                new QuestionData(
                        "Complete: 'The car __ by my father every week.'",
                        "washes", "is washed", "washed", "washing", "b",
                        "🚗 Present passive = 'is/am/are' + past participle.   So yes, *the car is washed* weekly (or at least before Sunday drives 🧽)."
        ),
        new QuestionData(
                "Which sentence shows present perfect passive?",
                "The work has been completed.", "The work is completed.",
                "The work was completed.", "The work will be completed.", "a",
                "✨ Formula: 'has/have been' + past participle.   It shows something is *done and dusted*. Like your homework… hopefully 😅."
        ),
        new QuestionData(
                "Choose the correct passive: 'They are building a new school.'",
                "A new school builds by them.", "A new school is built by them.",
                "A new school is being built by them.", "A new school was built by them.", "c",
                "🏗️ Present Continuous Passive = 'is/am/are being' + past participle.  The action is *still happening*. It’s grammar under construction 👷‍♀️."
        ),
        new QuestionData(
                "Which is correct for general truths?",
                "Coffee grows in Brazil.", "Coffee is grown in Brazil.",
                "Coffee was grown in Brazil.", "Coffee has grown in Brazil.", "b",
                "☕ When something is regularly done, we use present passive — *is grown*.  Because coffee doesn’t grow itself (sadly 😭). Farmers do!"
        )
    )
));

// ⏰ QUIZ SET 10: Prepositions of Time — “When time meets grammar… magic happens!” ✨
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLWfbqTkbLoyCoh0YJj53GvVIRT7ArM6UaV9Fz3J_J7fTnvstimIAT-Wk3l-5ZUBj4CaA&usqp=CAU",
                "Prepositions of Time: 'At' ⏰ = exact point, 'In' 📅 = period, 'On' 🗓️ = specific day!",
                Arrays.asList(
                        new QuestionData(
                                "Which preposition: 'I wake up __ 7 o'clock.'",
                                "at", "in", "on", "by", "a",
                                "⏰ 'At' loves *specific times* — like 7 o'clock, midnight, or lunch (if you’re lucky 😋)."
                        ),
                        new QuestionData(
                                "Complete: 'She was born __ May.'",
                                "at", "in", "on", "by", "b",
                                "🌸 'In' covers big chunks of time: months, years, seasons, and eras (like *in the 90s* — ah, the golden age of cartoons 🎮)."
                        ),
                        new QuestionData(
                                "Which is correct: 'The meeting is __ Monday.'",
                                "at", "in", "on", "by", "c",
                                "📆 'On' is for *days and dates*. So if it’s *on Monday*, don’t oversleep — your boss won’t be passive 😬."
                        ),
                        new QuestionData(
                                "Choose the right preposition: 'I'll see you __ Christmas.'",
                                "at", "in", "on", "by", "a",
                                "🎄 Holidays are *special*, so we use 'at'.   (At Christmas = during the holiday time 🎅, not standing beside the Christmas tree 🌲)."
        ),
        new QuestionData(
                "Complete: 'He graduated __ 2020.'",
                "at", "in", "on", "by", "b",
                "🎓 'In' + year = perfect combo.   (He graduated *in 2020*, and hopefully didn’t do it *in pajamas* like we all did 😷)."
        ),
        new QuestionData(
                "Which is correct: 'The party is __ Saturday night.'",
                "at", "in", "on", "by", "c",
                "🎉 Use 'on' for *days*, even when combined with parts of the day: *on Saturday night*. (Don’t show up on Sunday morning — too late! 💤)"
        ),
                new QuestionData(
                        "Choose the preposition: 'I study __ the morning.'",
                        "at", "in", "on", "by", "b",
                        "☀️ Use 'in' with parts of the day: *in the morning, in the evening.*  (Not in the mood though — that’s emotional grammar 😂)."
        ),
        new QuestionData(
                "Which is correct: 'We'll meet __ noon.'",
                "at", "in", "on", "by", "a",
                "🌞 Use 'at' with *specific times* — *at noon*, *at midnight*.   No delays! Grammar hates being late ⏳."
        ),
        new QuestionData(
                "Complete: 'My birthday is __ July 15th.'",
                "at", "in", "on", "by", "c",
                "🎂 'On' + date = perfect match 💞.    So yes, *on July 15th* — don’t forget the cake 🎉!"
        ),
        new QuestionData(
                "Choose the right preposition: 'I'll finish __ the weekend.'",
                "at", "in", "on", "by", "a",
                "🛋️ British English: 'at the weekend' 🇬🇧, American English: 'on the weekend' 🇺🇸.   Either way, we all pretend to be productive 😅."
        )
    )
));

// 📍 QUIZ SET 11: Prepositions of Place — “Location, Location, Grammar!” 🧭
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSlX4J0iyqizy5dQ0TZefsWFYVDI1BJRKcniQ&s",
                "Prepositions of Place: 'At' 🎯 = point, 'In' 🏠 = space, 'On' 🧍‍♂️ = surface.",
                Arrays.asList(
                        new QuestionData(
                                "Which preposition: 'I'm __ home.'",
                                "at", "in", "on", "by", "a",
                                "🏡 We say 'at home', not 'in home'. English logic: 404 not found 😆. It’s just how it is!"
                        ),
                        new QuestionData(
                                "Complete: 'The book is __ the table.'",
                                "at", "in", "on", "under", "c",
                                "📘 'On' = touching or resting on a surface.   If it’s under the table — that’s where your motivation is hiding 😜."
                ),
                new QuestionData(
                        "Which is correct: 'She lives __ New York.'",
                        "at", "in", "on", "by", "b",
                        "🏙️ 'In' for cities, countries, and big spaces.   So yes, she lives *in* New York — not *on* it (she’s not Spider-Man 🕸️)."
                ),
                new QuestionData(
                        "Choose the preposition: 'Meet me __ the bus stop.'",
                        "at", "in", "on", "by", "a",
                        "🚌 'At' marks specific points — bus stop, gate, door.   (Just don’t make your friend wait too long ⏱️)."
        ),
        new QuestionData(
                "Complete: 'The keys are __ my pocket.'",
                "at", "in", "on", "by", "b",
                "🗝️ Use 'in' for enclosed spaces.   *In my pocket*, *in my bag*, *in my fridge* — where snacks mysteriously vanish 🍫."
        ),
        new QuestionData(
                "Which is correct: 'There's a picture __ the wall.'",
                "at", "in", "on", "by", "c",
                "🖼️ 'On' is for surfaces.   *On the wall*, *on the screen*, *on your nerves* (like your little sibling 😂)."
        ),
        new QuestionData(
                "Choose the preposition: 'I work __ a bank.'",
                "at", "in", "on", "by", "a",
                "🏦 'At' is for workplaces as points of activity — *at school, at a bank, at a hospital.*  (Not in the vault, hopefully 💰)."
        ),
        new QuestionData(
                "Complete: 'She's sitting __ the chair.'",
                "at", "in", "on", "by", "c",
                "🪑 We sit *on* chairs (not *in* them, unless it’s a beanbag 😆)."
        ),
                new QuestionData(
                        "Which is correct: 'The plane is __ the sky.'",
                        "at", "in", "on", "by", "b",
                        "✈️ 'In' = surrounded by something.   The plane is *in the sky*, like your dreams during math class ☁️."
        ),
        new QuestionData(
                "Choose the preposition: 'Turn left __ the corner.'",
                "at", "in", "on", "by", "a",
                "🚗 'At' is for points — *at the corner*, *at the gate*.   Just don’t say *on the corner* unless you’re standing *on top* of it 🧍‍♂️😂."
        )
    )
));

// 👥 QUIZ SET 12: Subject-Verb Agreement — “When subjects and verbs must date correctly 💞”
        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcIJbtabNw5GA3oZDC2WNiPk05oOLLNSHFaQ&s",
                "Subject-Verb Agreement: The grammar version of relationship goals 💍 — one must match the other perfectly!",
                Arrays.asList(
                        new QuestionData(
                                "Which is correct?",
                                "The dog run in the park.", "The dog runs in the park.",
                                "The dog running in the park.", "The dogs runs in the park.", "b",
                                "🐕 Singular subject = singular verb.  'The dog runs' — because one dog, one run. Simple, unlike human relationships 😂."
        ),
        new QuestionData(
                "Complete: 'Everyone __ happy about the news.'",
                "is", "are", "were", "being", "a",
                "🎉 'Everyone' sounds plural but is actually singular.  Grammar twist: One word = many people = still *is* 🤯."
        ),
        new QuestionData(
                "Which is correct?",
                "The books on the shelf is heavy.", "The books on the shelf are heavy.",
                "The books on the shelf was heavy.", "The books on the shelf be heavy.", "b",
                "📚 Focus on the *main noun* — 'books'. It’s plural, so use *are*.   Don’t let 'shelf' distract you like side quests in a game 🎮."
        ),
        new QuestionData(
                "Choose the correct verb: 'Neither John nor Mary __ here.'",
                "is", "are", "were", "be", "a",
                "🤝 Rule: With 'neither...nor', the verb agrees with the *nearest subject*.    So if Mary is closer, it’s *is*. Grammar proximity power! ⚡"
        ),
        new QuestionData(
                "Complete: 'The team __ playing well this season.'",
                "is", "are", "was", "were", "a",
                "⚽ Collective nouns like *team, family, jury* — usually singular.  Unless your team keeps losing — then *they are* the problem 😂."
        ),
        new QuestionData(
                "Which is correct?",
                "There is two cats in the garden.", "There are two cats in the garden.",
                "There was two cats in the garden.", "There be two cats in the garden.", "b",
                "🐈 'There are' + plural noun.  Grammar rule: count the cats, not the word 'there' 😼."
        ),
        new QuestionData(
                "Choose the verb: 'Each of the students __ a book.'",
                "have", "has", "having", "are having", "b",
                "📖 'Each' means one by one, so verb is singular — *has*.  (Even if there are 50 students. Grammar doesn’t care 😅.)"
        ),
        new QuestionData(
                "Complete: 'The news __ very important.'",
                "is", "are", "were", "being", "a",
                "📰 Surprise! 'News' looks plural but is singular.   Like 'mathematics', 'economics', or your never-ending deadlines 😩."
        ),
        new QuestionData(
                "Which is correct?",
                "Either the teacher or the students is wrong.", "Either the teacher or the students are wrong.",
                "Either the teacher or the students was wrong.", "Either the teacher or the students be wrong.", "b",  "🎓 'Either...or' also agrees with the nearest subject — here, 'students'.   Grammar: closer = stronger 😎."
        ),
        new QuestionData(
                "Choose the verb: 'Mathematics __ my favorite subject.'",
                "is", "are", "were", "being", "a",
                "📐 Subjects like *mathematics* or *physics* end with ‘s’ but are singular.  English: confusing since forever 🤯."
        )
    )
));


        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS74ZZHigjNqjGaNwJ2nwXhKnVqIj1uywM5hA&s",
                "Conditionals: The 'if' universe — where your dreams, mistakes, and hopes live in parallel timelines 🌀",
                Arrays.asList(
                        new QuestionData(
                                "Which is First Conditional?",
                                "If I have time, I will help you.", "If I had time, I would help you.",
                                "If I have had time, I will have helped you.", "If I am having time, I help you.", "a",
                                "🧠 Rule: First Conditional = *real and possible future*. Structure: 'if + present simple, will + base verb'. Example: 'If I study, I’ll pass.' (Reality check: only if you actually study 🤓)"
                        ),
                        new QuestionData(
                                "Complete the Second Conditional: 'If I __ rich, I __ travel the world.'",
                                "am/will", "were/would", "was/will", "am/would", "b",
                                "💭 Second Conditional = *unreal or imaginary*. Use 'if + past simple, would + base verb'. So 'If I were rich, I would travel the world.' 🏝️ (Right now, I’m just rich in dreams 😅)."
                        ),
                        new QuestionData(
                                "Which expresses an unreal past situation?",
                                "If I studied harder, I would pass.", "If I had studied harder, I would have passed.",
                                "If I study harder, I will pass.", "If I am studying harder, I pass.", "b",
                                "😩 Third Conditional = *the regret zone*. 'If I had studied harder, I would have passed.' But now... you’re crying in the exam hall 🥲."
                        ),
                        new QuestionData(
                                "Choose the correct Zero Conditional: 'If you heat water to 100°C, it __.'",
                                "will boil", "would boil", "boils", "boiled", "c",
                                "🌡️ Zero Conditional = *science mode*. Always true facts! Use present simple on both sides. 'If you heat water, it boils.' (No surprises there 💧🔥)."
                        ),
                        new QuestionData(
                                "Which is correct for advice?",
                                "If I am you, I will study more.", "If I were you, I would study more.",
                                "If I was you, I will study more.", "If I be you, I would study more.", "b",
                                "🕵️‍♂️ Advice formula: 'If I were you...' — use 'were' for all persons! English logic decided to be weird just to keep us humble 😆."
                        ),
                        new QuestionData(
                                "Complete: 'If it __ tomorrow, we'll cancel the picnic.'",
                                "rains", "rained", "will rain", "would rain", "a",
                                "☔ Use 'present simple' even when talking about the future! 'If it rains, we’ll cancel.' Grammar says: keep the future in the main clause, not after 'if'."
                        ),
                        new QuestionData(
                                "Which shows regret about the past?",
                                "If I don't go, I will regret it.", "If I didn't go, I would regret it.",
                                "If I hadn't gone, I would have regretted it.", "If I won't go, I will regret it.", "c",
                                "😖 Third Conditional again! Used for past regrets and missed chances. (Also known as the 'If only I...' therapy clause 😅)."
                        ),
                        new QuestionData(
                                "Choose the correct form: 'What would you do if you __ a million dollars?'",
                                "win", "won", "will win", "have won", "b",
                                "💸 Second Conditional — time to dream big! 'If you won a million dollars, what would you do?' (Probably still not buy grammar books, right? 😜)"
                        ),
                        new QuestionData(
                                "Complete: 'If I __ earlier, I wouldn't have missed the train.'",
                                "leave", "left", "had left", "will leave", "c",
                                "🚉 Third Conditional: 'If I had left earlier...' — The train left you, and so did your luck 🥲."
                        ),
                        new QuestionData(
                                "Which is Mixed Conditional?",
                                "If I had studied medicine, I would be a doctor now.", "If I study medicine, I will be a doctor.",
                                "If I studied medicine, I would be a doctor.", "If I am studying medicine, I will be a doctor.", "a",
                                "🧬 Mixed Conditional = *past condition + present result*. You didn’t study medicine in the past, and now you’re coding instead 💻🤣."
                        )
                )
        ));

        quizzes.add(new QuizData(
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAt4NV8yNX5lzqV2CDn3T7e-5P5p2Vd_tIww&s",
                "Question Formation: How to form different types of questions correctly (and stop sounding like a caveman).",
                Arrays.asList(
                        new QuestionData("Which is the correct yes/no question?",
                                "Do you like coffee?", "You like coffee?", "Like you coffee?", "You do like coffee?", "a",
                                "☕ 'Do you like coffee?' — Perfect structure! Use **Do/Does + subject + base verb** for simple present questions. Other forms sound like a robot learning English. 🤖"),

                        new QuestionData("Form a question: 'She lives in Paris.'",
                                "Where does she lives?", "Where does she live?", "Where she lives?", "Where do she live?", "b",
                                "🏙️ When using **does**, the main verb goes to base form → ‘live’, not ‘lives’. Think: ‘Does’ already carries the tense load, don’t double the drama! 🎭"),

                        new QuestionData("Which is correct for 'He is studying'?",
                                "What does he studying?", "What is he studying?", "What he is studying?", "What does he study?", "b",
                                "📚 Continuous tense = **Move the helping verb before subject.** So ‘is he studying?’ = correct. Never let ‘does’ crash the party here. 🚫"),

                        new QuestionData("Form a question: 'They have been waiting for two hours.'",
                                "How long they have been waiting?", "How long have they been waiting?", "How long do they have been waiting?", "How long are they been waiting?", "b",
                                "⏳ Rule: **Bring 'have/has' before the subject**. ‘How long have they been waiting?’ — You sound like Sherlock solving time mysteries! 🕵️‍♂️"),

                        new QuestionData("Which is the correct question?",
                                "What time does the train leaves?", "What time does the train leave?", "What time the train leaves?", "What time do the train leave?", "b",
                                "🚂 Never say ‘does leaves’! The helper ‘does’ already takes the tense, so main verb stays base → ‘leave’. One tense per sentence, folks! 😎"),

                        new QuestionData("Form a tag question: 'You can swim,'",
                                "can you?", "can't you?", "do you?", "don't you?", "b",
                                "🏊‍♂️ Positive statement → negative tag. So 'You can swim, **can't you?**' If you say 'can you?' — it sounds like a dare 😆"),

                        new QuestionData("Which is correct for past simple?",
                                "Where did you went yesterday?", "Where did you go yesterday?", "Where you went yesterday?", "Where do you went yesterday?", "b",
                                "🕰️ When ‘did’ enters, verb goes base form! So ‘did you go’, not ‘did you went’. 'Did' already brought the past, don't bring it twice 😂"),

                        new QuestionData("Complete the question: '__ students are in your class?'",
                                "How much", "How many", "How long", "How often", "b",
                                "🎓 Countable nouns like ‘students’ → **How many**. If you say 'How much students', your teacher cries silently 🥲"),

                        new QuestionData("Which tag is correct: 'She doesn't like pizza,'",
                                "doesn't she?", "does she?", "is she?", "isn't she?", "b",
                                "🍕 Negative statement → positive tag → ‘does she?’. Simple! Grammar is like pizza — too much topping (negatives) ruins it 😅"),

                        new QuestionData("Form a question about frequency: 'He plays tennis twice a week.'",
                                "How much does he play tennis?", "How often does he play tennis?", "How long does he play tennis?", "How many does he play tennis?", "b",
                                "🎾 Use **How often** for frequency. If you say ‘How much’, you sound like you're buying tennis instead of playing it 😂")
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