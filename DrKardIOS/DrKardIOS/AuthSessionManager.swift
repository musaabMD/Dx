import AuthenticationServices
import CloudKit
import Combine
import Foundation
import Security

@MainActor
final class AuthSessionManager: ObservableObject {
    enum IdentityState: Equatable {
        case checking
        case signedOut
        case signedIn(displayName: String?)
        case iCloudUnavailable(String)
    }

    @Published private(set) var identityState: IdentityState = .checking
    @Published private(set) var errorMessage: String?

    private let keychain = KeychainStore(service: "hyperteam.DrKardIOS.auth")
    private let cloudService = CloudKitExamService()
    private let appleUserIDKey = "appleUserID"
    private let displayNameKey = "displayName"

    var isSignedIn: Bool {
        if case .signedIn = identityState { return true }
        return false
    }

    func configureAppleRequest(_ request: ASAuthorizationAppleIDRequest) {
        request.requestedScopes = [.fullName, .email]
    }

    func handleAppleResult(_ result: Result<ASAuthorization, Error>) {
        switch result {
        case .success(let authorization):
            guard let credential = authorization.credential as? ASAuthorizationAppleIDCredential else {
                errorMessage = "Apple did not return a usable credential."
                return
            }

            keychain.set(credential.user, for: appleUserIDKey)
            let displayName = [credential.fullName?.givenName, credential.fullName?.familyName]
                .compactMap { $0 }
                .joined(separator: " ")
            if !displayName.isEmpty {
                keychain.set(displayName, for: displayNameKey)
            }
            identityState = .signedIn(displayName: keychain.string(for: displayNameKey))
            errorMessage = nil

        case .failure(let error):
            errorMessage = error.localizedDescription
        }
    }

    func refreshIdentityState() async {
        identityState = .checking

        do {
            let status = try await cloudService.accountStatus()
            guard status == .available else {
                identityState = .iCloudUnavailable("iCloud account status is \(status.description).")
                return
            }
        } catch {
            identityState = .iCloudUnavailable(error.localizedDescription)
            return
        }

        guard let appleUserID = keychain.string(for: appleUserIDKey) else {
            identityState = .signedOut
            return
        }

        let credentialState = await appleCredentialState(for: appleUserID)
        switch credentialState {
        case .authorized:
            identityState = .signedIn(displayName: keychain.string(for: displayNameKey))
        default:
            keychain.delete(appleUserIDKey)
            identityState = .signedOut
        }
    }

    func signOut() {
        keychain.delete(appleUserIDKey)
        keychain.delete(displayNameKey)
        identityState = .signedOut
    }

    private func appleCredentialState(for userID: String) async -> ASAuthorizationAppleIDProvider.CredentialState {
        await withCheckedContinuation { continuation in
            ASAuthorizationAppleIDProvider().getCredentialState(forUserID: userID) { state, _ in
                continuation.resume(returning: state)
            }
        }
    }
}

private extension CKAccountStatus {
    var description: String {
        switch self {
        case .available: "available"
        case .couldNotDetermine: "unknown"
        case .noAccount: "no account"
        case .restricted: "restricted"
        case .temporarilyUnavailable: "temporarily unavailable"
        @unknown default: "unknown"
        }
    }
}

final class KeychainStore {
    private let service: String

    init(service: String) {
        self.service = service
    }

    func string(for account: String) -> String? {
        var query = baseQuery(account: account)
        query[kSecReturnData as String] = true
        query[kSecMatchLimit as String] = kSecMatchLimitOne

        var result: AnyObject?
        let status = SecItemCopyMatching(query as CFDictionary, &result)
        guard status == errSecSuccess,
              let data = result as? Data else {
            return nil
        }
        return String(data: data, encoding: .utf8)
    }

    func set(_ value: String, for account: String) {
        let data = Data(value.utf8)
        var query = baseQuery(account: account)
        let attributes = [kSecValueData as String: data]

        let status = SecItemUpdate(query as CFDictionary, attributes as CFDictionary)
        if status == errSecItemNotFound {
            query[kSecValueData as String] = data
            query[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
            SecItemAdd(query as CFDictionary, nil)
        }
    }

    func delete(_ account: String) {
        SecItemDelete(baseQuery(account: account) as CFDictionary)
    }

    private func baseQuery(account: String) -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: service,
            kSecAttrAccount as String: account
        ]
    }
}
