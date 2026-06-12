import SwiftUI

struct CreateCourseFlowView: View {
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var createCourse: CreateCourseViewModel
    @EnvironmentObject private var shell: AppShellViewModel
    @State private var generationErrorMessage: String?

    private let topicSuggestions: [String] = [
        "Python", "ECG Reading", "French", "Negotiation", "UX Design", "History of Japan", "Public Speaking"
    ]

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                stepProgressBar

                ScrollView(showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 24) {
                        switch createCourse.step {
                        case .topic:              topicStep
                        case .audienceAndStyle:   audienceAndStyleStep
                        case .exerciseTypes:      exerciseTypesStep
                        case .confirm:            confirmStep
                        }
                    }
                    .padding(20)
                    .padding(.bottom, 28)
                }
            }
            .liquidAppBackground()
            .navigationTitle("New course")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark")
                            .font(.caption.weight(.bold))
                            .frame(width: 30, height: 30)
                    }
                    .buttonStyle(.bordered)
                    .buttonBorderShape(.circle)
                    .tint(.primary.opacity(0.65))
                    .disabled(createCourse.isGenerating)
                }
            }
        }
        .interactiveDismissDisabled(createCourse.isGenerating)
    }

    private var stepProgressBar: some View {
        VStack(spacing: 10) {
            HStack(spacing: 6) {
                ForEach(1...4, id: \.self) { idx in
                    Capsule()
                        .fill(idx <= createCourse.step.rawValue
                              ? DesignTokens.ColorToken.brand
                              : Color.primary.opacity(0.08))
                        .frame(height: 3)
                        .animation(.spring(response: 0.4, dampingFraction: 0.85), value: createCourse.step)
                }
            }

            HStack {
                Text("Step \(createCourse.step.rawValue) of 4")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
                Spacer()
                Text(createCourse.step.title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(DesignTokens.ColorToken.brand)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
        .background(.ultraThinMaterial)
    }

    private var topicStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            stepHeader(
                icon: "sparkles",
                title: "What do you want to learn?",
                subtitle: "Be specific — it helps the course structure. Up to 500 characters."
            )

            TextField("Topic", text: $createCourse.topic, axis: .vertical)
                .textInputAutocapitalization(.sentences)
                .lineLimit(3...7)
                .font(.body)
                .padding(16)
                .liquidGlassCard(cornerRadius: LiquidGlass.controlRadius)

            HStack {
                Text("Suggestions")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(createCourse.topic.count)/500")
                    .font(.caption)
                    .foregroundStyle(createCourse.topic.count > 450 ? DesignTokens.ColorToken.danger : .secondary)
            }

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(topicSuggestions, id: \.self) { suggestion in
                        Button {
                            withAnimation(.spring(response: 0.3)) {
                                createCourse.topic = suggestion
                            }
                        } label: {
                            Text(suggestion)
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                        }
                        .buttonStyle(.bordered)
                        .tint(createCourse.topic == suggestion ? DesignTokens.ColorToken.brand : .secondary)
                        .buttonBorderShape(.capsule)
                    }
                }
            }

            Button("Continue") {
                createCourse.step = .audienceAndStyle
            }
            .font(.body.weight(.semibold))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .buttonStyle(.borderedProminent)
            .tint(DesignTokens.ColorToken.brand)
            .disabled(!createCourse.canContinueFromTopic)
        }
    }

    private var audienceAndStyleStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            stepHeader(
                icon: "person.2.fill",
                title: "Who is this for?",
                subtitle: "We’ll match tone and difficulty to your audience."
            )

            sectionLabel("Audience")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(CourseAudience.allCases) { audience in
                    SelectableTile(
                        title: audience.displayName,
                        isSelected: createCourse.audience == audience
                    ) { createCourse.audience = audience }
                }
            }

            sectionLabel("Learning style")
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                ForEach(CourseStyle.allCases) { style in
                    SelectableTile(
                        title: style.displayName,
                        isSelected: createCourse.style == style
                    ) { createCourse.style = style }
                }
            }

            stepNavRow(
                back: { createCourse.step = .topic },
                forward: { createCourse.step = .exerciseTypes }
            )
        }
    }

    private var exerciseTypesStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            stepHeader(
                icon: "rectangle.grid.2x2.fill",
                title: "Exercise types",
                subtitle: "Pick at least one. You can refine this later."
            )

            VStack(spacing: 10) {
                ForEach(RequestedExerciseType.allCases) { type in
                    let isOn = createCourse.exerciseTypes.contains(type)
                    Button {
                        withAnimation(.spring(response: 0.3)) {
                            createCourse.toggleExerciseType(type)
                        }
                    } label: {
                        HStack(spacing: 14) {
                            Image(systemName: exerciseIcon(type))
                                .font(.title3)
                                .foregroundStyle(isOn ? DesignTokens.ColorToken.brand : .secondary)
                                .frame(width: 36, height: 36)
                                .background(.thinMaterial, in: Circle())

                            VStack(alignment: .leading, spacing: 3) {
                                Text(type.displayName)
                                    .font(.headline)
                                Text(exerciseCopy(type))
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }

                            Spacer()

                            Image(systemName: isOn ? "checkmark.circle.fill" : "circle")
                                .font(.title3)
                                .foregroundStyle(isOn ? DesignTokens.ColorToken.brand : Color.secondary.opacity(0.55))
                        }
                        .padding(14)
                        .liquidGlassCard(cornerRadius: 18)
                        .overlay {
                            if isOn {
                                RoundedRectangle(cornerRadius: 18, style: .continuous)
                                    .strokeBorder(DesignTokens.ColorToken.brand.opacity(0.45), lineWidth: 1.5)
                            }
                        }
                    }
                    .buttonStyle(.plain)
                }
            }

            stepNavRow(
                back: { createCourse.step = .audienceAndStyle },
                forward: { createCourse.step = .confirm },
                forwardDisabled: createCourse.exerciseTypes.isEmpty
            )
        }
    }

    private var confirmStep: some View {
        VStack(alignment: .leading, spacing: 20) {
            stepHeader(
                icon: "checkmark.circle.fill",
                title: "Ready to generate",
                subtitle: "Review once — generation will use credits when the backend is connected."
            )

            VStack(spacing: 0) {
                summaryRow("Topic", value: createCourse.topic.trimmingCharacters(in: .whitespacesAndNewlines))
                Divider().padding(.leading, 16)
                summaryRow("Style", value: createCourse.style.displayName)
                Divider().padding(.leading, 16)
                summaryRow("Audience", value: createCourse.audience.displayName)
                Divider().padding(.leading, 16)
                summaryRow(
                    "Exercises",
                    value: createCourse.exerciseTypes.sorted { $0.displayName < $1.displayName }.map { $0.displayName }.joined(separator: ", ")
                )
            }
            .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
            .liquidFloatShadow()

            HStack {
                Button("Back") { createCourse.step = .exerciseTypes }
                    .font(.body.weight(.semibold))
                    .disabled(createCourse.isGenerating)
                Spacer()
            }

            if let generationErrorMessage {
                Text(generationErrorMessage)
                    .font(.caption)
                    .foregroundStyle(DesignTokens.ColorToken.danger)
            }

            Button(action: startFakeGeneration) {
                HStack(spacing: 10) {
                    if createCourse.isGenerating {
                        ProgressView()
                            .tint(.white)
                    } else {
                        Image(systemName: "sparkles")
                    }
                    Text(createCourse.isGenerating ? "Generating…" : "Generate course")
                        .font(.body.weight(.semibold))
                }
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(DesignTokens.ColorToken.brand)
            .disabled(!createCourse.canGenerate || createCourse.isGenerating)
        }
    }

    private func stepHeader(icon: String, title: String, subtitle: String) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(DesignTokens.ColorToken.brand)
                .frame(width: 48, height: 48)
                .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 14, style: .continuous))

            Text(title)
                .font(.title2.weight(.bold))

            Text(subtitle)
                .font(.subheadline)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    private func sectionLabel(_ text: String) -> some View {
        Text(text)
            .font(.footnote.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
    }

    private func stepNavRow(back: @escaping () -> Void, forward: @escaping () -> Void, forwardDisabled: Bool = false) -> some View {
        HStack {
            Button("Back", action: back)
                .font(.body.weight(.semibold))

            Spacer()

            Button {
                forward()
            } label: {
                Text("Continue")
                    .font(.body.weight(.semibold))
                    .padding(.horizontal, 20)
                    .padding(.vertical, 10)
            }
            .buttonStyle(.borderedProminent)
            .tint(DesignTokens.ColorToken.brand)
            .disabled(forwardDisabled)
        }
    }

    private func summaryRow(_ label: String, value: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Text(label)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
                .frame(width: 76, alignment: .leading)

            Text(value)
                .font(.subheadline)
                .multilineTextAlignment(.trailing)
                .frame(maxWidth: .infinity, alignment: .trailing)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }

    private func exerciseIcon(_ type: RequestedExerciseType) -> String {
        switch type {
        case .mcq:       return "checkmark.circle.fill"
        case .fillIn:    return "pencil.circle.fill"
        case .speaking:  return "mic.circle.fill"
        case .image:     return "photo.circle.fill"
        case .flashcard: return "rectangle.fill.on.rectangle.fill"
        case .mixed:     return "shuffle.circle.fill"
        }
    }

    private func exerciseCopy(_ type: RequestedExerciseType) -> String {
        switch type {
        case .mcq:       return "Four options, explanations, one correct answer"
        case .fillIn:    return "Type the missing words"
        case .speaking:  return "Speak and get keyword feedback"
        case .image:     return "Visual prompts and follow-ups"
        case .flashcard: return "Terms and definitions"
        case .mixed:     return "AI mixes formats per item"
        }
    }

    private func startFakeGeneration() {
        createCourse.isGenerating = true
        generationErrorMessage = nil
        Task {
            let generator = OpenRouterCourseGenerator()
            await MainActor.run {
                generationErrorMessage = nil
            }

            do {
                let generated = try await generator.generateCourse(from: createCourse)
                await MainActor.run {
                    createCourse.isGenerating = false
                    shell.addCourseDetail(generated)
                    dismiss()
                }
            } catch {
                // Fall back to local generation so testing works even with no auth or no API key.
                try? await Task.sleep(nanoseconds: 700_000_000)
                await MainActor.run {
                    createCourse.isGenerating = false
                    generationErrorMessage = "Using offline sample generation (\(error.localizedDescription))"
                    shell.addGeneratedCourse(from: createCourse)
                    dismiss()
                }
            }
        }
    }
}

private struct SelectableTile: View {
    let title: String
    let isSelected: Bool
    var onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            Text(title)
                .font(.subheadline.weight(.semibold))
                .multilineTextAlignment(.center)
                .frame(maxWidth: .infinity, minHeight: 48)
                .padding(.horizontal, 8)
        }
        .buttonStyle(.plain)
        .background {
            if isSelected {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(DesignTokens.ColorToken.brand.opacity(0.15))
                    .overlay {
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .strokeBorder(DesignTokens.ColorToken.brand.opacity(0.5), lineWidth: 1.5)
                    }
            } else {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(.clear)
                    .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
        }
        .foregroundStyle(isSelected ? DesignTokens.ColorToken.brand : .primary)
        .animation(.spring(response: 0.35, dampingFraction: 0.82), value: isSelected)
    }
}
