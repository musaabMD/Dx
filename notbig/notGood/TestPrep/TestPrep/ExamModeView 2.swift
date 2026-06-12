#if false
import SwiftUI

struct ExamModeView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var currentIndex: Int = 0
    @State private var selected: Int? = nil
    @State private var started = false

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                if let session = appState.currentSession, started {
                    if let question = session.questions[safe: currentIndex] {
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                Text("Question \(currentIndex + 1) / \(session.questions.count)")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                                Spacer()
                            }
                            Text(question.text)
                                .font(.title3)
                            ForEach(question.options.indices, id: \.self) { idx in
                                HStack {
                                    Image(systemName: selected == idx ? "largecircle.fill.circle" : "circle")
                                        .foregroundStyle(.blue)
                                    Text(question.options[idx])
                                    Spacer()
                                }
                                .contentShape(Rectangle())
                                .onTapGesture { selected = idx }
                            }
                            Spacer()
                            HStack {
                                if currentIndex > 0 {
                                    Button("Previous") {
                                        currentIndex -= 1
                                        selected = nil
                                    }
                                }
                                Spacer()
                                Button(currentIndex == session.questions.count - 1 ? "Finish" : "Next") {
                                    if currentIndex < session.questions.count - 1 {
                                        currentIndex += 1
                                        selected = nil
                                    } else {
                                        dismiss()
                                    }
                                }
                                .buttonStyle(.borderedProminent)
                            }
                        }
                        .padding()
                    } else {
                        Text("No questions in session").foregroundStyle(.secondary)
                    }
                } else {
                    VStack(spacing: 16) {
                        Text("Exam Mode")
                            .font(.largeTitle.bold())
                        Text("Simulates real exam conditions. Answers are reviewed at the end.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .padding(.horizontal)
                        Button("Start Exam") {
                            startSessionIfNeeded()
                            started = true
                        }
                        .buttonStyle(.borderedProminent)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                }
            }
            .navigationTitle("Exam Mode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark.circle.fill")
                    }
                }
            }
        }
    }

    func startSessionIfNeeded() {
        if appState.currentSession == nil {
            let pool = appState.allQuestions
            guard !pool.isEmpty else { return }
            appState.startStudySession(mode: .exam, examID: appState.selectedExam?.id ?? UUID(), questions: pool)
        }
    }
}

private extension Collection {
    subscript(safe index: Index) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}

#Preview {
    ExamModeView().environment(AppState())
}
#endif
