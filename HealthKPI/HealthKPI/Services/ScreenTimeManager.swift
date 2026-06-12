import Foundation
import SwiftUI
import Combine

#if canImport(FamilyControls)
import FamilyControls
#endif

/// Wraps Apple's Screen Time authorization (`FamilyControls`) so the rest of
/// the app can read a single `authState` and trigger a connect flow without
/// caring about SDK availability.
///
/// On simulators or devices where FamilyControls isn't available the manager
/// stays in `.unavailable` and the UI shows a disabled state.
@MainActor
final class ScreenTimeManager: ObservableObject {

    // MARK: - Auth State

    enum AuthState: Equatable {
        case unknown        // never asked
        case unavailable    // SDK / device doesn't support Screen Time
        case denied         // user declined
        case authorized     // ready to read / restrict
    }

    @Published private(set) var authState: AuthState = .unknown
    @Published private(set) var lastConnected: Date?

    // MARK: - Init

    init() {
        refreshAuthState()
    }

    // MARK: - Public API

    /// Ask the user for Screen Time (FamilyControls) authorization.
    /// Safe to call repeatedly — iOS will only present the prompt once per
    /// device unless authorization was explicitly revoked in Settings.
    func requestAuthorization() async {
        #if canImport(FamilyControls) && !targetEnvironment(simulator)
        do {
            try await AuthorizationCenter.shared.requestAuthorization(for: .individual)
            refreshAuthState()
            if authState == .authorized {
                lastConnected = Date()
            }
        } catch {
            // User declined, or the system couldn't present the prompt.
            authState = .denied
        }
        #else
        // FamilyControls isn't usable on the simulator and isn't available
        // in the current SDK — keep the UI in a sane state.
        authState = .unavailable
        #endif
    }

    /// Re-reads the current authorization status from the system.
    func refreshAuthState() {
        #if canImport(FamilyControls) && !targetEnvironment(simulator)
        switch AuthorizationCenter.shared.authorizationStatus {
        case .approved:     authState = .authorized
        case .denied:       authState = .denied
        case .notDetermined: authState = .unknown
        @unknown default:   authState = .unknown
        }
        #else
        authState = .unavailable
        #endif
    }
}
