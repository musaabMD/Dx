import Foundation

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
