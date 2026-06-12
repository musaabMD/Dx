import Foundation

struct QuranChapter: Identifiable, Hashable {
    let number: Int
    let nameArabic: String
    let nameEnglish: String
    let revelation: String
    let verseCount: Int

    nonisolated var id: Int { number }
}

struct QuranVerse: Identifiable, Hashable {
    let chapter: Int
    let verse: Int
    let textUthmani: String

    nonisolated var id: String { "\(chapter):\(verse)" }
}

struct QuranTranslationLine: Identifiable, Hashable {
    let resourceID: String
    let chapter: Int
    let verse: Int
    let text: String

    nonisolated var id: String { "\(resourceID):\(chapter):\(verse)" }
}

struct QuranVerseRow: Identifiable, Hashable {
    let verse: QuranVerse
    let translation: QuranTranslationLine?

    nonisolated var id: String { verse.id }
}

struct QuranRemoteManifest {
    let generatedAt: String
    let packs: [QuranDownloadPack]
}

struct QuranDownloadPack: Identifiable, Hashable {
    let id: String
    let title: String
    let description: String
    let version: String
    let baseURL: String
    let chaptersFile: String?
    let versesFile: String
    let translationFiles: [QuranTranslationFile]
    let tafsirFiles: [QuranTafsirFile]
    let audioFiles: [QuranAudioFile]
    let layoutFile: QuranLayoutFile?
    let mushafLayoutFile: QuranMushafLayoutFile?
    let mushafScriptFile: QuranMushafScriptFile?
    let mushafLayoutSQLiteFile: QuranMushafSQLiteFile?
    let mushafScriptSQLiteFile: QuranMushafSQLiteFile?
}

struct QuranTranslationFile: Hashable {
    let resourceID: String
    let language: String
    let file: String
    let title: String
}

struct QuranTafsirFile: Hashable {
    let resourceID: String
    let language: String
    let file: String
    let title: String
}

struct QuranAudioFile: Hashable {
    let reciterID: String
    let title: String
    let file: String
    let baseAudioURL: String
}

struct QuranLayoutFile: Hashable {
    let layoutID: String
    let title: String
    let file: String
}

struct QuranMushafLayoutFile: Hashable {
    let layoutID: String
    let title: String
    let file: String
}

struct QuranMushafScriptFile: Hashable {
    let layoutID: String
    let title: String
    let file: String
}

struct QuranMushafSQLiteFile: Hashable {
    let layoutID: String
    let title: String
    let file: String
}

struct QuranTafsirLine: Identifiable, Hashable {
    let resourceID: String
    let chapter: Int
    let verse: Int
    let text: String

    nonisolated var id: String { "\(resourceID):\(chapter):\(verse)" }
}

struct QuranAudioAyah: Identifiable, Hashable {
    let reciterID: String
    let chapter: Int
    let verse: Int
    let url: String
    let durationMS: Int?

    nonisolated var id: String { "\(reciterID):\(chapter):\(verse)" }
}

struct QuranLayoutWord: Identifiable, Hashable {
    let layoutID: String
    let page: Int
    let lineNumber: Int
    let position: Int
    let chapter: Int
    let verse: Int
    let wordIndex: Int
    let x: Double
    let y: Double
    let width: Double
    let height: Double
    let token: String?

    nonisolated var id: String { "\(layoutID):\(page):\(lineNumber):\(position)" }
}

enum QuranMushafLineType: String, Hashable {
    case ayah
    case surahName = "surah_name"
    case basmallah
}

struct QuranMushafPageLine: Identifiable, Hashable {
    let layoutID: String
    let pageNumber: Int
    let lineNumber: Int
    let lineType: QuranMushafLineType
    let isCentered: Bool
    let firstWordID: Int?
    let lastWordID: Int?
    let surahNumber: Int?

    nonisolated var id: String { "\(layoutID):\(pageNumber):\(lineNumber)" }
}

struct QuranMushafScriptWord: Identifiable, Hashable {
    let layoutID: String
    let wordIndex: Int
    let wordKey: String
    let surah: Int
    let ayah: Int
    let text: String

    nonisolated var id: String { "\(layoutID):\(wordIndex)" }
}

struct QuranPackInstallSummary: Identifiable, Hashable {
    let packID: String
    let version: String
    let installedAt: String
    let sourceURL: String

    nonisolated var id: String { packID }
}

enum QuranStoreError: LocalizedError {
    case sqliteOpenFailed
    case sqliteError(String)
    case malformedJSON(String)

