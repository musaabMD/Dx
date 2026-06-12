import SwiftUI

struct LibraryTabView: View {
    @ObservedObject var vm: AppViewModel
    @State private var showingSearchSheet = false

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()

                VStack(spacing: 12) {
                    if vm.library.isEmpty {
                        GlassCard {
                            VStack(alignment: .leading, spacing: 8) {
                                Text("Your Library Is Empty")
                                    .font(.headline)
                                Text("Go to Discover, search a title, and add your first book.")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding()
                    } else {
                        List {
                            ForEach(vm.library) { book in
                                Button {
                                    vm.selectBook(book)
                                    Task { await vm.generateSummaryIfNeeded() }
                                } label: {
                                    HStack(spacing: 10) {
                                        AsyncImage(url: book.secureThumbnailURL) { phase in
                                            switch phase {
                                            case .success(let image): image.resizable().scaledToFill()
                                            default: Color.gray.opacity(0.15)
                                            }
                                        }
                                        .frame(width: 42, height: 58)
                                        .clipShape(RoundedRectangle(cornerRadius: 8))

                                        VStack(alignment: .leading, spacing: 2) {
                                            Text(book.title).font(.subheadline).bold().lineLimit(2)
                                            Text(book.authorLine).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                                        }
                                        Spacer()
                                    }
                                    .contentShape(Rectangle())
                                }
                                .buttonStyle(.plain)
                                .listRowBackground(Color.clear)
                            }
                            .onDelete(perform: vm.removeFromLibrary)
                        }
                        .scrollContentBackground(.hidden)
                        .background(Color.clear)
                    }

                    if let selected = vm.selectedBook {
                        BookDetailPanel(book: selected, vm: vm)
                            .padding(.horizontal)
                            .padding(.bottom, 8)
                    }
                }
            }
            .navigationTitle("Library")
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button {
                        vm.clearSearchState()
                        showingSearchSheet = true
                    } label: {
                        Image(systemName: "plus")
                    }
                    .accessibilityLabel("Find and add book")
                }
            }
            .sheet(isPresented: $showingSearchSheet) {
                BookSearchSheetView(vm: vm)
            }
        }
    }
}

private struct BookDetailPanel: View {
    let book: Book
    @ObservedObject var vm: AppViewModel

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Text(book.title)
                        .font(.headline)
                        .lineLimit(2)
                    Spacer()
                    Button("Summarize") {
                        Task { await vm.generateSummary(for: book) }
                    }
                    .buttonStyle(.borderedProminent)
                }

                if vm.isLoadingSummary {
                    ProgressView("Generating summary...")
                } else {
                    ScrollView {
                        Text(vm.summary.isEmpty ? "Tap Summarize to generate AI summary." : vm.summary)
                            .font(.subheadline)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(maxHeight: 110)
                }

                if let err = vm.summaryError {
                    Text(err).font(.caption).foregroundStyle(.secondary)
                }

                HStack {
                    Button("Listen") { vm.speakSummary() }
                        .buttonStyle(.bordered)
                    Button("Stop") { vm.stopSpeaking() }
                        .buttonStyle(.bordered)
                }

                Divider()

                ScrollView {
                    VStack(alignment: .leading, spacing: 8) {
                        ForEach(vm.chatMessages) { message in
                            HStack {
                                if message.role == .assistant { Spacer(minLength: 24) }
                                Text(message.text)
                                    .padding(10)
                                    .background(message.role == .user ? Color.blue.opacity(0.2) : Color.gray.opacity(0.18))
                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                if message.role == .user { Spacer(minLength: 24) }
                            }
                        }
                    }
                }
                .frame(height: 150)

                HStack {
                    TextField("Chat with this book...", text: $vm.chatInput)
                        .textFieldStyle(.roundedBorder)
                    Button(vm.isChatting ? "..." : "Send") {
                        Task { await vm.sendChat() }
                    }
                    .disabled(vm.isChatting)
                }
            }
        }
    }
}

private struct BookSearchSheetView: View {
    @ObservedObject var vm: AppViewModel
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()

                VStack(spacing: 14) {
                    GlassCard {
                        HStack {
                            TextField("Type a book title or author", text: $vm.searchQuery)
                                .textFieldStyle(.plain)
                                .submitLabel(.search)
                                .onSubmit {
                                    Task { await vm.searchBooks() }
                                }
                            Button("Find") {
                                Task { await vm.searchBooks() }
                            }
                            .buttonStyle(.borderedProminent)
                        }
                    }
                    .padding(.horizontal)

                    if vm.isSearching {
                        ProgressView("Searching books...")
                            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
                            .padding(.top, 24)
                    } else if let searchError = vm.searchError {
                        GlassCard {
                            Text("Search failed: \(searchError)")
                                .font(.subheadline)
                        }
                        .padding(.horizontal)
                    } else if vm.hasSearched && vm.discoverResults.isEmpty {
                        GlassCard {
                            Text("No results found. Try a different title or author.")
                                .font(.subheadline)
                        }
                        .padding(.horizontal)
                    } else {
                        List(vm.discoverResults) { book in
                            HStack(spacing: 10) {
                                AsyncImage(url: book.secureThumbnailURL) { phase in
                                    switch phase {
                                    case .success(let image): image.resizable().scaledToFill()
                                    default: Color.gray.opacity(0.12)
                                    }
                                }
                                .frame(width: 42, height: 58)
                                .clipShape(RoundedRectangle(cornerRadius: 8))

                                VStack(alignment: .leading, spacing: 2) {
                                    Text(book.title).font(.subheadline).bold().lineLimit(2)
                                    Text(book.authorLine).font(.caption).foregroundStyle(.secondary).lineLimit(1)
                                }

                                Spacer()

                                Button("Add") {
                                    vm.addToLibrary(book)
                                    dismiss()
                                }
                                .buttonStyle(.bordered)
                            }
                            .listRowBackground(Color.clear)
                        }
                        .listStyle(.plain)
                        .scrollContentBackground(.hidden)
                        .background(Color.clear)
                    }
                }
                .padding(.top, 8)
            }
            .navigationTitle("Find Book")
            .toolbar {
                ToolbarItem(placement: .automatic) {
                    Button("Close") {
                        dismiss()
                    }
                }
            }
        }
    }
}
