import Foundation
import SQLite3

actor QuranPackInstaller {
    private let decoder = JSONDecoder()

    func fetchManifest(url: URL) async throws -> QuranRemoteManifest {
        let data = try await loadData(from: url)
        if let text = String(data: data, encoding: .utf8), looksLikeHTML(text) {
            if isQULResourcePage(url: url) {
                throw QuranStoreError.malformedJSON(
                    "This QUL link is a webpage (not manifest JSON) and download requires QUL sign-in. Use a real manifest.json URL, the local sample button, or provide local SQLite files via your own manifest."
                )
            }
            throw QuranStoreError.malformedJSON("The URL returned HTML, not manifest JSON.")
        }
        let dto = try decoder.decode(RemoteManifestDTO.self, from: data)

        let packs = dto.packs.map { pack in
            QuranDownloadPack(
                id: pack.id,
                title: pack.title,
                description: pack.description,
                version: pack.version,
                baseURL: pack.baseURL,
                chaptersFile: pack.chaptersFile,
                versesFile: pack.versesFile,
                translationFiles: pack.translationFiles.map {
                    .init(resourceID: $0.resourceID, language: $0.language, file: $0.file, title: $0.title)
                },
                tafsirFiles: pack.tafsirFiles.map {
                    .init(resourceID: $0.resourceID, language: $0.language, file: $0.file, title: $0.title)
                },
                audioFiles: pack.audioFiles.map {
                    .init(reciterID: $0.reciterID, title: $0.title, file: $0.file, baseAudioURL: $0.baseAudioURL)
                },
                layoutFile: pack.layoutFile.map {
                    .init(layoutID: $0.layoutID, title: $0.title, file: $0.file)
                },
                mushafLayoutFile: pack.mushafLayoutFile.map {
                    .init(layoutID: $0.layoutID, title: $0.title, file: $0.file)
                },
                mushafScriptFile: pack.mushafScriptFile.map {
                    .init(layoutID: $0.layoutID, title: $0.title, file: $0.file)
                },
                mushafLayoutSQLiteFile: pack.mushafLayoutSQLiteFile.map {
                    .init(layoutID: $0.layoutID, title: $0.title, file: $0.file)
                },
                mushafScriptSQLiteFile: pack.mushafScriptSQLiteFile.map {
                    .init(layoutID: $0.layoutID, title: $0.title, file: $0.file)
                }
            )
        }

        return .init(generatedAt: dto.generatedAt, packs: packs)
    }

    private func looksLikeHTML(_ text: String) -> Bool {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        return trimmed.hasPrefix("<!doctype html") || trimmed.hasPrefix("<html")
    }

    private func isQULResourcePage(url: URL) -> Bool {
        guard let host = url.host?.lowercased() else { return false }
        return host.contains("qul.tarteel.ai") && url.path.contains("/resources/")
    }

    func installPack(
        manifestURL: URL,
        pack: QuranDownloadPack,
        store: QuranSQLiteStore
    ) async throws {
        let baseURL = URL(string: pack.baseURL, relativeTo: manifestURL)?.absoluteURL
        guard let baseURL else {
            throw QuranStoreError.malformedJSON("Invalid base_url in manifest for pack \(pack.id)")
        }

        let chapters = try await downloadChapters(fileName: pack.chaptersFile, baseURL: baseURL)
        let verses = try await downloadVerses(fileName: pack.versesFile, baseURL: baseURL)

        var translations: [QuranTranslationLine] = []
        for file in pack.translationFiles {
            let lines = try await downloadTranslations(file: file, baseURL: baseURL)
            translations.append(contentsOf: lines)
        }

        var tafsirLines: [QuranTafsirLine] = []
        for file in pack.tafsirFiles {
            let lines = try await downloadTafsir(file: file, baseURL: baseURL)
            tafsirLines.append(contentsOf: lines)
        }

        var audioLines: [QuranAudioAyah] = []
        for file in pack.audioFiles {
            let lines = try await downloadAudioManifest(file: file, baseURL: baseURL)
            audioLines.append(contentsOf: lines)
        }

        var layoutWords: [QuranLayoutWord] = []
        if let layoutFile = pack.layoutFile {
            layoutWords = try await downloadLayout(file: layoutFile, baseURL: baseURL)
        }

        var mushafPageLines: [QuranMushafPageLine] = []
        if let mushafLayoutFile = pack.mushafLayoutFile {
            mushafPageLines = try await downloadMushafPages(file: mushafLayoutFile, baseURL: baseURL)
        }

        var mushafScriptWords: [QuranMushafScriptWord] = []
        if let mushafScriptFile = pack.mushafScriptFile {
            mushafScriptWords = try await downloadMushafWords(file: mushafScriptFile, baseURL: baseURL)
        }

        if mushafPageLines.isEmpty, let sqliteLayout = pack.mushafLayoutSQLiteFile {
            mushafPageLines = try await downloadMushafPagesSQLite(file: sqliteLayout, baseURL: baseURL)
        }

        if mushafScriptWords.isEmpty, let sqliteScript = pack.mushafScriptSQLiteFile {
            mushafScriptWords = try await downloadMushafWordsSQLite(file: sqliteScript, baseURL: baseURL)
        }

        try await store.installPack(
            pack: pack,
            chapters: chapters,
            verses: verses,
            translations: translations,
            tafsir: tafsirLines,
            audioAyahs: audioLines,
            layoutWords: layoutWords,
            mushafPageLines: mushafPageLines,
            mushafScriptWords: mushafScriptWords,
            sourceURL: baseURL.absoluteString
        )
    }

    private func downloadChapters(fileName: String?, baseURL: URL) async throws -> [QuranChapter] {
        guard let fileName, !fileName.isEmpty else {
            return []
        }
        let data = try await loadData(from: baseURL.appendingPathComponent(fileName))
        let records = try decoder.decode([RemoteChapterRecord].self, from: data)
        return records.map {
            .init(
                number: $0.number,
                nameArabic: $0.nameArabic,
                nameEnglish: $0.nameEnglish,
                revelation: $0.revelation,
                verseCount: $0.verseCount
            )
        }
    }

    private func downloadVerses(fileName: String, baseURL: URL) async throws -> [QuranVerse] {
        let data = try await loadData(from: baseURL.appendingPathComponent(fileName))
        let records = try decoder.decode([RemoteVerseRecord].self, from: data)
        return try records.map {
            guard let chapter = $0.chapter, let verse = $0.verse else {
                throw QuranStoreError.malformedJSON("Verse record missing chapter/verse key")
            }
            return .init(chapter: chapter, verse: verse, textUthmani: $0.textUthmani)
        }
    }

    private func downloadTranslations(file: QuranTranslationFile, baseURL: URL) async throws -> [QuranTranslationLine] {
        let data = try await loadData(from: baseURL.appendingPathComponent(file.file))
        let records = try decoder.decode([RemoteTranslationRecord].self, from: data)
        return try records.map {
            guard let chapter = $0.chapter, let verse = $0.verse else {
                throw QuranStoreError.malformedJSON("Translation record missing chapter/verse key")
            }
            return .init(resourceID: file.resourceID, chapter: chapter, verse: verse, text: $0.text)
        }
    }

    private func downloadTafsir(file: QuranTafsirFile, baseURL: URL) async throws -> [QuranTafsirLine] {
        let data = try await loadData(from: baseURL.appendingPathComponent(file.file))
        let records = try decoder.decode([RemoteTafsirRecord].self, from: data)
        return try records.map {
            guard let chapter = $0.chapter, let verse = $0.verse else {
                throw QuranStoreError.malformedJSON("Tafsir record missing chapter/verse key")
            }
            return .init(resourceID: file.resourceID, chapter: chapter, verse: verse, text: $0.text)
        }
    }

    private func downloadAudioManifest(file: QuranAudioFile, baseURL: URL) async throws -> [QuranAudioAyah] {
        let data = try await loadData(from: baseURL.appendingPathComponent(file.file))
        let records = try decoder.decode([RemoteAudioRecord].self, from: data)
        let audioBase = URL(string: file.baseAudioURL, relativeTo: baseURL)?.absoluteURL

        return try records.map {
            guard let chapter = $0.chapter, let verse = $0.verse else {
                throw QuranStoreError.malformedJSON("Audio record missing chapter/verse key")
            }
            let resolvedURL = resolveAudioURL(audioBase: audioBase, absoluteURL: $0.url, relativePath: $0.path)
            return .init(reciterID: file.reciterID, chapter: chapter, verse: verse, url: resolvedURL, durationMS: $0.durationMS)
        }
    }

    private func downloadLayout(file: QuranLayoutFile, baseURL: URL) async throws -> [QuranLayoutWord] {
        let data = try await loadData(from: baseURL.appendingPathComponent(file.file))
        let records = try decoder.decode([RemoteLayoutRecord].self, from: data)
        return try records.map {
            guard let chapter = $0.chapter, let verse = $0.verse else {
                throw QuranStoreError.malformedJSON("Layout record missing chapter/verse key")
            }
            return .init(
                layoutID: file.layoutID,
                page: $0.page,
                lineNumber: $0.lineNumber,
                position: $0.position,
                chapter: chapter,
                verse: verse,
                wordIndex: $0.wordIndex,
                x: $0.x,
                y: $0.y,
                width: $0.width,
                height: $0.height,
                token: $0.token
            )
        }
    }

    private func downloadMushafPages(file: QuranMushafLayoutFile, baseURL: URL) async throws -> [QuranMushafPageLine] {
        let data = try await loadData(from: baseURL.appendingPathComponent(file.file))
        let records = try decoder.decode([RemoteMushafPageRecord].self, from: data)
        return records.map { record in
            .init(
                layoutID: file.layoutID,
                pageNumber: record.pageNumber,
                lineNumber: record.lineNumber,
                lineType: record.lineType,
                isCentered: record.isCentered,
                firstWordID: record.firstWordID,
                lastWordID: record.lastWordID,
                surahNumber: record.surahNumber
            )
        }
    }

    private func downloadMushafWords(file: QuranMushafScriptFile, baseURL: URL) async throws -> [QuranMushafScriptWord] {
        let data = try await loadData(from: baseURL.appendingPathComponent(file.file))
        let records = try decoder.decode([RemoteMushafWordRecord].self, from: data)
        return records.map { record in
            .init(
                layoutID: file.layoutID,
                wordIndex: record.wordIndex,
                wordKey: record.wordKey,
                surah: record.surah,
                ayah: record.ayah,
                text: record.text
            )
        }
    }

    private func downloadMushafPagesSQLite(file: QuranMushafSQLiteFile, baseURL: URL) async throws -> [QuranMushafPageLine] {
        let data = try await loadData(from: baseURL.appendingPathComponent(file.file))
        return try withTemporarySQLite(data: data, suffix: "mushaf-layout.sqlite") { db in
            let sql = """
            SELECT page_number, line_number, line_type, is_centered, first_word_id, last_word_id, surah_number
            FROM pages
            ORDER BY page_number, line_number;
            """
            var statement: OpaquePointer?
            guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
                throw QuranStoreError.sqliteError("Could not query pages from mushaf layout SQLite")
            }
            defer { sqlite3_finalize(statement) }

            var rows: [QuranMushafPageLine] = []
            while sqlite3_step(statement) == SQLITE_ROW {
                let rawType = sqliteString(sqlite3_column_text(statement, 2)).lowercased()
                let lineType: QuranMushafLineType
                switch rawType {
                case "ayah":
                    lineType = .ayah
                case "basmallah":
                    lineType = .basmallah
                case "surah_name", "surahname":
                    lineType = .surahName
                default:
                    continue
                }

                rows.append(
                    .init(
                        layoutID: file.layoutID,
                        pageNumber: Int(sqlite3_column_int(statement, 0)),
                        lineNumber: Int(sqlite3_column_int(statement, 1)),
                        lineType: lineType,
                        isCentered: sqlite3_column_int(statement, 3) == 1,
                        firstWordID: sqlite3_column_type(statement, 4) == SQLITE_NULL ? nil : Int(sqlite3_column_int(statement, 4)),
                        lastWordID: sqlite3_column_type(statement, 5) == SQLITE_NULL ? nil : Int(sqlite3_column_int(statement, 5)),
                        surahNumber: sqlite3_column_type(statement, 6) == SQLITE_NULL ? nil : Int(sqlite3_column_int(statement, 6))
                    )
                )
            }
            return rows
        }
    }

    private func downloadMushafWordsSQLite(file: QuranMushafSQLiteFile, baseURL: URL) async throws -> [QuranMushafScriptWord] {
        let data = try await loadData(from: baseURL.appendingPathComponent(file.file))
        return try withTemporarySQLite(data: data, suffix: "mushaf-script.sqlite") { db in
            let sql = """
            SELECT word_index, word_key, surah, ayah, text
            FROM words
            ORDER BY word_index;
            """
            var statement: OpaquePointer?
            guard sqlite3_prepare_v2(db, sql, -1, &statement, nil) == SQLITE_OK else {
                throw QuranStoreError.sqliteError("Could not query words from mushaf script SQLite")
            }
            defer { sqlite3_finalize(statement) }

            var rows: [QuranMushafScriptWord] = []
            while sqlite3_step(statement) == SQLITE_ROW {
                rows.append(
                    .init(
                        layoutID: file.layoutID,
                        wordIndex: Int(sqlite3_column_int(statement, 0)),
                        wordKey: sqliteString(sqlite3_column_text(statement, 1)),
                        surah: Int(sqlite3_column_int(statement, 2)),
                        ayah: Int(sqlite3_column_int(statement, 3)),
                        text: sqliteString(sqlite3_column_text(statement, 4))
                    )
                )
            }
            return rows
        }
    }

    private func withTemporarySQLite<T>(data: Data, suffix: String, work: (OpaquePointer?) throws -> T) throws -> T {
        let tempDir = FileManager.default.temporaryDirectory
        let fileURL = tempDir.appendingPathComponent("\(UUID().uuidString)-\(suffix)")
        try data.write(to: fileURL, options: .atomic)
        defer { try? FileManager.default.removeItem(at: fileURL) }

        var db: OpaquePointer?
        guard sqlite3_open_v2(fileURL.path, &db, SQLITE_OPEN_READONLY, nil) == SQLITE_OK else {
            if let db, let message = sqlite3_errmsg(db) {
                let error = QuranStoreError.sqliteError("Could not open temporary SQLite: \(String(cString: message))")
                sqlite3_close(db)
                throw error
            }
            throw QuranStoreError.sqliteError("Could not open temporary SQLite")
        }
        defer { sqlite3_close(db) }
        return try work(db)
    }

    private func sqliteString(_ pointer: UnsafePointer<UInt8>?) -> String {
        guard let pointer else { return "" }
        return String(cString: pointer)
    }

    private func resolveAudioURL(audioBase: URL?, absoluteURL: String?, relativePath: String?) -> String {
        if let absoluteURL, !absoluteURL.isEmpty {
            return absoluteURL
        }
        if let relativePath, let audioBase {
            return audioBase.appendingPathComponent(relativePath).absoluteString
        }
        return ""
    }

    private func loadData(from url: URL) async throws -> Data {
        if url.isFileURL {
            return try Data(contentsOf: url)
        }

        let (data, response) = try await URLSession.shared.data(from: url)
        try validateHTTPResponse(response)
        return data
    }

    private func validateHTTPResponse(_ response: URLResponse) throws {
        guard let http = response as? HTTPURLResponse,
              (200...299).contains(http.statusCode) else {
            throw QuranStoreError.sqliteError("Network request failed while downloading Quran resources")
        }
    }
}

