import SwiftUI

struct ExamDetailView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    let exam: Exam

    private var totalTopics: Int { exam.subjects.reduce(0) { $0 + max(1, $1.topics.count) } }

    var body: some View {
        NavigationStack {
            ZStack(alignment: .bottom) {
                Color(.systemGroupedBackground).ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 20) {
                        VStack(alignment: .leading, spacing: 16) {
                            // Header with back button
                            HStack {
                                Button {
                                    dismiss()
                                } label: {
                                    Image(systemName: "chevron.left")
                                        .font(.body.bold())
                                        .foregroundStyle(.blue)
                                }
                                Spacer()
                            }

                            // Exam icon
                            Image(systemName: exam.icon)
                                .font(.system(size: 60))
                                .foregroundStyle(.white)
                                .frame(width: 100, height: 100)
                                .background(Color.blue.gradient)
                                .clipShape(RoundedRectangle(cornerRadius: 20))

                            // Exam name
                            Text(exam.name)
                                .font(.largeTitle.bold())

                            // Description
                            Text(exam.description)
                                .font(.body)
                                .foregroundStyle(.secondary)

                            // Stats
                            HStack(spacing: 20) {
                                StatLabel(icon: "doc.text.fill", text: "\(exam.totalQuestions) Questions")
                                StatLabel(icon: "folder.fill", text: "\(exam.subjects.count) Subjects")
                                StatLabel(icon: "tag.fill", text: "\(totalTopics) Topics")
                            }
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)

                        // What you'll get section
                        VStack(alignment: .leading, spacing: 12) {
                            Text("What You'll Get")
                                .font(.headline)
                            
                            VStack(alignment: .leading, spacing: 8) {
                                ExamFeatureRow(icon: "books.vertical.fill", text: "Subject-wise practice")
                                ExamFeatureRow(icon: "target", text: "Topic and tag drilling")
                                ExamFeatureRow(icon: "arrow.clockwise", text: "Review incorrect & flagged")
                                ExamFeatureRow(icon: "text.alignleft", text: "High-yield summaries")
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color(.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .padding(.horizontal)

                        // Subject breakdown
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Subject Breakdown")
                                .font(.headline)
                                .padding(.horizontal)
                            
                            VStack(spacing: 0) {
                                ForEach(Array(exam.subjects.enumerated()), id: \.element.id) { index, subject in
                                    HStack {
                                        VStack(alignment: .leading, spacing: 4) {
                                            Text(subject.name)
                                                .font(.body)
                                            Text("\(subject.topics.count) topics")
                                                .font(.caption)
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        Text("\(subject.questionCount)")
                                            .font(.headline)
                                            .foregroundStyle(.secondary)
                                    }
                                    .padding()
                                    .background(Color(.secondarySystemGroupedBackground))
                                    
                                    if index < exam.subjects.count - 1 {
                                        Divider()
                                            .padding(.leading)
                                    }
                                }
                            }
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                            .padding(.horizontal)
                        }

                        Spacer(minLength: 100)
                    }
                    .padding(.top)
                }

                // Start button
                Button {
                    appState.selectedExam = exam
                    dismiss()
                } label: {
                    Text("Start Studying")
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.blue.gradient)
                        .clipShape(Capsule())
                }
                .padding(.horizontal)
                .padding(.bottom, 20)
                .background(Color(.systemGroupedBackground))
            }
            .navigationBarHidden(true)
        }
    }
}

private struct StatLabel: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption)
            Text(text)
        }
    }
}

private struct ExamFeatureRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(.blue)
                .frame(width: 24)
            Text(text)
                .font(.body)
        }
    }
}

#Preview {
    ExamDetailView(exam: Exam(name: "USMLE Step 1", description: "United States Medical Licensing Examination", icon: "cross.case.fill", subjects: [Subject(name: "Anatomy", topics: [Topic(name: "Cardio")], questionCount: 140)], totalQuestions: 370, category: "Medical")).environment(AppState())
}
