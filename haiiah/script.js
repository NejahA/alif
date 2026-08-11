/* ============================================
   HAIIAH — God Consciousness
   Data & interactions
   ============================================ */

/* ---------- Data: Quranic Verses (Taqwa-focused) ---------- */
const VERSES = [
  {
    arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ حَقَّ تُقَاتِهِ وَلَا تَمُوتُنَّ إِلَّا وَأَنتُم مُّسْلِمُونَ',
    translation: 'O you who have believed, fear Allah as He should be feared and do not die except as Muslims [in submission to Him].',
    reference: 'Qur\'an 3:102 — Surah Ali \'Imran'
  },
  {
    arabic: 'إِنَّ أَكْرَمَكُمْ عِندَ اللَّهِ أَتْقَاكُمْ ۚ إِنَّ اللَّهَ عَلِيمٌ خَبِيرٌ',
    translation: 'Indeed, the most noble of you in the sight of Allah is the most righteous [most conscious of Allah]. Indeed, Allah is Knowing and Acquainted.',
    reference: 'Qur\'an 49:13 — Surah Al-Hujurat'
  },
  {
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    translation: 'And whoever fears Allah — He will make for him a way out.',
    reference: 'Qur\'an 65:2 — Surah At-Talaq'
  },
  {
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مِنْ أَمْرِهِ يُسْرًا',
    translation: 'And whoever fears Allah — He will make for him of his matter ease.',
    reference: 'Qur\'an 65:4 — Surah At-Talaq'
  },
  {
    arabic: 'ذَٰلِكَ وَمَن يُعَظِّمْ شَعَائِرَ اللَّهِ فَإِنَّهَا مِن تَقْوَى الْقُلُوبِ',
    translation: 'That [is so]. And whoever honors the symbols of Allah — indeed, it is from the piety of hearts.',
    reference: 'Qur\'an 22:32 — Surah Al-Hajj'
  },
  {
    arabic: 'وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَىٰ ۚ وَاتَّقُونِ يَا أُولِي الْأَلْبَابِ',
    translation: 'And take provisions, but indeed, the best provision is Taqwa [piety, God consciousness]. So fear Me, O you of understanding.',
    reference: 'Qur\'an 2:197 — Surah Al-Baqarah'
  },
  {
    arabic: 'إِنَّ اللَّهَ مَعَ الَّذِينَ اتَّقَوا وَّالَّذِينَ هُم مُّحْسِنُونَ',
    translation: 'Indeed, Allah is with those who fear Him and those who are doers of good.',
    reference: 'Qur\'an 16:128 — Surah An-Nahl'
  },
  {
    arabic: 'وَاتَّقُوا يَوْمًا تُرْجَعُونَ فِيهِ إِلَى اللَّهِ ۖ ثُمَّ تُوَفَّىٰ كُلُّ نَفْسٍ مَّا كَسَبَتْ وَهُمْ لَا يُظْلَمُونَ',
    translation: 'And fear a Day when you will be returned to Allah. Then every soul will be compensated for what it earned, and they will not be wronged.',
    reference: 'Qur\'an 2:281 — Surah Al-Baqarah'
  },
  {
    arabic: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ الَّذِي خَلَقَكُمْ وَالَّذِينَ مِن قَبْلِكُمْ لَعَلَّكُمْ تَتَّقُونَ',
    translation: 'O mankind, worship your Lord, who created you and those before you, that you may become righteous [God-conscious].',
    reference: 'Qur\'an 2:21 — Surah Al-Baqarah'
  },
  {
    arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
    translation: 'Verily, in the remembrance of Allah do hearts find rest.',
    reference: 'Qur\'an 13:28 — Surah Ar-Ra\'d'
  },
  {
    arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ ۚ إِنَّ اللَّهَ بَالِغُ أَمْرِهِ',
    translation: 'And whoever relies upon Allah — then He is sufficient for him. Indeed, Allah will accomplish His purpose.',
    reference: 'Qur\'an 65:3 — Surah At-Talaq'
  },
  {
    arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
    translation: 'So remember Me; I will remember you. And be grateful to Me and do not deny Me.',
    reference: 'Qur\'an 2:152 — Surah Al-Baqarah'
  },
  {
    arabic: 'إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ ۗ وَلَذِكْرُ اللَّهِ أَكْبَرُ',
    translation: 'Indeed, prayer prohibits immorality and wrongdoing, and the remembrance of Allah is greater.',
    reference: 'Qur\'an 29:45 — Surah Al-Ankabut'
  },
  {
    arabic: 'وَأَن لَّيْسَ لِلْإِنسَانِ إِلَّا مَا سَعَىٰ',
    translation: 'And that there is not for man except that [good] for which he strives.',
    reference: 'Qur\'an 53:39 — Surah An-Najm'
  },
  {
    arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
    translation: 'And those who strive for Us — We will surely guide them to Our ways.',
    reference: 'Qur\'an 29:69 — Surah Al-Ankabut'
  },
  {
    arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَىٰ أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
    translation: 'Say, "O My servants who have transgressed against themselves, do not despair of the mercy of Allah."',
    reference: 'Qur\'an 39:53 — Surah Az-Zumar'
  }
];

