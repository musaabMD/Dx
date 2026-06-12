import Foundation

enum QuranBundledPack {
    static func ensureManifestInSupport(fileManager: FileManager = .default) throws -> URL {
        guard let resourceRoot = Bundle.main.resourceURL else {
            throw QuranStoreError.malformedJSON("Could not access app resources.")
        }

        let bundledRoot = resourceRoot.appendingPathComponent("QuranPackSamples", isDirectory: true)
        guard fileManager.fileExists(atPath: bundledRoot.path) else {
            throw QuranStoreError.malformedJSON("Bundled QuranPackSamples folder is missing.")
        }

        let support = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        let destinationRoot = support.appendingPathComponent("QuranLibrary/BundledPack", isDirectory: true)

        if fileManager.fileExists(atPath: destinationRoot.path) {
            try fileManager.removeItem(at: destinationRoot)
        }
        try fileManager.createDirectory(at: destinationRoot, withIntermediateDirectories: true)

        guard let enumerator = fileManager.enumerator(at: bundledRoot, includingPropertiesForKeys: [.isDirectoryKey]) else {
            throw QuranStoreError.malformedJSON("Could not enumerate bundled Quran pack files.")
        }

        for case let sourceURL as URL in enumerator {
            let relative = sourceURL.path.replacingOccurrences(of: bundledRoot.path + "/", with: "")
            let destinationURL = destinationRoot.appendingPathComponent(relative)
            let values = try sourceURL.resourceValues(forKeys: [.isDirectoryKey])
            if values.isDirectory == true {
                try fileManager.createDirectory(at: destinationURL, withIntermediateDirectories: true)
            } else {
                try fileManager.copyItem(at: sourceURL, to: destinationURL)
            }
        }

        let manifestURL = destinationRoot.appendingPathComponent("manifest.json")
        guard fileManager.fileExists(atPath: manifestURL.path) else {
            throw QuranStoreError.malformedJSON("Bundled manifest.json was not found.")
        }
        return manifestURL
    }
}

actor QuranAutoInstaller {
    private let installer = QuranPackInstaller()
    private let remoteBuilder = QuranRemoteFullPackBuilder()

    func ensureMainPackInstalled(store: QuranSQLiteStore = .shared) async throws {
        try await store.bootstrap()

        let verseCount = try await store.verseCount()
        let pageLineCount = try await store.mushafPageLineCount()
        let wordCount = try await store.mushafWordCount()

        // Full pack thresholds for this app's expected Mushaf/text completeness.
        if verseCount >= 6200, pageLineCount >= 8500, wordCount >= 83000 {
            return
        }

        do {
            let manifestURL = try QuranBundledPack.ensureManifestInSupport()
            let manifest = try await installer.fetchManifest(url: manifestURL)
            guard let pack = manifest.packs.first else {
                throw QuranStoreError.malformedJSON("Bundled manifest has no packs.")
            }
            try await installer.installPack(manifestURL: manifestURL, pack: pack, store: store)
            return
        } catch {
            // Fallback: generate and install a complete pack from public APIs.
            try await remoteBuilder.installIntoStore(store: store)
        }
    }
}

