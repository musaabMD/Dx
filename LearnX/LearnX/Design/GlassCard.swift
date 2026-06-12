import SwiftUI

struct GlassCard<Content: View>: View {
    private let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(DesignTokens.Spacing.l)
            .liquidGlassCard(cornerRadius: DesignTokens.Radius.card)
            .liquidFloatShadow()
    }
}