/* ---------- Data: Hadith (Taqwa-focused) ---------- */
const HADITHS = [
  {
    arabic: 'اتَّقِ اللَّهَ حَيْثُمَا كُنْتَ، وَأَتْبِعِ السَّيِّئَةَ الْحَسَنَةَ تَمْحُهَا، وَخَالِقِ النَّاسَ بِخُلُقٍ حَسَنٍ',
    translation: 'Fear Allah wherever you are, and follow up a bad deed with a good deed which will wipe it out, and deal with people in a good manner.',
    source: 'Hadith — At-Tirmidhi, 1987 (Hasan Sahih)'
  },
  {
    arabic: 'لَا يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لِأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ',
    translation: 'None of you [truly] believes until he loves for his brother what he loves for himself.',
    source: 'Hadith — Sahih al-Bukhari, 13'
  },
  {
    arabic: 'مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ',
    translation: 'Whoever believes in Allah and the Last Day, let him speak good or remain silent.',
    source: 'Hadith — Sahih al-Bukhari, 6018'
  },
  {
    arabic: 'إِنَّ اللَّهَ لَا يَنْظُرُ إِلَى صُوَرِكُمْ وَأَمْوَالِكُمْ وَلَكِنْ يَنْظُرُ إِلَى قُلُوبِكُمْ وَأَعْمَالِكُمْ',
    translation: 'Indeed, Allah does not look at your appearance or your wealth, but He looks at your hearts and your deeds.',
    source: 'Hadith — Sahih Muslim, 2564'
  },
  {
    arabic: 'التُّقَى هَاهُنَا — وَيُشِيرُ إِلَى صَدْرِهِ ثَلَاثَ مَرَّاتٍ',
    translation: 'Taqwa [God consciousness] is here — and he pointed to his chest three times.',
    source: 'Hadith — Sahih Muslim, 2564'
  },
  {
    arabic: 'كُلُّ سُلَامَى مِنَ النَّاسِ عَلَيْهِ صَدَقَةٌ كُلَّ يَوْمٍ تَطْلُعُ فِيهِ الشَّمْسُ',
    translation: 'Every joint of a person must perform a charity each day the sun rises.',
    source: 'Hadith — Sahih al-Bukhari, 2891'
  },
  {
    arabic: 'مَنْ سَلَكَ طَرِيقًا يَلْتَمِسُ فِيهِ عِلْمًا سَهَّلَ اللَّهُ لَهُ بِهِ طَرِيقًا إِلَى الْجَنَّةِ',
    translation: 'Whoever takes a path upon which to obtain knowledge, Allah makes the path to Paradise easy for him.',
    source: 'Hadith — Sahih Muslim, 2699'
  },
  {
    arabic: 'الدُّعَاءُ هُوَ الْعِبَادَةُ',
    translation: 'Supplication is worship.',
    source: 'Hadith — Jami\' at-Tirmidhi, 3371'
  },
  {
    arabic: 'الطُّهُورُ شَطْرُ الْإِيمَانِ، وَالْحَمْدُ لِلَّهِ تَمْلَأُ الْمِيزَانَ',
    translation: 'Purity is half of faith, and al-hamdu lillah [praise be to Allah] fills the scales.',
    source: 'Hadith — Sahih Muslim, 223'
  },
  {
    arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    translation: 'Actions are judged by intentions, and every person will get what they intended.',
    source: 'Hadith — Sahih al-Bukhari, 1'
  },
  {
    arabic: 'مَنْ صَامَ رَمَضَانَ إِيمَانًا وَاحْتِسَابًا غُفِرَ لَهُ مَا تَقَدَّمَ مِنْ ذَنْبِهِ',
    translation: 'Whoever fasts Ramadan out of faith and seeking reward, their previous sins will be forgiven.',
    source: 'Hadith — Sahih al-Bukhari, 38'
  },
  {
    arabic: 'يَتْبَعُ الْمَيِّتَ ثَلَاثَةٌ: أَهْلُهُ وَمَالُهُ وَعَمَلُهُ، فَيَرْجِعُ اثْنَانِ وَيَبْقَى وَاحِدٌ',
    translation: 'Three things follow the deceased: family, wealth, and deeds. Two return and one remains — his deeds.',
    source: 'Hadith — Sahih al-Bukhari, 6514'
  },
  {
    arabic: 'مَنْ أَحَبَّ لِقَاءَ اللَّهِ أَحَبَّ اللَّهُ لِقَاءَهُ',
    translation: 'Whoever loves to meet Allah, Allah loves to meet him.',
    source: 'Hadith — Sahih al-Bukhari, 6507'
  },
  {
    arabic: 'جُعِلَتْ قُرَّةُ عَيْنِي فِي الصَّلَاةِ',
    translation: 'The coolness of my eyes was placed in prayer.',
    source: 'Hadith — Sunan an-Nasa\'i, 3939'
  }
];

