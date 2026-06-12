#if false
import SwiftUI

struct NewMockExamsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState

    var body: some View {
        NavigationStack {
            List {
                Section("Mock Exams") {
                    if appState.mockExams.isEmpty {
                        Text("No mock exams available yet.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(appState.mockExams) { mock in
                            NavigationLink {
                                MockExamStartView(mockExam: mock)
                            } label: {
                                HStack {
                                    VStack(alignment: .leading) {
                                        Text(mock.name).font(.headline)
                                        Text("\(Int(mock.duration / 60)) min • \(mock.questionCount) Q")
                                            .font(.caption).foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Text("Start")
                                        .foregroundColor(.blue)
                                        .fontWeight(.semibold)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Mock Exams")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) { Button("Done") { dismiss() } }
            }
        }
    }
}

struct MockExamStartView: View {
    let mockExam: MockExam

    var body: some View {
        VStack(spacing: 20) {
            Text(mockExam.name)
                .font(.largeTitle)
                .fontWeight(.bold)
                .multilineTextAlignment(.center)
                .padding(.top)

            Text("Duration: \(Int(mockExam.duration / 60)) minutes")
                .font(.title3)
                .foregroundStyle(.secondary)

            Text("Number of Questions: \(mockExam.questionCount)")
                .font(.title3)
                .foregroundStyle(.secondary)

            Spacer()

            Button("Start Exam") {
                // Non-functional placeholder CTA
            }
            .font(.title2)
            .padding()
            .frame(maxWidth: .infinity)
            .background(Color.accentColor)
            .foregroundColor(.white)
            .cornerRadius(10)
            .padding(.horizontal)

            Spacer()
        }
        .padding()
        .navigationTitle("Start Mock Exam")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NewMockExamsView().environment(AppState())
}

#endif
