import Foundation
import SQLite3

actor QuranSQLiteStore {
    static let shared = QuranSQLiteStore()

    private let dbURL: URL
    private var db: OpaquePointer?

    init(fileManager: FileManager = .default) {
        let support = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        let folder = support.appendingPathComponent("QuranLibrary", isDirectory: true)
        if !fileManager.fileExists(atPath: folder.path) {
            try? fileManager.createDirectory(at: folder, withIntermediateDirectories: true)
        }
        self.dbURL = folder.appendingPathComponent("quran.sqlite")
    }

    deinit {
        if db != nil {
            sqlite3_close(db)
        }
    }

    func bootstrap() throws {
        try openIfNeeded()
        try createSchemaIfNeeded()
        try seedIfNeeded()
    }

    func fetchChapters() throws -> [QuranChapter] {
        try openIfNeeded()
        let sql = """
        SELECT number, name_ar, name_en, revelation, verse_count
        FROM chapters
        ORDER BY number;
        """
        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare chapters query")
        }
        defer { sqlite3_finalize(statement) }

        var rows: [QuranChapter] = []
        while sqlite3_step(statement) == SQLITE_ROW {
            rows.append(
                .init(
                    number: Int(sqlite3_column_int(statement, 0)),
                    nameArabic: string(from: sqlite3_column_text(statement, 1)),
                    nameEnglish: string(from: sqlite3_column_text(statement, 2)),
                    revelation: string(from: sqlite3_column_text(statement, 3)),
                    verseCount: Int(sqlite3_column_int(statement, 4))
                )
            )
        }
        return rows
    }

    func fetchVerses(chapter: Int, translationResourceID: String) throws -> [QuranVerseRow] {
        try openIfNeeded()

        let sql = """
        SELECT v.chapter, v.verse, v.text_uthmani, t.text
        FROM verses v
        LEFT JOIN translations t
          ON t.chapter = v.chapter
         AND t.verse = v.verse
         AND t.resource_id = ?
        WHERE v.chapter = ?
        ORDER BY v.verse;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare verse query")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: translationResourceID)
        sqlite3_bind_int(statement, 2, Int32(chapter))

        var rows: [QuranVerseRow] = []
        while sqlite3_step(statement) == SQLITE_ROW {
            let verse = QuranVerse(
                chapter: Int(sqlite3_column_int(statement, 0)),
                verse: Int(sqlite3_column_int(statement, 1)),
                textUthmani: string(from: sqlite3_column_text(statement, 2))
            )

            let translationText = stringOptional(from: sqlite3_column_text(statement, 3))
            let translation: QuranTranslationLine?
            if let translationText {
                translation = .init(
                    resourceID: translationResourceID,
                    chapter: verse.chapter,
                    verse: verse.verse,
                    text: translationText
                )
            } else {
                translation = nil
            }

            rows.append(.init(verse: verse, translation: translation))
        }

        return rows
    }

    func fetchVerseRow(chapter: Int, verse: Int, translationResourceID: String) throws -> QuranVerseRow? {
        try openIfNeeded()
        let sql = """
        SELECT v.chapter, v.verse, v.text_uthmani, t.text
        FROM verses v
        LEFT JOIN translations t
          ON t.chapter = v.chapter
         AND t.verse = v.verse
         AND t.resource_id = ?
        WHERE v.chapter = ? AND v.verse = ?
        LIMIT 1;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare single verse query")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: translationResourceID)
        sqlite3_bind_int(statement, 2, Int32(chapter))
        sqlite3_bind_int(statement, 3, Int32(verse))

        guard sqlite3_step(statement) == SQLITE_ROW else { return nil }

        let rowVerse = QuranVerse(
            chapter: Int(sqlite3_column_int(statement, 0)),
            verse: Int(sqlite3_column_int(statement, 1)),
            textUthmani: string(from: sqlite3_column_text(statement, 2))
        )
        let translationText = stringOptional(from: sqlite3_column_text(statement, 3))
        let translation: QuranTranslationLine?
        if let translationText {
            translation = .init(
                resourceID: translationResourceID,
                chapter: rowVerse.chapter,
                verse: rowVerse.verse,
                text: translationText
            )
        } else {
            translation = nil
        }
        return .init(verse: rowVerse, translation: translation)
    }

    func installedPacks() throws -> [QuranPackInstallSummary] {
        try openIfNeeded()

        let sql = """
        SELECT pack_id, version, installed_at, source_url
        FROM installed_packs
        ORDER BY installed_at DESC;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not read installed packs")
        }
        defer { sqlite3_finalize(statement) }

        var items: [QuranPackInstallSummary] = []
        while sqlite3_step(statement) == SQLITE_ROW {
            items.append(
                .init(
                    packID: string(from: sqlite3_column_text(statement, 0)),
                    version: string(from: sqlite3_column_text(statement, 1)),
                    installedAt: string(from: sqlite3_column_text(statement, 2)),
                    sourceURL: string(from: sqlite3_column_text(statement, 3))
                )
            )
        }

        return items
    }

    func fetchTafsir(resourceID: String, chapter: Int, verse: Int) throws -> QuranTafsirLine? {
        try openIfNeeded()

        let sql = """
        SELECT text
        FROM tafsir
        WHERE resource_id = ? AND chapter = ? AND verse = ?
        LIMIT 1;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare tafsir query")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: resourceID)
        sqlite3_bind_int(statement, 2, Int32(chapter))
        sqlite3_bind_int(statement, 3, Int32(verse))

        guard sqlite3_step(statement) == SQLITE_ROW else { return nil }
        return .init(
            resourceID: resourceID,
            chapter: chapter,
            verse: verse,
            text: string(from: sqlite3_column_text(statement, 0))
        )
    }

    func fetchAudioAyah(reciterID: String, chapter: Int, verse: Int) throws -> QuranAudioAyah? {
        try openIfNeeded()

        let sql = """
        SELECT audio_url, duration_ms
        FROM audio_ayah
        WHERE reciter_id = ? AND chapter = ? AND verse = ?
        LIMIT 1;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare audio query")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: reciterID)
        sqlite3_bind_int(statement, 2, Int32(chapter))
        sqlite3_bind_int(statement, 3, Int32(verse))

        guard sqlite3_step(statement) == SQLITE_ROW else { return nil }
        let url = string(from: sqlite3_column_text(statement, 0))
        let duration = sqlite3_column_type(statement, 1) == SQLITE_NULL ? nil : Int(sqlite3_column_int(statement, 1))
        return .init(reciterID: reciterID, chapter: chapter, verse: verse, url: url, durationMS: duration)
    }

    func installPack(
        pack: QuranDownloadPack,
        chapters: [QuranChapter],
        verses: [QuranVerse],
        translations: [QuranTranslationLine],
        tafsir: [QuranTafsirLine],
        audioAyahs: [QuranAudioAyah],
        layoutWords: [QuranLayoutWord],
        mushafPageLines: [QuranMushafPageLine],
        mushafScriptWords: [QuranMushafScriptWord],
        sourceURL: String
    ) throws {
        try openIfNeeded()
        try beginTransaction()
        do {
            for chapter in chapters {
                try upsert(chapter: chapter)
            }

            for verse in verses {
                try upsert(verse: verse)
            }

            for translation in translations {
                try upsert(translation: translation)
            }

            for tafsirLine in tafsir {
                try upsert(tafsir: tafsirLine)
            }

            for audio in audioAyahs {
                try upsert(audioAyah: audio)
            }

            for word in layoutWords {
                try upsert(layoutWord: word)
            }

            for line in mushafPageLines {
                try upsert(mushafPageLine: line)
            }

            for word in mushafScriptWords {
                try upsert(mushafScriptWord: word)
            }

            try upsertInstalledPack(packID: pack.id, version: pack.version, sourceURL: sourceURL)
            try commitTransaction()
        } catch {
            try? rollbackTransaction()
            throw error
        }
    }

    private func openIfNeeded() throws {
        guard db == nil else { return }
        if sqlite3_open(dbURL.path, &db) != SQLITE_OK {
            throw QuranStoreError.sqliteOpenFailed
        }
        try execute("PRAGMA journal_mode = WAL;")
        try execute("PRAGMA foreign_keys = ON;")
    }

    private func createSchemaIfNeeded() throws {
        try execute("""
        CREATE TABLE IF NOT EXISTS chapters (
            number INTEGER PRIMARY KEY,
            name_ar TEXT NOT NULL,
            name_en TEXT NOT NULL,
            revelation TEXT NOT NULL,
            verse_count INTEGER NOT NULL DEFAULT 0
        );
        """)

        try execute("""
        CREATE TABLE IF NOT EXISTS verses (
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            text_uthmani TEXT NOT NULL,
            PRIMARY KEY (chapter, verse)
        );
        """)

        try execute("""
        CREATE TABLE IF NOT EXISTS translations (
            resource_id TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            text TEXT NOT NULL,
            PRIMARY KEY (resource_id, chapter, verse)
        );
        """)

        try execute("""
        CREATE TABLE IF NOT EXISTS installed_packs (
            pack_id TEXT PRIMARY KEY,
            version TEXT NOT NULL,
            installed_at TEXT NOT NULL,
            source_url TEXT NOT NULL
        );
        """)

        try execute("""
        CREATE TABLE IF NOT EXISTS tafsir (
            resource_id TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            text TEXT NOT NULL,
            PRIMARY KEY (resource_id, chapter, verse)
        );
        """)

        try execute("""
        CREATE TABLE IF NOT EXISTS audio_ayah (
            reciter_id TEXT NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            audio_url TEXT NOT NULL,
            duration_ms INTEGER,
            downloaded_path TEXT,
            PRIMARY KEY (reciter_id, chapter, verse)
        );
        """)

        try execute("""
        CREATE TABLE IF NOT EXISTS mushaf_layout_words (
            layout_id TEXT NOT NULL,
            page INTEGER NOT NULL,
            line_number INTEGER NOT NULL,
            position INTEGER NOT NULL,
            chapter INTEGER NOT NULL,
            verse INTEGER NOT NULL,
            word_index INTEGER NOT NULL,
            x REAL NOT NULL,
            y REAL NOT NULL,
            width REAL NOT NULL,
            height REAL NOT NULL,
            token TEXT,
            PRIMARY KEY (layout_id, page, line_number, position)
        );
        """)

        try execute("""
        CREATE TABLE IF NOT EXISTS mushaf_layout_pages (
            layout_id TEXT NOT NULL,
            page_number INTEGER NOT NULL,
            line_number INTEGER NOT NULL,
            line_type TEXT NOT NULL,
            is_centered INTEGER NOT NULL DEFAULT 0,
            first_word_id INTEGER,
            last_word_id INTEGER,
            surah_number INTEGER,
            PRIMARY KEY (layout_id, page_number, line_number)
        );
        """)

        try execute("""
        CREATE TABLE IF NOT EXISTS mushaf_script_words (
            layout_id TEXT NOT NULL,
            word_index INTEGER NOT NULL,
            word_key TEXT NOT NULL,
            surah INTEGER NOT NULL,
            ayah INTEGER NOT NULL,
            text TEXT NOT NULL,
            PRIMARY KEY (layout_id, word_index)
        );
        """)

        try execute("CREATE INDEX IF NOT EXISTS idx_verses_chapter ON verses(chapter);")
        try execute("CREATE INDEX IF NOT EXISTS idx_translations_lookup ON translations(resource_id, chapter, verse);")
        try execute("CREATE INDEX IF NOT EXISTS idx_tafsir_lookup ON tafsir(resource_id, chapter, verse);")
        try execute("CREATE INDEX IF NOT EXISTS idx_audio_lookup ON audio_ayah(reciter_id, chapter, verse);")
        try execute("CREATE INDEX IF NOT EXISTS idx_layout_lookup ON mushaf_layout_words(layout_id, chapter, verse);")
        try execute("CREATE INDEX IF NOT EXISTS idx_mushaf_pages_lookup ON mushaf_layout_pages(layout_id, page_number, line_number);")
        try execute("CREATE INDEX IF NOT EXISTS idx_mushaf_words_lookup ON mushaf_script_words(layout_id, word_index);")
    }

    private func seedIfNeeded() throws {
        let count = try scalarInt("SELECT COUNT(*) FROM chapters;")
        guard count == 0 else { return }

        try beginTransaction()
        do {
            for chapter in QuranBuiltInData.chapters {
                try upsert(chapter: chapter)
            }
            for verse in QuranBuiltInData.sampleVerses {
                try upsert(verse: verse)
            }
            for line in QuranBuiltInData.sampleEnglishTranslation {
                try upsert(translation: line)
            }
            try upsertInstalledPack(packID: "built-in-core", version: "1.0.0", sourceURL: "app-bundle")
            try commitTransaction()
        } catch {
            try? rollbackTransaction()
            throw error
        }
    }

    private func upsert(chapter: QuranChapter) throws {
        let sql = """
        INSERT INTO chapters (number, name_ar, name_en, revelation, verse_count)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(number) DO UPDATE SET
            name_ar = excluded.name_ar,
            name_en = excluded.name_en,
            revelation = excluded.revelation,
            verse_count = excluded.verse_count;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare chapter upsert")
        }
        defer { sqlite3_finalize(statement) }

        sqlite3_bind_int(statement, 1, Int32(chapter.number))
        bindText(statement, index: 2, value: chapter.nameArabic)
        bindText(statement, index: 3, value: chapter.nameEnglish)
        bindText(statement, index: 4, value: chapter.revelation)
        sqlite3_bind_int(statement, 5, Int32(chapter.verseCount))

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert chapter \(chapter.number)")
        }
    }

    private func upsert(verse: QuranVerse) throws {
        let sql = """
        INSERT INTO verses (chapter, verse, text_uthmani)
        VALUES (?, ?, ?)
        ON CONFLICT(chapter, verse) DO UPDATE SET
            text_uthmani = excluded.text_uthmani;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare verse upsert")
        }
        defer { sqlite3_finalize(statement) }

        sqlite3_bind_int(statement, 1, Int32(verse.chapter))
        sqlite3_bind_int(statement, 2, Int32(verse.verse))
        bindText(statement, index: 3, value: verse.textUthmani)

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert verse \(verse.id)")
        }
    }

    private func upsert(translation: QuranTranslationLine) throws {
        let sql = """
        INSERT INTO translations (resource_id, chapter, verse, text)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(resource_id, chapter, verse) DO UPDATE SET
            text = excluded.text;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare translation upsert")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: translation.resourceID)
        sqlite3_bind_int(statement, 2, Int32(translation.chapter))
        sqlite3_bind_int(statement, 3, Int32(translation.verse))
        bindText(statement, index: 4, value: translation.text)

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert translation \(translation.id)")
        }
    }

    private func upsertInstalledPack(packID: String, version: String, sourceURL: String) throws {
        let sql = """
        INSERT INTO installed_packs (pack_id, version, installed_at, source_url)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(pack_id) DO UPDATE SET
            version = excluded.version,
            installed_at = excluded.installed_at,
            source_url = excluded.source_url;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare installed pack upsert")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: packID)
        bindText(statement, index: 2, value: version)
        bindText(statement, index: 3, value: isoNow())
        bindText(statement, index: 4, value: sourceURL)

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert installed pack metadata")
        }
    }

    private func upsert(tafsir: QuranTafsirLine) throws {
        let sql = """
        INSERT INTO tafsir (resource_id, chapter, verse, text)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(resource_id, chapter, verse) DO UPDATE SET
            text = excluded.text;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare tafsir upsert")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: tafsir.resourceID)
        sqlite3_bind_int(statement, 2, Int32(tafsir.chapter))
        sqlite3_bind_int(statement, 3, Int32(tafsir.verse))
        bindText(statement, index: 4, value: tafsir.text)

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert tafsir \(tafsir.id)")
        }
    }

    private func upsert(audioAyah: QuranAudioAyah) throws {
        let sql = """
        INSERT INTO audio_ayah (reciter_id, chapter, verse, audio_url, duration_ms, downloaded_path)
        VALUES (?, ?, ?, ?, ?, NULL)
        ON CONFLICT(reciter_id, chapter, verse) DO UPDATE SET
            audio_url = excluded.audio_url,
            duration_ms = excluded.duration_ms;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare audio upsert")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: audioAyah.reciterID)
        sqlite3_bind_int(statement, 2, Int32(audioAyah.chapter))
        sqlite3_bind_int(statement, 3, Int32(audioAyah.verse))
        bindText(statement, index: 4, value: audioAyah.url)
        if let duration = audioAyah.durationMS {
            sqlite3_bind_int(statement, 5, Int32(duration))
        } else {
            sqlite3_bind_null(statement, 5)
        }

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert audio ayah \(audioAyah.id)")
        }
    }

    private func upsert(layoutWord: QuranLayoutWord) throws {
        let sql = """
        INSERT INTO mushaf_layout_words (
            layout_id, page, line_number, position, chapter, verse, word_index, x, y, width, height, token
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(layout_id, page, line_number, position) DO UPDATE SET
            chapter = excluded.chapter,
            verse = excluded.verse,
            word_index = excluded.word_index,
            x = excluded.x,
            y = excluded.y,
            width = excluded.width,
            height = excluded.height,
            token = excluded.token;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare mushaf layout upsert")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: layoutWord.layoutID)
        sqlite3_bind_int(statement, 2, Int32(layoutWord.page))
        sqlite3_bind_int(statement, 3, Int32(layoutWord.lineNumber))
        sqlite3_bind_int(statement, 4, Int32(layoutWord.position))
        sqlite3_bind_int(statement, 5, Int32(layoutWord.chapter))
        sqlite3_bind_int(statement, 6, Int32(layoutWord.verse))
        sqlite3_bind_int(statement, 7, Int32(layoutWord.wordIndex))
        sqlite3_bind_double(statement, 8, layoutWord.x)
        sqlite3_bind_double(statement, 9, layoutWord.y)
        sqlite3_bind_double(statement, 10, layoutWord.width)
        sqlite3_bind_double(statement, 11, layoutWord.height)

        if let token = layoutWord.token {
            bindText(statement, index: 12, value: token)
        } else {
            sqlite3_bind_null(statement, 12)
        }

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert layout word \(layoutWord.id)")
        }
    }

    private func upsert(mushafPageLine: QuranMushafPageLine) throws {
        let sql = """
        INSERT INTO mushaf_layout_pages (
            layout_id, page_number, line_number, line_type, is_centered, first_word_id, last_word_id, surah_number
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(layout_id, page_number, line_number) DO UPDATE SET
            line_type = excluded.line_type,
            is_centered = excluded.is_centered,
            first_word_id = excluded.first_word_id,
            last_word_id = excluded.last_word_id,
            surah_number = excluded.surah_number;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare mushaf line upsert")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: mushafPageLine.layoutID)
        sqlite3_bind_int(statement, 2, Int32(mushafPageLine.pageNumber))
        sqlite3_bind_int(statement, 3, Int32(mushafPageLine.lineNumber))
        bindText(statement, index: 4, value: mushafPageLine.lineType.rawValue)
        sqlite3_bind_int(statement, 5, mushafPageLine.isCentered ? 1 : 0)

        if let firstWordID = mushafPageLine.firstWordID {
            sqlite3_bind_int(statement, 6, Int32(firstWordID))
        } else {
            sqlite3_bind_null(statement, 6)
        }

        if let lastWordID = mushafPageLine.lastWordID {
            sqlite3_bind_int(statement, 7, Int32(lastWordID))
        } else {
            sqlite3_bind_null(statement, 7)
        }

        if let surahNumber = mushafPageLine.surahNumber {
            sqlite3_bind_int(statement, 8, Int32(surahNumber))
        } else {
            sqlite3_bind_null(statement, 8)
        }

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert mushaf layout line \(mushafPageLine.id)")
        }
    }

    private func upsert(mushafScriptWord: QuranMushafScriptWord) throws {
        let sql = """
        INSERT INTO mushaf_script_words (layout_id, word_index, word_key, surah, ayah, text)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(layout_id, word_index) DO UPDATE SET
            word_key = excluded.word_key,
            surah = excluded.surah,
            ayah = excluded.ayah,
            text = excluded.text;
        """

        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare mushaf word upsert")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: mushafScriptWord.layoutID)
        sqlite3_bind_int(statement, 2, Int32(mushafScriptWord.wordIndex))
        bindText(statement, index: 3, value: mushafScriptWord.wordKey)
        sqlite3_bind_int(statement, 4, Int32(mushafScriptWord.surah))
        sqlite3_bind_int(statement, 5, Int32(mushafScriptWord.ayah))
        bindText(statement, index: 6, value: mushafScriptWord.text)

        if sqlite3_step(statement) != SQLITE_DONE {
            throw sqliteError("Failed to upsert mushaf script word \(mushafScriptWord.id)")
        }
    }

    func defaultMushafLayoutID() throws -> String? {
        try openIfNeeded()
        let sql = """
        SELECT layout_id
        FROM mushaf_layout_pages
        GROUP BY layout_id
        ORDER BY COUNT(*) DESC
        LIMIT 1;
        """
        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare default layout query")
        }
        defer { sqlite3_finalize(statement) }

        guard sqlite3_step(statement) == SQLITE_ROW else { return nil }
        return stringOptional(from: sqlite3_column_text(statement, 0))
    }

    func fetchMushafPageLines(layoutID: String, pageNumber: Int) throws -> [QuranMushafPageLine] {
        try openIfNeeded()
        let sql = """
        SELECT layout_id, page_number, line_number, line_type, is_centered, first_word_id, last_word_id, surah_number
        FROM mushaf_layout_pages
        WHERE layout_id = ? AND page_number = ?
        ORDER BY line_number;
        """
        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare mushaf page lines query")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: layoutID)
        sqlite3_bind_int(statement, 2, Int32(pageNumber))

        var lines: [QuranMushafPageLine] = []
        while sqlite3_step(statement) == SQLITE_ROW {
            let rawLineType = string(from: sqlite3_column_text(statement, 3))
            guard let lineType = QuranMushafLineType(rawValue: rawLineType) else { continue }
            lines.append(
                .init(
                    layoutID: string(from: sqlite3_column_text(statement, 0)),
                    pageNumber: Int(sqlite3_column_int(statement, 1)),
                    lineNumber: Int(sqlite3_column_int(statement, 2)),
                    lineType: lineType,
                    isCentered: sqlite3_column_int(statement, 4) == 1,
                    firstWordID: sqlite3_column_type(statement, 5) == SQLITE_NULL ? nil : Int(sqlite3_column_int(statement, 5)),
                    lastWordID: sqlite3_column_type(statement, 6) == SQLITE_NULL ? nil : Int(sqlite3_column_int(statement, 6)),
                    surahNumber: sqlite3_column_type(statement, 7) == SQLITE_NULL ? nil : Int(sqlite3_column_int(statement, 7))
                )
            )
        }
        return lines
    }

    func fetchMushafWords(layoutID: String, from firstWordID: Int, to lastWordID: Int) throws -> [QuranMushafScriptWord] {
        try openIfNeeded()
        let sql = """
        SELECT layout_id, word_index, word_key, surah, ayah, text
        FROM mushaf_script_words
        WHERE layout_id = ? AND word_index BETWEEN ? AND ?
        ORDER BY word_index;
        """
        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare mushaf words query")
        }
        defer { sqlite3_finalize(statement) }

        bindText(statement, index: 1, value: layoutID)
        sqlite3_bind_int(statement, 2, Int32(firstWordID))
        sqlite3_bind_int(statement, 3, Int32(lastWordID))

        var words: [QuranMushafScriptWord] = []
        while sqlite3_step(statement) == SQLITE_ROW {
            words.append(
                .init(
                    layoutID: string(from: sqlite3_column_text(statement, 0)),
                    wordIndex: Int(sqlite3_column_int(statement, 1)),
                    wordKey: string(from: sqlite3_column_text(statement, 2)),
                    surah: Int(sqlite3_column_int(statement, 3)),
                    ayah: Int(sqlite3_column_int(statement, 4)),
                    text: string(from: sqlite3_column_text(statement, 5))
                )
            )
        }
        return words
    }

    func chapterArabicName(chapterNumber: Int) throws -> String? {
        try openIfNeeded()
        let sql = """
        SELECT name_ar
        FROM chapters
        WHERE number = ?
        LIMIT 1;
        """
        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare chapter name query")
        }
        defer { sqlite3_finalize(statement) }

        sqlite3_bind_int(statement, 1, Int32(chapterNumber))
        guard sqlite3_step(statement) == SQLITE_ROW else { return nil }
        return stringOptional(from: sqlite3_column_text(statement, 0))
    }

    func verseCount() throws -> Int {
        try openIfNeeded()
        return try scalarInt("SELECT COUNT(*) FROM verses;")
    }

    func mushafPageLineCount() throws -> Int {
        try openIfNeeded()
        return try scalarInt("SELECT COUNT(*) FROM mushaf_layout_pages;")
    }

    func mushafWordCount() throws -> Int {
        try openIfNeeded()
        return try scalarInt("SELECT COUNT(*) FROM mushaf_script_words;")
    }

    private func beginTransaction() throws {
        try execute("BEGIN TRANSACTION;")
    }

    private func commitTransaction() throws {
        try execute("COMMIT;")
    }

    private func rollbackTransaction() throws {
        try execute("ROLLBACK;")
    }

    private func execute(_ sql: String) throws {
        guard sqlite3_exec(db, sql, nil, nil, nil) == SQLITE_OK else {
            throw sqliteError("SQLite execute failed for SQL: \(sql)")
        }
    }

    private func scalarInt(_ sql: String) throws -> Int {
        var statement: OpaquePointer?
        guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
            throw sqliteError("Could not prepare scalar SQL")
        }
        defer { sqlite3_finalize(statement) }

        guard sqlite3_step(statement) == SQLITE_ROW else {
            return 0
        }
        return Int(sqlite3_column_int(statement, 0))
    }

    private func string(from pointer: UnsafePointer<UInt8>?) -> String {
        guard let pointer else { return "" }
        return String(cString: pointer)
    }

    private func stringOptional(from pointer: UnsafePointer<UInt8>?) -> String? {
        guard let pointer else { return nil }
        return String(cString: pointer)
    }

    private func sqliteError(_ fallback: String) -> QuranStoreError {
        if let db, let message = sqlite3_errmsg(db) {
            return .sqliteError("\(fallback): \(String(cString: message))")
        }
        return .sqliteError(fallback)
    }

    private func bindText(_ statement: OpaquePointer?, index: Int32, value: String) {
        let cString = (value as NSString).utf8String
        sqlite3_bind_text(statement, index, cString, -1, SQLITE_TRANSIENT)
    }

    private func isoNow() -> String {
        ISO8601DateFormatter().string(from: Date())
    }
}

nonisolated(unsafe) private let SQLITE_TRANSIENT = unsafeBitCast(-1, to: sqlite3_destructor_type.self)