/* ---------- Data: Names of Allah (Asma ul-Husna) — All 99 ---------- */
const NAMES_OF_ALLAH = [
  { arabic: 'الرَّحْمَٰنُ', translit: 'Ar-Rahman', meaning: 'The Most Merciful' },
  { arabic: 'الرَّحِيمُ', translit: 'Ar-Rahim', meaning: 'The Most Compassionate' },
  { arabic: 'الْمَلِكُ', translit: 'Al-Malik', meaning: 'The King' },
  { arabic: 'الْقُدُّوسُ', translit: 'Al-Quddus', meaning: 'The Most Pure' },
  { arabic: 'السَّلَامُ', translit: 'As-Salam', meaning: 'The Source of Peace' },
  { arabic: 'الْمُؤْمِنُ', translit: 'Al-Mu\'min', meaning: 'The Giver of Faith' },
  { arabic: 'الْمُهَيْمِنُ', translit: 'Al-Muhaymin', meaning: 'The Guardian' },
  { arabic: 'الْعَزِيزُ', translit: 'Al-\'Aziz', meaning: 'The Almighty' },
  { arabic: 'الْجَبَّارُ', translit: 'Al-Jabbar', meaning: 'The Compeller / Restorer' },
  { arabic: 'الْمُتَكَبِّرُ', translit: 'Al-Mutakabbir', meaning: 'The Majestic' },
  { arabic: 'الْخَالِقُ', translit: 'Al-Khaliq', meaning: 'The Creator' },
  { arabic: 'الْبَارِئُ', translit: 'Al-Bari\'', meaning: 'The Evolver' },
  { arabic: 'الْمُصَوِّرُ', translit: 'Al-Musawwir', meaning: 'The Fashioner' },
  { arabic: 'الْغَفَّارُ', translit: 'Al-Ghaffar', meaning: 'The Ever-Forgiving' },
  { arabic: 'الْقَهَّارُ', translit: 'Al-Qahhar', meaning: 'The Subduer' },
  { arabic: 'الْوَهَّابُ', translit: 'Al-Wahhab', meaning: 'The Bestower' },
  { arabic: 'الرَّزَّاقُ', translit: 'Ar-Razzaq', meaning: 'The Provider' },
  { arabic: 'الْفَتَّاحُ', translit: 'Al-Fattah', meaning: 'The Opener' },
  { arabic: 'الْعَلِيمُ', translit: 'Al-\'Alim', meaning: 'The All-Knowing' },
  { arabic: 'الْقَابِضُ', translit: 'Al-Qabid', meaning: 'The Withholder' },
  { arabic: 'الْبَاسِطُ', translit: 'Al-Basit', meaning: 'The Extender' },
  { arabic: 'الْخَافِضُ', translit: 'Al-Khafid', meaning: 'The Reducer' },
  { arabic: 'الرَّافِعُ', translit: 'Ar-Rafi\'', meaning: 'The Elevator' },
  { arabic: 'الْمُعِزُّ', translit: 'Al-Mu\'izz', meaning: 'The Honourer' },
  { arabic: 'الْمُذِلُّ', translit: 'Al-Mudhill', meaning: 'The Humiliator' },
  { arabic: 'السَّمِيعُ', translit: 'As-Sami\'', meaning: 'The All-Hearing' },
  { arabic: 'الْبَصِيرُ', translit: 'Al-Basir', meaning: 'The All-Seeing' },
  { arabic: 'الْحَكَمُ', translit: 'Al-Hakam', meaning: 'The Judge' },
  { arabic: 'الْعَدْلُ', translit: 'Al-\'Adl', meaning: 'The Just' },
  { arabic: 'اللَّطِيفُ', translit: 'Al-Latif', meaning: 'The Subtle' },
  { arabic: 'الْخَبِيرُ', translit: 'Al-Khabir', meaning: 'The Aware' },
  { arabic: 'الْحَلِيمُ', translit: 'Al-Halim', meaning: 'The Forbearing' },
  { arabic: 'الْعَظِيمُ', translit: 'Al-\'Azim', meaning: 'The Magnificent' },
  { arabic: 'الْغَفُورُ', translit: 'Al-Ghafur', meaning: 'The Forgiving' },
  { arabic: 'الشَّكُورُ', translit: 'Ash-Shakur', meaning: 'The Appreciative' },
  { arabic: 'الْعَلِيُّ', translit: 'Al-\'Ali', meaning: 'The Most High' },
  { arabic: 'الْكَبِيرُ', translit: 'Al-Kabir', meaning: 'The Most Great' },
  { arabic: 'الْحَفِيظُ', translit: 'Al-Hafiz', meaning: 'The Preserver' },
  { arabic: 'الْمُقِيتُ', translit: 'Al-Muqit', meaning: 'The Sustainer' },
  { arabic: 'الْحَسِيبُ', translit: 'Al-Hasib', meaning: 'The Reckoner' },
  { arabic: 'الْجَلِيلُ', translit: 'Al-Jalil', meaning: 'The Majestic' },
  { arabic: 'الْكَرِيمُ', translit: 'Al-Karim', meaning: 'The Generous' },
  { arabic: 'الرَّقِيبُ', translit: 'Ar-Raqib', meaning: 'The Watchful' },
  { arabic: 'الْمُجِيبُ', translit: 'Al-Mujib', meaning: 'The Responsive' },
  { arabic: 'الْوَاسِعُ', translit: 'Al-Wasi\'', meaning: 'The Vast' },
  { arabic: 'الْحَكِيمُ', translit: 'Al-Hakim', meaning: 'The All-Wise' },
  { arabic: 'الْوَدُودُ', translit: 'Al-Wadud', meaning: 'The Most Loving' },
  { arabic: 'الْمَجِيدُ', translit: 'Al-Majid', meaning: 'The Glorious' },
  { arabic: 'الْبَاعِثُ', translit: 'Al-Ba\'ith', meaning: 'The Resurrector' },
  { arabic: 'الشَّهِيدُ', translit: 'Ash-Shahid', meaning: 'The Witness' },
  { arabic: 'الْحَقُّ', translit: 'Al-Haqq', meaning: 'The Truth' },
  { arabic: 'الْوَكِيلُ', translit: 'Al-Wakil', meaning: 'The Trustee' },
  { arabic: 'الْقَوِيُّ', translit: 'Al-Qawi', meaning: 'The Strong' },
  { arabic: 'الْمَتِينُ', translit: 'Al-Matin', meaning: 'The Firm' },
  { arabic: 'الْوَلِيُّ', translit: 'Al-Wali', meaning: 'The Friend' },
  { arabic: 'الْحَمِيدُ', translit: 'Al-Hamid', meaning: 'The Praiseworthy' },
  { arabic: 'الْمُحْصِي', translit: 'Al-Muhsi', meaning: 'The Counter' },
  { arabic: 'الْمُبْدِئُ', translit: 'Al-Mubdi', meaning: 'The Originator' },
  { arabic: 'الْمُعِيدُ', translit: 'Al-Mu\'id', meaning: 'The Restorer' },
  { arabic: 'الْمُحْيِي', translit: 'Al-Muhyi', meaning: 'The Giver of Life' },
  { arabic: 'الْمُمِيتُ', translit: 'Al-Mumit', meaning: 'The Taker of Life' },
  { arabic: 'الْحَيُّ', translit: 'Al-Hayy', meaning: 'The Ever-Living' },
  { arabic: 'الْقَيُّومُ', translit: 'Al-Qayyum', meaning: 'The Self-Sustaining' },
  { arabic: 'الْوَاجِدُ', translit: 'Al-Wajid', meaning: 'The Finder' },
  { arabic: 'الْمَاجِدُ', translit: 'Al-Majid', meaning: 'The Noble' },
  { arabic: 'الْوَاحِدُ', translit: 'Al-Wahid', meaning: 'The One' },
  { arabic: 'الْأَحَدُ', translit: 'Al-Ahad', meaning: 'The Unique' },
  { arabic: 'الصَّمَدُ', translit: 'As-Samad', meaning: 'The Eternal' },
  { arabic: 'الْقَادِرُ', translit: 'Al-Qadir', meaning: 'The All-Powerful' },
  { arabic: 'الْمُقْتَدِرُ', translit: 'Al-Muqtadir', meaning: 'The Omnipotent' },
  { arabic: 'الْمُقَدِّمُ', translit: 'Al-Muqaddim', meaning: 'The Advancer' },
  { arabic: 'الْمُؤَخِّرُ', translit: 'Al-Mu\'akhkhir', meaning: 'The Delayer' },
  { arabic: 'الْأَوَّلُ', translit: 'Al-Awwal', meaning: 'The First' },
  { arabic: 'الْآخِرُ', translit: 'Al-Akhir', meaning: 'The Last' },
  { arabic: 'الظَّاهِرُ', translit: 'Az-Zahir', meaning: 'The Manifest' },
  { arabic: 'الْبَاطِنُ', translit: 'Al-Batin', meaning: 'The Hidden' },
  { arabic: 'الْوَالِي', translit: 'Al-Wali', meaning: 'The Governor' },
  { arabic: 'الْمُتَعَالِي', translit: 'Al-Muta\'ali', meaning: 'The Most Exalted' },
  { arabic: 'الْبَرُّ', translit: 'Al-Barr', meaning: 'The Source of Goodness' },
  { arabic: 'التَّوَّابُ', translit: 'At-Tawwab', meaning: 'The Accepter of Repentance' },
  { arabic: 'الْمُنْتَقِمُ', translit: 'Al-Muntaqim', meaning: 'The Avenger' },
  { arabic: 'الْعَفُوُّ', translit: 'Al-\'Afuww', meaning: 'The Pardoner' },
  { arabic: 'الرَّءُوفُ', translit: 'Ar-Ra\'uf', meaning: 'The Compassionate' },
  { arabic: 'مَالِكُ الْمُلْكِ', translit: 'Malik-ul-Mulk', meaning: 'The Owner of Sovereignty' },
  { arabic: 'ذُو الْجَلَالِ وَالْإِكْرَامِ', translit: 'Dhu-l-Jalal wa-l-Ikram', meaning: 'The Lord of Majesty and Honour' },
  { arabic: 'الْمُقْسِطُ', translit: 'Al-Muqsit', meaning: 'The Equitable' },
  { arabic: 'الْجَامِعُ', translit: 'Al-Jami\'', meaning: 'The Gatherer' },
  { arabic: 'الْغَنِيُّ', translit: 'Al-Ghani', meaning: 'The Self-Sufficient' },
  { arabic: 'الْمُغْنِي', translit: 'Al-Mughni', meaning: 'The Enricher' },
  { arabic: 'الْمَانِعُ', translit: 'Al-Mani\'', meaning: 'The Preventer' },
  { arabic: 'الضَّارُّ', translit: 'Ad-Darr', meaning: 'The Distresser' },
  { arabic: 'النَّافِعُ', translit: 'An-Nafi\'', meaning: 'The Benefactor' },
  { arabic: 'النُّورُ', translit: 'An-Nur', meaning: 'The Light' },
  { arabic: 'الْهَادِي', translit: 'Al-Hadi', meaning: 'The Guide' },
  { arabic: 'الْبَدِيعُ', translit: 'Al-Badi\'', meaning: 'The Originator' },
  { arabic: 'الْبَاقِي', translit: 'Al-Baqi', meaning: 'The Everlasting' },
  { arabic: 'الْوَارِثُ', translit: 'Al-Warith', meaning: 'The Inheritor' },
  { arabic: 'الرَّشِيدُ', translit: 'Ar-Rashid', meaning: 'The Righteous Teacher' },
  { arabic: 'الصَّبُورُ', translit: 'As-Sabur', meaning: 'The Patient' }
];

