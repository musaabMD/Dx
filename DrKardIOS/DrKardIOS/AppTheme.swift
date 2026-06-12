// AppTheme.swift
// Shared design tokens for study shell & mock exam flows.

import SwiftUI

enum AppTheme {
    static let background = Color(red: 0.05, green: 0.05, blue: 0.10)
    static let card = Color(red: 0.10, green: 0.10, blue: 0.18)
    static let cardBright = Color(red: 0.14, green: 0.14, blue: 0.24)
    static let accent = Color(red: 0.31, green: 0.55, blue: 0.97)
    static let accentPurple = Color(red: 0.49, green: 0.34, blue: 0.96)
    static let accentGold = Color(red: 0.98, green: 0.76, blue: 0.18)
    static let border = Color.white.opacity(0.12)
    static let textPrimary = Color.white
    static let textSecondary = Color.white.opacity(0.55)
    static let success = Color(red: 0.20, green: 0.85, blue: 0.55)
    static let danger = Color(red: 0.95, green: 0.35, blue: 0.38)

    static let accentGradient = LinearGradient(
        colors: [accent, accentPurple],
        startPoint: .leading,
        endPoint: .trailing
    )

    static let backgroundGradient = LinearGradient(
        colors: [background, Color(red: 0.07, green: 0.05, blue: 0.14)],
        startPoint: .top,
        endPoint: .bottom
    )
}
