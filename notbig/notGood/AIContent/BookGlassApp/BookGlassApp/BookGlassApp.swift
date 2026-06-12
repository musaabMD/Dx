import SwiftUI
import AVFoundation

@main
struct BookGlassApp: App {
    var body: some Scene {
        WindowGroup {
            RootTabView()
        }
    }
}

enum AppConfig {
    static var openRouterAPIKey: String {
        Bundle.main.object(forInfoDictionaryKey: "OPENROUTER_API_KEY") as? String ?? ""
    }

    static var googleBooksAPIKey: String {
        Bundle.main.object(forInfoDictionaryKey: "GOOGLE_BOOKS_API_KEY") as? String ?? ""
    }
}

struct Book: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let authors: [String]
    let description: String
    let thumbnailURL: String?

    var authorsText: String { authors.isEmpty ? "Unknown Author" : authors.joined(separator: ", ") }
}

struct ChatMessage: Identifiable, Hashable {
    let id = UUID()
    let role: Role
    let content: String

    enum Role: String {
        case user
        case assistant
    }
}

struct GoogleBooksResponse: Decodable {
    let items: [VolumeItem]?
}

struct VolumeItem: Decodable {
    let id: String
    let volumeInfo: VolumeInfo
}

struct VolumeInfo: Decodable {
    let title: String
    let authors: [String]?
    let description: String?
    let imageLinks: ImageLinks?
}

struct ImageLinks: Decodable {
    let thumbnail: String?
}

struct GoogleBooksService {
    func searchBooks(query: String) async throws -> [Book] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }

        var components = URLComponents(string: "https://www.googleapis.com/books/v1/volumes")!
        components.queryItems = [
            URLQueryItem(name: "q", value: trimmed),
            URLQueryItem(name: "maxResults", value: "20"),
            URLQueryItem(name: "key", value: AppConfig.googleBooksAPIKey)
        ]

        let (data, response) = try await URLSession.shared.data(from: components.url!)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoded = try JSONDecoder().decode(GoogleBooksResponse.self, from: data)
        return (decoded.items ?? []).map {
            Book(
                id: $0.id,
                title: $0.volumeInfo.title,
                authors: $0.volumeInfo.authors ?? [],
                description: $0.volumeInfo.description ?? "No description available.",
                thumbnailURL: $0.volumeInfo.imageLinks?.thumbnail
            )
        }
    }
}

struct OpenRouterService {
    private let endpoint = URL(string: "https://openrouter.ai/api/v1/chat/completions")!
    private let model = "openai/gpt-4o-mini"

    func generateSummary(for book: Book) async throws -> String {
        let prompt = """
        Give a clean, engaging summary of this book in 6-10 short paragraphs.
        Include: core theme, key ideas, and who should read it.

        Title: \(book.title)
        Authors: \(book.authorsText)
        Description: \(book.description)
        """

        return try await send(messages: [
            .init(role: "system", content: "You summarize books clearly and accurately."),
            .init(role: "user", content: prompt)
        ])
    }

    func chat(book: Book, history: [ChatMessage]) async throws -> String {
        var messages: [Message] = [
            .init(role: "system", content: "You are a helpful reading companion. Discuss only this book with grounded, practical insights."),
            .init(role: "system", content: "Book context: Title=\(book.title), Authors=\(book.authorsText), Description=\(book.description)")
        ]

        messages.append(contentsOf: history.map { .init(role: $0.role.rawValue, content: $0.content) })
        return try await send(messages: messages)
    }

    private func send(messages: [Message]) async throws -> String {
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(AppConfig.openRouterAPIKey)", forHTTPHeaderField: "Authorization")

        let body = RequestBody(model: model, messages: messages, temperature: 0.7)
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            let serverError = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw NSError(domain: "OpenRouter", code: 1, userInfo: [NSLocalizedDescriptionKey: serverError])
        }

        let decoded = try JSONDecoder().decode(OpenRouterResponse.self, from: data)
        return decoded.choices.first?.message.content.trimmingCharacters(in: .whitespacesAndNewlines) ?? "No response"
    }
}

private struct RequestBody: Encodable {
    let model: String
    let messages: [Message]
    let temperature: Double
}

private struct Message: Codable {
    let role: String
    let content: String
}

private struct OpenRouterResponse: Decodable {
    let choices: [Choice]
}

private struct Choice: Decodable {
    let message: Message
}

final class SpeechService: NSObject, ObservableObject {
    private let synthesizer = AVSpeechSynthesizer()
    @Published var isSpeaking = false

    override init() {
        super.init()
        synthesizer.delegate = self
    }

