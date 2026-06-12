import SwiftUI

struct HeaderContainer<Content: View>: View {
    var headerModel: AppHeader.Model
    var showsHeader: Bool = true
    @ViewBuilder var content: () -> Content

    init(headerModel: AppHeader.Model, showsHeader: Bool = true, @ViewBuilder content: @escaping () -> Content) {
        self.headerModel = headerModel
        self.showsHeader = showsHeader
        self.content = content
    }

    var body: some View {
        ZStack(alignment: .top) {
            AppTheme.backgroundGradient
                .ignoresSafeArea()

            VStack(spacing: 0) {
                if showsHeader {
                    AppHeader(model: headerModel)
                        .zIndex(1)
                }
                // Add top padding equal to header height so content doesn't go under it
                content()
                    .padding(.top, showsHeader ? 8 : 0)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            }
        }
    }
}

#Preview {
    HeaderContainer(headerModel: .init(streak: 3, isPaid: false, creditsUsedToday: 10, rank: 42, progressPercent: 89, examName: "CFA")) {
        ScrollView {
            ForEach(0..<20, id: \.self) { i in
                Text("Row \(i)")
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(AppTheme.surface)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .padding(.horizontal)
                    .padding(.top, 8)
            }
            Spacer(minLength: 20)
        }
    }
}
