import SwiftUI
import Combine
import AVFoundation

private enum QuranTheme {
    static let background = LinearGradient(
        colors: [Color(red: 0.97, green: 0.96, blue: 0.94), Color(red: 0.94, green: 0.92, blue: 0.89)],
        startPoint: .top,
        endPoint: .bottom
    )
    static let surface = Color(red: 0.99, green: 0.98, blue: 0.97)
    static let softSurface = Color(red: 0.92, green: 0.89, blue: 0.84)
    static let accent = Color(red: 0.07, green: 0.51, blue: 0.31)
}

struct QuranLibraryView: View {
    @StateObject private var viewModel = QuranLibraryViewModel()
    @AppStorage("app_language") private var appLanguageRaw = "ar"
    @AppStorage("quran_manifest_url") private var manifestURLString = ""
    @AppStorage("quran_translation_resource") private var selectedTranslationResource = "en.sahih"
    @AppStorage("quran_tafsir_resource") private var selectedTafsirResource = "en.tafsir.sample"
    @AppStorage("quran_reciter_id") private var selectedReciterID = "ar.alafasy.sample"

    @State private var showingSyncSheet = false
    @State private var query = ""

    private var lang: QLanguage {
        appLanguageRaw == "ar" ? .ar : .en
    }

    private var filteredChapters: [QuranChapter] {
        let needle = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !needle.isEmpty else { return viewModel.chapters }
        return viewModel.chapters.filter {
            $0.nameArabic.localizedCaseInsensitiveContains(needle)
            || $0.nameEnglish.localizedCaseInsensitiveContains(needle)
            || "\($0.number)".contains(needle)
        }
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 14) {
                VStack(spacing: 10) {
                    ForEach(filteredChapters) { chapter in
                        NavigationLink {
                            QuranReaderView(
                                chapter: chapter,
                                translationResourceID: selectedTranslationResource,
                                tafsirResourceID: selectedTafsirResource,
                                reciterID: selectedReciterID,
                                language: lang
                            )
                        } label: {
                            chapterCard(chapter)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.top, 12)
            .padding(.bottom, 22)
        }
        .background(QuranTheme.background.ignoresSafeArea())
        .environment(\.layoutDirection, lang == .ar ? .rightToLeft : .leftToRight)
        .searchable(text: $query, prompt: lang.text(ar: "ابحث برقم أو اسم السورة", en: "Search by chapter number or name"))
        .navigationTitle(lang.text(ar: "القرآن", en: "Quran"))
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showingSyncSheet = true
                } label: {
                    Label(lang.text(ar: "تحديث", en: "Sync"), systemImage: "arrow.triangle.2.circlepath")
                }
            }
        }
        .sheet(isPresented: $showingSyncSheet) {
            QuranSyncSheet(
                language: lang,
                manifestURLString: $manifestURLString,
                selectedTranslationResource: $selectedTranslationResource,
                selectedTafsirResource: $selectedTafsirResource,
                selectedReciterID: $selectedReciterID,
                viewModel: viewModel
            )
        }
        .task {
            await viewModel.bootstrap()
            if !manifestURLString.isEmpty {
                await viewModel.loadManifest(urlString: manifestURLString)
            }
        }
        .alert(lang.text(ar: "خطأ", en: "Error"), isPresented: $viewModel.showingError) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(viewModel.errorMessage)
        }
    }

    private func chapterCard(_ chapter: QuranChapter) -> some View {
        HStack(spacing: 12) {
            ZStack {
                Circle().fill(QuranTheme.softSurface.opacity(0.6))
                Text("\(chapter.number)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(QuranTheme.accent)
            }
            .frame(width: 38, height: 38)

            VStack(alignment: .leading, spacing: 2) {
                Text(lang == .ar ? chapter.nameArabic : chapter.nameEnglish)
                    .font(.body.weight(.semibold))
                Text(
                    lang.text(
                        ar: "\(chapter.verseCount) آيات • \(chapter.revelation == "medinan" ? "مدنية" : "مكية")",
                        en: "\(chapter.verseCount) verses • \(chapter.revelation.capitalized)"
                    )
                )
                .font(.caption)
                .foregroundStyle(.secondary)
            }

            Spacer(minLength: 0)

            Image(systemName: lang == .ar ? "chevron.left" : "chevron.right")
                .font(.footnote.weight(.bold))
                .foregroundStyle(.secondary)
                .padding(.trailing, 2)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(QuranTheme.surface)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(QuranTheme.softSurface.opacity(0.42), lineWidth: 1)
        )
    }
}

