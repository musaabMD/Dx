import SwiftUI

struct NewIntroView: View {
    @Binding var showIntro: Bool
    @State private var showPaywall = false
    @State private var page = 0
    @State private var pages: [FeaturePage] = [
        .init(title: "Smart Practice", subtitle: "Target weak areas first and improve faster."),
        .init(title: "Daily Streak", subtitle: "Stay consistent with smart reminders."),
        .init(title: "Subject Analytics", subtitle: "Track progress by every subject."),
        .init(title: "Topic Breakdown", subtitle: "See exactly where you lose marks."),
        .init(title: "Tag-Based Practice", subtitle: "Practice by tags like cardio, ethics, pharma."),
        .init(title: "Review Wrong Answers", subtitle: "Retry incorrect questions until mastery."),
        .init(title: "Flag + Bookmark", subtitle: "Save high-yield and hard questions quickly."),
        .init(title: "One-Line HY Summary", subtitle: "Revise fast before exam day."),
        .init(title: "Mock + Rank", subtitle: "Compete with others and track your rank."),
        .init(title: "Exam Ready", subtitle: "Finish strong with focused revision flow."),
    ]

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(red: 0.68, green: 0.73, blue: 0.77), AppTheme.bg], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 0) {
                HStack {
                    Spacer()
                    Button("Skip") { showPaywall = true }
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.85))
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)

                TabView(selection: $page) {
                    ForEach(Array(pages.enumerated()), id: \.offset) { index, item in
                        IntroFeaturePage(pageIndex: index + 1, total: pages.count, page: item)
                            .tag(index)
                            .padding(.horizontal, 20)
                    }
                }
                .tabViewStyle(.page(indexDisplayMode: .always))

                Button {
                    if page < pages.count - 1 { withAnimation(.easeInOut) { page += 1 } }
                    else { showPaywall = true }
                } label: {
                    Text(page == pages.count - 1 ? "Continue" : "Next")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 15)
                        .background(.black)
                        .clipShape(Capsule())
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 20)
            }
        }
        .fullScreenCover(isPresented: $showPaywall) {
            NewPaywallView()
                .onDisappear { showIntro = false }
        }
        .task {
            do {
                let remotePages = try await IntroFlowService.fetchIntroPages()
                if !remotePages.isEmpty {
                    pages = remotePages.map { .init(title: $0.title, subtitle: $0.subtitle) }
                    if page >= pages.count { page = 0 }
                }
            } catch {
                // Keep local fallback pages if remote fetch fails.
            }
        }
    }
}

private struct FeaturePage {
    let title: String
    let subtitle: String
}

private struct IntroFeaturePage: View {
    let pageIndex: Int
    let total: Int
    let page: FeaturePage

    var body: some View {
        VStack(spacing: 18) {
            Spacer(minLength: 14)

            VStack(alignment: .leading, spacing: 8) {
                Text("Feature \(pageIndex)/\(total)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.78))
                Text(page.title)
                    .font(.system(size: 44, weight: .bold, design: .rounded))
                    .foregroundStyle(.white.opacity(0.92))
                Text(page.subtitle)
                    .font(.title3.weight(.medium))
                    .foregroundStyle(.white.opacity(0.80))
                    .fixedSize(horizontal: false, vertical: true)
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            RoundedRectangle(cornerRadius: 24)
                .fill(Color.white.opacity(0.62))
                .frame(height: 250)
                .overlay {
                    VStack(spacing: 14) {
                        Capsule().fill(AppTheme.red).frame(width: 190, height: 48)
                        HStack(spacing: 12) {
                            RoundedRectangle(cornerRadius: 14).fill(.white)
                            RoundedRectangle(cornerRadius: 14).fill(.white)
                        }
                        .frame(height: 80)
                        RoundedRectangle(cornerRadius: 12).fill(.white).frame(height: 44)
                    }
                    .padding(18)
                }

            Spacer()
        }
    }
}

#Preview {
    NewIntroView(showIntro: .constant(true))
}
