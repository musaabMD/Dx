import SwiftUI

struct DiscoverView: View {
    @StateObject private var vm = DiscoverViewModel()
    @ObservedObject var libraryVM: LibraryViewModel

    var body: some View {
        ZStack {
            background

            VStack(spacing: 12) {
                HStack {
                    TextField("Type a book name", text: $vm.query)
                        .textFieldStyle(.roundedBorder)

                    Button("Search") {
                        Task { await vm.search() }
                    }
                    .buttonStyle(.borderedProminent)
                }
                .padding(.horizontal)

                if vm.isLoading {
                    ProgressView("Searching...")
                        .padding(.top, 8)
                }

                if let error = vm.errorMessage {
                    Text(error)
                        .foregroundStyle(.red)
                        .font(.footnote)
                        .padding(.horizontal)
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
                            NavigationLink("Open") {
                                BookDetailView(book: book)
                            }
                            .buttonStyle(.bordered)

                            Spacer()

                            Button("Add to Library") {
                                libraryVM.add(book)
                            }
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

    private var background: some View {
        LinearGradient(
            colors: [Color.cyan.opacity(0.2), Color.mint.opacity(0.16), Color.white],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}
