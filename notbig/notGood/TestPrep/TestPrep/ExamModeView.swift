//
//  ExamModeView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI
import Combine

struct ExamModeView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState

    @State private var currentQuestionIndex = 0
    @State private var selectedAnswer: Int? = nil
    @State private var questionStartTime = Date()

    // Timer (default 60 minutes)
    @State private var timeRemaining: Int = 60 * 60
    @State private var isTimerRunning: Bool = true
    @State private var showSubmitAlert: Bool = false
    @State private var showResults: Bool = false

    @State private var timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    var totalQuestions: Int { appState.allQuestions.count }
    var hasQuestions: Bool { totalQuestions > 0 }

    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()

                if !hasQuestions {
                    VStack(spacing: 16) {
                        Image(systemName: "tray")
                            .font(.system(size: 60))
                            .foregroundStyle(.secondary)
                        Text("No questions available")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                        Button("Close") { dismiss() }
                            .buttonStyle(.bordered)
                    }
                } else {
                    VStack(spacing: 0) {
                        // Top bar: progress + timer
                        ExamTopBar(current: currentQuestionIndex + 1, total: totalQuestions, timeRemaining: timeRemaining)
                            .padding(.horizontal)
                            .padding(.top)

                        ScrollView {
                            VStack(spacing: 24) {
                                let question = appState.allQuestions[currentQuestionIndex]

                                // Question card (no immediate explanations in exam mode)
                                VStack(alignment: .leading, spacing: 16) {
                                    HStack {
                                        Text("Question \(currentQuestionIndex + 1)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        Spacer()
                                        DifficultyBadge(difficulty: question.difficulty)
                                    }

                                    Text(question.text)
                                        .font(.title3)
                                        .fixedSize(horizontal: false, vertical: true)

                                    // Tags (optional)
                                    if !question.tags.isEmpty {
                                        ScrollView(.horizontal, showsIndicators: false) {
                                            HStack(spacing: 8) {
                                                ForEach(question.tags, id: \.self) { tag in
                                                    Text(tag)
                                                        .font(.caption)
                                                        .padding(.horizontal, 10)
                                                        .padding(.vertical, 5)
                                                        .background(Color.blue.opacity(0.12))
                                                        .clipShape(Capsule())
                                                }
                                            }
                                        }
                                    }
                                }
                                .padding()
                                .background(Color(.secondarySystemGroupedBackground))
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                                .padding(.horizontal)
                                .padding(.top)

                                // Options (no correctness indicators until after submission)
                                VStack(spacing: 12) {
                                    ForEach(question.options.indices, id: \.self) { index in
                                        OptionButton(
                                            text: question.options[index],
                                            index: index,
                                            isSelected: selectedAnswer == index,
                                            isCorrect: nil,
                                            isWrong: false
                                        ) {
                                            selectedAnswer = index
                                        }
                                    }
                                }
                                .padding(.horizontal)

                                // Navigation buttons
                                HStack(spacing: 12) {
                                    Button {
                                        goPrevious()
                                    } label: {
                                        HStack {
                                            Image(systemName: "chevron.left")
                                            Text("Previous")
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(Color(.systemGray5))
                                        .foregroundStyle(.primary)
                                        .clipShape(RoundedRectangle(cornerRadius: 12))
                                    }
                                    .disabled(currentQuestionIndex == 0)

                                    Button {
                                        goNextOrSubmit()
                                    } label: {
                                        HStack {
                                            Text(isLastQuestion ? "Submit" : "Next")
                                            Image(systemName: isLastQuestion ? "checkmark" : "chevron.right")
                                        }
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(selectedAnswer == nil && !isLastQuestion ? Color.gray : Color.blue)
                                        .foregroundStyle(.white)
                                        .clipShape(RoundedRectangle(cornerRadius: 12))
                                    }
                                    .disabled(selectedAnswer == nil && !isLastQuestion)
                                }
                                .padding(.horizontal)
                                .padding(.bottom, 24)
                            }
                        }
                    }
                }
            }
            .navigationTitle(appState.selectedExam?.name ?? "Exam Mode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        showSubmitAlert = true
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .alert("Exit Exam?", isPresented: $showSubmitAlert) {
                Button("Continue Exam", role: .cancel) {}
                Button("Submit & Exit", role: .destructive) { submitExam() }
            } message: {
                Text("You can submit now. Your unanswered questions will be marked as incorrect.")
            }
            .sheet(isPresented: $showResults) {
                ReviewView()
            }
            .onAppear {
                initializeSessionIfNeeded()
                loadExistingSelection()
                questionStartTime = Date()
            }
            .onReceive(timer) { _ in
                guard isTimerRunning else { return }
                guard timeRemaining > 0 else {
                    submitExam()
                    return
                }
                timeRemaining -= 1
            }
        }
    }

    // MARK: - Helpers

    var isLastQuestion: Bool { currentQuestionIndex == max(0, totalQuestions - 1) }

    func initializeSessionIfNeeded() {
        if appState.currentSession == nil && hasQuestions {
            appState.startStudySession(
                mode: .exam,
                examID: appState.selectedExam?.id ?? UUID(),
                questions: appState.allQuestions
            )
        }
    }

    func loadExistingSelection() {
        let q = appState.allQuestions[currentQuestionIndex]
        if let record = appState.currentSession?.answers[q.id] {
            selectedAnswer = record.selectedAnswerIndex
        } else {
            selectedAnswer = nil
        }
    }

    func goPrevious() {
        guard currentQuestionIndex > 0 else { return }
        submitCurrentIfNeeded()
        currentQuestionIndex -= 1
        loadExistingSelection()
        questionStartTime = Date()
    }

    func goNextOrSubmit() {
        if isLastQuestion {
            submitCurrentIfNeeded()
            submitExam()
        } else {
            submitCurrentIfNeeded()
            currentQuestionIndex += 1
            loadExistingSelection()
            questionStartTime = Date()
        }
    }

    func submitCurrentIfNeeded() {
        guard let selected = selectedAnswer else { return }
        let question = appState.allQuestions[currentQuestionIndex]
        let timeSpent = Date().timeIntervalSince(questionStartTime)
        appState.submitAnswer(questionID: question.id, selectedIndex: selected, timeSpent: timeSpent)
    }

    func submitExam() {
        isTimerRunning = false
        showResults = true
    }
}

private struct ExamTopBar: View {
    let current: Int
    let total: Int
    let timeRemaining: Int

    var progress: Double {
        guard total > 0 else { return 0 }
        return Double(current) / Double(total)
    }

    var timeString: String {
        let hours = timeRemaining / 3600
        let minutes = (timeRemaining % 3600) / 60
        let seconds = timeRemaining % 60
        if hours > 0 {
            return String(format: "%d:%02d:%02d", hours, minutes, seconds)
        } else {
            return String(format: "%02d:%02d", minutes, seconds)
        }
    }

    var body: some View {
        VStack(spacing: 10) {
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.2))
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.blue)
                        .frame(width: geometry.size.width * progress)
                }
            }
            .frame(height: 8)

            HStack {
                Text("\(current) of \(total)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                HStack(spacing: 6) {
                    Image(systemName: "timer")
                    Text(timeString)
                        .monospacedDigit()
                }
                .font(.caption.bold())
                .foregroundStyle(.blue)
            }
        }
    }
}

#Preview {
    ExamModeView()
        .environment(AppState())
}
