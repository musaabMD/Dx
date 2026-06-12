import Foundation

enum AppConfig {
    static var openRouterAPIKey: String {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "OPENROUTER_API_KEY") as? String,
              !key.isEmpty else {
            fatalError("Missing OPENROUTER_API_KEY in Info.plist")
        }
        return key
    }

    static var googleBooksAPIKey: String {
        guard let key = Bundle.main.object(forInfoDictionaryKey: "GOOGLE_BOOKS_API_KEY") as? String,
              !key.isEmpty else {
            fatalError("Missing GOOGLE_BOOKS_API_KEY in Info.plist")
        }
        return key
    }
}