private struct QuranReaderView: View {
    let chapter: QuranChapter
    let translationResourceID: String
    let tafsirResourceID: String
    let reciterID: String
    let language: QLanguage

    @State private var rows: [QuranVerseRow] = []
    @State private var loading = true
    @State private var error: String?
    @State private var selectedRow: QuranVerseRow?

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            Group {
                if loading {
                    ProgressView()
                        .tint(.white)
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if let error {
                    ContentUnavailableView(
                        language.text(ar: "تعذر تحميل السورة", en: "Unable to load chapter"),
                        systemImage: "exclamationmark.triangle",
                        description: Text(error)
                    )
                } else if rows.isEmpty {
                    ContentUnavailableView(
                        language.text(ar: "هذه السورة غير مثبّتة بعد", en: "This chapter is not installed yet"),
                        systemImage: "square.and.arrow.down",
                        description: Text(language.text(ar: "نزّل حزمة QUL من صفحة التحديث.", en: "Install a QUL pack from the Sync sheet."))
                    )
                } else {
                    VStack(spacing: 0) {
                        ScrollView {
                            VStack(spacing: 0) {
                                // Page header: in RTL HStack first item=RIGHT, last item=LEFT
                                // So juz goes RIGHT, surah name goes LEFT — matching Quran layout
                                HStack {
                                    Text("الجزء \(arabicNumber(juzForChapter(chapter.number)))")
                                        .font(.caption.weight(.medium))
                                        .foregroundStyle(Color.white.opacity(0.5))
                                    Spacer()
                                    Text(language == .ar ? chapter.nameArabic : chapter.nameEnglish)
                                        .font(.caption.weight(.medium))
                                        .foregroundStyle(Color.white.opacity(0.5))
                                }
                                .padding(.horizontal, 22)
                                .padding(.top, 10)
                                .padding(.bottom, 22)

                                // Decorative surah name banner
                                QuranSurahNameBanner(arabicName: chapter.nameArabic)
                                    .padding(.horizontal, 22)
                                    .padding(.bottom, 24)

                                // Bismillah (omit for At-Tawbah / surah 9)
                                if chapter.number != 9 {
                                    Text("بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ")
                                        .font(.system(size: 42, weight: .regular, design: .serif))
                                        .multilineTextAlignment(.center)
                                        .foregroundStyle(Color.white.opacity(0.93))
                                        .frame(maxWidth: .infinity)
                                        .padding(.horizontal, 22)
                                        .padding(.bottom, 20)
                                }

                                // Verses — flowing naturally with no gaps
                                VStack(spacing: 0) {
                                    ForEach(rows) { row in
                                        Button {
                                            selectedRow = row
                                        } label: {
                                            Text(verseLineText(row))
                                                .font(.system(size: 44, weight: .regular, design: .serif))
                                                .lineSpacing(18)
                                                .foregroundStyle(Color.white.opacity(0.95))
                                                .multilineTextAlignment(.trailing)
                                                .frame(maxWidth: .infinity, alignment: .trailing)
                                        }
                                        .buttonStyle(.plain)
                                    }
                                }
                                .padding(.horizontal, 22)
                                .padding(.bottom, 32)
                            }
                        }

                        // Bottom page number badge (Arabic numeral)
                        HStack {
                            Spacer()
                            Text(arabicNumber(chapter.number))
                                .font(.caption.bold())
                                .foregroundStyle(Color.white.opacity(0.7))
                                .padding(.horizontal, 20)
                                .padding(.vertical, 7)
                                .overlay(Capsule().stroke(Color.white.opacity(0.3), lineWidth: 1))
                            Spacer()
                        }
                        .padding(.vertical, 10)
                        .background(Color.black)
                    }
                }
            }
        }
        .navigationTitle(language.text(ar: "سورة \(chapter.nameArabic)", en: chapter.nameEnglish))
        .navigationBarTitleDisplayMode(.inline)
        .environment(\.layoutDirection, .rightToLeft)
        .toolbar(.hidden, for: .tabBar)
        .sheet(item: $selectedRow) { row in
            AyahDetailSheet(
                row: row,
                chapterTitle: language == .ar ? chapter.nameArabic : chapter.nameEnglish,
                language: language,
                tafsirResourceID: tafsirResourceID,
                reciterID: reciterID
            )
        }
        .task {
            await load()
        }
    }

    private func verseLineText(_ row: QuranVerseRow) -> String {
        "\(row.verse.textUthmani) ۝\(arabicNumber(row.verse.verse))"
    }

    private func arabicNumber(_ value: Int) -> String {
        let mapping: [Character: Character] = [
            "0": "٠", "1": "١", "2": "٢", "3": "٣", "4": "٤",
            "5": "٥", "6": "٦", "7": "٧", "8": "٨", "9": "٩"
        ]
        return String(String(value).map { mapping[$0] ?? $0 })
    }

    // Approximate starting juz for each surah (index matches surah number 1-114)
    private func juzForChapter(_ chapter: Int) -> Int {
        let table: [Int] = [
            0,                                        // index 0 unused
            1,  1,  3,  4,  6,  7,  8,  9, 10, 11,  // surahs 1-10
           11, 12, 13, 13, 14, 14, 15, 15, 16, 16,   // 11-20
           17, 17, 18, 18, 18, 19, 19, 20, 21, 21,   // 21-30
           21, 21, 21, 22, 22, 22, 23, 23, 23, 24,   // 31-40
           24, 25, 25, 25, 26, 26, 26, 26, 26, 26,   // 41-50
           26, 27, 27, 27, 27, 27, 27, 28, 28, 28,   // 51-60
           28, 28, 28, 28, 28, 28, 29, 29, 29, 29,   // 61-70
           29, 29, 29, 29, 29, 29, 29, 30, 30, 30,   // 71-80
           30, 30, 30, 30, 30, 30, 30, 30, 30, 30,   // 81-90
           30, 30, 30, 30, 30, 30, 30, 30, 30, 30,   // 91-100
           30, 30, 30, 30, 30, 30, 30, 30, 30, 30,   // 101-110
           30, 30, 30, 30                             // 111-114
        ]
        guard chapter >= 1, chapter < table.count else { return 1 }
        return table[chapter]
    }

    private func load() async {
        loading = true
        defer { loading = false }
        do {
            try await QuranSQLiteStore.shared.bootstrap()
            rows = try await QuranSQLiteStore.shared.fetchVerses(
                chapter: chapter.number,
                translationResourceID: translationResourceID
            )
        } catch {
            self.error = error.localizedDescription
        }
    }
}

