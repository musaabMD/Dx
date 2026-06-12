import SwiftUI

struct DiscoverTabView: View {
    @ObservedObject var vm: AppViewModel

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
            .navigationTitle("Discover")
        }
    }
}
