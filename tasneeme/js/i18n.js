/* =========================================================
   Tasneeme — i18n  (en / ar / tn)
   ========================================================= */
(function () {
  "use strict";
  const TS = (window.TS = window.TS || {});

  const dayShortEn = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const en = {
    "brand.tagline": "The Living Spring OS",
    "nav.garden": "Garden", "nav.habits": "Habits", "nav.focus": "Focus", "nav.journal": "Journal",
    "nav.quests": "Quests", "nav.stats": "Stats", "nav.achievements": "Trophies", "nav.settings": "Settings",
    "top.streak": "day streak", "top.drops": "spring drops", "top.hello": "Welcome back",

    "garden.spring": "Spring vitality", "garden.species": "Flora unlocked", "garden.time": "Local time",
    "garden.title": "Your spring is alive",
    "garden.sub": "Every habit you keep, every focused minute and every honest reflection feeds the water. Watch it bloom.",
    "garden.cta1": "Tend today's habits", "garden.cta2": "Release a droplet",

    "habits.title": "Habits", "habits.sub": "Small rivers carve canyons. Keep the streak.",
    "habits.add": "+ New habit", "habits.heatmap": "Consistency map · last 12 weeks", "habits.empty": "No habits yet. Plant the first seed.",

    "focus.title": "Focus chamber", "focus.sub": "Deep work distilled into a single luminous timer.",
    "focus.modeWork": "Deep work", "focus.modeBreak": "Rest", "focus.start": "Start", "focus.pause": "Pause",
    "focus.reset": "Reset", "focus.task": "What are you focusing on?", "focus.today": "Today's sessions",
    "focus.total": "Lifetime focused", "focus.minutes": "minutes", "focus.empty": "No sessions yet today.",

    "journal.title": "Reflection & Mood", "journal.sub": "Name the weather inside you. The garden listens.",
    "journal.moodTitle": "How do you feel today?", "journal.noteLabel": "A line about today",
    "journal.saveMood": "Save today's weather", "journal.entries": "Journal", "journal.new": "+ Entry",
    "journal.empty": "Nothing written yet. Begin with one honest line.",

    "quests.title": "Daily quests", "quests.sub": "Three small deeds, woven fresh each dawn.",
    "quests.reroll": "Reroll (costs 5 💧)", "quests.contracts": "Standing contracts",
    "quests.contractsSub": "Longer vows that grow with repetition.", "quests.claim": "Mark done", "quests.done": "Done",

    "stats.title": "The Ledger", "stats.sub": "What you have been watering, and what grew.",
    "stats.radar": "Attribute constellation", "stats.xpChart": "XP current · last 30 days",
    "stats.moodChart": "Mood tide · last 30 days", "stats.attrBars": "Attribute depth",

    "ach.title": "Trophies", "ach.sub": "Markers of a spring well tended.",

    "set.title": "Settings", "set.sub": "Tune the spring to your liking.",
    "set.identity": "Identity", "set.name": "Your name", "set.lang": "Language",
    "set.look": "Look & feel", "set.reduce": "Reduce motion", "set.particles": "Particles & bloom",
    "set.ambient": "Ambient sound", "set.volume": "Volume", "set.data": "Your data",
    "set.dataSub": "Stored only in this browser. Nothing leaves your device.",
    "set.export": "Export JSON", "set.import": "Import JSON", "set.danger": "Danger zone",
    "set.demo": "Load demo spring", "set.wipe": "Erase everything", "set.about": "About",
    "set.aboutText": "Tasneeme (تسنيم) is a living spring: an offline-first, gamified life-companion that renders your real growth as a procedurally grown garden. No accounts, no tracking.",

    "onb.title": "Welcome to Tasneeme", "onb.sub": "Name yourself and plant the first seed. Everything you do here grows a private, living spring.",
    "onb.name": "What should the spring call you?", "onb.focus": "What do you most want to grow?",
    "onb.start": "Plant the seed", "onb.demo": "Explore a demo spring first",

    "habitModal.new": "New habit", "habitModal.edit": "Edit habit", "habitModal.name": "Habit name",
    "habitModal.attr": "Which part of you does it feed?", "habitModal.energy": "Effort / reward",
    "habitModal.days": "Days", "habitModal.icon": "Emblem",

    "entry.new": "New reflection", "entry.title": "Title", "entry.body": "Write freely", "entry.tags": "Tags (comma separated)",

    "levelup.kicker": "The spring rises", "levelup.text": "A new terrace of the garden unlocks",
    "common.cancel": "Cancel", "common.save": "Save", "common.continue": "Continue", "common.delete": "Delete",
    "common.close": "Close", "common.confirm": "Confirm",

    "attr.body": "Body", "attr.mind": "Mind", "attr.spirit": "Spirit", "attr.craft": "Craft",

    "stat.xp": "Total XP", "stat.level": "Level", "stat.streak": "Current streak", "stat.best": "Best streak",
    "stat.checks": "Habit check-ins", "stat.focus": "Focused", "stat.entries": "Reflections",
    "stat.drops": "Spring drops", "stat.days": "Active days", "stat.species": "Flora unlocked",
    "stat.quests": "Quests done", "stat.vitality": "Vitality",

    "theme.dawn": "Dawn", "theme.dusk": "Dusk", "theme.abyss": "Abyss", "theme.grove": "Grove",
    "theme.rose": "Rose", "theme.mono": "Mono",

    "tag.calm": "calm", "tag.anxious": "anxious", "tag.grateful": "grateful", "tag.tired": "tired",
    "tag.inspired": "inspired", "tag.lonely": "lonely", "tag.proud": "proud", "tag.restless": "restless",
    "tag.hopeful": "hopeful", "tag.foggy": "foggy",

    "quest.water": "Drink six glasses of water", "quest.walk": "Take a fifteen-minute walk",
    "quest.stretch": "Stretch for five minutes", "quest.sleep": "Be asleep before midnight",
    "quest.read": "Read ten pages", "quest.learn": "Learn one new thing",
    "quest.noPhone": "Spend thirty minutes phone-free", "quest.breathe": "Breathe slowly for three minutes",
    "quest.gratitude": "Name three gratitudes", "quest.kind": "Do one small kindness",
    "quest.connect": "Reach out to someone you miss", "quest.create": "Make something today",
    "quest.tidy": "Tidy one small space", "quest.practice": "Practice your craft for twenty minutes",

    "contract.streak7": "Seven-day streak", "contract.streak30": "Thirty-day streak",
    "contract.checks100": "100 habit check-ins", "contract.focus600": "10 hours of focus",
    "contract.entries25": "25 reflections", "contract.days30": "30 active days",
    "contract.level10": "Reach level 10", "contract.quests50": "50 quests completed",

    "ach.first_drop.name": "First Droplet", "ach.first_drop.desc": "Release a droplet into the spring",
    "ach.first_habit.name": "First Planting", "ach.first_habit.desc": "Create your first habit",
    "ach.first_check.name": "First Tending", "ach.first_check.desc": "Check off a habit",
    "ach.first_focus.name": "First Focus", "ach.first_focus.desc": "Finish a focus session",
    "ach.first_mood.name": "Weather Watcher", "ach.first_mood.desc": "Log your mood once",
    "ach.first_entry.name": "Inner Scribe", "ach.first_entry.desc": "Write your first reflection",
    "ach.streak3.name": "Kindling", "ach.streak3.desc": "Keep a 3-day streak",
    "ach.streak7.name": "Steady Flame", "ach.streak7.desc": "Keep a 7-day streak",
    "ach.streak30.name": "Wildfire", "ach.streak30.desc": "Keep a 30-day streak",
    "ach.habits5.name": "Gardener", "ach.habits5.desc": "Plant 5 habits",
    "ach.checks50.name": "Tireless", "ach.checks50.desc": "Reach 50 habit check-ins",
    "ach.checks200.name": "Relentless", "ach.checks200.desc": "Reach 200 habit check-ins",
    "ach.focus600.name": "Deep Diver", "ach.focus600.desc": "Focus 10 hours in total",
    "ach.focus3000.name": "Time Bender", "ach.focus3000.desc": "Focus 50 hours in total",
    "ach.entries25.name": "Chronicler", "ach.entries25.desc": "Write 25 reflections",
    "ach.quests25.name": "Questkeeper", "ach.quests25.desc": "Complete 25 quests",
    "ach.level5.name": "Rising Spring", "ach.level5.desc": "Reach level 5",
    "ach.level10.name": "Terraced", "ach.level10.desc": "Reach level 10",
    "ach.level20.name": "Cascade", "ach.level20.desc": "Reach level 20",
    "ach.species10.name": "Botanist", "ach.species10.desc": "Unlock 10 flora species",
    "ach.species20.name": "Whole Garden", "ach.species20.desc": "Unlock every flora species",
    "ach.balanced.name": "Four Rivers", "ach.balanced.desc": "Raise all four attributes to 150",
    "ach.blooms100.name": "Rainmaker", "ach.blooms100.desc": "Release 100 droplets",
    "ach.days30.name": "Constant", "ach.days30.desc": "Be active on 30 days",
  };

  const ar = {
    "brand.tagline": "نظام النبع الحيّ",
    "nav.garden": "الحديقة", "nav.habits": "العادات", "nav.focus": "التركيز", "nav.journal": "المُدوّنة",
    "nav.quests": "المهام", "nav.stats": "الإحصاءات", "nav.achievements": "الأوسمة", "nav.settings": "الإعدادات",
    "top.streak": "يوم متواصل", "top.drops": "قطرات النبع", "top.hello": "أهلًا بعودتك",

    "garden.spring": "حيوية النبع", "garden.species": "أزهار مكتشفة", "garden.time": "التوقيت المحلي",
    "garden.title": "نبعك ينبض بالحياة",
    "garden.sub": "كل عادة تحافظ عليها، وكل دقيقة تركيز، وكل تأمل صادق، تسقي هذا النبع. شاهده يتفتّح.",
    "garden.cta1": "اعتنِ بعادات اليوم", "garden.cta2": "أطلق قطرة",

    "habits.title": "العادات", "habits.sub": "الأنهار الصغيرة تحفر الأخاديد. حافظ على السلسلة.",
    "habits.add": "+ عادة جديدة", "habits.heatmap": "خريطة الالتزام · آخر ١٢ أسبوعًا", "habits.empty": "لا عادات بعد. ازرع البذرة الأولى.",

    "focus.title": "غرفة التركيز", "focus.sub": "العمل العميق مُقتصر في مؤقّت واحد مضيء.",
    "focus.modeWork": "عمل عميق", "focus.modeBreak": "راحة", "focus.start": "ابدأ", "focus.pause": "إيقاف",
    "focus.reset": "تصفير", "focus.task": "على ماذا تركّز؟", "focus.today": "جلسات اليوم",
    "focus.total": "إجمالي التركيز", "focus.minutes": "دقيقة", "focus.empty": "لا جلسات اليوم بعد.",

    "journal.title": "التأمل والمزاج", "journal.sub": "سمِّ الطقس بداخلك. الحديقة تسمعك.",
    "journal.moodTitle": "كيف تشعر اليوم؟", "journal.noteLabel": "سطر عن يومك",
    "journal.saveMood": "احفظ طقس اليوم", "journal.entries": "المدوّنة", "journal.new": "+ تدوينة",
    "journal.empty": "لا شيء مكتوب بعد. ابدأ بسطر صادق واحد.",

    "quests.title": "مهام اليوم", "quests.sub": "ثلاث أعمال صغيرة تُنسج كل فجر.",
    "quests.reroll": "إعادة السحب (٥ 💧)", "quests.contracts": "عقود دائمة",
    "quests.contractsSub": "عهود أطول تنمو مع التكرار.", "quests.claim": "تم الإنجاز", "quests.done": "مُنجزة",

    "stats.title": "دفتر الحساب", "stats.sub": "ما كنت تسقيه، وما نما منه.",
    "stats.radar": "كوكبة الصفات", "stats.xpChart": "الخبرة اليومية · آخر ٣٠ يومًا",
    "stats.moodChart": "مدّ المزاج · آخر ٣٠ يومًا", "stats.attrBars": "عمق الصفات",

    "ach.title": "الأوسمة", "ach.sub": "علامات على نبعٍ أُحسن رعايته.",

    "set.title": "الإعدادات", "set.sub": "اضبط النبع كما تحب.",
    "set.identity": "الهوية", "set.name": "اسمك", "set.lang": "اللغة",
    "set.look": "المظهر", "set.reduce": "تقليل الحركة", "set.particles": "الجزيئات والتفتّح",
    "set.ambient": "صوت محيطي", "set.volume": "مستوى الصوت", "set.data": "بياناتك",
    "set.dataSub": "محفوظة في هذا المتصفح فقط. لا شيء يغادر جهازك.",
    "set.export": "تصدير JSON", "set.import": "استيراد JSON", "set.danger": "منطقة الخطر",
    "set.demo": "تحميل نبع تجريبي", "set.wipe": "حذف كل شيء", "set.about": "حول",
    "set.aboutText": "تسنيم نظام حياة مُلعَّب يعمل دون إنترنت، ويحوّل نموّك الحقيقي إلى حديقة تنمو إجرائيًا. بلا حسابات، بلا تتبّع.",

    "onb.title": "أهلًا بك في تسنيم", "onb.sub": "سمِّ نفسك وازرع البذرة الأولى. كل ما تفعله هنا يُنمي نبعًا خاصًا بك.",
    "onb.name": "بماذا يناديك النبع؟", "onb.focus": "ما أكثر ما تريد أن تُنمّيه؟",
    "onb.start": "ازرع البذرة", "onb.demo": "استكشف نبعًا تجريبيًا أولًا",

    "habitModal.new": "عادة جديدة", "habitModal.edit": "تعديل العادة", "habitModal.name": "اسم العادة",
    "habitModal.attr": "أي جزء منك تُغذّي؟", "habitModal.energy": "الجهد / المكافأة",
    "habitModal.days": "الأيام", "habitModal.icon": "الرمز",

    "entry.new": "تأمل جديد", "entry.title": "العنوان", "entry.body": "اكتب بحرية", "entry.tags": "وسوم (مفصولة بفواصل)",

    "levelup.kicker": "النبع يرتفع", "levelup.text": "مصطبة جديدة من الحديقة تُفتح",
    "common.cancel": "إلغاء", "common.save": "حفظ", "common.continue": "متابعة", "common.delete": "حذف",
    "common.close": "إغلاق", "common.confirm": "تأكيد",

    "attr.body": "الجسد", "attr.mind": "العقل", "attr.spirit": "الروح", "attr.craft": "الصنعة",

    "stat.xp": "إجمالي الخبرة", "stat.level": "المستوى", "stat.streak": "السلسلة الحالية", "stat.best": "أطول سلسلة",
    "stat.checks": "مرات إتمام العادات", "stat.focus": "مدة التركيز", "stat.entries": "التأملات",
    "stat.drops": "قطرات النبع", "stat.days": "الأيام النشطة", "stat.species": "أزهار مكتشفة",
    "stat.quests": "مهام مُنجزة", "stat.vitality": "الحيوية",

    "theme.dawn": "الفجر", "theme.dusk": "الغروب", "theme.abyss": "اللجّة", "theme.grove": "الغابة",
    "theme.rose": "الورد", "theme.mono": "أحادي",

    "tag.calm": "هادئ", "tag.anxious": "قلق", "tag.grateful": "ممتن", "tag.tired": "متعب",
    "tag.inspired": "ملهم", "tag.lonely": "وحيد", "tag.proud": "فخور", "tag.restless": "متوتر",
    "tag.hopeful": "متفائل", "tag.foggy": "ضبابي",

    "quest.water": "اشرب ستة أكواب من الماء", "quest.walk": "تمشَّ خمس عشرة دقيقة",
    "quest.stretch": "تمطَّ خمس دقائق", "quest.sleep": "نَم قبل منتصف الليل",
    "quest.read": "اقرأ عشر صفحات", "quest.learn": "تعلَّم شيئًا جديدًا",
    "quest.noPhone": "ثلاثون دقيقة بلا هاتف", "quest.breathe": "تنفَّس ببطء ثلاث دقائق",
    "quest.gratitude": "اذكر ثلاث نعم", "quest.kind": "افعل لطفًا صغيرًا",
    "quest.connect": "تواصل مع من تفتقده", "quest.create": "اصنع شيئًا اليوم",
    "quest.tidy": "رتّب مكانًا صغيرًا", "quest.practice": "تدرّب على صنعتك عشرين دقيقة",

    "contract.streak7": "سلسلة سبعة أيام", "contract.streak30": "سلسلة ثلاثين يومًا",
    "contract.checks100": "١٠٠ إتمام عادة", "contract.focus600": "١٠ ساعات تركيز",
    "contract.entries25": "٢٥ تأملًا", "contract.days30": "٣٠ يومًا نشطًا",
    "contract.level10": "الوصول للمستوى ١٠", "contract.quests50": "إنجاز ٥٠ مهمة",

    "ach.first_drop.name": "أول قطرة", "ach.first_drop.desc": "أطلق قطرة في النبع",
    "ach.first_habit.name": "أول غرس", "ach.first_habit.desc": "أنشئ عادتك الأولى",
    "ach.first_check.name": "أول رعاية", "ach.first_check.desc": "أكمل عادة واحدة",
    "ach.first_focus.name": "أول تركيز", "ach.first_focus.desc": "أكمل جلسة تركيز",
    "ach.first_mood.name": "راصد الطقس", "ach.first_mood.desc": "سجّل مزاجك مرة",
    "ach.first_entry.name": "الكاتب الداخلي", "ach.first_entry.desc": "اكتب تأملك الأول",
    "ach.streak3.name": "شرارة", "ach.streak3.desc": "حافظ على سلسلة ٣ أيام",
    "ach.streak7.name": "لهب ثابت", "ach.streak7.desc": "حافظ على سلسلة ٧ أيام",
    "ach.streak30.name": "حريق الغابة", "ach.streak30.desc": "حافظ على سلسلة ٣٠ يومًا",
    "ach.habits5.name": "البستاني", "ach.habits5.desc": "اغرس ٥ عادات",
    "ach.checks50.name": "لا يكل", "ach.checks50.desc": "بلغ ٥٠ إتمامًا",
    "ach.checks200.name": "لا يلين", "ach.checks200.desc": "بلغ ٢٠٠ إتمام",
    "ach.focus600.name": "الغوّاص", "ach.focus600.desc": "ركّز ١٠ ساعات إجمالًا",
    "ach.focus3000.name": "حاني الزمن", "ach.focus3000.desc": "ركّز ٥٠ ساعة إجمالًا",
    "ach.entries25.name": "المؤرّخ", "ach.entries25.desc": "اكتب ٢٥ تأملًا",
    "ach.quests25.name": "حافظ المهام", "ach.quests25.desc": "أنجز ٢٥ مهمة",
    "ach.level5.name": "نبع صاعد", "ach.level5.desc": "ابلغ المستوى ٥",
    "ach.level10.name": "مصاطب", "ach.level10.desc": "ابلغ المستوى ١٠",
    "ach.level20.name": "شلال", "ach.level20.desc": "ابلغ المستوى ٢٠",
    "ach.species10.name": "عالم النبات", "ach.species10.desc": "اكتشف ١٠ أزهار",
    "ach.species20.name": "الحديقة كاملة", "ach.species20.desc": "اكتشف كل الأزهار",
    "ach.balanced.name": "أربعة أنهار", "ach.balanced.desc": "ارفع الصفات الأربع إلى ١٥٠",
    "ach.blooms100.name": "صانع المطر", "ach.blooms100.desc": "أطلق ١٠٠ قطرة",
    "ach.days30.name": "المواصل", "ach.days30.desc": "كن نشطًا ٣٠ يومًا",
  };

  const tn = {
    "brand.tagline": "Système el 3ayn el hayya",
    "nav.garden": "Ej-jnina", "nav.habits": "El-3wayed", "nav.focus": "Et-tarkiz", "nav.journal": "Journel",
    "nav.quests": "El-missions", "nav.stats": "El-hsab", "nav.achievements": "Ej-jwaïz", "nav.settings": "Réglage",
    "top.streak": "nhar 3ala nhar", "top.drops": "qatrat", "top.hello": "Marhbe bik",

    "garden.spring": "Hayawiya el 3ayn", "garden.species": "Zhour mektachfa", "garden.time": "El waqt",
    "garden.title": "El 3ayn mte3ek 3aycha",
    "garden.sub": "Kol 3ada tsedha, kol daqiqa tarkiz, w kol ta2ammol bsedq — kolhom yesqu el ma. Chof kif yetfate7.",
    "garden.cta1": "Ehbel 3wayed el yom", "garden.cta2": "Khodh qatra",

    "habits.title": "El-3wayed", "habits.sub": "El widyan es-sghar yehafrou el wdin. 7afedh 3al silsla.",
    "habits.add": "+ 3ada jdida", "habits.heatmap": "Khritet el iltizem · ekhern 12 simana", "habits.empty": "Ma famma 3wayed. Ezra3 el bdhra el loula.",

    "focus.title": "Beyt et-tarkiz", "focus.sub": "El khedma el 3amiqa fi mouwaqqit we7ed mya77i.",
    "focus.modeWork": "Khedma 3amiqa", "focus.modeBreak": "Rta7a", "focus.start": "Ebda", "focus.pause": "Waqef",
    "focus.reset": "Sfar", "focus.task": "3la chnouwa rak metrakkez?", "focus.today": "Sessions el yom",
    "focus.total": "El jomla", "focus.minutes": "dqiqa", "focus.empty": "Ma famma sessions el yom.",

    "journal.title": "Ta2ammol w Mezaj", "journal.sub": "Sammi et-taqs elli fik. El jnina tesma3.",
    "journal.moodTitle": "Kifek el yom?", "journal.noteLabel": "Satar 3al yom mte3ek",
    "journal.saveMood": "Sa77el taqs el yom", "journal.entries": "Journel", "journal.new": "+ Tdwinah",
    "journal.empty": "Ma katabt chay. Ebda b tsatar sadiq.",

    "quests.title": "Missions el yom", "quests.sub": "Thletha khidmaat zghar, metnsiin kol fajr.",
    "quests.reroll": "A3id (5 💧)", "quests.contracts": "3ouqoud daïma",
    "quests.contractsSub": "Wou3oud twèl yokbrou m3a et-takrar.", "quests.claim": "Kammel", "quests.done": "Mkammel",

    "stats.title": "El dafter", "stats.sub": "Chnouwa kont tesqi, w chnouwa nbet.",
    "stats.radar": "Kawkbet es-sefat", "stats.xpChart": "El XP · ekhern 30 yom",
    "stats.moodChart": "Medd el mezaj · ekhern 30 yom", "stats.attrBars": "3omq es-sefat",

    "ach.title": "Ej-jwaïz", "ach.sub": "3lamet 3ala 3ayn m3atniya behi.",

    "set.title": "Réglage", "set.sub": "Dhabbet el 3ayn kifma t7eb.",
    "set.identity": "El howiya", "set.name": "Smitek", "set.lang": "El lougha",
    "set.look": "El manzhar", "set.reduce": "Naqqes el 7araka", "set.particles": "Jzy2at w tfettou7",
    "set.ambient": "Sawt ambient", "set.volume": "El sawt", "set.data": "El data mte3ek",
    "set.dataSub": "Makdouza fi el navigateur hedha. Chay ma ykhraj men el appareil.",
    "set.export": "Export JSON", "set.import": "Import JSON", "set.danger": "Mintaqet el khatar",
    "set.demo": "7ammel 3ayn demo", "set.wipe": "Fassa5 kol chay", "set.about": "3la",
    "set.aboutText": "Tasneeme (تسنيم) houwa 3ayn hayya: compagnon mte3 el 7ayat, ye5dem bla internet, yraouwel nmetwek el haqiqi k jnina tetnbet. Bla comptes, bla traçage.",

    "onb.title": "Marhbe bik fi Tasneeme", "onb.sub": "Sammi rou7ek w o5zes el bdhra el loula. Kol chay ta3mlo houni ynemmi 3ayn khassa bik.",
    "onb.name": "Chnouwa tesmik el 3ayn?", "onb.focus": "Chnouwa akther chay t7eb tnemmih?",
    "onb.start": "O5zes el bdhra", "onb.demo": "Chouf 3ayn demo elloula",

    "habitModal.new": "3ada jdida", "habitModal.edit": "Baddel el 3ada", "habitModal.name": "Ism el 3ada",
    "habitModal.attr": "Chkoun mennek ta3mel el 3ada?", "habitModal.energy": "Joud / mokaf2a",
    "habitModal.days": "El ayem", "habitModal.icon": "Er-ramz",

    "entry.new": "Ta2ammol jdid", "entry.title": "El 3onwan", "entry.body": "Ektib b 7ourriya", "entry.tags": "Tags (b virgule)",

    "levelup.kicker": "El 3ayn ta3let", "levelup.text": "Terraça jdida fi el jnina fethet",
    "common.cancel": "Annuller", "common.save": "Sa77el", "common.continue": "Kammel", "common.delete": "Fassa5",
    "common.close": "Ghalef", "common.confirm": "Akkid",

    "attr.body": "El jesed", "attr.mind": "El 3aql", "attr.spirit": "Er-rou7", "attr.craft": "Es-sana3a",

    "stat.xp": "Jomlet XP", "stat.level": "El niveau", "stat.streak": "Silsla taw", "stat.best": "A6wal silsla",
    "stat.checks": "Marrat el 3wayed", "stat.focus": "Waqt et-tarkiz", "stat.entries": "Ta2ammolat",
    "stat.drops": "Qatrat", "stat.days": "Ayem actifs", "stat.species": "Zhour mektachfa",
    "stat.quests": "Missions mkemmla", "stat.vitality": "Hayawiya",

    "theme.dawn": "Fajr", "theme.dusk": "Ghroub", "theme.abyss": "El 3amq", "theme.grove": "El ghaba",
    "theme.rose": "El warda", "theme.mono": "Mono",

    "tag.calm": "hédi", "tag.anxious": "galaq", "tag.grateful": "memten", "tag.tired": "3ayane",
    "tag.inspired": "melham", "tag.lonely": "wa7ed", "tag.proud": "fakhour", "tag.restless": "ma hné",
    "tag.hopeful": "mefte7el", "tag.foggy": "dobab",

    "quest.water": "Echreb settha kess ma", "quest.walk": "Emchi rb3a sa3a",
    "quest.stretch": "Tmatte5 khamsa dqiqa", "quest.sleep": "Orqod qbel no9s el lil",
    "quest.read": "A9ra 3achra saf7at", "quest.learn": "T3allem 7aja jdida",
    "quest.noPhone": "Thlethin dqiqa bla telephone", "quest.breathe": "Tneffes b chwaya thletha dqiqa",
    "quest.gratitude": "Sammi thletha ne3ma", "quest.kind": "A3mel 7aja mezya",
    "quest.connect": "Kallem wa7ed tchemmo", "quest.create": "A3mel 7aja el yom",
    "quest.tidy": "Naddef blasa sghira", "quest.practice": "Tdareb 3al sana3tek 3echrin dqiqa",

    "contract.streak7": "Silsla seb3a ayem", "contract.streak30": "Silsla thlethin yom",
    "contract.checks100": "100 marra 3wayed", "contract.focus600": "10 se3at tarkiz",
    "contract.entries25": "25 ta2ammol", "contract.days30": "30 yom actifs",
    "contract.level10": "Wsel lel niveau 10", "contract.quests50": "Kammel 50 mission",

    "ach.first_drop.name": "Awel qatra", "ach.first_drop.desc": "Khodh qatra fel 3ayn",
    "ach.first_habit.name": "Awel gharsa", "ach.first_habit.desc": "A3mel awel 3ada",
    "ach.first_check.name": "Awel 3aniya", "ach.first_check.desc": "Kammel 3ada",
    "ach.first_focus.name": "Awel tarkiz", "ach.first_focus.desc": "Kammel session tarkiz",
    "ach.first_mood.name": "Raased et-taqs", "ach.first_mood.desc": "Sa77el el mezaj marra",
    "ach.first_entry.name": "El keteb ed-dakhli", "ach.first_entry.desc": "Ektib awel ta2ammol",
    "ach.streak3.name": "Ch3ila", "ach.streak3.desc": "7afedh 3al silsla 3 ayem",
    "ach.streak7.name": "Nar thebta", "ach.streak7.desc": "7afedh 3al silsla 7 ayem",
    "ach.streak30.name": "7riq el ghaba", "ach.streak30.desc": "7afedh 3al silsla 30 yom",
    "ach.habits5.name": "El boustani", "ach.habits5.desc": "O5zes 5 3wayed",
    "ach.checks50.name": "Ma yet3ab", "ach.checks50.desc": "Wsel 50 marra",
    "ach.checks200.name": "Ma yelîn", "ach.checks200.desc": "Wsel 200 marra",
    "ach.focus600.name": "El ghawwas", "ach.focus600.desc": "Rakkez 10 se3at",
    "ach.focus3000.name": "Hani ez-zmen", "ach.focus3000.desc": "Rakkez 50 sa3a",
    "ach.entries25.name": "El m2arrikh", "ach.entries25.desc": "Ektib 25 ta2ammol",
    "ach.quests25.name": "7afedh el missions", "ach.quests25.desc": "Kammel 25 mission",
    "ach.level5.name": "3ayn ta3let", "ach.level5.desc": "Wsel niveau 5",
    "ach.level10.name": "Terraces", "ach.level10.desc": "Wsel niveau 10",
    "ach.level20.name": "Challal", "ach.level20.desc": "Wsel niveau 20",
    "ach.species10.name": "3alem en-nebat", "ach.species10.desc": "Ktechgef 10 zhour",
    "ach.species20.name": "El jnina kamla", "ach.species20.desc": "Ktechgef kol ez-zhour",
    "ach.balanced.name": "Arb3a wdyen", "ach.balanced.desc": "Rfa3 es-sefat el arb3a lel 150",
    "ach.blooms100.name": "Sane3 el mter", "ach.blooms100.desc": "Khodh 100 qatra",
    "ach.days30.name": "El mwassel", "ach.days30.desc": "Kon actif 30 yom",
  };

  const dict = { en, ar, tn };

  /* week-day names merged into every language */
  const DAYS = {
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    ar: ["أحد", "اثنين", "ثلاثاء", "أربعاء", "خميس", "جمعة", "سبت"],
    tn: ["L7ed", "Letnin", "Letlata", "Larb3a", "Lkhmis", "Jem3a", "Sebt"],
  };
  Object.keys(dict).forEach((l) => DAYS[l].forEach((d, i) => { dict[l]["day." + i] = d; }));

  const i18n = {
    lang: "en",
    t(key) {
      const d = dict[this.lang] || en;
      return d[key] != null ? d[key] : (en[key] != null ? en[key] : key);
    },
    setLang(lang) {
      if (!dict[lang]) lang = "en";
      this.lang = lang;
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    },
    apply(root) {
      root = root || document;
      root.querySelectorAll("[data-i18n]").forEach((el) => {
        const k = el.getAttribute("data-i18n");
        const val = this.t(k);
        if (val != null) el.textContent = val;
      });
      root.querySelectorAll("[data-i18n-ph]").forEach((el) => { el.placeholder = this.t(el.getAttribute("data-i18n-ph")); });
    },
    dayShort(dow) { return dayShortEn[dow]; },
    dayNames() { return dayShortEn.slice(); },
  };

  TS.i18n = i18n;
})();