/* ---------- Data: Du'a Library ---------- */
const DUAS = [
  {
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    translation: 'Our Lord, give us in this world [that which is] good and in the Hereafter [that which is] good and protect us from the punishment of the Fire.',
    occasion: 'Daily Supplication',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
    translation: 'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
    occasion: 'Daily Supplication',
  },
  {
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    translation: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
    occasion: 'After Prayer',
  },
  {
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي',
    translation: 'My Lord, expand for me my chest [with assurance] and ease for me my task.',
    occasion: 'Before Difficult Tasks',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ',
    translation: 'O Allah, I seek refuge in You from anxiety and sorrow, weakness and laziness.',
    occasion: 'When Feeling Anxious',
  },
  {
    arabic: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
    translation: 'Allah is sufficient for me; there is no deity except Him. Upon Him I rely, and He is the Lord of the Mighty Throne.',
    occasion: 'When Facing Hardship',
  },
  {
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    translation: 'O Allah, You are Forgiving and love forgiveness, so forgive me.',
    occasion: 'Laylatul Qadr / Seeking Forgiveness',
  },
  {
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    translation: 'My Lord, increase me in knowledge.',
    occasion: 'Seeking Knowledge',
  },
  {
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ وَأَعُوذُ بِكَ مِنَ النَّارِ',
    translation: 'O Allah, I ask You for Paradise and I seek refuge in You from the Fire.',
    occasion: 'Daily Supplication',
  },
  {
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، سُبْحَانَ اللَّهِ الْعَظِيمِ',
    translation: 'Glory be to Allah and praise be to Him; Glory be to Allah, the Magnificent.',
    occasion: 'Light on the Tongue, Heavy on the Scales',
  },
  {
    arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
    translation: 'O Allah, send blessings upon Muhammad and upon the family of Muhammad.',
    occasion: 'Sending Salawat',
  },
  {
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِن لَّدُنكَ رَحْمَةً',
    translation: 'Our Lord, let not our hearts deviate after You have guided us and grant us from Yourself mercy.',
    occasion: 'Seeking Steadfastness',
  },
];