// MARK: - Decorative Surah Name Banner

private struct QuranSurahNameBanner: View {
    let arabicName: String

    var body: some View {
        ZStack {
            // Subtle background tint
            Rectangle()
                .fill(Color.white.opacity(0.04))

            // Outer border
            Rectangle()
                .stroke(Color.white.opacity(0.32), lineWidth: 1.5)

            // Inner inset border
            Rectangle()
                .stroke(Color.white.opacity(0.12), lineWidth: 0.5)
                .padding(4)

            HStack(spacing: 0) {
                // Decorative side panel — appears on RIGHT in RTL
                ZStack {
                    Rectangle()
                        .fill(Color.white.opacity(0.06))
                        .frame(width: 52)
                    QuranOrnament()
                }

                Rectangle()
                    .fill(Color.white.opacity(0.32))
                    .frame(width: 1)

                // Surah name centred
                Text("سُورَةُ \(arabicName)")
                    .font(.system(size: 26, weight: .regular, design: .serif))
                    .foregroundStyle(Color.white.opacity(0.92))
                    .multilineTextAlignment(.center)
                    .frame(maxWidth: .infinity)

                Rectangle()
                    .fill(Color.white.opacity(0.32))
                    .frame(width: 1)

                // Decorative side panel — appears on LEFT in RTL
                ZStack {
                    Rectangle()
                        .fill(Color.white.opacity(0.06))
                        .frame(width: 52)
                    QuranOrnament()
                }
            }
        }
        .frame(height: 68)
        .clipShape(Rectangle())
    }
}

private struct QuranOrnament: View {
    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.white.opacity(0.32), lineWidth: 1)
                .frame(width: 30, height: 30)
            Circle()
                .stroke(Color.white.opacity(0.16), lineWidth: 0.5)
                .frame(width: 18, height: 18)
            Circle()
                .fill(Color.white.opacity(0.38))
                .frame(width: 4, height: 4)
        }
    }
}


