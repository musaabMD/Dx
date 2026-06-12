//
//  MockExamsView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct MockExamsView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedMockExam: MockExam?
    @State private var showingExamSimulator = false
    @State private var showOnboarding = false
    
    var body: some View {
        HeaderContainer(
            headerModel: .init(
                streak: 0,
                isPaid: false,
                creditsUsedToday: 0,
                rank: nil,
                progressPercent: 0,
                examName: appState.selectedExam?.name
            )
        ) {
            NavigationStack {
                ZStack {
                    Color(.systemGroupedBackground)
                        .ignoresSafeArea()

                    ScrollView {
                        VStack(spacing: 24) {
                            // Hero Header
                            ZStack {
                                RoundedRectangle(cornerRadius: 28)
                                    .fill(
                                        LinearGradient(colors: [Color.blue.opacity(0.9), Color.purple.opacity(0.8)], startPoint: .topLeading, endPoint: .bottomTrailing)
                                    )
                                    .overlay(
                                        ZStack {
                                            Circle()
                                                .fill(Color.white.opacity(0.15))
                                                .frame(width: 220, height: 220)
                                                .offset(x: 120, y: -80)
                                            Circle()
                                                .fill(Color.white.opacity(0.10))
                                                .frame(width: 160, height: 160)
                                                .offset(x: -140, y: 80)
                                        }
                                    )
                                    .shadow(color: Color.blue.opacity(0.2), radius: 16, x: 0, y: 10)

                                HStack(alignment: .center, spacing: 16) {
                                    ZStack {
                                        RoundedRectangle(cornerRadius: 20)
                                            .fill(Color.white.opacity(0.15))
                                            .frame(width: 110, height: 110)
                                            .overlay(
                                                Image(systemName: appState.selectedExam?.icon ?? "doc.text.fill")
                                                    .symbolRenderingMode(.hierarchical)
                                                    .foregroundStyle(.white)
                                                    .font(.system(size: 44, weight: .bold))
                                            )
                                            .glassEffect(.regular.tint(.white.opacity(0.4)), in: .rect(cornerRadius: 20))
                                    }

                                    VStack(alignment: .leading, spacing: 8) {
                                        Text("Exam Simulator")
                                            .font(.title.bold())
                                            .foregroundStyle(.white)

                                        Text("Practice full-length exams under real conditions")
                                            .font(.subheadline)
                                            .foregroundStyle(.white.opacity(0.85))

                                        if let exam = appState.selectedExam {
                                            HStack(spacing: 8) {
                                                Image(systemName: exam.icon)
                                                    .foregroundStyle(.white)
                                                Text(exam.name)
                                                    .font(.footnote.weight(.semibold))
                                                    .foregroundStyle(.white)
                                                    .padding(.horizontal, 10)
                                                    .padding(.vertical, 6)
                                                    .background(Color.white.opacity(0.15))
                                                    .clipShape(Capsule())
                                            }
                                            .padding(.top, 4)
                                        } else {
                                            Text("Select your exam to get tailored mocks")
                                                .font(.footnote)
                                                .foregroundStyle(.white.opacity(0.8))
                                                .padding(.top, 4)
                                        }
                                    }

                                    Spacer(minLength: 0)
                                }
                                .padding(20)
                            }
                            .padding(.horizontal)

                            // Quick Stats / Tips
                            HStack(spacing: 12) {
                                StatPill(icon: "clock.fill", title: "Duration", value: appState.mockExams.first != nil ? "~\(Int((appState.mockExams.first!.duration) / 60))m" : "—")
                                StatPill(icon: "checkmark.seal.fill", title: "Passing", value: appState.mockExams.first != nil ? "\(appState.mockExams.first!.passingScore)%" : "—")
                                StatPill(icon: "number", title: "Questions", value: appState.mockExams.first != nil ? "\(appState.mockExams.first!.questionCount)" : "—")
                            }
                            .padding(.horizontal)

                            // Mock exams list
                            if appState.mockExams.isEmpty {
                                VStack(spacing: 20) {
                                    ZStack {
                                        RoundedRectangle(cornerRadius: 28)
                                            .fill(
                                                LinearGradient(colors: [Color.blue.opacity(0.15), Color.purple.opacity(0.12)], startPoint: .topLeading, endPoint: .bottomTrailing)
                                            )
                                            .frame(height: 180)
                                            .overlay(
                                                Image(systemName: "chart.bar.xaxis")
                                                    .symbolRenderingMode(.hierarchical)
                                                    .font(.system(size: 72, weight: .bold))
                                                    .foregroundStyle(.blue.opacity(0.6))
                                            )
                                            .glassEffect(.regular, in: .rect(cornerRadius: 28))

                                        VStack(spacing: 8) {
                                            Text("No mock exams yet")
                                                .font(.headline)
                                            Text("Mock exams will be generated after you pick an exam.")
                                                .font(.subheadline)
                                                .foregroundStyle(.secondary)
                                        }
                                        .padding(.top, 120)
                                    }
                                    .padding(.horizontal)

                                    Button {
                                        if appState.selectedExam == nil {
                                            showOnboarding = true
                                        } else {
                                            generateSampleMockExams()
                                        }
                                    } label: {
                                        HStack(spacing: 8) {
                                            Image(systemName: appState.selectedExam == nil ? "list.bullet" : "sparkles")
                                            Text(appState.selectedExam == nil ? "Select Exam to Generate" : "Generate Sample Exams")
                                                .font(.headline)
                                        }
                                        .foregroundStyle(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding()
                                        .background(
                                            LinearGradient(colors: [.blue, .purple], startPoint: .leading, endPoint: .trailing)
                                        )
                                        .clipShape(RoundedRectangle(cornerRadius: 16))
                                        .padding(.horizontal)
                                    }
                                }
                                .padding(.vertical, 40)
                            } else {
                                VStack(alignment: .leading, spacing: 12) {
                                    Text("Available Mock Exams")
                                        .font(.title2.bold())
                                        .padding(.horizontal)
                                        .padding(.top, 4)

                                    ForEach(appState.mockExams) { mockExam in
                                        MockExamCard(mockExam: mockExam, action: {
                                            selectedMockExam = mockExam
                                            showingExamSimulator = true
                                        })
                                    }
                                }
                            }
                        }
                        .padding(.bottom, 30)
                    }
                }
                .navigationTitle("Mock Exams")
                .navigationBarTitleDisplayMode(.inline)
                .sheet(isPresented: $showingExamSimulator) {
                    if let exam = selectedMockExam {
                        MockExamSimulatorView(mockExam: exam)
                    }
                }
                .fullScreenCover(isPresented: $showOnboarding) {
                    OnboardingFlowView(isPresented: $showOnboarding)
                        .environment(appState)
                }
            }
        }
    }
    
    func generateSampleMockExams() {
        guard let examID = appState.selectedExam?.id else { return }
        
        appState.mockExams = [
            MockExam(
                examID: examID,
                name: "Full Practice Test 1",
                duration: 3600,
                questionCount: 50,
                passingScore: 70,
                questions: appState.allQuestions.map { $0.id }
            ),
            MockExam(
                examID: examID,
                name: "Quick Practice Test",
                duration: 1800,
                questionCount: 25,
                passingScore: 70,
                questions: Array(appState.allQuestions.prefix(25).map { $0.id })
            ),
            MockExam(
                examID: examID,
                name: "Comprehensive Exam",
                duration: 7200,
                questionCount: 100,
                passingScore: 75,
                questions: appState.allQuestions.map { $0.id }
            )
        ]
    }
}

