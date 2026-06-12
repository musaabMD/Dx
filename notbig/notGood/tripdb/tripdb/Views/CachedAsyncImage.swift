import SwiftUI
import UIKit
import Combine

actor ImageCache {
    static let shared = ImageCache()

    private let cache = NSCache<NSURL, UIImage>()

    private init() {
        cache.countLimit = 200
        cache.totalCostLimit = 50 * 1024 * 1024
    }

    func image(for url: URL) -> UIImage? {
        cache.object(forKey: url as NSURL)
    }

    func insert(_ image: UIImage, for url: URL) {
        cache.setObject(image, forKey: url as NSURL)
    }
}

final class ImageLoader: ObservableObject {
    @Published var image: UIImage?

    private var url: URL?
    private var task: Task<Void, Never>?

    init(url: URL?) {
        self.url = url
    }

    func update(url: URL?) {
        guard self.url != url else { return }
        self.url = url
        image = nil
        load()
    }

    func load() {
        guard let url else { return }

        task?.cancel()
        task = Task.detached(priority: .utility) { [weak self] in
            guard let self else { return }
            do {
                if let cached = await ImageCache.shared.image(for: url) {
                    await MainActor.run {
                        self.image = cached
                    }
                    return
                }
                let (data, _) = try await URLSession.shared.data(from: url)
                if Task.isCancelled { return }
                guard let uiImage = UIImage(data: data) else { return }
                await ImageCache.shared.insert(uiImage, for: url)
                await MainActor.run {
                    self.image = uiImage
                }
            } catch {
                return
            }
        }
    }

    func cancel() {
        task?.cancel()
        task = nil
    }
}

struct CachedAsyncImage<Content: View, Placeholder: View>: View {
    let url: URL?
    let content: (Image) -> Content
    let placeholder: () -> Placeholder

    @StateObject private var loader: ImageLoader

    init(
        url: URL?,
        @ViewBuilder content: @escaping (Image) -> Content,
        @ViewBuilder placeholder: @escaping () -> Placeholder
    ) {
        self.url = url
        self.content = content
        self.placeholder = placeholder
        _loader = StateObject(wrappedValue: ImageLoader(url: url))
    }

    var body: some View {
        ZStack {
            if let image = loader.image {
                content(Image(uiImage: image))
            } else {
                placeholder()
            }
        }
        .onAppear { loader.load() }
        .onChange(of: url) { newURL in
            loader.update(url: newURL)
        }
        .onDisappear { loader.cancel() }
    }
}
