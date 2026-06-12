import SwiftUI

struct BookDetailView: View {
    let book: Book

    @StateObject private var vm = BookDetailViewModel()
    @StateObject private var speech = SpeechService()

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 16) {
                headerCard
                summaryCard
                chatCard
            }
            .padding()
        }
        .background(background)
        .navigationTitle(book.title)
        .navigationBarTitleDisplayMode(.inline)
        .alert("Error", isPresented: Binding(get: { vm.errorMessage != nil }, set: { _ in vm.errorMessage = nil })) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(vm.errorMessage ?? "")
        }
    }

    private var headerCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(book.title)
                .font(.title2.bold())
            Text(book.authorsText)
                .foregroundStyle(.secondary)
            Text(book.description)
                .font(.callout)
                .foregroundStyle(.secondary)
                .lineLimit(5)
        }
        .padding()
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var summaryCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Summary")
                    .font(.headline)
                Spacer()
                Button(vm.isSummarizing ? "Working..." : "Generate") {
                    Task { await vm.generateSummary(for: book) }
                }
                .buttonStyle(.borderedProminent)
                .disabled(vm.isSummarizing)
            }

            if vm.summary.isEmpty {
                Text("Generate a summary to start.")
                    .foregroundStyle(.secondary)
            } else {
                Text(vm.summary)
                    .font(.body)

                HStack {
                    Button(speech.isSpeaking ? "Stop Audio" : "Listen") {
                        if speech.isSpeaking {
                            speech.stop()
                        } else {
                            speech.speak(vm.summary)
                        }
                    }
                    .buttonStyle(.bordered)
                }
            }
        }
        .padding()
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    private var chatCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Chat With Book")
                .font(.headline)

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

    private var background: some View {
        LinearGradient(
            colors: [Color.indigo.opacity(0.18), Color.blue.opacity(0.12), Color.white],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}
