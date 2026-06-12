import Foundation

struct ExamContentCache {
    private let fileName = "exam-content-cache.json"

    private var cacheURL: URL? {
        FileManager.default.urls(for: .cachesDirectory, in: .userDomainMask).first?.appendingPathComponent(fileName)
    }

    func load() throws -> ExamContentBundle? {
        guard let cacheURL, FileManager.default.fileExists(atPath: cacheURL.path) else {
            return nil
        }

        let data = try Data(contentsOf: cacheURL)
        return try JSONDecoder().decode(ExamContentBundle.self, from: data)
    }

    func save(_ bundle: ExamContentBundle) throws {
        guard let cacheURL else { return }
        let data = try JSONEncoder().encode(bundle)
        try data.write(to: cacheURL, options: [.atomic])
    }
}
