import SwiftUI

struct LibraryView: View {
    @EnvironmentObject private var shell: AppShellViewModel

    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<12:  return "Good morning"
        case 12..<17: return "Good afternoon"
        case 17..<21: return "Good evening"
        default:      return "Good night"
        }
    }

    private var firstName: String {
        shell.profile.name.components(separatedBy: " ").first ?? shell.profile.name
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                Text("\(greeting), \(firstName)")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)

                if let topCourse = shell.courses.sorted(by: { $0.progress > $1.progress }).first,
                   topCourse.progress > 0 {
                    continueLearningSection(course: topCourse)
                }

                if !shell.courses.isEmpty {
                    SectionHeader(title: "My courses", count: shell.courses.count)

                    VStack(spacing: 12) {
                        ForEach(shell.courses) { course in
                            NavigationLink {
                                if let detail = shell.courseDetail(id: course.id) {
                                    CourseDetailView(full: detail)
                                }
                            } label: {
                                CourseCard(course: course)
                            }
                            .buttonStyle(.plain)
                        }
                    }
                } else {
                    emptyState
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 28)
        }
        .liquidAppBackground()
        .navigationTitle("Courses")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                HStack(spacing: 4) {
                    Image(systemName: "flame.fill")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(DesignTokens.ColorToken.streak)
                    Text("\(shell.profile.streakDays)")
                        .font(.subheadline.weight(.semibold))
                }
                .padding(.horizontal, 12)
                .padding(.vertical, 6)
                .liquidGlassCapsule()
            }
        }
        .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
    }

    private func continueLearningSection(course: CourseSummary) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Continue")
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            NavigationLink {
                if let detail = shell.courseDetail(id: course.id) {
                    CourseDetailView(full: detail)
                }
            } label: {
                ContinueLearningCard(course: course, detail: shell.courseDetail(id: course.id))
            }
            .buttonStyle(.plain)
        }
    }

    private var emptyState: some View {
        VStack(spacing: 16) {
            Image(systemName: "sparkles")
                .font(.largeTitle)
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(DesignTokens.ColorToken.brand)
                .frame(width: 72, height: 72)
                .liquidGlassCard(cornerRadius: 22)
                .liquidFloatShadow()

            VStack(spacing: 6) {
                Text("No courses yet")
                    .font(.title3.weight(.semibold))
                Text("Use the Create tab to generate your first course.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }
}

// MARK: - Continue Learning Card
private struct ContinueLearningCard: View {
    let course: CourseSummary
    let detail: CourseDetail?

    private var subtitle: String {
        guard let d = detail, !d.lessons.isEmpty else {
            return "\(Int(course.progress * 100))% complete"
        }
        let total = d.lessons.count
        let done = min(total, Int(round(course.progress * Double(total))))
        let next = min(total, max(1, done + 1))
        return "Lesson \(next) of \(total)"
    }

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            LinearGradient(
                colors: [
                    DesignTokens.ColorToken.brand.opacity(0.92),
                    DesignTokens.ColorToken.brandMid.opacity(0.88),
                    DesignTokens.ColorToken.brandDeep.opacity(0.75),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Circle()
                .fill(Color.white.opacity(0.12))
                .frame(width: 140, height: 140)
                .offset(x: 220, y: -36)

            VStack(alignment: .leading, spacing: 12) {
                HStack(alignment: .top) {
                    Text(course.emoji)
                        .font(.system(size: 40))
                    Spacer()
                    Image(systemName: "play.circle.fill")
                        .font(.title2)
                        .symbolRenderingMode(.hierarchical)
                        .foregroundStyle(.white.opacity(0.95))
                }

                Text(course.title)
                    .font(.headline)
                    .foregroundStyle(.white)
                    .lineLimit(2)

                Text(subtitle)
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.white.opacity(0.85))

                ProgressView(value: course.progress)
                    .tint(.white)
                    .scaleEffect(x: 1, y: 0.85, anchor: .center)
            }
            .padding(20)
        }
        .frame(height: 168)
        .clipShape(RoundedRectangle(cornerRadius: LiquidGlass.cardRadius, style: .continuous))
        .overlay {
            RoundedRectangle(cornerRadius: LiquidGlass.cardRadius, style: .continuous)
                .strokeBorder(Color.white.opacity(0.28), lineWidth: 1)
        }
        .liquidFloatShadow()
    }
}

// MARK: - Course Card
struct CourseCard: View {
    let course: CourseSummary

    var body: some View {
        HStack(spacing: 14) {
            Text(course.emoji)
                .font(.system(size: 32))
                .frame(width: 52, height: 52)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

            VStack(alignment: .leading, spacing: 6) {
                Text(course.title)
                    .font(.headline)
                    .foregroundStyle(.primary)
                    .lineLimit(1)

                HStack(spacing: 6) {
                    Text(course.style.displayName)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(DesignTokens.ColorToken.brand)
                    Text("·")
                        .foregroundStyle(.tertiary)
                    Text("\(course.estimatedMinutes) min")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }

                ProgressView(value: course.progress)
                    .tint(DesignTokens.ColorToken.brand)
            }

            Spacer(minLength: 0)

            VStack(alignment: .trailing, spacing: 4) {
                if let score = course.averageScore {
                    Text("\(score)%")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.secondary)
                }
                Text("\(Int(course.progress * 100))%")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(.tertiary)
                Image(systemName: "chevron.right")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.tertiary)
            }
        }
        .padding(16)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }
}

// MARK: - Section Header
struct SectionHeader: View {
    let title: String
    let count: Int

    var body: some View {
        HStack(alignment: .firstTextBaseline) {
            Text(title)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
            Spacer()
            Text("\(count)")
                .font(.footnote.weight(.medium))
                .foregroundStyle(.tertiary)
        }
    }
}