    var errorDescription: String? {
        switch self {
        case .sqliteOpenFailed:
            return "Could not open Quran SQLite database."
        case let .sqliteError(message):
            return message
        case let .malformedJSON(message):
            return message
        }
    }
}

enum QuranBuiltInData {
    nonisolated static let chapters: [QuranChapter] = [
        .init(number: 1, nameArabic: "الفاتحة", nameEnglish: "Al-Fatihah", revelation: "meccan", verseCount: 7),
        .init(number: 2, nameArabic: "البقرة", nameEnglish: "Al-Baqarah", revelation: "medinan", verseCount: 286),
        .init(number: 3, nameArabic: "آل عمران", nameEnglish: "Ali 'Imran", revelation: "medinan", verseCount: 200),
        .init(number: 4, nameArabic: "النساء", nameEnglish: "An-Nisa", revelation: "medinan", verseCount: 176),
        .init(number: 5, nameArabic: "المائدة", nameEnglish: "Al-Ma'idah", revelation: "medinan", verseCount: 120),
        .init(number: 6, nameArabic: "الأنعام", nameEnglish: "Al-An'am", revelation: "meccan", verseCount: 165),
        .init(number: 7, nameArabic: "الأعراف", nameEnglish: "Al-A'raf", revelation: "meccan", verseCount: 206),
        .init(number: 8, nameArabic: "الأنفال", nameEnglish: "Al-Anfal", revelation: "medinan", verseCount: 75),
        .init(number: 9, nameArabic: "التوبة", nameEnglish: "At-Tawbah", revelation: "medinan", verseCount: 129),
        .init(number: 10, nameArabic: "يونس", nameEnglish: "Yunus", revelation: "meccan", verseCount: 109),
        .init(number: 11, nameArabic: "هود", nameEnglish: "Hud", revelation: "meccan", verseCount: 123),
        .init(number: 12, nameArabic: "يوسف", nameEnglish: "Yusuf", revelation: "meccan", verseCount: 111),
        .init(number: 13, nameArabic: "الرعد", nameEnglish: "Ar-Ra'd", revelation: "medinan", verseCount: 43),
        .init(number: 14, nameArabic: "إبراهيم", nameEnglish: "Ibrahim", revelation: "meccan", verseCount: 52),
        .init(number: 15, nameArabic: "الحجر", nameEnglish: "Al-Hijr", revelation: "meccan", verseCount: 99),
        .init(number: 16, nameArabic: "النحل", nameEnglish: "An-Nahl", revelation: "meccan", verseCount: 128),
        .init(number: 17, nameArabic: "الإسراء", nameEnglish: "Al-Isra", revelation: "meccan", verseCount: 111),
        .init(number: 18, nameArabic: "الكهف", nameEnglish: "Al-Kahf", revelation: "meccan", verseCount: 110),
        .init(number: 19, nameArabic: "مريم", nameEnglish: "Maryam", revelation: "meccan", verseCount: 98),
        .init(number: 20, nameArabic: "طه", nameEnglish: "Ta-Ha", revelation: "meccan", verseCount: 135),
        .init(number: 21, nameArabic: "الأنبياء", nameEnglish: "Al-Anbiya", revelation: "meccan", verseCount: 112),
        .init(number: 22, nameArabic: "الحج", nameEnglish: "Al-Hajj", revelation: "medinan", verseCount: 78),
        .init(number: 23, nameArabic: "المؤمنون", nameEnglish: "Al-Mu'minun", revelation: "meccan", verseCount: 118),
        .init(number: 24, nameArabic: "النور", nameEnglish: "An-Nur", revelation: "medinan", verseCount: 64),
        .init(number: 25, nameArabic: "الفرقان", nameEnglish: "Al-Furqan", revelation: "meccan", verseCount: 77),
        .init(number: 26, nameArabic: "الشعراء", nameEnglish: "Ash-Shu'ara", revelation: "meccan", verseCount: 227),
        .init(number: 27, nameArabic: "النمل", nameEnglish: "An-Naml", revelation: "meccan", verseCount: 93),
        .init(number: 28, nameArabic: "القصص", nameEnglish: "Al-Qasas", revelation: "meccan", verseCount: 88),
        .init(number: 29, nameArabic: "العنكبوت", nameEnglish: "Al-'Ankabut", revelation: "meccan", verseCount: 69),
        .init(number: 30, nameArabic: "الروم", nameEnglish: "Ar-Rum", revelation: "meccan", verseCount: 60),
        .init(number: 31, nameArabic: "لقمان", nameEnglish: "Luqman", revelation: "meccan", verseCount: 34),
        .init(number: 32, nameArabic: "السجدة", nameEnglish: "As-Sajdah", revelation: "meccan", verseCount: 30),
        .init(number: 33, nameArabic: "الأحزاب", nameEnglish: "Al-Ahzab", revelation: "medinan", verseCount: 73),
        .init(number: 34, nameArabic: "سبأ", nameEnglish: "Saba", revelation: "meccan", verseCount: 54),
        .init(number: 35, nameArabic: "فاطر", nameEnglish: "Fatir", revelation: "meccan", verseCount: 45),
        .init(number: 36, nameArabic: "يس", nameEnglish: "Ya-Sin", revelation: "meccan", verseCount: 83),
        .init(number: 37, nameArabic: "الصافات", nameEnglish: "As-Saffat", revelation: "meccan", verseCount: 182),
        .init(number: 38, nameArabic: "ص", nameEnglish: "Sad", revelation: "meccan", verseCount: 88),
        .init(number: 39, nameArabic: "الزمر", nameEnglish: "Az-Zumar", revelation: "meccan", verseCount: 75),
        .init(number: 40, nameArabic: "غافر", nameEnglish: "Ghafir", revelation: "meccan", verseCount: 85),
        .init(number: 41, nameArabic: "فصلت", nameEnglish: "Fussilat", revelation: "meccan", verseCount: 54),
        .init(number: 42, nameArabic: "الشورى", nameEnglish: "Ash-Shuraa", revelation: "meccan", verseCount: 53),
        .init(number: 43, nameArabic: "الزخرف", nameEnglish: "Az-Zukhruf", revelation: "meccan", verseCount: 89),
        .init(number: 44, nameArabic: "الدخان", nameEnglish: "Ad-Dukhan", revelation: "meccan", verseCount: 59),
        .init(number: 45, nameArabic: "الجاثية", nameEnglish: "Al-Jathiyah", revelation: "meccan", verseCount: 37),
        .init(number: 46, nameArabic: "الأحقاف", nameEnglish: "Al-Ahqaf", revelation: "meccan", verseCount: 35),
        .init(number: 47, nameArabic: "محمد", nameEnglish: "Muhammad", revelation: "medinan", verseCount: 38),
        .init(number: 48, nameArabic: "الفتح", nameEnglish: "Al-Fath", revelation: "medinan", verseCount: 29),
        .init(number: 49, nameArabic: "الحجرات", nameEnglish: "Al-Hujurat", revelation: "medinan", verseCount: 18),
        .init(number: 50, nameArabic: "ق", nameEnglish: "Qaf", revelation: "meccan", verseCount: 45),
        .init(number: 51, nameArabic: "الذاريات", nameEnglish: "Adh-Dhariyat", revelation: "meccan", verseCount: 60),
        .init(number: 52, nameArabic: "الطور", nameEnglish: "At-Tur", revelation: "meccan", verseCount: 49),
        .init(number: 53, nameArabic: "النجم", nameEnglish: "An-Najm", revelation: "meccan", verseCount: 62),
        .init(number: 54, nameArabic: "القمر", nameEnglish: "Al-Qamar", revelation: "meccan", verseCount: 55),
        .init(number: 55, nameArabic: "الرحمن", nameEnglish: "Ar-Rahman", revelation: "medinan", verseCount: 78),
        .init(number: 56, nameArabic: "الواقعة", nameEnglish: "Al-Waqi'ah", revelation: "meccan", verseCount: 96),
        .init(number: 57, nameArabic: "الحديد", nameEnglish: "Al-Hadid", revelation: "medinan", verseCount: 29),
        .init(number: 58, nameArabic: "المجادلة", nameEnglish: "Al-Mujadila", revelation: "medinan", verseCount: 22),
        .init(number: 59, nameArabic: "الحشر", nameEnglish: "Al-Hashr", revelation: "medinan", verseCount: 24),
        .init(number: 60, nameArabic: "الممتحنة", nameEnglish: "Al-Mumtahanah", revelation: "medinan", verseCount: 13),
        .init(number: 61, nameArabic: "الصف", nameEnglish: "As-Saff", revelation: "medinan", verseCount: 14),
        .init(number: 62, nameArabic: "الجمعة", nameEnglish: "Al-Jumu'ah", revelation: "medinan", verseCount: 11),
        .init(number: 63, nameArabic: "المنافقون", nameEnglish: "Al-Munafiqun", revelation: "medinan", verseCount: 11),
        .init(number: 64, nameArabic: "التغابن", nameEnglish: "At-Taghabun", revelation: "medinan", verseCount: 18),
        .init(number: 65, nameArabic: "الطلاق", nameEnglish: "At-Talaq", revelation: "medinan", verseCount: 12),
        .init(number: 66, nameArabic: "التحريم", nameEnglish: "At-Tahrim", revelation: "medinan", verseCount: 12),
        .init(number: 67, nameArabic: "الملك", nameEnglish: "Al-Mulk", revelation: "meccan", verseCount: 30),
        .init(number: 68, nameArabic: "القلم", nameEnglish: "Al-Qalam", revelation: "meccan", verseCount: 52),
        .init(number: 69, nameArabic: "الحاقة", nameEnglish: "Al-Haqqah", revelation: "meccan", verseCount: 52),
        .init(number: 70, nameArabic: "المعارج", nameEnglish: "Al-Ma'arij", revelation: "meccan", verseCount: 44),
        .init(number: 71, nameArabic: "نوح", nameEnglish: "Nuh", revelation: "meccan", verseCount: 28),
        .init(number: 72, nameArabic: "الجن", nameEnglish: "Al-Jinn", revelation: "meccan", verseCount: 28),
        .init(number: 73, nameArabic: "المزمل", nameEnglish: "Al-Muzzammil", revelation: "meccan", verseCount: 20),
        .init(number: 74, nameArabic: "المدثر", nameEnglish: "Al-Muddaththir", revelation: "meccan", verseCount: 56),
        .init(number: 75, nameArabic: "القيامة", nameEnglish: "Al-Qiyamah", revelation: "meccan", verseCount: 40),
        .init(number: 76, nameArabic: "الإنسان", nameEnglish: "Al-Insan", revelation: "medinan", verseCount: 31),
        .init(number: 77, nameArabic: "المرسلات", nameEnglish: "Al-Mursalat", revelation: "meccan", verseCount: 50),
        .init(number: 78, nameArabic: "النبأ", nameEnglish: "An-Naba", revelation: "meccan", verseCount: 40),
        .init(number: 79, nameArabic: "النازعات", nameEnglish: "An-Nazi'at", revelation: "meccan", verseCount: 46),
        .init(number: 80, nameArabic: "عبس", nameEnglish: "'Abasa", revelation: "meccan", verseCount: 42),
        .init(number: 81, nameArabic: "التكوير", nameEnglish: "At-Takwir", revelation: "meccan", verseCount: 29),
        .init(number: 82, nameArabic: "الانفطار", nameEnglish: "Al-Infitar", revelation: "meccan", verseCount: 19),
        .init(number: 83, nameArabic: "المطففين", nameEnglish: "Al-Mutaffifin", revelation: "meccan", verseCount: 36),
        .init(number: 84, nameArabic: "الانشقاق", nameEnglish: "Al-Inshiqaq", revelation: "meccan", verseCount: 25),
        .init(number: 85, nameArabic: "البروج", nameEnglish: "Al-Buruj", revelation: "meccan", verseCount: 22),
        .init(number: 86, nameArabic: "الطارق", nameEnglish: "At-Tariq", revelation: "meccan", verseCount: 17),
        .init(number: 87, nameArabic: "الأعلى", nameEnglish: "Al-A'la", revelation: "meccan", verseCount: 19),
        .init(number: 88, nameArabic: "الغاشية", nameEnglish: "Al-Ghashiyah", revelation: "meccan", verseCount: 26),
        .init(number: 89, nameArabic: "الفجر", nameEnglish: "Al-Fajr", revelation: "meccan", verseCount: 30),
        .init(number: 90, nameArabic: "البلد", nameEnglish: "Al-Balad", revelation: "meccan", verseCount: 20),
        .init(number: 91, nameArabic: "الشمس", nameEnglish: "Ash-Shams", revelation: "meccan", verseCount: 15),
        .init(number: 92, nameArabic: "الليل", nameEnglish: "Al-Layl", revelation: "meccan", verseCount: 21),
        .init(number: 93, nameArabic: "الضحى", nameEnglish: "Ad-Duhaa", revelation: "meccan", verseCount: 11),
        .init(number: 94, nameArabic: "الشرح", nameEnglish: "Ash-Sharh", revelation: "meccan", verseCount: 8),
        .init(number: 95, nameArabic: "التين", nameEnglish: "At-Tin", revelation: "meccan", verseCount: 8),
        .init(number: 96, nameArabic: "العلق", nameEnglish: "Al-'Alaq", revelation: "meccan", verseCount: 19),
        .init(number: 97, nameArabic: "القدر", nameEnglish: "Al-Qadr", revelation: "meccan", verseCount: 5),
        .init(number: 98, nameArabic: "البينة", nameEnglish: "Al-Bayyinah", revelation: "medinan", verseCount: 8),
        .init(number: 99, nameArabic: "الزلزلة", nameEnglish: "Az-Zalzalah", revelation: "medinan", verseCount: 8),
        .init(number: 100, nameArabic: "العاديات", nameEnglish: "Al-'Adiyat", revelation: "meccan", verseCount: 11),
        .init(number: 101, nameArabic: "القارعة", nameEnglish: "Al-Qari'ah", revelation: "meccan", verseCount: 11),
        .init(number: 102, nameArabic: "التكاثر", nameEnglish: "At-Takathur", revelation: "meccan", verseCount: 8),
        .init(number: 103, nameArabic: "العصر", nameEnglish: "Al-'Asr", revelation: "meccan", verseCount: 3),
        .init(number: 104, nameArabic: "الهمزة", nameEnglish: "Al-Humazah", revelation: "meccan", verseCount: 9),
        .init(number: 105, nameArabic: "الفيل", nameEnglish: "Al-Fil", revelation: "meccan", verseCount: 5),
        .init(number: 106, nameArabic: "قريش", nameEnglish: "Quraysh", revelation: "meccan", verseCount: 4),
        .init(number: 107, nameArabic: "الماعون", nameEnglish: "Al-Ma'un", revelation: "meccan", verseCount: 7),
        .init(number: 108, nameArabic: "الكوثر", nameEnglish: "Al-Kawthar", revelation: "meccan", verseCount: 3),
        .init(number: 109, nameArabic: "الكافرون", nameEnglish: "Al-Kafirun", revelation: "meccan", verseCount: 6),
        .init(number: 110, nameArabic: "النصر", nameEnglish: "An-Nasr", revelation: "medinan", verseCount: 3),
        .init(number: 111, nameArabic: "المسد", nameEnglish: "Al-Masad", revelation: "meccan", verseCount: 5),
        .init(number: 112, nameArabic: "الإخلاص", nameEnglish: "Al-Ikhlas", revelation: "meccan", verseCount: 4),
        .init(number: 113, nameArabic: "الفلق", nameEnglish: "Al-Falaq", revelation: "meccan", verseCount: 5),
        .init(number: 114, nameArabic: "الناس", nameEnglish: "An-Nas", revelation: "meccan", verseCount: 6)
    ]

