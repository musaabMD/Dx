# BookGlass SwiftUI App

SwiftUI iOS app scaffold with Apple-style glass UI:
- Tabs: `Library`, `Discover`, `Upgrade`
- Search books with Google Books API
- Add selected books to personal library (persisted in `UserDefaults`)
- Generate summary with OpenRouter
- Listen to summary with text-to-speech
- Chat with the selected book

## Add to Xcode
1. Create a new iOS App in Xcode (SwiftUI).
2. Copy all files from `BookGlass/` into your app target.
3. Add these keys to your app `Info.plist`:
   - `OPENROUTER_API_KEY`
   - `GOOGLE_BOOKS_API_KEY`
4. Run.

## Notes
- Keep API keys out of git and production binaries when possible.
- Replace the model in `OpenRouterService.swift` if you prefer another OpenRouter model.