struct MockExamCard: View {
    let mockExam: MockExam
    let action: () -> Void
    
    var durationString: String {
        let hours = Int(mockExam.duration) / 3600
        let minutes = (Int(mockExam.duration) % 3600) / 60
        if hours > 0 {
            return "\(hours)h \(minutes)m"
        }
        return "\(minutes) min"
    }
    
    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    ZStack {
                        RoundedRectangle(cornerRadius: 12)
                            .fill(
                                LinearGradient(colors: [.purple.opacity(0.2), .blue.opacity(0.2)], startPoint: .topLeading, endPoint: .bottomTrailing)
                            )
                        Image(systemName: "doc.text.fill")
                            .font(.title2)
                            .foregroundStyle(.purple)
                    }
                    .frame(width: 60, height: 60)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.purple.opacity(0.25), lineWidth: 1)
                    )
                    
                    VStack(alignment: .leading, spacing: 6) {
                        Text(mockExam.name)
                            .font(.headline)
                            .foregroundStyle(.primary)
                        
                        Text("\(mockExam.questionCount) questions")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: "chevron.right")
                        .foregroundStyle(.secondary)
                }
                
                Divider()
                
                HStack {
                    Label(durationString, systemImage: "clock.fill")
                        .font(.caption)
                        .foregroundStyle(.blue)

                    Spacer()

                    Label("\(mockExam.passingScore)% to pass", systemImage: "target")
                        .font(.caption)
                        .foregroundStyle(.green)
                }
                .overlay(
                    Rectangle()
                        .fill(LinearGradient(colors: [.blue.opacity(0.4), .purple.opacity(0.4)], startPoint: .leading, endPoint: .trailing))
                        .frame(height: 2)
                        .cornerRadius(1)
                        .offset(y: 14)
                    , alignment: .bottom
                )
            }
            .padding()
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .glassEffect(.regular, in: .rect(cornerRadius: 16))
        }
        .buttonStyle(.plain)
        .padding(.horizontal)
    }
}