private nonisolated struct RemoteManifestDTO: Decodable {
    let generatedAt: String
    let packs: [RemotePackDTO]

    enum CodingKeys: String, CodingKey {
        case generatedAt = "generated_at"
        case packs
    }
}

private nonisolated struct RemotePackDTO: Decodable {
    let id: String
    let title: String
    let description: String
    let version: String
    let baseURL: String
    let chaptersFile: String?
    let versesFile: String
    let translationFiles: [RemoteTranslationFileDTO]
    let tafsirFiles: [RemoteTafsirFileDTO]
    let audioFiles: [RemoteAudioFileDTO]
    let layoutFile: RemoteLayoutFileDTO?
    let mushafLayoutFile: RemoteMushafLayoutFileDTO?
    let mushafScriptFile: RemoteMushafScriptFileDTO?
    let mushafLayoutSQLiteFile: RemoteMushafSQLiteFileDTO?
    let mushafScriptSQLiteFile: RemoteMushafSQLiteFileDTO?

    enum CodingKeys: String, CodingKey {
        case id
        case title
        case description
        case version
        case baseURL = "base_url"
        case chaptersFile = "chapters_file"
        case versesFile = "verses_file"
        case translationFiles = "translation_files"
        case tafsirFiles = "tafsir_files"
        case audioFiles = "audio_files"
        case layoutFile = "layout_file"
        case mushafLayoutFile = "mushaf_layout_file"
        case mushafScriptFile = "mushaf_script_file"
        case mushafLayoutSQLiteFile = "mushaf_layout_sqlite_file"
        case mushafScriptSQLiteFile = "mushaf_script_sqlite_file"
    }
}