private struct QuranSyncSheet: View {
    let language: QLanguage
    @Binding var manifestURLString: String
    @Binding var selectedTranslationResource: String
    @Binding var selectedTafsirResource: String
    @Binding var selectedReciterID: String
    @ObservedObject var viewModel: QuranLibraryViewModel

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section(language.text(ar: "مصدر البيانات", en: "Data Source")) {
                    TextField("https://.../manifest.json", text: $manifestURLString)
                        .textInputAutocapitalization(.never)
                        .keyboardType(.URL)
                        .autocorrectionDisabled()

                    Button(language.text(ar: "استخدم العينة المحلية", en: "Use Local Sample")) {
                        Task {
                            manifestURLString = QuranLibraryViewModel.sampleManifestToken
                            await viewModel.loadManifest(urlString: manifestURLString)
                        }
                    }
                    .disabled(viewModel.isBusy)

                    Button(language.text(ar: "تحميل Manifest", en: "Load Manifest")) {
                        Task {
                            await viewModel.loadManifest(urlString: manifestURLString)
                        }
                    }
                    .disabled(viewModel.isBusy)
                }

                Section(language.text(ar: "الترجمة الحالية", en: "Translation")) {
                    TextField(language.text(ar: "معرّف مورد الترجمة", en: "Translation resource ID"), text: $selectedTranslationResource)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }

                Section(language.text(ar: "التفسير والصوت", en: "Tafsir & Audio")) {
                    TextField(language.text(ar: "معرّف مورد التفسير", en: "Tafsir resource ID"), text: $selectedTafsirResource)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    TextField(language.text(ar: "معرّف القارئ", en: "Reciter ID"), text: $selectedReciterID)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()

                    Text(language.text(ar: "مثال: en.tafsir.sample / ar.alafasy.sample", en: "Example: en.tafsir.sample / ar.alafasy.sample"))
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                Section(language.text(ar: "الحزم المتاحة", en: "Available Packs")) {
                    if viewModel.availablePacks.isEmpty {
                        Text(language.text(ar: "لا توجد حزم بعد. حمّل manifest أولاً.", en: "No packs loaded yet. Fetch manifest first."))
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(viewModel.availablePacks) { pack in
                            VStack(alignment: .leading, spacing: 6) {
                                Text(pack.title)
                                    .font(.headline)
                                Text(pack.description)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                Text("id: \(pack.id) • v\(pack.version)")
                                    .font(.caption)
                                    .foregroundStyle(.tertiary)

                                Button(language.text(ar: "تثبيت الحزمة", en: "Install Pack")) {
                                    Task {
                                        await viewModel.install(pack: pack, manifestURLString: manifestURLString)
                                    }
                                }
                                .buttonStyle(.borderedProminent)
                                .disabled(viewModel.isBusy)
                            }
                            .padding(.vertical, 4)
                        }
                    }
                }

                Section(language.text(ar: "الحزم المثبتة", en: "Installed Packs")) {
                    if viewModel.installedPacks.isEmpty {
                        Text(language.text(ar: "لا توجد حزم مثبتة.", en: "No installed packs yet."))
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(viewModel.installedPacks) { item in
                            VStack(alignment: .leading, spacing: 3) {
                                Text(item.packID)
                                    .font(.subheadline.weight(.semibold))
                                Text("v\(item.version)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Text(item.installedAt)
                                    .font(.caption2)
                                    .foregroundStyle(.tertiary)
                            }
                            .padding(.vertical, 2)
                        }
                    }
                }
            }
            .overlay {
                if viewModel.isBusy {
                    ZStack {
                        Color.black.opacity(0.08).ignoresSafeArea()
                        ProgressView(language.text(ar: "جاري التثبيت...", en: "Installing..."))
                            .padding(14)
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12, style: .continuous))
                    }
                }
            }
            .navigationTitle(language.text(ar: "تحديث مكتبة القرآن", en: "Quran Sync"))
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button(language.text(ar: "إغلاق", en: "Close")) {
                        dismiss()
                    }
                }
            }
        }
    }
}

@MainActor
final class QuranLibraryViewModel: ObservableObject {
    static let sampleManifestToken = "sample://local-manifest"

    @Published var chapters: [QuranChapter] = []
    @Published var availablePacks: [QuranDownloadPack] = []
    @Published var installedPacks: [QuranPackInstallSummary] = []
    @Published var isBusy = false
    @Published var showingError = false
    @Published var errorMessage = ""

