import SwiftUI
import UIKit
import QuartzCore
import Combine

private enum MushafConstants {
    static let basmallah = "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ"
}

private extension NSAttributedString.Key {
    static let ayahKey = NSAttributedString.Key("ayahKey")
    static let ayahSurah = NSAttributedString.Key("ayahSurah")
    static let ayahNumber = NSAttributedString.Key("ayahNumber")
}

private enum MushafScrollDirection: String, CaseIterable, Identifiable {
    case horizontal
    case vertical

    var id: String { rawValue }
}

private enum MushafPageDesign: String, CaseIterable, Identifiable {
    case book
    case fullscreen

    var id: String { rawValue }
}

private enum MushafLandscapeLayout: String, CaseIterable, Identifiable {
    case single
    case double

    var id: String { rawValue }
}

private enum MushafTheme: String, CaseIterable, Identifiable {
    case classic
    case emerald

    var id: String { rawValue }
}

private struct MushafStyle {
    let theme: MushafTheme
    let pageDesign: MushafPageDesign
    let textScale: Double
    let lineHeight: Double
    let blackBackgroundInDarkMode: Bool
    let colorScheme: ColorScheme

    var isDarkPage: Bool {
        colorScheme == .dark && blackBackgroundInDarkMode
    }

    var appBackground: Color {
        if isDarkPage { return .black }
        switch theme {
        case .classic:
            return Color(red: 0.965, green: 0.955, blue: 0.93)
        case .emerald:
            return Color(red: 0.91, green: 0.96, blue: 0.93)
        }
    }

    var pageBackground: Color {
        if isDarkPage { return Color(red: 0.08, green: 0.08, blue: 0.09) }
        switch theme {
        case .classic:
            return Color(red: 0.993, green: 0.985, blue: 0.963)
        case .emerald:
            return Color(red: 0.95, green: 0.99, blue: 0.96)
        }
    }

    var borderColor: Color {
        if isDarkPage { return .white.opacity(0.1) }
        switch theme {
        case .classic:
            return .black.opacity(0.08)
        case .emerald:
            return Color(red: 0.1, green: 0.45, blue: 0.29).opacity(0.2)
        }
    }

    var overlayFill: AnyShapeStyle {
        if isDarkPage { return AnyShapeStyle(Color.white.opacity(0.08)) }
        return AnyShapeStyle(.ultraThinMaterial)
    }

    var labelColor: Color {
        if isDarkPage { return .white.opacity(0.9) }
        return Color(red: 0.62, green: 0.49, blue: 0.35)
    }

    var textColor: UIColor {
        if isDarkPage { return .white }
        return UIColor.label
    }

    var highlightColor: UIColor {
        if isDarkPage {
            return UIColor.systemGreen.withAlphaComponent(0.28)
        }
        return UIColor.systemGreen.withAlphaComponent(0.18)
    }

    var cacheSignature: String {
        "\(theme.rawValue):\(pageDesign.rawValue):\(String(format: "%.2f", textScale)):\(String(format: "%.2f", lineHeight)):\(isDarkPage ? "dark" : "light")"
    }
}

struct MushafPagerView: View {
    let translationResourceID: String
    let tafsirResourceID: String
    let reciterID: String
    let language: QLanguage
    var onAyahSelected: (Int, Int, Int) -> Void = { _, _, _ in }

    @Environment(\.colorScheme) private var colorScheme
    @AppStorage("mushaf_scroll_direction") private var scrollDirectionRaw = MushafScrollDirection.horizontal.rawValue
    @AppStorage("mushaf_page_design") private var pageDesignRaw = MushafPageDesign.book.rawValue
    @AppStorage("mushaf_landscape_layout") private var landscapeLayoutRaw = MushafLandscapeLayout.single.rawValue
    @AppStorage("mushaf_theme") private var themeRaw = MushafTheme.classic.rawValue
    @AppStorage("mushaf_show_clock") private var showClock = false
    @AppStorage("mushaf_black_bg_dark") private var blackBackgroundInDarkMode = true
    @AppStorage("mushaf_text_scale") private var textScale = 1.0
    @AppStorage("mushaf_line_height") private var lineHeight = 1.0