    func speak(_ text: String) {
        guard !text.isEmpty else { return }
        if synthesizer.isSpeaking { synthesizer.stopSpeaking(at: .immediate) }
        let utterance = AVSpeechUtterance(string: text)
        utterance.rate = 0.5
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        synthesizer.speak(utterance)
    }

    func stop() { synthesizer.stopSpeaking(at: .immediate) }
}

extension SpeechService: AVSpeechSynthesizerDelegate {
    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didStart utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { self.isSpeaking = true }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didFinish utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { self.isSpeaking = false }
    }

    func speechSynthesizer(_ synthesizer: AVSpeechSynthesizer, didCancel utterance: AVSpeechUtterance) {
        DispatchQueue.main.async { self.isSpeaking = false }
    }
}

@MainActor
final class LibraryViewModel: ObservableObject {
    @Published private(set) var books: [Book] = []
    private let storageKey = "book_library_v1"

    init() { load() }

    func add(_ book: Book) {
        guard !books.contains(where: { $0.id == book.id }) else { return }
        books.insert(book, at: 0)
        persist()
    }

    func remove(_ book: Book) {
        books.removeAll { $0.id == book.id }
        persist()
    }

    private func persist() {
        if let encoded = try? JSONEncoder().encode(books) {
            UserDefaults.standard.set(encoded, forKey: storageKey)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([Book].self, from: data) else { return }
        books = decoded
    }
}

@MainActor
final class DiscoverViewModel: ObservableObject {
    @Published var query = ""
    @Published private(set) var results: [Book] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?
    private let service = GoogleBooksService()

