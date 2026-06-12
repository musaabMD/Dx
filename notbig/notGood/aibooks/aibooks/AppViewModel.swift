import AVFoundation
import Combine
import Foundation

@MainActor
final class AppViewModel: ObservableObject {
    @Published var library: [Book] = []
    @Published var searchQuery = ""
    @Published var discoverResults: [Book] = []
    @Published var isSearching = false
    @Published var hasSearched = false
    @Published var searchError: String?
    @Published var selectedBook: Book?
    @Published var summary = ""
    @Published var isLoadingSummary = false
    @Published var summaryError: String?
    @Published var chatInput = ""
    @Published var chatMessages: [ChatMessage] = []
    @Published var isChatting = false

    private let googleBooksService = GoogleBooksService()
    private let openRouterService = OpenRouterService()
    private let synth = AVSpeechSynthesizer()
    private let storageKey = "savedLibraryBooks"

    init() {
        loadLibrary()
        selectedBook = library.first
    }

    func searchBooks() async {
        let query = searchQuery.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !query.isEmpty else {
            discoverResults = []
            hasSearched = false
            searchError = nil
            return
        }

        isSearching = true
        searchError = nil

        do {
            discoverResults = try await googleBooksService.searchBooks(query: query)
            hasSearched = true
        } catch {
            do {
                discoverResults = try await openRouterService.discoverBooks(query: query)
                hasSearched = true
                searchError = nil
            } catch {
                discoverResults = []
                hasSearched = true
                searchError = error.localizedDescription
            }
        }

        isSearching = false
    }

    func clearSearchState() {
        searchQuery = ""
        discoverResults = []
        hasSearched = false
        searchError = nil
        isSearching = false
    }

    func addToLibrary(_ book: Book) {
        guard !library.contains(where: { $0.id == book.id }) else { return }
        library.insert(book, at: 0)
        selectedBook = book
        summary = ""
        chatMessages = []
        persistLibrary()
    }

    func removeFromLibrary(at offsets: IndexSet) {
        for index in offsets.sorted(by: >) {
            library.remove(at: index)
        }
        if selectedBook != nil, !library.contains(where: { $0.id == selectedBook?.id }) {
            selectedBook = library.first
            summary = ""
            chatMessages = []
        }
        persistLibrary()
    }

    func generateSummaryIfNeeded() async {
        guard let selectedBook else { return }
        if !summary.isEmpty { return }
        await generateSummary(for: selectedBook)
    }

    func generateSummary(for book: Book) async {
        isLoadingSummary = true
        summaryError = nil
        do {
            summary = try await openRouterService.summarize(book: book)
        } catch {
            summary = fallbackSummary(for: book)
            let reason = (error as? LocalizedError)?.errorDescription ?? error.localizedDescription
            summaryError = "Using fallback summary. AI summary failed: \(reason)"
        }
        isLoadingSummary = false
    }

    func speakSummary() {
        guard !summary.isEmpty else { return }
        synth.stopSpeaking(at: .immediate)
        let utterance = AVSpeechUtterance(string: summary)
        utterance.voice = AVSpeechSynthesisVoice(language: "en-US")
        utterance.rate = 0.48
        synth.speak(utterance)
    }

    func stopSpeaking() {
        synth.stopSpeaking(at: .immediate)
    }

    func sendChat() async {
        guard let selectedBook else { return }
        let trimmed = chatInput.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return }

        let userMessage = ChatMessage(role: .user, text: trimmed)
        chatMessages.append(userMessage)
        chatInput = ""
        isChatting = true

        do {
            let response = try await openRouterService.chat(book: selectedBook, summary: summary, messages: chatMessages)
            chatMessages.append(ChatMessage(role: .assistant, text: response))
        } catch {
            chatMessages.append(ChatMessage(role: .assistant, text: "I couldn't reach AI chat right now. Add a valid OpenRouter key in Secrets.swift and try again."))
        }

        isChatting = false
    }

    func selectBook(_ book: Book) {
        selectedBook = book
        summary = ""
        chatMessages = []
    }

    private func persistLibrary() {
        guard let data = try? JSONEncoder().encode(library) else { return }
        UserDefaults.standard.set(data, forKey: storageKey)
    }

    private func loadLibrary() {
        guard
            let data = UserDefaults.standard.data(forKey: storageKey),
            let books = try? JSONDecoder().decode([Book].self, from: data)
        else {
            library = []
            return
        }
        library = books
    }

    private func fallbackSummary(for book: Book) -> String {
        let excerpt = String(book.description.prefix(320))
        return "\(book.title) by \(book.authorLine). \(excerpt)"
    }
}