private nonisolated struct RemoteTranslationFileDTO: Decodable {
    let resourceID: String
    let language: String
    let file: String
    let title: String

    enum CodingKeys: String, CodingKey {
        case resourceID = "resource_id"
        case language
        case file
        case title
    }
}

private nonisolated struct RemoteTafsirFileDTO: Decodable {
    let resourceID: String
    let language: String
    let file: String
    let title: String

    enum CodingKeys: String, CodingKey {
        case resourceID = "resource_id"
        case language
        case file
        case title
    }
}

private nonisolated struct RemoteAudioFileDTO: Decodable {
    let reciterID: String
    let title: String
    let file: String
    let baseAudioURL: String

    enum CodingKeys: String, CodingKey {
        case reciterID = "reciter_id"
        case title
        case file
        case baseAudioURL = "base_audio_url"
    }
}

private nonisolated struct RemoteLayoutFileDTO: Decodable {
    let layoutID: String
    let title: String
    let file: String

    enum CodingKeys: String, CodingKey {
        case layoutID = "layout_id"
        case title
        case file
    }
}

private nonisolated struct RemoteMushafLayoutFileDTO: Decodable {
    let layoutID: String
    let title: String
    let file: String

    enum CodingKeys: String, CodingKey {
        case layoutID = "layout_id"
        case title
        case file
    }
}