/* ---------- Data: Quiz Questions ---------- */
const QUIZ_QUESTIONS = [
  {
    question: 'What is the Arabic term for God consciousness / piety?',
    options: ['Ihsan', 'Taqwa', 'Iman', 'Sabr'],
    answer: 1,
  },
  {
    question: 'Which Surah contains the verse: "Indeed, the most noble of you in the sight of Allah is the most righteous"?',
    options: ['Al-Baqarah', 'Al-Hujurat', 'An-Nahl', 'At-Talaq'],
    answer: 1,
  },
  {
    question: 'How many Names of Allah are traditionally listed in the Asma ul-Husna?',
    options: ['66', '77', '99', '100'],
    answer: 2,
  },
  {
    question: 'What is the first revelation received by Prophet Muhammad (peace be upon him)?',
    options: ['"Read! In the name of your Lord"', '"O you who believe, fast"', '"Praise be to Allah"', '"Say: He is Allah, the One"'],
    answer: 0,
  },
  {
    question: 'Which pillar of Islam involves fasting during Ramadan?',
    options: ['Shahada', 'Salah', 'Zakat', 'Sawm'],
    answer: 3,
  },
  {
    question: 'What does "Alhamdulillah" mean?',
    options: ['Allah is the Greatest', 'Praise be to Allah', 'Glory be to Allah', 'There is no god but Allah'],
    answer: 1,
  },
  {
    question: 'Which Surah is known as the "Heart of the Quran"?',
    options: ['Al-Fatiha', 'Yasin', 'Ar-Rahman', 'Al-Ikhlas'],
    answer: 1,
  },
  {
    question: 'What is the night journey called when the Prophet traveled from Makkah to Jerusalem?',
    options: ['Hijrah', 'Isra', 'Miraj', 'Umrah'],
    answer: 1,
  },
  {
    question: 'How many daily prayers (Salah) are obligatory for Muslims?',
    options: ['3', '4', '5', '7'],
    answer: 2,
  },
  {
    question: 'What does "Astaghfirullah" mean?',
    options: ['I seek forgiveness from Allah', 'Allah is sufficient for me', 'In the name of Allah', 'Praise be to Allah'],
    answer: 0,
  },
];