struct MockExamSimulatorView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    let mockExam: MockExam
    @State private var hasStarted = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                if !hasStarted {
                    // Exam instructions
                    VStack(spacing: 30) {
                        Image(systemName: "doc.text.fill")
                            .font(.system(size: 80))
                            .foregroundStyle(.purple)
                            .frame(width: 140, height: 140)
                            .background(Color.purple.opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: 30))
                            .glassEffect(.regular.tint(.purple), in: .rect(cornerRadius: 30))
                        
                        VStack(spacing: 16) {
                            Text(mockExam.name)
                                .font(.title.bold())
                            
                            Text("Exam Instructions")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                        }
                        
                        VStack(alignment: .leading, spacing: 16) {
                            InstructionRow(icon: "questionmark.circle.fill", text: "\(mockExam.questionCount) questions")
                            InstructionRow(icon: "clock.fill", text: "Time limit: \(Int(mockExam.duration / 60)) minutes")
                            InstructionRow(icon: "target", text: "Passing score: \(mockExam.passingScore)%")
                            InstructionRow(icon: "flag.fill", text: "You can flag questions for review")
                            InstructionRow(icon: "exclamationmark.triangle.fill", text: "You cannot pause once started")
                        }
                        .padding()
                        .background(Color(.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        
                        Button {
                            hasStarted = true
                        } label: {
                            Text("Start Exam")
                                .font(.headline)
                                .foregroundStyle(.white)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(
                                    LinearGradient(colors: [.purple, .blue], startPoint: .leading, endPoint: .trailing)
                                )
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                        }
                        .padding(.horizontal, 40)
                    }
                    .padding()
                } else {
                    // Use StudyModeView for the actual exam
                    StudyModeView()
                }
            }
            .navigationTitle(mockExam.name)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    if !hasStarted {
                        Button {
                            dismiss()
                        } label: {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
    }
}

struct InstructionRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(.blue)
                .frame(width: 30)
            
            Text(text)
                .font(.body)
        }
    }
}

struct OnboardingFlowView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss
    @Binding var isPresented: Bool
    @State private var step: Step = .features

    enum Step { case features, examSelect, login }

    var body: some View {
        NavigationStack {
            switch step {
            case .features:
                FeatureIntroScreen {
                    step = .examSelect
                }
            case .examSelect:
                ExamSelectScreen(onContinue: {
                    step = .login
                })
            case .login:
                LoginScreen(onComplete: {
                    isPresented = false
                })
            }
        }
        .interactiveDismissDisabled()
    }
}