private nonisolated struct RemoteMushafScriptFileDTO: Decodable {
    let layoutID: String
    let title: String
    let file: String

    enum CodingKeys: String, CodingKey {
        case layoutID = "layout_id"
        case title
        case file
    }
}

private nonisolated struct RemoteMushafSQLiteFileDTO: Decodable {
    let layoutID: String
    let title: String
    let file: String

    enum CodingKeys: String, CodingKey {
        case layoutID = "layout_id"
        case title
        case file
    }
}

private nonisolated struct RemoteChapterRecord: Decodable {
    let number: Int
    let nameArabic: String
    let nameEnglish: String
    let revelation: String
    let verseCount: Int

    enum CodingKeys: String, CodingKey {
        case number
        case nameArabic = "name_ar"
        case nameEnglish = "name_en"
        case revelation
        case verseCount = "verse_count"
    }
}

private nonisolated struct RemoteVerseRecord: Decodable {
    let chapter: Int?
    let verse: Int?
    let textUthmani: String

    enum CodingKeys: String, CodingKey {
        case chapter
        case verse
        case verseKey = "verse_key"
        case textUthmani = "text_uthmani"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let chapter = try c.decodeIfPresent(Int.self, forKey: .chapter)
        let verse = try c.decodeIfPresent(Int.self, forKey: .verse)
        let verseKey = try c.decodeIfPresent(String.self, forKey: .verseKey)

        if let chapter, let verse {
            self.chapter = chapter
            self.verse = verse
        } else if let verseKey {
            let parts = verseKey.split(separator: ":")
            self.chapter = parts.indices.contains(0) ? Int(String(parts[0])) : nil
            self.verse = parts.indices.contains(1) ? Int(String(parts[1])) : nil
        } else {
            self.chapter = nil
            self.verse = nil
        }

        self.textUthmani = try c.decode(String.self, forKey: .textUthmani)
    }
}