/* ---------- Data: Reflection Prompts ---------- */
const REFLECTION_PROMPTS = [
  'Where in your life today can you feel the presence of Allah most clearly?',
  'What is one action you can take today that would please Allah, even if no one else sees it?',
  'Which of Allah\'s names do you need to call upon most tonight?',
  'What blessing did you overlook today that you are grateful for now?',
  'If today were your last day, what would you ask Allah\'s forgiveness for?',
  'How can you turn a habit into an act of worship through intention?',
  'Who around you needs your kindness today, and how can you offer it for Allah\'s sake?',
  'What worry can you truly place in Allah\'s hands tonight and leave there?',
  'Which verse or hadith touched your heart recently, and what did it teach you?',
  'What is one small step you can take to grow closer to Allah this week?',
  'How can you make your tongue a garden of remembrance today?',
  'What would it look like to love for your fellow human what you love for yourself?'
];

/* ---------- State ---------- */
let lastVerseIndex = -1;
let lastHadithIndex = -1;
let lastPromptIndex = -1;

/* ---------- Utility ---------- */
function getRandomItem(arr, lastIndex) {
  if (arr.length === 0) return null;
  let idx = Math.floor(Math.random() * arr.length);
  while (idx === lastIndex && arr.length > 1) {
    idx = Math.floor(Math.random() * arr.length);
  }
  return idx;
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/* ---------- Daily Verse ---------- */
function showDailyVerse() {
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const verseIndex = daysSinceEpoch % VERSES.length;
  const verse = VERSES[verseIndex];

  const arabic = document.getElementById('dailyArabic');
  const translation = document.getElementById('dailyTranslation');
  const reference = document.getElementById('dailyReference');

  arabic.textContent = `﴿ ${verse.arabic} ﴾`;
  translation.textContent = `"${verse.translation}"`;
  reference.textContent = verse.reference;

  arabic.classList.remove('fade-in');
  translation.classList.remove('fade-in');
  reference.classList.remove('fade-in');
  void arabic.offsetWidth; // restart animation
  arabic.classList.add('fade-in');
  translation.classList.add('fade-in');
  reference.classList.add('fade-in');
}

function showRandomVerse() {
  const idx = getRandomItem(VERSES, lastVerseIndex);
  lastVerseIndex = idx;
  const verse = VERSES[idx];

  const arabic = document.getElementById('dailyArabic');
  const translation = document.getElementById('dailyTranslation');
  const reference = document.getElementById('dailyReference');

  arabic.textContent = `﴿ ${verse.arabic} ﴾`;
  translation.textContent = `"${verse.translation}"`;
  reference.textContent = verse.reference;

  arabic.classList.remove('fade-in');
  translation.classList.remove('fade-in');
  reference.classList.remove('fade-in');
  void arabic.offsetWidth;
  arabic.classList.add('fade-in');
  translation.classList.add('fade-in');
  reference.classList.add('fade-in');
}

/* ---------- Hadith ---------- */
function showDailyHadith() {
  const daysSinceEpoch = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const hadithIndex = daysSinceEpoch % HADITHS.length;
  const hadith = HADITHS[hadithIndex];

  const text = document.getElementById('hadithText');
  const source = document.getElementById('hadithSource');

  text.textContent = `❝ ${hadith.arabic} ❞`;
  source.textContent = `${hadith.translation} — ${hadith.source}`;

  text.classList.remove('fade-in');
  source.classList.remove('fade-in');
  void text.offsetWidth;
  text.classList.add('fade-in');
  source.classList.add('fade-in');
}

function showRandomHadith() {
  const idx = getRandomItem(HADITHS, lastHadithIndex);
  lastHadithIndex = idx;
  const hadith = HADITHS[idx];

  const text = document.getElementById('hadithText');
  const source = document.getElementById('hadithSource');

  text.textContent = `❝ ${hadith.arabic} ❞`;
  source.textContent = `${hadith.translation} — ${hadith.source}`;

  text.classList.remove('fade-in');
  source.classList.remove('fade-in');
  void text.offsetWidth;
  text.classList.add('fade-in');
  source.classList.add('fade-in');
}

/* ---------- Names of Allah ---------- */
function renderNames() {
  const grid = document.getElementById('namesGrid');
  grid.innerHTML = '';

  NAMES_OF_ALLAH.forEach((name) => {
    const card = document.createElement('div');
    card.className = 'name-card reveal';
    card.innerHTML = `
      <div class="name-arabic">${name.arabic}</div>
      <div class="name-translit">${name.translit}</div>
      <div class="name-meaning">${name.meaning}</div>
    `;
    grid.appendChild(card);
  });

  // Intersection Observer for reveal animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.name-card.reveal').forEach((card, i) => {
    card.style.transitionDelay = `${(i % 5) * 80}ms`;
    observer.observe(card);
  });
}