    func search() async {
        guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            results = []
            return
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            results = try await service.searchBooks(query: query)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

@MainActor
final class BookDetailViewModel: ObservableObject {
    @Published var summary = ""
    @Published var isSummarizing = false
    @Published var chatMessages: [ChatMessage] = []
    @Published var chatInput = ""
    @Published var isChatLoading = false
    @Published var errorMessage: String?

    private let openRouter = OpenRouterService()

    func generateSummary(for book: Book) async {
        isSummarizing = true
        errorMessage = nil
        defer { isSummarizing = false }

        do {
            summary = try await openRouter.generateSummary(for: book)
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    func sendMessage(for book: Book) async {
        let input = chatInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !input.isEmpty else { return }

        chatInput = ""
        chatMessages.append(ChatMessage(role: .user, content: input))
        isChatLoading = true
        errorMessage = nil
        defer { isChatLoading = false }

        do {
            let answer = try await openRouter.chat(book: book, history: chatMessages)
            chatMessages.append(ChatMessage(role: .assistant, content: answer))
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}

struct RootTabView: View {
    @StateObject private var libraryVM = LibraryViewModel()

    var body: some View {
        TabView {
            NavigationStack { LibraryView(libraryVM: libraryVM) }
                .tabItem { Label("Library", systemImage: "books.vertical") }

            NavigationStack { DiscoverView(libraryVM: libraryVM) }
                .tabItem { Label("Discover", systemImage: "sparkles") }

            NavigationStack { UpgradeView() }
                .tabItem { Label("Upgrade", systemImage: "crown") }
        }
    }
}

struct LibraryView: View {
    @ObservedObject var libraryVM: LibraryViewModel

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.teal.opacity(0.22), Color.blue.opacity(0.15), Color.white], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            if libraryVM.books.isEmpty {
                ContentUnavailableView("Your Library Is Empty", systemImage: "books.vertical", description: Text("Go to Discover, search a book, and add it."))
            } else {
                List {
                    ForEach(libraryVM.books) { book in
                        NavigationLink {
                            BookDetailView(book: book)
                        } label: {
                            HStack(spacing: 12) {
                                AsyncImage(url: URL(string: book.thumbnailURL ?? "")) { image in
                                    image.resizable().scaledToFill()
                                } placeholder: {
                                    Color.gray.opacity(0.2)
                                }
                                .frame(width: 48, height: 64)
                                .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

                                VStack(alignment: .leading, spacing: 4) {
                                    Text(book.title).font(.headline).lineLimit(2)
                                    Text(book.authorsText).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
                                }
                            }
                            .padding(10)
                            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                        }
                        .listRowBackground(Color.clear)
                    }
                    .onDelete { indexSet in
                        indexSet.map { libraryVM.books[$0] }.forEach(libraryVM.remove)
                    }
                }
                .scrollContentBackground(.hidden)
                .background(Color.clear)
            }
        }
        .navigationTitle("Library")
    }
}

struct DiscoverView: View {
    @StateObject private var vm = DiscoverViewModel()
    @ObservedObject var libraryVM: LibraryViewModel

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.cyan.opacity(0.2), Color.mint.opacity(0.16), Color.white], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            VStack(spacing: 12) {
                HStack {
                    TextField("Type a book name", text: $vm.query)
                        .textFieldStyle(.roundedBorder)
                    Button("Search") { Task { await vm.search() } }
                        .buttonStyle(.borderedProminent)
                }
                .padding(.horizontal)

                if vm.isLoading { ProgressView("Searching...") }

                if let error = vm.errorMessage {
                    Text(error).foregroundStyle(.red).font(.footnote).padding(.horizontal)
                }

                List(vm.results) { book in
                    VStack(alignment: .leading, spacing: 10) {
                        HStack(spacing: 12) {
                            AsyncImage(url: URL(string: book.thumbnailURL ?? "")) { image in
                                image.resizable().scaledToFill()
                            } placeholder: {
                                Color.gray.opacity(0.2)
                            }
                            .frame(width: 42, height: 58)
                            .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                            VStack(alignment: .leading, spacing: 4) {
                                Text(book.title).font(.headline).lineLimit(2)
                                Text(book.authorsText).font(.subheadline).foregroundStyle(.secondary).lineLimit(1)
                            }
                        }

                        HStack {
                            NavigationLink("Open") { BookDetailView(book: book) }
                                .buttonStyle(.bordered)
                            Spacer()
                            Button("Add to Library") { libraryVM.add(book) }
                                .buttonStyle(.borderedProminent)
                        }
                    }
                    .padding(12)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .listRowBackground(Color.clear)
                }
                .scrollContentBackground(.hidden)
                .background(Color.clear)
            }
        }
        .navigationTitle("Discover")
    }
}

struct BookDetailView: View {
    let book: Book
    @StateObject private var vm = BookDetailViewModel()
    @StateObject private var speech = SpeechService()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                VStack(alignment: .leading, spacing: 8) {
                    Text(book.title).font(.title2.bold())
                    Text(book.authorsText).foregroundStyle(.secondary)
                    Text(book.description).font(.callout).foregroundStyle(.secondary).lineLimit(5)
                }
                .padding()
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))

                VStack(alignment: .leading, spacing: 10) {
                    HStack {
                        Text("Summary").font(.headline)
                        Spacer()
                        Button(vm.isSummarizing ? "Working..." : "Generate") {
                            Task { await vm.generateSummary(for: book) }
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(vm.isSummarizing)
                    }

                    if vm.summary.isEmpty {
                        Text("Generate a summary to start.").foregroundStyle(.secondary)
                    } else {
                        Text(vm.summary).font(.body)
                        Button(speech.isSpeaking ? "Stop Audio" : "Listen") {
                            if speech.isSpeaking { speech.stop() } else { speech.speak(vm.summary) }
                        }
                        .buttonStyle(.bordered)
                    }
                }
                .padding()
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))

                VStack(alignment: .leading, spacing: 10) {
                    Text("Chat With Book").font(.headline)

                    ForEach(vm.chatMessages) { message in
                        HStack {
                            if message.role == .assistant {
                                Text(message.content)
                                    .padding(10)
                                    .background(Color.white.opacity(0.7), in: RoundedRectangle(cornerRadius: 12))
                                Spacer()
                            } else {
                                Spacer()
                                Text(message.content)
                                    .padding(10)
                                    .foregroundStyle(.white)
                                    .background(Color.blue, in: RoundedRectangle(cornerRadius: 12))
                            }
                        }
                    }

                    HStack {
                        TextField("Ask about this book...", text: $vm.chatInput)
                            .textFieldStyle(.roundedBorder)
                        Button(vm.isChatLoading ? "..." : "Send") {
                            Task { await vm.sendMessage(for: book) }
                        }
                        .buttonStyle(.borderedProminent)
                        .disabled(vm.isChatLoading)
                    }
                }
                .padding()
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
            }
            .padding()
        }
        .background(LinearGradient(colors: [Color.indigo.opacity(0.18), Color.blue.opacity(0.12), Color.white], startPoint: .topLeading, endPoint: .bottomTrailing).ignoresSafeArea())
        .navigationTitle(book.title)
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: Binding(get: { vm.errorMessage != nil }, set: { _ in vm.errorMessage = nil })) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(vm.errorMessage ?? "")
        }
    }
}

struct UpgradeView: View {
    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.blue.opacity(0.25), Color.cyan.opacity(0.2), Color.white], startPoint: .topLeading, endPoint: .bottomTrailing)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                Text("Upgrade").font(.largeTitle.bold())
                Text("Unlock unlimited summaries, deeper chat context, and premium voices.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)
                Button("Go Premium") {}
                    .buttonStyle(.borderedProminent)
            }
            .padding()
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .padding()
        }
    }
}