    @State private var currentPage = 1
    @State private var layoutID: String?
    @State private var isLoading = true
    @State private var errorMessage: String?
    @State private var selectedAyah: MushafSelection?
    @State private var showingSettings = false
    @State private var showingPageJump = false
    @State private var pageJumpInput = ""

    private var scrollDirection: MushafScrollDirection {
        MushafScrollDirection(rawValue: scrollDirectionRaw) ?? .horizontal
    }

    private var pageDesign: MushafPageDesign {
        MushafPageDesign(rawValue: pageDesignRaw) ?? .book
    }

    private var landscapeLayout: MushafLandscapeLayout {
        MushafLandscapeLayout(rawValue: landscapeLayoutRaw) ?? .single
    }

    private var selectedTheme: MushafTheme {
        MushafTheme(rawValue: themeRaw) ?? .classic
    }

    private var style: MushafStyle {
        MushafStyle(
            theme: selectedTheme,
            pageDesign: pageDesign,
            textScale: textScale,
            lineHeight: lineHeight,
            blackBackgroundInDarkMode: blackBackgroundInDarkMode,
            colorScheme: colorScheme
        )
    }

    var body: some View {
        ZStack {
            style.appBackground.ignoresSafeArea()

            if isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let errorMessage {
                ContentUnavailableView(
                    language.text(ar: "تعذر تحميل المصحف", en: "Unable to load Mushaf"),
                    systemImage: "exclamationmark.triangle",
                    description: Text(errorMessage)
                )
            } else if let layoutID {
                GeometryReader { geometry in
                    if usesDoubleLandscapeLayout(in: geometry.size) {
                        doublePageHorizontalPager(layoutID: layoutID)
                    } else if scrollDirection == .horizontal {
                        singlePageHorizontalPager(layoutID: layoutID)
                    } else {
                        verticalReader(layoutID: layoutID)
                    }
                }
                .overlay(alignment: .topTrailing) {
                    VStack(alignment: .trailing, spacing: 8) {
                        if showClock {
                            TimelineView(.periodic(from: .now, by: 60)) { context in
                                Text(context.date, style: .time)
                                    .font(.caption.bold())
                                    .foregroundStyle(style.labelColor)
                                    .padding(.horizontal, 10)
                                    .padding(.vertical, 6)
                                    .background(style.overlayFill, in: Capsule())
                            }
                        }

                        Text(pageCounterLabel)
                            .font(.caption.bold())
                            .foregroundStyle(style.labelColor)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .background(style.overlayFill, in: Capsule())
                    }
                    .padding(12)
                }
            } else {
                ContentUnavailableView(
                    language.text(ar: "لا توجد بيانات تخطيط للمصحف", en: "No mushaf layout data found"),
                    systemImage: "square.and.arrow.down",
                    description: Text(language.text(ar: "ثبّت حزمة QUL تحتوي mushaf_layout_file و mushaf_script_file.", en: "Install a QUL pack that includes mushaf_layout_file and mushaf_script_file."))
                )
            }
        }
        .navigationTitle(language.text(ar: "المصحف", en: "Mushaf"))
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                HStack(spacing: 12) {
                    Button {
                        pageJumpInput = "\(currentPage)"
                        showingPageJump = true
                    } label: {
                        Text("\(currentPage)")
                            .font(.subheadline.weight(.semibold))
                    }

                    Button {
                        showingSettings = true
                    } label: {
                        Image(systemName: "slider.horizontal.3")
                    }
                }
            }
        }
        .sheet(item: $selectedAyah) { selection in
            MushafAyahDetailSheetLoader(
                selection: selection,
                translationResourceID: translationResourceID,
                tafsirResourceID: tafsirResourceID,
                reciterID: reciterID,
                language: language
            )
        }
        .sheet(isPresented: $showingSettings) {
            MushafSettingsSheet(
                language: language,
                scrollDirectionRaw: $scrollDirectionRaw,
                pageDesignRaw: $pageDesignRaw,
                landscapeLayoutRaw: $landscapeLayoutRaw,
                themeRaw: $themeRaw,
                showClock: $showClock,
                blackBackgroundInDarkMode: $blackBackgroundInDarkMode,
                textScale: $textScale,
                lineHeight: $lineHeight
            )
        }
        .alert(
            language.text(ar: "اذهب إلى صفحة", en: "Go to Page"),
            isPresented: $showingPageJump
        ) {
            TextField("1...604", text: $pageJumpInput)
                .keyboardType(.numberPad)
            Button(language.text(ar: "انتقال", en: "Go")) {
                if let target = Int(pageJumpInput) {
                    currentPage = min(max(target, 1), 604)
                }
            }
            Button(language.text(ar: "إلغاء", en: "Cancel"), role: .cancel) {}
        } message: {
            Text(language.text(ar: "أدخل رقم الصفحة", en: "Enter page number"))
        }
        .task {
            await loadLayoutID()
        }
    }

    private var pageCounterLabel: String {
        if scrollDirection == .horizontal && landscapeLayout == .double {
            let second = min(currentPage + 1, 604)
            return "\(currentPage)-\(second)/604"
        }
        return "\(currentPage)/604"
    }

    private func usesDoubleLandscapeLayout(in size: CGSize) -> Bool {
        scrollDirection == .horizontal && landscapeLayout == .double && size.width > size.height
    }

    private func pageView(layoutID: String, pageNumber: Int) -> some View {
        MushafPageView(
            layoutID: layoutID,
            pageNumber: pageNumber,
            selectedAyahKey: selectedAyah?.page == pageNumber ? selectedAyah?.key : nil,
            style: style
        ) { surah, ayah in
            selectedAyah = .init(page: pageNumber, surah: surah, ayah: ayah)
            currentPage = pageNumber
            onAyahSelected(surah, ayah, pageNumber)
        }
    }

    private func singlePageHorizontalPager(layoutID: String) -> some View {
        TabView(selection: $currentPage) {
            ForEach(1...604, id: \.self) { pageNumber in
                pageView(layoutID: layoutID, pageNumber: pageNumber)
                    .tag(pageNumber)
                    .padding(.horizontal, 8)
                    .padding(.vertical, 12)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .task(id: currentPage) {
            await MushafPageViewModel.prefetchAdjacent(layoutID: layoutID, currentPage: currentPage, style: style)
        }
    }

    private func doublePageHorizontalPager(layoutID: String) -> some View {
        TabView(selection: Binding(
            get: { currentPage % 2 == 0 ? max(currentPage - 1, 1) : currentPage },
            set: { currentPage = $0 }
        )) {
            ForEach(Array(stride(from: 1, through: 604, by: 2)), id: \.self) { startPage in
                HStack(spacing: 10) {
                    pageView(layoutID: layoutID, pageNumber: startPage)
                    if startPage < 604 {
                        pageView(layoutID: layoutID, pageNumber: startPage + 1)
                    } else {
                        Color.clear
                    }
                }
                .padding(.horizontal, 8)
                .padding(.vertical, 12)
                .tag(startPage)
            }
        }
        .tabViewStyle(.page(indexDisplayMode: .never))
        .task(id: currentPage) {
            await MushafPageViewModel.prefetchAdjacent(layoutID: layoutID, currentPage: currentPage, style: style)
            if currentPage < 604 {
                await MushafPageViewModel.prefetchAdjacent(layoutID: layoutID, currentPage: currentPage + 1, style: style)
            }
        }
        .onAppear {
            if currentPage % 2 == 0 {
                currentPage = max(currentPage - 1, 1)
            }
        }
    }

    private func verticalReader(layoutID: String) -> some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 12) {
                    ForEach(1...604, id: \.self) { pageNumber in
                        pageView(layoutID: layoutID, pageNumber: pageNumber)
                            .id(pageNumber)
                            .frame(maxWidth: .infinity)
                            .frame(height: 640)
                            .padding(.horizontal, 10)
                            .onAppear {
                                if abs(pageNumber - currentPage) <= 1 {
                                    currentPage = pageNumber
                                }
                            }
                    }
                }
                .padding(.vertical, 12)
            }
            .onChange(of: currentPage) { page in
                withAnimation(.easeInOut(duration: 0.2)) {
                    proxy.scrollTo(page, anchor: .top)
                }
            }
        }
    }

    private func loadLayoutID() async {
        isLoading = true
        defer { isLoading = false }
        do {
            try await QuranAutoInstaller().ensureMainPackInstalled(store: QuranSQLiteStore.shared)
            layoutID = try await QuranSQLiteStore.shared.defaultMushafLayoutID()
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

private struct MushafPageView: View {
    let layoutID: String
    let pageNumber: Int
    let selectedAyahKey: String?
    let style: MushafStyle
    let onAyahSelected: (Int, Int) -> Void

    @StateObject private var viewModel = MushafPageViewModel()

    var body: some View {
        Group {
            if viewModel.isLoading {
                ProgressView()
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else if let error = viewModel.errorMessage {
                ContentUnavailableView("", systemImage: "exclamationmark.triangle", description: Text(error))
            } else if let attributedText = viewModel.attributedText {
                MushafTextKitView(
                    attributedText: attributedText,
                    selectedAyahKey: selectedAyahKey,
                    highlightColor: style.highlightColor,
                    onAyahSelected: onAyahSelected
                )
                .modifier(MushafPageContainerModifier(style: style))
            } else {
                ContentUnavailableView("", systemImage: "book.closed", description: Text("No page data"))
            }
        }
        .task(id: pageNumber) {
            await viewModel.loadPage(layoutID: layoutID, pageNumber: pageNumber, style: style)
        }
    }
}

private struct MushafPageContainerModifier: ViewModifier {
    let style: MushafStyle

    func body(content: Content) -> some View {
        if style.pageDesign == .fullscreen {
            content
                .background(style.pageBackground)
                .overlay(Rectangle().stroke(style.borderColor, lineWidth: 0.6))
        } else {
            content
                .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(style.borderColor, lineWidth: 1)
                )
                .background(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .fill(style.pageBackground)
                )
        }
    }
}

@MainActor
private final class MushafPageViewModel: ObservableObject {
    @Published var attributedText: NSAttributedString?
    @Published var isLoading = false
    @Published var errorMessage: String?

    private static var cache: [String: NSAttributedString] = [:]
    private static var cacheOrder: [String] = []
    private static var inFlightPrefetch: Set<String> = []
    private static let maxCachedPages = 18

    func loadPage(layoutID: String, pageNumber: Int, style: MushafStyle) async {
        let cacheKey = "\(layoutID):\(pageNumber):\(style.cacheSignature)"
        if let cached = Self.cachedValue(for: cacheKey) {
            attributedText = cached
            return
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            let page = try await renderedPage(layoutID: layoutID, pageNumber: pageNumber, style: style)
            guard let page else {
                attributedText = nil
                return
            }
            Self.storeCachedValue(page, for: cacheKey)
            attributedText = page
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    static func prefetchAdjacent(layoutID: String, currentPage: Int, style: MushafStyle) async {
        let pages = [currentPage - 2, currentPage - 1, currentPage + 1, currentPage + 2]
            .filter { (1...604).contains($0) }

        for pageNumber in pages {
            let key = "\(layoutID):\(pageNumber):\(style.cacheSignature)"
            if cache[key] != nil || inFlightPrefetch.contains(key) {
                continue
            }
            inFlightPrefetch.insert(key)
            let viewModel = MushafPageViewModel()
            if let rendered = try? await viewModel.renderedPage(layoutID: layoutID, pageNumber: pageNumber, style: style) {
                storeCachedValue(rendered, for: key)
            }
            inFlightPrefetch.remove(key)
        }
    }

    private func renderedPage(layoutID: String, pageNumber: Int, style: MushafStyle) async throws -> NSAttributedString? {
        let lines = try await QuranSQLiteStore.shared.fetchMushafPageLines(layoutID: layoutID, pageNumber: pageNumber)
        guard !lines.isEmpty else { return nil }

        var minWord = Int.max
        var maxWord = Int.min
        var neededSurahNumbers = Set<Int>()

        for line in lines {
            if line.lineType == .ayah,
               let firstWord = line.firstWordID,
               let lastWord = line.lastWordID {
                minWord = min(minWord, firstWord)
                maxWord = max(maxWord, lastWord)
            }
            if line.lineType == .surahName, let surahNumber = line.surahNumber {
                neededSurahNumbers.insert(surahNumber)
            }
        }

        var wordsByIndex: [Int: QuranMushafScriptWord] = [:]
        if minWord <= maxWord {
            let words = try await QuranSQLiteStore.shared.fetchMushafWords(layoutID: layoutID, from: minWord, to: maxWord)
            wordsByIndex = Dictionary(uniqueKeysWithValues: words.map { ($0.wordIndex, $0) })
        }

        var chapterNames: [Int: String] = [:]
        for number in neededSurahNumbers {
            chapterNames[number] = try await QuranSQLiteStore.shared.chapterArabicName(chapterNumber: number) ?? ""
        }

        let page = NSMutableAttributedString()
        for (idx, line) in lines.enumerated() {
            page.append(buildLine(line: line, wordsByIndex: wordsByIndex, chapterNames: chapterNames, style: style))
            if idx < lines.count - 1 {
                page.append(NSAttributedString(string: "\n"))
            }
        }
        return page
    }

    private static func cachedValue(for key: String) -> NSAttributedString? {
        guard let value = cache[key] else { return nil }
        if let idx = cacheOrder.firstIndex(of: key) {
            cacheOrder.remove(at: idx)
        }
        cacheOrder.append(key)
        return value
    }

    private static func storeCachedValue(_ value: NSAttributedString, for key: String) {
        cache[key] = value
        if let idx = cacheOrder.firstIndex(of: key) {
            cacheOrder.remove(at: idx)
        }
        cacheOrder.append(key)

        while cacheOrder.count > maxCachedPages {
            let evictKey = cacheOrder.removeFirst()
            cache.removeValue(forKey: evictKey)
        }
    }

    private func buildLine(
        line: QuranMushafPageLine,
        wordsByIndex: [Int: QuranMushafScriptWord],
        chapterNames: [Int: String],
        style: MushafStyle
    ) -> NSAttributedString {
        let fontName = "KFGQPC Uthmanic Script HAFS"
        let fontSize: CGFloat
        switch line.lineType {
        case .surahName: fontSize = 29 * style.textScale
        case .basmallah: fontSize = 32 * style.textScale
        case .ayah: fontSize = 34 * style.textScale
        }

        let font = UIFont(name: fontName, size: fontSize) ?? UIFont.systemFont(ofSize: fontSize, weight: .regular)
        let paragraphStyle = NSMutableParagraphStyle()
        paragraphStyle.baseWritingDirection = .rightToLeft
        paragraphStyle.alignment = line.isCentered ? .center : .justified
        paragraphStyle.lineBreakMode = .byWordWrapping
        paragraphStyle.lineHeightMultiple = style.lineHeight

        let baseAttributes: [NSAttributedString.Key: Any] = [
            .font: font,
            .foregroundColor: style.textColor,
            .paragraphStyle: paragraphStyle
        ]

        let rendered = NSMutableAttributedString()

        switch line.lineType {
        case .surahName:
            let title = chapterNames[line.surahNumber ?? 0] ?? ""
            rendered.append(NSAttributedString(string: title, attributes: baseAttributes))

        case .basmallah:
            rendered.append(NSAttributedString(string: MushafConstants.basmallah, attributes: baseAttributes))

        case .ayah:
            guard let firstWordID = line.firstWordID, let lastWordID = line.lastWordID else {
                return NSAttributedString(string: "", attributes: baseAttributes)
            }

            var isFirst = true
            for index in firstWordID...lastWordID {
                guard let word = wordsByIndex[index] else { continue }

                if !isFirst {
                    rendered.append(NSAttributedString(string: " ", attributes: baseAttributes))
                }
                isFirst = false

                var attributes = baseAttributes
                attributes[.ayahKey] = "\(word.surah):\(word.ayah)"
                attributes[.ayahSurah] = word.surah
                attributes[.ayahNumber] = word.ayah

                rendered.append(NSAttributedString(string: word.text, attributes: attributes))
            }
        }

        return rendered
    }
}

private struct MushafTextKitView: UIViewRepresentable {
    let attributedText: NSAttributedString
    let selectedAyahKey: String?
    let highlightColor: UIColor
    let onAyahSelected: (Int, Int) -> Void

    func makeUIView(context: Context) -> MushafTextView {
        let view = MushafTextView()
        view.onAyahSelected = onAyahSelected
        return view
    }

    func updateUIView(_ uiView: MushafTextView, context: Context) {
        uiView.onAyahSelected = onAyahSelected
        uiView.highlightColor = highlightColor
        uiView.updateText(attributedText)
        uiView.setSelectedAyah(selectedAyahKey)
    }
}

private final class MushafTextView: UITextView {
    var onAyahSelected: ((Int, Int) -> Void)?
    var highlightColor: UIColor = UIColor.systemGreen.withAlphaComponent(0.18) {
        didSet {
            highlightLayer.fillColor = highlightColor.cgColor
            redrawHighlight()
        }
    }

    private var selectedAyahKey: String?
    private let highlightLayer = CAShapeLayer()

    override init(frame: CGRect, textContainer: NSTextContainer?) {
        super.init(frame: frame, textContainer: textContainer)
        configure()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        configure()
    }

    override func layoutSubviews() {
        super.layoutSubviews()
        redrawHighlight()
    }

    func updateText(_ text: NSAttributedString) {
        if attributedText.isEqual(to: text) { return }
        attributedText = text
        textContainerInset = UIEdgeInsets(top: 16, left: 16, bottom: 24, right: 16)
        redrawHighlight()
    }

    func setSelectedAyah(_ ayahKey: String?) {
        selectedAyahKey = ayahKey
        redrawHighlight()
    }

    private func configure() {
        backgroundColor = .clear
        isEditable = false
        isSelectable = false
        isScrollEnabled = true
        textAlignment = .right
        showsVerticalScrollIndicator = false
        textContainer.lineFragmentPadding = 0

        highlightLayer.fillColor = highlightColor.cgColor
        layer.addSublayer(highlightLayer)

        let tap = UITapGestureRecognizer(target: self, action: #selector(handleTap(_:)))
        addGestureRecognizer(tap)
    }

    @objc
    private func handleTap(_ recognizer: UITapGestureRecognizer) {
        guard recognizer.state == .ended else { return }

        var point = recognizer.location(in: self)
        point.x -= textContainerInset.left
        point.y -= textContainerInset.top

        let charIndex = layoutManager.characterIndex(
            for: point,
            in: textContainer,
            fractionOfDistanceBetweenInsertionPoints: nil
        )

        guard charIndex < textStorage.length else { return }

        let attributes = textStorage.attributes(at: charIndex, effectiveRange: nil)
        guard let ayahKey = attributes[.ayahKey] as? String else { return }

        setSelectedAyah(ayahKey)

        if let surah = attributes[.ayahSurah] as? Int,
           let ayah = attributes[.ayahNumber] as? Int {
            onAyahSelected?(surah, ayah)
            return
        }

        let parts = ayahKey.split(separator: ":")
        if parts.count == 2,
           let surah = Int(parts[0]),
           let ayah = Int(parts[1]) {
            onAyahSelected?(surah, ayah)
        }
    }

    private func redrawHighlight() {
        guard let selectedAyahKey else {
            highlightLayer.path = nil
            return
        }

        let fullRange = NSRange(location: 0, length: textStorage.length)
        let path = UIBezierPath()

        textStorage.enumerateAttribute(.ayahKey, in: fullRange) { value, range, _ in
            guard let key = value as? String, key == selectedAyahKey else { return }
            let glyphRange = layoutManager.glyphRange(forCharacterRange: range, actualCharacterRange: nil)
            layoutManager.enumerateEnclosingRects(
                forGlyphRange: glyphRange,
                withinSelectedGlyphRange: NSRange(location: NSNotFound, length: 0),
                in: textContainer
            ) { rect, _ in
                let shifted = rect.offsetBy(dx: self.textContainerInset.left, dy: self.textContainerInset.top)
                let rounded = UIBezierPath(roundedRect: shifted.insetBy(dx: -1, dy: -1), cornerRadius: 5)
                path.append(rounded)
            }
        }

        highlightLayer.path = path.cgPath
    }
}

private struct MushafSettingsSheet: View {
    let language: QLanguage
    @Binding var scrollDirectionRaw: String
    @Binding var pageDesignRaw: String
    @Binding var landscapeLayoutRaw: String
    @Binding var themeRaw: String
    @Binding var showClock: Bool
    @Binding var blackBackgroundInDarkMode: Bool
    @Binding var textScale: Double
    @Binding var lineHeight: Double

    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            Form {
                Section(language.text(ar: "اتجاه التمرير", en: "Scroll Direction")) {
                    Picker("", selection: $scrollDirectionRaw) {
                        Text(language.text(ar: "أفقي", en: "Horizontal")).tag(MushafScrollDirection.horizontal.rawValue)
                        Text(language.text(ar: "عمودي", en: "Vertical")).tag(MushafScrollDirection.vertical.rawValue)
                    }
                    .pickerStyle(.segmented)
                }

                Section(language.text(ar: "تصميم الصفحة", en: "Page Design")) {
                    Picker("", selection: $pageDesignRaw) {
                        Text(language.text(ar: "كتاب", en: "Book")).tag(MushafPageDesign.book.rawValue)
                        Text(language.text(ar: "كامل الشاشة", en: "Fullscreen")).tag(MushafPageDesign.fullscreen.rawValue)
                    }
                    .pickerStyle(.segmented)
                }

                Section(language.text(ar: "تخطيط العرض الأفقي", en: "Landscape Layout")) {
                    Picker("", selection: $landscapeLayoutRaw) {
                        Text(language.text(ar: "صفحة واحدة", en: "Single")).tag(MushafLandscapeLayout.single.rawValue)
                        Text(language.text(ar: "صفحتان", en: "Double")).tag(MushafLandscapeLayout.double.rawValue)
                    }
                    .pickerStyle(.segmented)
                }

                Section(language.text(ar: "السمة", en: "Theme")) {
                    Picker("", selection: $themeRaw) {
                        Text(language.text(ar: "كلاسيكي", en: "Classic")).tag(MushafTheme.classic.rawValue)
                        Text(language.text(ar: "زمردي", en: "Emerald")).tag(MushafTheme.emerald.rawValue)
                    }
                    .pickerStyle(.segmented)
                }

                Section(language.text(ar: "الخط والتباعد", en: "Typography")) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(language.text(ar: "حجم خط المصحف", en: "Mushaf text size"))
                        Slider(value: $textScale, in: 0.82...1.35, step: 0.01)
                        Text(String(format: "%.0f%%", textScale * 100))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }

                    VStack(alignment: .leading, spacing: 8) {
                        Text(language.text(ar: "تباعد السطور", en: "Line spacing"))
                        Slider(value: $lineHeight, in: 0.9...1.35, step: 0.01)
                        Text(String(format: "%.2f", lineHeight))
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                Section(language.text(ar: "خيارات إضافية", en: "Extra Options")) {
                    Toggle(language.text(ar: "إظهار الساعة", en: "Show Clock"), isOn: $showClock)
                    Toggle(language.text(ar: "خلفية سوداء في الوضع الداكن", en: "Black Background in Dark Mode"), isOn: $blackBackgroundInDarkMode)
                }
            }
            .navigationTitle(language.text(ar: "إعدادات المصحف", en: "Quran Settings"))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button(language.text(ar: "تم", en: "Done")) {
                        dismiss()
                    }
                }
            }
        }
    }
}

private struct MushafSelection: Identifiable {
    let page: Int
    let surah: Int
    let ayah: Int

    var key: String { "\(surah):\(ayah)" }
    var id: String { "\(page):\(surah):\(ayah)" }
}

private struct MushafAyahDetailSheetLoader: View {
    let selection: MushafSelection
    let translationResourceID: String
    let tafsirResourceID: String
    let reciterID: String
    let language: QLanguage

    @State private var row: QuranVerseRow?
    @State private var chapterTitle: String = ""
    @State private var isLoading = true
    @State private var errorMessage: String?

    var body: some View {
        NavigationStack {
            Group {
                if isLoading {
                    ProgressView()
                } else if let row {
                    AyahDetailSheet(
                        row: row,
                        chapterTitle: chapterTitle,
                        language: language,
                        tafsirResourceID: tafsirResourceID,
                        reciterID: reciterID
                    )
                } else {
                    ContentUnavailableView(
                        language.text(ar: "تعذر تحميل الآية", en: "Unable to load ayah"),
                        systemImage: "exclamationmark.triangle",
                        description: Text(errorMessage ?? "")
                    )
                }
            }
        }
        .task {
            await loadAyah()
        }
    }

    private func loadAyah() async {
        isLoading = true
        defer { isLoading = false }
        do {
            row = try await QuranSQLiteStore.shared.fetchVerseRow(
                chapter: selection.surah,
                verse: selection.ayah,
                translationResourceID: translationResourceID
            )
            chapterTitle = try await QuranSQLiteStore.shared.chapterArabicName(chapterNumber: selection.surah) ?? ""
            _ = tafsirResourceID
            _ = reciterID
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
