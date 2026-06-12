import SwiftUI

struct LibraryView: View {
    @ObservedObject var libraryVM: LibraryViewModel

    var body: some View {
        ZStack {
            background

            if libraryVM.books.isEmpty {
                ContentUnavailableView(
                    "Your Library Is Empty",
                    systemImage: "books.vertical",
                    description: Text("Go to Discover, search a book, and add it.")
                )
            } else {
                List {
                    ForEach(libraryVM.books) { book in
                        NavigationLink {
                            BookDetailView(book: book)
                        } label: {
                            BookRow(book: book)
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

    private var background: some View {
        LinearGradient(
            colors: [Color.teal.opacity(0.22), Color.blue.opacity(0.15), Color.white],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}

private struct BookRow: View {
    let book: Book

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: URL(string: book.thumbnailURL ?? "")) { image in
                image.resizable().scaledToFill()
            } placeholder: {
                Color.gray.opacity(0.2)
            }
            .frame(width: 48, height: 64)
            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(book.title)
                    .font(.headline)
                    .lineLimit(2)
                Text(book.authorsText)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
            }
        }
        .padding(10)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
    }
}