private actor QuranRemoteFullPackBuilder {
    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func installIntoStore(store: QuranSQLiteStore) async throws {
        let chapters = try await fetchChapters()
        let generated = try await fetchFullQuranData()

        let generatedPack = QuranDownloadPack(
            id: "qul-core-full-generated",
            title: "QUL Core Full Generated",
            description: "Generated from Quran API when bundled pack is unavailable",
            version: "1.0.0",
            baseURL: "https://api.quran.com/",
            chaptersFile: nil,
            versesFile: "generated",
            translationFiles: [],
            tafsirFiles: [],
            audioFiles: [],
            layoutFile: nil,
            mushafLayoutFile: nil,
            mushafScriptFile: nil,
            mushafLayoutSQLiteFile: nil,
            mushafScriptSQLiteFile: nil
        )

        try await store.installPack(
            pack: generatedPack,
            chapters: chapters,
            verses: generated.verses,
            translations: [],
            tafsir: [],
            audioAyahs: [],
            layoutWords: [],
            mushafPageLines: generated.pageLines,
            mushafScriptWords: generated.scriptWords,
            sourceURL: "https://api.quran.com/api/v4/"
        )
    }

    private func fetchChapters() async throws -> [QuranChapter] {
        let url = URL(string: "https://api.quran.com/api/v4/chapters?language=en")!
        let payload: ChaptersResponse = try await fetchJSON(url: url)
        return payload.chapters.map {
            QuranChapter(
                number: $0.id,
                nameArabic: $0.nameArabic,
                nameEnglish: $0.nameSimple,
                revelation: $0.revelationPlace == "madinah" ? "medinan" : "meccan",
                verseCount: $0.versesCount
            )
        }
    }

    private func fetchFullQuranData() async throws -> GeneratedQuranData {
        var wordsByID: [Int: QuranMushafScriptWord] = [:]
        var lineBuckets: [LineKey: [Int]] = [:]
        var firstAyahLineForSurah: [Int: LineKey] = [:]
        var verseTokens: [String: [(Int, String, String)]] = [:]

        for page in 1...604 {
            let url = buildPageURL(page: page)
            let payload: PageResponse = try await fetchJSON(url: url)

            for verse in payload.verses {
                let parts = verse.verseKey.split(separator: ":")
                guard parts.count == 2,
                      let surah = Int(parts[0]),
                      let ayah = Int(parts[1]) else { continue }

                for word in verse.words {
                    let key = LineKey(page: word.pageNumber, line: word.lineNumber)
                    lineBuckets[key, default: []].append(word.id)

                    if ayah == 1, firstAyahLineForSurah[surah] == nil {
                        firstAyahLineForSurah[surah] = key
                    }

                    wordsByID[word.id] = QuranMushafScriptWord(
                        layoutID: "kfgqpc-v2-full",
                        wordIndex: word.id,
                        wordKey: verse.verseKey,
                        surah: surah,
                        ayah: ayah,
                        text: word.textUthmani
                    )

                    verseTokens[verse.verseKey, default: []].append((word.position, word.textUthmani, word.charTypeName))
                }
            }
        }

        let scriptWords = wordsByID.keys.sorted().compactMap { wordsByID[$0] }

        var verses: [QuranVerse] = []
        for (key, tokens) in verseTokens {
            let parts = key.split(separator: ":")
            guard parts.count == 2,
                  let surah = Int(parts[0]),
                  let ayah = Int(parts[1]) else { continue }
            let text = tokens
                .sorted { $0.0 < $1.0 }
                .filter { $0.2 != "end" }
                .map { $0.1 }
                .joined(separator: " ")
            verses.append(QuranVerse(chapter: surah, verse: ayah, textUthmani: text))
        }
        verses.sort { lhs, rhs in
            lhs.chapter == rhs.chapter ? lhs.verse < rhs.verse : lhs.chapter < rhs.chapter
        }

        var pageLines: [QuranMushafPageLine] = lineBuckets.keys.sorted().map { key in
            let ids = (lineBuckets[key] ?? []).sorted()
            return QuranMushafPageLine(
                layoutID: "kfgqpc-v2-full",
                pageNumber: key.page,
                lineNumber: key.line,
                lineType: .ayah,
                isCentered: false,
                firstWordID: ids.first,
                lastWordID: ids.last,
                surahNumber: nil
            )
        }

        let occupied = Set(pageLines.map { "\($0.pageNumber):\($0.lineNumber)" })
        for (surah, key) in firstAyahLineForSurah.sorted(by: { $0.key < $1.key }) {
            let candidate = max(1, key.line - 1)
            let slot = "\(key.page):\(candidate)"
            if occupied.contains(slot) {
                continue
            }
            pageLines.append(
                QuranMushafPageLine(
                    layoutID: "kfgqpc-v2-full",
                    pageNumber: key.page,
                    lineNumber: candidate,
                    lineType: .surahName,
                    isCentered: true,
                    firstWordID: nil,
                    lastWordID: nil,
                    surahNumber: surah
                )
            )
        }

        pageLines.sort { lhs, rhs in
            lhs.pageNumber == rhs.pageNumber ? lhs.lineNumber < rhs.lineNumber : lhs.pageNumber < rhs.pageNumber
        }

        return GeneratedQuranData(verses: verses, scriptWords: scriptWords, pageLines: pageLines)
    }

    private func buildPageURL(page: Int) -> URL {
        var components = URLComponents(string: "https://api.quran.com/api/v4/verses/by_page/\(page)")!
        components.queryItems = [
            .init(name: "language", value: "ar"),
            .init(name: "words", value: "true"),
            .init(name: "word_fields", value: "text_uthmani,position,verse_key,line_number,page_number,char_type_name"),
            .init(name: "per_page", value: "50")
        ]
        return components.url!
    }

    private func fetchJSON<T: Decodable>(url: URL) async throws -> T {
        var request = URLRequest(url: url)
        request.timeoutInterval = 45
        request.setValue("application/json", forHTTPHeaderField: "Accept")

        let (data, response) = try await session.data(for: request)
        guard let http = response as? HTTPURLResponse, (200...299).contains(http.statusCode) else {
            throw QuranStoreError.malformedJSON("Failed request: \(url.absoluteString)")
        }
        return try JSONDecoder().decode(T.self, from: data)
    }
}

private struct GeneratedQuranData {
    let verses: [QuranVerse]
    let scriptWords: [QuranMushafScriptWord]
    let pageLines: [QuranMushafPageLine]
}

private struct LineKey: Hashable, Comparable {
    let page: Int
    let line: Int

    static func < (lhs: LineKey, rhs: LineKey) -> Bool {
        lhs.page == rhs.page ? lhs.line < rhs.line : lhs.page < rhs.page
    }
}

private struct ChaptersResponse: Decodable {
    let chapters: [ChapterRecord]
}

private struct ChapterRecord: Decodable {
    let id: Int
    let nameArabic: String
    let nameSimple: String
    let revelationPlace: String
    let versesCount: Int

    enum CodingKeys: String, CodingKey {
        case id
        case nameArabic = "name_arabic"
        case nameSimple = "name_simple"
        case revelationPlace = "revelation_place"
        case versesCount = "verses_count"
    }
}

private struct PageResponse: Decodable {
    let verses: [PageVerse]
}

private struct PageVerse: Decodable {
    let verseKey: String
    let words: [PageWord]

    enum CodingKeys: String, CodingKey {
        case verseKey = "verse_key"
        case words
    }
}

private struct PageWord: Decodable {
    let id: Int
    let position: Int
    let lineNumber: Int
    let pageNumber: Int
    let charTypeName: String
    let textUthmani: String

    enum CodingKeys: String, CodingKey {
        case id
        case position
        case lineNumber = "line_number"
        case pageNumber = "page_number"
        case charTypeName = "char_type_name"
        case textUthmani = "text_uthmani"
    }
}