    private let store = QuranSQLiteStore.shared
    private let installer = QuranPackInstaller()
    private let autoInstaller = QuranAutoInstaller()

    func bootstrap() async {
        do {
            try await autoInstaller.ensureMainPackInstalled(store: store)
            chapters = try await store.fetchChapters()
            installedPacks = try await store.installedPacks()
        } catch {
            show(error)
        }
    }

    func loadManifest(urlString: String) async {
        guard let url = resolveManifestURL(urlString: urlString) else {
            show(QuranStoreError.malformedJSON("Manifest URL is invalid"))
            return
        }

        isBusy = true
        defer { isBusy = false }

        do {
            let manifest = try await installer.fetchManifest(url: url)
            availablePacks = manifest.packs
        } catch {
            show(error)
        }
    }

    func install(pack: QuranDownloadPack, manifestURLString: String) async {
        guard let manifestURL = resolveManifestURL(urlString: manifestURLString) else {
            show(QuranStoreError.malformedJSON("Manifest URL is invalid"))
            return
        }

        isBusy = true
        defer { isBusy = false }

        do {
            try await installer.installPack(manifestURL: manifestURL, pack: pack, store: store)
            chapters = try await store.fetchChapters()
            installedPacks = try await store.installedPacks()
        } catch {
            show(error)
        }
    }

    private func show(_ error: Error) {
        errorMessage = error.localizedDescription
        showingError = true
    }

    private func resolveManifestURL(urlString: String) -> URL? {
        let trimmed = urlString.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.isEmpty || trimmed == Self.sampleManifestToken {
            return (try? QuranBundledPack.ensureManifestInSupport())
                ?? (try? QuranLocalSamplePack.ensureManifest())
        }

        if trimmed.hasPrefix("~") {
            let expanded = (trimmed as NSString).expandingTildeInPath
            return URL(fileURLWithPath: expanded)
        }

        if trimmed.hasPrefix("/") {
            return URL(fileURLWithPath: trimmed)
        }

        guard let parsed = URL(string: trimmed) else {
            return nil
        }

        if parsed.scheme == nil {
            return URL(fileURLWithPath: trimmed)
        }

        return parsed
    }
}