private nonisolated struct RemoteTranslationRecord: Decodable {
    let chapter: Int?
    let verse: Int?
    let text: String

    enum CodingKeys: String, CodingKey {
        case chapter
        case verse
        case verseKey = "verse_key"
        case text
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let chapter = try c.decodeIfPresent(Int.self, forKey: .chapter)
        let verse = try c.decodeIfPresent(Int.self, forKey: .verse)
        let verseKey = try c.decodeIfPresent(String.self, forKey: .verseKey)

        if let chapter, let verse {
            self.chapter = chapter
            self.verse = verse
        } else if let verseKey {
            let parts = verseKey.split(separator: ":")
            self.chapter = parts.indices.contains(0) ? Int(String(parts[0])) : nil
            self.verse = parts.indices.contains(1) ? Int(String(parts[1])) : nil
        } else {
            self.chapter = nil
            self.verse = nil
        }

        self.text = try c.decode(String.self, forKey: .text)
    }
}

private nonisolated struct RemoteTafsirRecord: Decodable {
    let chapter: Int?
    let verse: Int?
    let text: String

    enum CodingKeys: String, CodingKey {
        case chapter
        case verse
        case verseKey = "verse_key"
        case text
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let chapter = try c.decodeIfPresent(Int.self, forKey: .chapter)
        let verse = try c.decodeIfPresent(Int.self, forKey: .verse)
        let verseKey = try c.decodeIfPresent(String.self, forKey: .verseKey)

        if let chapter, let verse {
            self.chapter = chapter
            self.verse = verse
        } else if let verseKey {
            let parts = verseKey.split(separator: ":")
            self.chapter = parts.indices.contains(0) ? Int(String(parts[0])) : nil
            self.verse = parts.indices.contains(1) ? Int(String(parts[1])) : nil
        } else {
            self.chapter = nil
            self.verse = nil
        }

        self.text = try c.decode(String.self, forKey: .text)
    }
}