/* ---------- Reflection ---------- */
function showReflectionPrompt() {
  const idx = getRandomItem(REFLECTION_PROMPTS, lastPromptIndex);
  lastPromptIndex = idx;
  const prompt = REFLECTION_PROMPTS[idx];

  const el = document.getElementById('reflectPrompt');
  el.textContent = `🕊  ${prompt}`;
  el.classList.remove('fade-in');
  void el.offsetWidth;
  el.classList.add('fade-in');
}

/* ---------- Journal (localStorage) ---------- */
function loadJournal() {
  const saved = localStorage.getItem('haiiah_journal');
  const textarea = document.getElementById('journalText');
  if (saved) {
    textarea.value = saved;
  }
}

function saveJournal() {
  const text = document.getElementById('journalText').value;
  localStorage.setItem('haiiah_journal', text);
  const hint = document.getElementById('journalHint');
  hint.textContent = `Saved ${formatDate()} — may Allah accept it.`;
  setTimeout(() => { hint.textContent = ''; }, 3000);
}

/* ---------- Tasbih ---------- */
let tasbihCount = 0;
let tasbihTarget = 33;
let currentPhrase = 'سُبْحَانَ اللَّهِ';
let currentTranslation = 'Glory be to Allah';

function setTasbihPhrase(phraseEl) {
  const phrase = phraseEl.dataset.phrase;
  const translation = phraseEl.dataset.translation;
  if (!phrase) return;

  currentPhrase = phrase;
  currentTranslation = translation;
  tasbihCount = 0;

  document.getElementById('tasbihPhrase').textContent = phrase;
  document.getElementById('tasbihTranslation').textContent = translation;
  document.getElementById('tasbihCount').textContent = '0';

  // Highlight active phrase button
  document.querySelectorAll('.tasbih-phrases .btn').forEach((btn) => {
    btn.classList.remove('active');
  });
  phraseEl.classList.add('active');
}

function incrementTasbih() {
  tasbihCount++;
  const countEl = document.getElementById('tasbihCount');
  countEl.textContent = tasbihCount;

  // Pulse animation
  countEl.classList.remove('pulse');
  void countEl.offsetWidth;
  countEl.classList.add('pulse');

  // Auto-reset when target reached
  if (tasbihCount >= tasbihTarget) {
    setTimeout(() => {
      tasbihCount = 0;
      countEl.textContent = '0';
    }, 600);
  }
}

function resetTasbih() {
  tasbihCount = 0;
  document.getElementById('tasbihCount').textContent = '0';
}

function setupTasbih() {
  const tapBtn = document.getElementById('tasbihTap');
  const resetBtn = document.getElementById('tasbihReset');

  // Tap with mouse
  tapBtn.addEventListener('click', incrementTasbih);
  // Touch support
  tapBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    incrementTasbih();
  });

  resetBtn.addEventListener('click', resetTasbih);

  // Phrase selection
  document.querySelectorAll('.tasbih-phrases .btn').forEach((btn) => {
    btn.addEventListener('click', () => setTasbihPhrase(btn));
  });

  // Activate default phrase
  const defaultBtn = document.querySelector('.tasbih-phrases .btn');
  if (defaultBtn) defaultBtn.classList.add('active');
}

/* ---------- Du'a Library ---------- */
function renderDuas() {
  const grid = document.getElementById('duaGrid');
  grid.innerHTML = '';

  DUAS.forEach((dua, i) => {
    const card = document.createElement('div');
    card.className = 'dua-card reveal';
    card.style.transitionDelay = `${(i % 4) * 60}ms`;
    card.innerHTML = `
      <div class="dua-arabic">${dua.arabic}</div>
      <div class="dua-translation">"${dua.translation}"</div>
      <span class="dua-occasion">${dua.occasion}</span>
    `;
    grid.appendChild(card);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.dua-card.reveal').forEach((card) => {
    observer.observe(card);
  });
}

/* ---------- Quiz ---------- */
let quizIndex = 0;
let quizScore = 0;
let quizAnswered = false;

function renderQuizQuestion() {
  quizAnswered = false;
  const q = QUIZ_QUESTIONS[quizIndex];

  document.getElementById('quizQuestion').textContent = q.question;
  document.getElementById('quizResult').textContent = '';

  const optionsEl = document.getElementById('quizOptions');
  optionsEl.innerHTML = '';

  q.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-option';
    btn.textContent = option;
    btn.addEventListener('click', () => answerQuiz(i, btn));
    optionsEl.appendChild(btn);
  });

  // Update progress
  const progress = ((quizIndex + 1) / QUIZ_QUESTIONS.length) * 100;
  document.getElementById('quizProgressBar').style.width = `${progress}%`;

  document.getElementById('quizNext').style.display = 'none';
  document.getElementById('quizRestart').style.display = 'none';
}