private enum QuranLocalSamplePack {
    static func ensureManifest(fileManager: FileManager = .default) throws -> URL {
        let support = fileManager.urls(for: .applicationSupportDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        let root = support.appendingPathComponent("QuranLibrary/SamplePack", isDirectory: true)
        let sampleFolder = root.appendingPathComponent("qul-core-sample", isDirectory: true)
        try fileManager.createDirectory(at: sampleFolder, withIntermediateDirectories: true)

        try write("manifest.json", content: manifestJSON, folder: root)
        try write("chapters.json", content: chaptersJSON, folder: sampleFolder)
        try write("verses.json", content: versesJSON, folder: sampleFolder)
        try write("translation_en_sahih.json", content: translationJSON, folder: sampleFolder)
        try write("tafsir_en_sample.json", content: tafsirJSON, folder: sampleFolder)
        try write("audio_manifest.json", content: audioJSON, folder: sampleFolder)
        try write("layout_words.json", content: "[]", folder: sampleFolder)
        try write("mushaf_pages.json", content: mushafPagesJSON, folder: sampleFolder)
        try write("mushaf_words.json", content: mushafWordsJSON, folder: sampleFolder)

        return root.appendingPathComponent("manifest.json")
    }

    private static func write(_ name: String, content: String, folder: URL) throws {
        let url = folder.appendingPathComponent(name)
        try content.data(using: .utf8)?.write(to: url, options: .atomic)
    }

    private static let manifestJSON = """
    {
      "generated_at": "2026-02-22T02:40:00Z",
      "packs": [
        {
          "id": "qul-core-sample",
          "title": "QUL Core Sample",
          "description": "Local sample pack for testing Mushaf flow",
          "version": "1.0.0",
          "base_url": "./qul-core-sample/",
          "chapters_file": "chapters.json",
          "verses_file": "verses.json",
          "translation_files": [
            {
              "resource_id": "en.sahih",
              "language": "en",
              "title": "Sahih International (Sample)",
              "file": "translation_en_sahih.json"
            }
          ],
          "tafsir_files": [
            {
              "resource_id": "en.tafsir.sample",
              "language": "en",
              "title": "Sample Tafsir",
              "file": "tafsir_en_sample.json"
            }
          ],
          "audio_files": [
            {
              "reciter_id": "ar.alafasy.sample",
              "title": "Alafasy Sample",
              "file": "audio_manifest.json",
              "base_audio_url": "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/"
            }
          ],
          "layout_file": {
            "layout_id": "madani-15line-sample",
            "title": "Madani 15-line Sample",
            "file": "layout_words.json"
          },
          "mushaf_layout_file": {
            "layout_id": "kfgqpc-v2-sample",
            "title": "QUL Mushaf Pages Sample",
            "file": "mushaf_pages.json"
          },
          "mushaf_script_file": {
            "layout_id": "kfgqpc-v2-sample",
            "title": "QUL Mushaf Words Sample",
            "file": "mushaf_words.json"
          }
        }
      ]
    }
    """

    private static let chaptersJSON = """
    [
      { "number": 1, "name_ar": "الفاتحة", "name_en": "Al-Fatihah", "revelation": "meccan", "verse_count": 7 }
    ]
    """

    private static let versesJSON = """
    [
      { "verse_key": "1:1", "text_uthmani": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ" },
      { "verse_key": "1:2", "text_uthmani": "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ" },
      { "verse_key": "1:3", "text_uthmani": "الرَّحْمَٰنِ الرَّحِيمِ" },
      { "verse_key": "1:4", "text_uthmani": "مَالِكِ يَوْمِ الدِّينِ" },
      { "verse_key": "1:5", "text_uthmani": "إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ" },
      { "verse_key": "1:6", "text_uthmani": "اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ" },
      { "verse_key": "1:7", "text_uthmani": "صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ" }
    ]
    """

    private static let translationJSON = """
    [
      { "verse_key": "1:1", "text": "In the name of Allah, the Entirely Merciful, the Especially Merciful." },
      { "verse_key": "1:2", "text": "[All] praise is [due] to Allah, Lord of the worlds." },
      { "verse_key": "1:3", "text": "The Entirely Merciful, the Especially Merciful." },
      { "verse_key": "1:4", "text": "Sovereign of the Day of Recompense." },
      { "verse_key": "1:5", "text": "It is You we worship and You we ask for help." },
      { "verse_key": "1:6", "text": "Guide us to the straight path." },
      { "verse_key": "1:7", "text": "The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray." }
    ]
    """

    private static let tafsirJSON = """
    [
      { "verse_key": "1:1", "text": "Begin by invoking Allah's name before all acts." },
      { "verse_key": "1:2", "text": "All gratitude belongs to Allah, Sustainer of all realms." },
      { "verse_key": "1:3", "text": "His mercy is absolute and recurring." },
      { "verse_key": "1:4", "text": "He alone fully owns the Day of Judgment." },
      { "verse_key": "1:5", "text": "Servitude and reliance must be directed to Allah alone." },
      { "verse_key": "1:6", "text": "A prayer for guidance and steadfastness." },
      { "verse_key": "1:7", "text": "The path of favor, away from misguidance and wrath." }
    ]
    """

    private static let audioJSON = """
    [
      { "verse_key": "1:1", "path": "001001.mp3", "duration_ms": 4310 },
      { "verse_key": "1:2", "path": "001002.mp3", "duration_ms": 3820 },
      { "verse_key": "1:3", "path": "001003.mp3", "duration_ms": 2980 },
      { "verse_key": "1:4", "path": "001004.mp3", "duration_ms": 3230 },
      { "verse_key": "1:5", "path": "001005.mp3", "duration_ms": 3760 },
      { "verse_key": "1:6", "path": "001006.mp3", "duration_ms": 3340 },
      { "verse_key": "1:7", "path": "001007.mp3", "duration_ms": 5440 }
    ]
    """

    private static let mushafPagesJSON = """
    [
      { "page_number": 1, "line_number": 1, "line_type": "surah_name", "is_centered": 1, "surah_number": 1 },
      { "page_number": 1, "line_number": 2, "line_type": "basmallah", "is_centered": 1 },
      { "page_number": 1, "line_number": 3, "line_type": "ayah", "is_centered": 0, "first_word_id": 1, "last_word_id": 4 },
      { "page_number": 1, "line_number": 4, "line_type": "ayah", "is_centered": 0, "first_word_id": 5, "last_word_id": 8 },
      { "page_number": 1, "line_number": 5, "line_type": "ayah", "is_centered": 0, "first_word_id": 9, "last_word_id": 10 },
      { "page_number": 1, "line_number": 6, "line_type": "ayah", "is_centered": 0, "first_word_id": 11, "last_word_id": 14 },
      { "page_number": 1, "line_number": 7, "line_type": "ayah", "is_centered": 0, "first_word_id": 15, "last_word_id": 18 },
      { "page_number": 1, "line_number": 8, "line_type": "ayah", "is_centered": 0, "first_word_id": 19, "last_word_id": 21 },
      { "page_number": 1, "line_number": 9, "line_type": "ayah", "is_centered": 0, "first_word_id": 22, "last_word_id": 26 },
      { "page_number": 1, "line_number": 10, "line_type": "ayah", "is_centered": 0, "first_word_id": 27, "last_word_id": 30 }
    ]
    """

    private static let mushafWordsJSON = """
    [
      { "word_index": 1, "word_key": "1:1", "surah": 1, "ayah": 1, "text": "بِسْمِ" },
      { "word_index": 2, "word_key": "1:1", "surah": 1, "ayah": 1, "text": "اللَّهِ" },
      { "word_index": 3, "word_key": "1:1", "surah": 1, "ayah": 1, "text": "الرَّحْمَٰنِ" },
      { "word_index": 4, "word_key": "1:1", "surah": 1, "ayah": 1, "text": "الرَّحِيمِ" },
      { "word_index": 5, "word_key": "1:2", "surah": 1, "ayah": 2, "text": "الْحَمْدُ" },
      { "word_index": 6, "word_key": "1:2", "surah": 1, "ayah": 2, "text": "لِلَّهِ" },
      { "word_index": 7, "word_key": "1:2", "surah": 1, "ayah": 2, "text": "رَبِّ" },
      { "word_index": 8, "word_key": "1:2", "surah": 1, "ayah": 2, "text": "الْعَالَمِينَ" },
      { "word_index": 9, "word_key": "1:3", "surah": 1, "ayah": 3, "text": "الرَّحْمَٰنِ" },
      { "word_index": 10, "word_key": "1:3", "surah": 1, "ayah": 3, "text": "الرَّحِيمِ" },
      { "word_index": 11, "word_key": "1:4", "surah": 1, "ayah": 4, "text": "مَالِكِ" },
      { "word_index": 12, "word_key": "1:4", "surah": 1, "ayah": 4, "text": "يَوْمِ" },
      { "word_index": 13, "word_key": "1:4", "surah": 1, "ayah": 4, "text": "الدِّينِ" },
      { "word_index": 14, "word_key": "1:4", "surah": 1, "ayah": 4, "text": "۝" },
      { "word_index": 15, "word_key": "1:5", "surah": 1, "ayah": 5, "text": "إِيَّاكَ" },
      { "word_index": 16, "word_key": "1:5", "surah": 1, "ayah": 5, "text": "نَعْبُدُ" },
      { "word_index": 17, "word_key": "1:5", "surah": 1, "ayah": 5, "text": "وَإِيَّاكَ" },
      { "word_index": 18, "word_key": "1:5", "surah": 1, "ayah": 5, "text": "نَسْتَعِينُ" },
      { "word_index": 19, "word_key": "1:6", "surah": 1, "ayah": 6, "text": "اهْدِنَا" },
      { "word_index": 20, "word_key": "1:6", "surah": 1, "ayah": 6, "text": "الصِّرَاطَ" },
      { "word_index": 21, "word_key": "1:6", "surah": 1, "ayah": 6, "text": "الْمُسْتَقِيمَ" },
      { "word_index": 22, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "صِرَاطَ" },
      { "word_index": 23, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "الَّذِينَ" },
      { "word_index": 24, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "أَنْعَمْتَ" },
      { "word_index": 25, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "عَلَيْهِمْ" },
      { "word_index": 26, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "غَيْرِ" },
      { "word_index": 27, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "الْمَغْضُوبِ" },
      { "word_index": 28, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "عَلَيْهِمْ" },
      { "word_index": 29, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "وَلَا" },
      { "word_index": 30, "word_key": "1:7", "surah": 1, "ayah": 7, "text": "الضَّالِّينَ" }
    ]
    """
}

enum QLanguage {
    case ar
    case en