private nonisolated struct RemoteAudioRecord: Decodable {
    let chapter: Int?
    let verse: Int?
    let url: String?
    let path: String?
    let durationMS: Int?

    enum CodingKeys: String, CodingKey {
        case chapter
        case verse
        case verseKey = "verse_key"
        case url
        case path
        case durationMS = "duration_ms"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        let chapter = try c.decodeIfPresent(Int.self, forKey: .chapter)
        let verse = try c.decodeIfPresent(Int.self, forKey: .verse)
        let verseKey = try c.decodeIfPresent(String.self, forKey: .verseKey)

        if let chapter, let verse {
            self.chapter = chapter
            self.verse = verse
        } else if let verseKey {
            let parts = verseKey.split(separator: ":")
            self.chapter = parts.indices.contains(0) ? Int(String(parts[0])) : nil
            self.verse = parts.indices.contains(1) ? Int(String(parts[1])) : nil
        } else {
            self.chapter = nil
            self.verse = nil
        }

        self.url = try c.decodeIfPresent(String.self, forKey: .url)
        self.path = try c.decodeIfPresent(String.self, forKey: .path)
        self.durationMS = try c.decodeIfPresent(Int.self, forKey: .durationMS)
    }
}

private nonisolated struct RemoteLayoutRecord: Decodable {
    let page: Int
    let lineNumber: Int
    let position: Int
    let chapter: Int?
    let verse: Int?
    let wordIndex: Int
    let x: Double
    let y: Double
    let width: Double
    let height: Double
    let token: String?

    enum CodingKeys: String, CodingKey {
        case page
        case lineNumber = "line_number"
        case position
        case chapter
        case verse
        case verseKey = "verse_key"
        case wordIndex = "word_index"
        case x
        case y
        case width
        case height
        case token
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        self.page = try c.decode(Int.self, forKey: .page)
        self.lineNumber = try c.decode(Int.self, forKey: .lineNumber)
        self.position = try c.decode(Int.self, forKey: .position)
        self.wordIndex = try c.decode(Int.self, forKey: .wordIndex)
        self.x = try c.decode(Double.self, forKey: .x)
        self.y = try c.decode(Double.self, forKey: .y)
        self.width = try c.decode(Double.self, forKey: .width)
        self.height = try c.decode(Double.self, forKey: .height)
        self.token = try c.decodeIfPresent(String.self, forKey: .token)

        let chapter = try c.decodeIfPresent(Int.self, forKey: .chapter)
        let verse = try c.decodeIfPresent(Int.self, forKey: .verse)
        let verseKey = try c.decodeIfPresent(String.self, forKey: .verseKey)

        if let chapter, let verse {
            self.chapter = chapter
            self.verse = verse
        } else if let verseKey {
            let parts = verseKey.split(separator: ":")
            self.chapter = parts.indices.contains(0) ? Int(String(parts[0])) : nil
            self.verse = parts.indices.contains(1) ? Int(String(parts[1])) : nil
        } else {
            self.chapter = nil
            self.verse = nil
        }
    }
}