function answerQuiz(selectedIndex, btnEl) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = QUIZ_QUESTIONS[quizIndex];
  const allOptions = document.querySelectorAll('.quiz-option');
  allOptions.forEach((opt) => { opt.disabled = true; });

  if (selectedIndex === q.answer) {
    quizScore++;
    btnEl.classList.add('correct');
    document.getElementById('quizResult').textContent = '✅ Correct! ' + (q.options[q.answer].startsWith('"') ? '' : '');
  } else {
    btnEl.classList.add('incorrect');
    allOptions[q.answer].classList.add('correct');
    document.getElementById('quizResult').textContent = '❌ Not quite. The correct answer is: ' + q.options[q.answer];
  }

  const nextBtn = document.getElementById('quizNext');
  const restartBtn = document.getElementById('quizRestart');

  if (quizIndex < QUIZ_QUESTIONS.length - 1) {
    nextBtn.style.display = 'inline-block';
  } else {
    nextBtn.style.display = 'none';
    restartBtn.style.display = 'inline-block';
    document.getElementById('quizResult').textContent = `🏆 Quiz complete! You scored ${quizScore} / ${QUIZ_QUESTIONS.length}`;
  }
}

function nextQuizQuestion() {
  quizIndex++;
  renderQuizQuestion();
}

function restartQuiz() {
  quizIndex = 0;
  quizScore = 0;
  renderQuizQuestion();
}

function setupQuiz() {
  renderQuizQuestion();
  document.getElementById('quizNext').addEventListener('click', nextQuizQuestion);
  document.getElementById('quizRestart').addEventListener('click', restartQuiz);
}

/* ---------- Search ---------- */
function buildSearchIndex() {
  const index = [];

  VERSES.forEach((verse, i) => {
    index.push({
      type: 'Qur\'an',
      arabic: verse.arabic,
      translation: verse.translation,
      reference: verse.reference,
      keywords: `${verse.translation} ${verse.reference}`
    });
  });

  HADITHS.forEach((hadith, i) => {
    index.push({
      type: 'Hadith',
      arabic: hadith.arabic,
      translation: hadith.translation,
      reference: hadith.source,
      keywords: `${hadith.translation} ${hadith.source}`
    });
  });

  return index;
}

const SEARCH_INDEX = buildSearchIndex();

function performSearch(query) {
  const resultsEl = document.getElementById('searchResults');
  const q = query.trim().toLowerCase();

  if (!q) {
    resultsEl.innerHTML = '';
    return;
  }

  const matches = SEARCH_INDEX.filter((item) => {
    return item.keywords.toLowerCase().includes(q) ||
           item.arabic.includes(query.trim());
  });

  if (matches.length === 0) {
    resultsEl.innerHTML = `<div class="search-empty">No verses found. Try another word — perhaps "mercy", "patience", or "heart".</div>`;
    return;
  }

  resultsEl.innerHTML = '';
  matches.forEach((match, i) => {
    const result = document.createElement('div');
    result.className = 'search-result';
    result.style.animationDelay = `${i * 60}ms`;
    result.innerHTML = `
      <div class="search-result-arabic">${match.type === 'Qur\'an' ? '﴿ ' + match.arabic + ' ﴾' : '❝ ' + match.arabic + ' ❞'}</div>
      <div class="search-result-translation">"${match.translation}"</div>
      <div class="search-result-reference">${match.type} — ${match.reference}</div>
    `;
    resultsEl.appendChild(result);
  });
}

/* ---------- Mobile Nav ---------- */
function setupNav() {
  const toggle = document.getElementById('navToggle');
  const nav = document.querySelector('.main-nav');

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ---------- Scroll reveal for sections ---------- */
function setupReveal() {
  const revealEls = document.querySelectorAll('.section > .container > .section-head, .verse-card, .hadith-card, .reflect-layout');
  revealEls.forEach((el) => el.classList.add('reveal'));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  revealEls.forEach((el) => observer.observe(el));
}

/* ---------- Init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  showDailyVerse();
  showDailyHadith();
  renderNames();
  showReflectionPrompt();
  loadJournal();
  setupNav();
  setupReveal();

  // Events
  document.getElementById('newVerse').addEventListener('click', showRandomVerse);
  document.getElementById('newHadith').addEventListener('click', showRandomHadith);
  document.getElementById('newPrompt').addEventListener('click', showReflectionPrompt);
  document.getElementById('saveReflection').addEventListener('click', saveJournal);

  // Auto-save journal on input (debounced)
  let saveTimer;
  document.getElementById('journalText').addEventListener('input', () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      const hint = document.getElementById('journalHint');
      localStorage.setItem('haiiah_journal', document.getElementById('journalText').value);
      hint.textContent = 'Autosaved.';
      setTimeout(() => { hint.textContent = ''; }, 2000);
    }, 800);
  });

  // Search
  const searchInput = document.getElementById('searchInput');
  let searchTimer;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      performSearch(searchInput.value);
    }, 200);
  });

  // New Features
  setupTasbih();
  renderDuas();
  setupQuiz();

  // Add new sections to reveal
  document.querySelectorAll('.tasbih-display, .dua-card, .quiz-layout').forEach((el) => {
    el.classList.add('reveal');
  });
});
