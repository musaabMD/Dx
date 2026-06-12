import SwiftUI

struct CourseDetailView: View {
    let full: CourseDetail

    private var detail: CourseSummary { full.summary }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                heroCard

                SectionHeader(title: "Lessons", count: full.lessons.count)

                VStack(spacing: 10) {
                    ForEach(Array(full.lessons.enumerated()), id: \.element.id) { idx, lesson in
                        NavigationLink {
                            LessonReadingView(courseTitle: full.summary.title, lessonIndex: idx + 1, lesson: lesson)
                        } label: {
                            LessonRow(
                                index: idx + 1,
                                lesson: lesson,
                                isCompleted: Double(idx + 1) / Double(full.lessons.count) < detail.progress
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }

                shareCard
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .liquidAppBackground()
        .navigationTitle(detail.title)
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
    }

    private var heroCard: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [
                    DesignTokens.ColorToken.brand.opacity(0.95),
                    DesignTokens.ColorToken.brandMid,
                    DesignTokens.ColorToken.brandDeep.opacity(0.72),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Circle()
                .fill(Color.white.opacity(0.1))
                .frame(width: 160, height: 160)
                .offset(x: 200, y: -50)

            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    Text(detail.emoji)
                        .font(.system(size: 44))
                    Spacer()
                    if detail.isPublic {
                        Label("Public", systemImage: "globe")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .liquidGlassCapsule()
                    } else {
                        Label("Private", systemImage: "lock.fill")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 6)
                            .liquidGlassCapsule()
                    }
                }

                Text(detail.title)
                    .font(.title2.weight(.bold))
                    .foregroundStyle(.white)
                    .lineLimit(2)

                FlowMetaRow(
                    items: metaItems
                )

                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("\(Int(detail.progress * 100))% complete")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.white.opacity(0.9))
                        Spacer()
                        if let score = detail.averageScore {
                            Label("\(score)%", systemImage: "star.fill")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(.white.opacity(0.95))
                        }
                    }
                    ProgressView(value: detail.progress)
                        .tint(.white)
                }
            }
            .padding(20)
        }
        .clipShape(RoundedRectangle(cornerRadius: LiquidGlass.cardRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: LiquidGlass.cardRadius, style: .continuous)
                .strokeBorder(Color.white.opacity(0.28), lineWidth: 1)
        }
        .liquidFloatShadow()
    }

    private var metaItems: [String] {
        var items = [detail.style.displayName, "\(detail.estimatedMinutes) min"]
        if let views = detail.views, detail.isPublic {
            items.append("\(views.formatted()) views")
        }
        return items
    }

    private var shareCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Share link", systemImage: "square.and.arrow.up")
                .font(.headline)

            Text("learnx.app/c/\(detail.id.uuidString.prefix(8))")
                .font(.caption.monospaced())
                .foregroundStyle(.secondary)

            Text(detail.isPublic ? "Anyone with the link can open this course on the web." : "Only people you invite can access this course.")
                .font(.subheadline)
                .foregroundStyle(.secondary)

            Button("Copy link") {}
                .font(.body.weight(.semibold))
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: LiquidGlass.controlRadius, style: .continuous))
                .disabled(true)
                .opacity(0.55)
        }
        .padding(18)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }
}

// Simple wrapping meta chips without heavy pills
private struct FlowMetaRow: View {
    let items: [String]

    var body: some View {
        HStack(spacing: 8) {
            ForEach(items, id: \.self) { text in
                Text(text)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.white.opacity(0.95))
                    .padding(.horizontal, 10)
                    .padding(.vertical, 5)
                    .background(Color.white.opacity(0.18), in: Capsule())
            }
        }
    }
}

private struct LessonRow: View {
    let index: Int
    let lesson: LessonDetail
    let isCompleted: Bool

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                if isCompleted {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title2)
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(DesignTokens.ColorToken.success)
                } else {
                    Text("\(index)")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(DesignTokens.ColorToken.brand)
                        .frame(width: 32, height: 32)
                        .background(.thinMaterial, in: Circle())
                }
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(lesson.title)
                    .font(.headline)
                    .lineLimit(2)
                Label("\(lesson.exercises.count) exercises", systemImage: "doc.text")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.tertiary)
        }
        .padding(16)
        .liquidGlassCard(cornerRadius: 18)
        .liquidFloatShadow()
    }
}