struct FeatureIntroScreen: View {
    var onContinue: () -> Void

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color.blue.opacity(0.15), Color.purple.opacity(0.12)], startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            VStack(spacing: 28) {
                Spacer(minLength: 20)

                ZStack {
                    RoundedRectangle(cornerRadius: 40)
                        .fill(LinearGradient(colors: [Color.blue, Color.purple], startPoint: .topLeading, endPoint: .bottomTrailing))
                        .frame(height: 220)
                        .overlay(
                            Image(systemName: "heart.text.square.fill")
                                .symbolRenderingMode(.hierarchical)
                                .font(.system(size: 88, weight: .bold))
                                .foregroundStyle(.white.opacity(0.95))
                        )
                        .shadow(color: .blue.opacity(0.25), radius: 20, x: 0, y: 12)
                }
                .padding(.horizontal)

                VStack(spacing: 14) {
                    Text("Ace your exam")
                        .font(.largeTitle.bold())
                        .multilineTextAlignment(.center)
                    Text("Build skills with a clean, focused experience: full-length mocks, study mode with explanations, and quick last‑minute notes.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal)
                }

                VStack(alignment: .leading, spacing: 12) {
                    FeatureRow(icon: "book.fill", title: "Question Bank", subtitle: "Curated questions with explanations")
                    FeatureRow(icon: "timer", title: "Exam Simulator", subtitle: "Timed practice under real conditions")
                    FeatureRow(icon: "bolt.fill", title: "Last‑Minute Review", subtitle: "One‑line summaries for fast revision")
                }
                .padding()
                .background(Color(.secondarySystemGroupedBackground))
                .clipShape(RoundedRectangle(cornerRadius: 20))
                .padding(.horizontal)

                Spacer()

                Button(action: onContinue) {
                    Text("Get Started")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(LinearGradient(colors: [.blue, .purple], startPoint: .leading, endPoint: .trailing))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                }
                .padding(.horizontal)

                Button {
                    onContinue()
                } label: {
                    Text("Skip")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }

                Spacer(minLength: 20)
            }
        }
        .navigationTitle("")
        .navigationBarHidden(true)
    }
}

struct ExamSelectScreen: View {
    @Environment(AppState.self) private var appState
    var onContinue: () -> Void

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Choose your exam")
                        .font(.title.bold())
                    Text("We'll tailor questions and mock tests for you")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .listRowInsets(EdgeInsets())
                .listRowBackground(Color.clear)
            }

            Section("Available Exams") {
                ForEach(appState.availableExams) { exam in
                    Button {
                        appState.selectedExam = exam
                        onContinue()
                    } label: {
                        HStack(spacing: 12) {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(Color.blue.opacity(0.15))
                                    .frame(width: 40, height: 40)
                                Image(systemName: exam.icon)
                                    .foregroundStyle(.blue)
                            }
                            VStack(alignment: .leading, spacing: 2) {
                                Text(exam.name)
                                    .font(.headline)
                                Text("\(exam.totalQuestions) questions")
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                            Image(systemName: "chevron.right")
                                .foregroundStyle(.secondary)
                        }
                    }
                    .foregroundStyle(.primary)
                }
            }
        }
        .navigationTitle("Select Exam")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct LoginScreen: View {
    @Environment(AppState.self) private var appState
    var onComplete: () -> Void

    var body: some View {
        VStack(spacing: 24) {
            Spacer()

            VStack(spacing: 8) {
                Text("Create your account")
                    .font(.largeTitle.bold())
                Text("Sync progress, track streaks, and compete on the leaderboard")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }

            VStack(spacing: 12) {
                Button {
                    // Placeholder auth flow
                    appState.signUp(name: "Guest", email: "guest@example.com")
                    onComplete()
                } label: {
                    HStack {
                        Image(systemName: "applelogo")
                        Text("Continue with Apple")
                            .fontWeight(.semibold)
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.black)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                Button {
                    appState.signUp(name: "Guest", email: "guest@example.com")
                    onComplete()
                } label: {
                    HStack {
                        Image(systemName: "envelope.fill")
                            .foregroundStyle(.blue)
                        Text("Use email instead")
                            .fontWeight(.semibold)
                            .foregroundStyle(.blue)
                    }
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Color.blue.opacity(0.12))
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }

                Text("By continuing, you agree to our Terms & Privacy Policy.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .padding(.top, 8)
            }
            .padding(.horizontal)

            Spacer()
        }
        .navigationTitle("Log In")
        .navigationBarTitleDisplayMode(.inline)
    }
}

struct FeatureRow: View {
    let icon: String
    let title: String
    let subtitle: String

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(.blue)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: 4) {
                Text(title).font(.headline)
                Text(subtitle).font(.caption).foregroundStyle(.secondary)
            }
            Spacer()
        }
    }
}

struct StatPill: View {
    let icon: String
    let title: String
    let value: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack(spacing: 6) {
                Image(systemName: icon)
                    .foregroundStyle(.blue)
                Text(title)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Text(value)
                .font(.headline)
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .glassEffect(.regular, in: .rect(cornerRadius: 14))
    }
}

#Preview {
    MockExamsView()
        .environment(AppState())
}
