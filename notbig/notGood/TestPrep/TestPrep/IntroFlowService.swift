import Foundation
import ConvexMobile
import Combine

struct IntroPageDTO: Decodable {
    let title: String
    let subtitle: String
}

enum IntroFlowService {
    static func fetchText(for key: String) async throws -> String {
        try await withCheckedThrowingContinuation { continuation in
            var cancellable: AnyCancellable?
            cancellable = ConvexConfig.client
                .subscribe(to: "introflow:getIntroText", with: ["key": key], yielding: String.self)
                .first()
                .sink(
                    receiveCompletion: { completion in
                        if case let .failure(error) = completion {
                            continuation.resume(throwing: error)
                        }
                        cancellable?.cancel()
                        cancellable = nil
                    },
                    receiveValue: { value in
                        continuation.resume(returning: value)
                    }
                )
        }
    }

    static func fetchIntroPages() async throws -> [IntroPageDTO] {
        try await withCheckedThrowingContinuation { continuation in
            var cancellable: AnyCancellable?
            cancellable = ConvexConfig.client
                .subscribe(to: "introflow:getIntroPages", with: [:], yielding: [IntroPageDTO].self)
                .first()
                .sink(
                    receiveCompletion: { completion in
                        if case let .failure(error) = completion {
                            continuation.resume(throwing: error)
                        }
                        cancellable?.cancel()
                        cancellable = nil
                    },
                    receiveValue: { value in
                        continuation.resume(returning: value)
                    }
                )
        }
    }
}