private nonisolated struct RemoteMushafPageRecord: Decodable {
    let pageNumber: Int
    let lineNumber: Int
    let lineType: QuranMushafLineType
    let isCentered: Bool
    let firstWordID: Int?
    let lastWordID: Int?
    let surahNumber: Int?

    enum CodingKeys: String, CodingKey {
        case pageNumber = "page_number"
        case lineNumber = "line_number"
        case lineType = "line_type"
        case isCentered = "is_centered"
        case firstWordID = "first_word_id"
        case lastWordID = "last_word_id"
        case surahNumber = "surah_number"
    }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        self.pageNumber = try c.decode(Int.self, forKey: .pageNumber)
        self.lineNumber = try c.decode(Int.self, forKey: .lineNumber)
        self.firstWordID = try c.decodeIfPresent(Int.self, forKey: .firstWordID)
        self.lastWordID = try c.decodeIfPresent(Int.self, forKey: .lastWordID)
        self.surahNumber = try c.decodeIfPresent(Int.self, forKey: .surahNumber)

        let rawType = try c.decode(String.self, forKey: .lineType).lowercased()
        switch rawType {
        case "ayah":
            self.lineType = .ayah
        case "basmallah":
            self.lineType = .basmallah
        case "surah_name", "surahname":
            self.lineType = .surahName
        default:
            throw DecodingError.dataCorruptedError(forKey: .lineType, in: c, debugDescription: "Unsupported line_type: \(rawType)")
        }

        if let boolValue = try c.decodeIfPresent(Bool.self, forKey: .isCentered) {
            self.isCentered = boolValue
        } else if let intValue = try c.decodeIfPresent(Int.self, forKey: .isCentered) {
            self.isCentered = intValue == 1
        } else {
            self.isCentered = false
        }
    }
}

private nonisolated struct RemoteMushafWordRecord: Decodable {
    let wordIndex: Int
    let wordKey: String
    let surah: Int
    let ayah: Int
    let text: String

    enum CodingKeys: String, CodingKey {
        case wordIndex = "word_index"
        case wordKey = "word_key"
        case surah
        case ayah
        case text
    }
}