    func text(ar: String, en: String) -> String {
        self == .ar ? ar : en
    }
}

private struct AyahNumberBadge: View {
    let number: Int

    var body: some View {
        Text("\(number)")
            .font(.footnote.weight(.bold))
            .foregroundStyle(QuranTheme.accent)
            .frame(width: 28, height: 28)
            .background(Circle().fill(QuranTheme.softSurface))
            .overlay(Circle().stroke(QuranTheme.accent.opacity(0.35), lineWidth: 1))
    }
}

struct AyahDetailSheet: View {
    let row: QuranVerseRow
    let chapterTitle: String
    let language: QLanguage
    let tafsirResourceID: String
    let reciterID: String

    @State private var tafsir: QuranTafsirLine?
    @State private var audioAyah: QuranAudioAyah?
    @State private var loading = true
    @State private var errorMessage: String?
    @StateObject private var audioPlayer = AyahAudioPlayer()
    private var isRTL: Bool { language == .ar }

    var body: some View {
        NavigationStack {
            List {
                Section(language.text(ar: "الآية", en: "Ayah")) {
                    Text(row.verse.textUthmani)
                        .font(.system(size: 36, weight: .regular, design: .serif))
                        .multilineTextAlignment(.trailing)
                        .frame(maxWidth: .infinity, alignment: .trailing)
                }

                if let translation = row.translation {
                    Section(language.text(ar: "الترجمة", en: "Translation")) {
                        Text(translation.text)
                    }
                }

                Section(language.text(ar: "التفسير", en: "Tafsir")) {
                    if loading {
                        ProgressView()
                    } else if let tafsir {
                        Text(tafsir.text)
                    } else {
                        Text(language.text(ar: "لا يوجد تفسير لهذه الآية في الحزمة الحالية.", en: "No tafsir found for this ayah in current pack."))
                            .foregroundStyle(.secondary)
                    }
                }

                Section(language.text(ar: "الصوت", en: "Audio")) {
                    if let audioAyah, !audioAyah.url.isEmpty {
                        Button {
                            audioPlayer.toggle(urlString: audioAyah.url)
                        } label: {
                            Label(
                                audioPlayer.isPlaying
                                ? language.text(ar: "إيقاف", en: "Stop")
                                : language.text(ar: "تشغيل", en: "Play"),
                                systemImage: audioPlayer.isPlaying ? "stop.circle.fill" : "play.circle.fill"
                            )
                        }
                        .buttonStyle(.borderedProminent)

                        if let durationMS = audioAyah.durationMS {
                            Text(language.text(ar: "المدة: \(durationMS) ms", en: "Duration: \(durationMS) ms"))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    } else if loading {
                        ProgressView()
                    } else {
                        Text(language.text(ar: "لا يوجد ملف صوتي لهذه الآية في الحزمة الحالية.", en: "No audio found for this ayah in current pack."))
                            .foregroundStyle(.secondary)
                    }
                }

                if let errorMessage {
                    Section(language.text(ar: "ملاحظة", en: "Note")) {
                        Text(errorMessage)
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .navigationTitle(language.text(ar: "سورة \(chapterTitle) • آية \(row.verse.verse)", en: "\(chapterTitle) • Ayah \(row.verse.verse)"))
            .navigationBarTitleDisplayMode(.inline)
        }
        .environment(\.layoutDirection, isRTL ? .rightToLeft : .leftToRight)
        .task {
            await loadDetails()
        }
        .onDisappear {
            audioPlayer.stop()
        }
    }

    private func loadDetails() async {
        loading = true
        defer { loading = false }
        do {
            tafsir = try await QuranSQLiteStore.shared.fetchTafsir(
                resourceID: tafsirResourceID,
                chapter: row.verse.chapter,
                verse: row.verse.verse
            )
            audioAyah = try await QuranSQLiteStore.shared.fetchAudioAyah(
                reciterID: reciterID,
                chapter: row.verse.chapter,
                verse: row.verse.verse
            )
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

@MainActor
final class AyahAudioPlayer: ObservableObject {
    @Published var isPlaying = false

    private var player: AVPlayer?
    private var activeURL: String?

    func toggle(urlString: String) {
        if isPlaying, activeURL == urlString {
            stop()
            return
        }
        play(urlString: urlString)
    }

    func stop() {
        player?.pause()
        isPlaying = false
        activeURL = nil
    }

    private func play(urlString: String) {
        guard let url = URL(string: urlString) else { return }
        activeURL = urlString
        player = AVPlayer(url: url)
        player?.play()
        isPlaying = true
    }
}