    nonisolated static let sampleVerses: [QuranVerse] = [
        .init(chapter: 1, verse: 1, textUthmani: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"),
        .init(chapter: 1, verse: 2, textUthmani: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ"),
        .init(chapter: 1, verse: 3, textUthmani: "الرَّحْمَٰنِ الرَّحِيمِ"),
        .init(chapter: 1, verse: 4, textUthmani: "مَالِكِ يَوْمِ الدِّينِ"),
        .init(chapter: 1, verse: 5, textUthmani: "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ"),
        .init(chapter: 1, verse: 6, textUthmani: "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ"),
        .init(chapter: 1, verse: 7, textUthmani: "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ")
    ]

    nonisolated static let sampleEnglishTranslation: [QuranTranslationLine] = [
        .init(resourceID: "en.sahih", chapter: 1, verse: 1, text: "In the name of Allah, the Entirely Merciful, the Especially Merciful."),
        .init(resourceID: "en.sahih", chapter: 1, verse: 2, text: "[All] praise is [due] to Allah, Lord of the worlds."),
        .init(resourceID: "en.sahih", chapter: 1, verse: 3, text: "The Entirely Merciful, the Especially Merciful."),
        .init(resourceID: "en.sahih", chapter: 1, verse: 4, text: "Sovereign of the Day of Recompense."),
        .init(resourceID: "en.sahih", chapter: 1, verse: 5, text: "It is You we worship and You we ask for help."),
        .init(resourceID: "en.sahih", chapter: 1, verse: 6, text: "Guide us to the straight path."),
        .init(resourceID: "en.sahih", chapter: 1, verse: 7, text: "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.")
    ]
}
