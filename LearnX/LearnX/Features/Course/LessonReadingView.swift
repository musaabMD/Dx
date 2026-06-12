import SwiftUI

struct LessonReadingView: View {
    let courseTitle: String
    let lessonIndex: Int
    let lesson: LessonDetail

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 10) {
                    Text("Lesson \(lessonIndex)")
                        .font(.caption.weight(.bold))
                        .foregroundStyle(DesignTokens.ColorToken.brand)
                        .textCase(.uppercase)

                    Text(lesson.title)
                        .font(.title2.weight(.bold))
                        .fixedSize(horizontal: false, vertical: true)

                    Text(courseTitle)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }

                VStack(alignment: .leading, spacing: 12) {
                    Label("Reading", systemImage: "text.book.closed.fill")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(DesignTokens.ColorToken.brand)

                    Text(lesson.content)
                        .font(.body)
                        .foregroundStyle(.primary)
                        .lineSpacing(5)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(18)
                .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
                .liquidFloatShadow()

                VStack(alignment: .leading, spacing: 14) {
                    Label("Key points", systemImage: "list.bullet.circle.fill")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(DesignTokens.ColorToken.success)

                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(Array(lesson.keyPoints.enumerated()), id: \.offset) { idx, point in
                            HStack(alignment: .top, spacing: 12) {
                                Text("\(idx + 1)")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(DesignTokens.ColorToken.brand)
                                    .frame(width: 24, height: 24)
                                    .background(.thinMaterial, in: Circle())

                                Text(point)
                                    .font(.body)
                                    .foregroundStyle(.secondary)
                                    .fixedSize(horizontal: false, vertical: true)
                            }
                        }
                    }
                }
                .padding(18)
                .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
                .liquidFloatShadow()

                NavigationLink {
                    LessonExercisesPlaceholderView(lesson: lesson)
                } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "bolt.fill")
                        Text("Start exercises")
                            .font(.body.weight(.semibold))
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                }
                .buttonStyle(.borderedProminent)
                .tint(DesignTokens.ColorToken.brand)
                .controlSize(.large)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .liquidAppBackground()
        .navigationTitle("Lesson \(lessonIndex)")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
    }
}

struct LessonExercisesPlaceholderView: View {
    let lesson: LessonDetail

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 12) {
                ForEach(lesson.exercises) { exercise in
                    ExercisePreviewCard(exercise: exercise)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .liquidAppBackground()
        .navigationTitle("Exercises")
        .navigationBarTitleDisplayMode(.inline)
        .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
    }
}

private struct ExercisePreviewCard: View {
    let exercise: CourseExercise

    private var typeColor: Color {
        switch exercise.type {
        case .mcq:       return DesignTokens.ColorToken.brand
        case .fillIn:    return DesignTokens.ColorToken.success
        case .speaking:  return DesignTokens.ColorToken.xp
        case .image:     return DesignTokens.ColorToken.warning
        case .flashcard: return Color(hex: 0x32ADE6)
        case .mixed:     return Color(hex: 0xEF4444)
        }
    }

    private var typeIcon: String {
        switch exercise.type {
        case .mcq:       return "checkmark.circle.fill"
        case .fillIn:    return "pencil.circle.fill"
        case .speaking:  return "mic.circle.fill"
        case .image:     return "photo.circle.fill"
        case .flashcard: return "rectangle.fill.on.rectangle.fill"
        case .mixed:     return "shuffle.circle.fill"
        }
    }

    var body: some View {
        HStack(spacing: 14) {
            Image(systemName: typeIcon)
                .font(.title3)
                .foregroundStyle(typeColor)
                .frame(width: 40, height: 40)
                .background(typeColor.opacity(0.12), in: RoundedRectangle(cornerRadius: 12, style: .continuous))

            VStack(alignment: .leading, spacing: 4) {
                Text(exercise.type.rawValue.uppercased())
                    .font(.caption2.weight(.bold))
                    .foregroundStyle(typeColor)
                Text(exercise.question)
                    .font(.subheadline.weight(.semibold))
                    .lineLimit(3)
            }

            Spacer()
        }
        .padding(16)
        .liquidGlassCard(cornerRadius: 18)
        .liquidFloatShadow()
    }
}
