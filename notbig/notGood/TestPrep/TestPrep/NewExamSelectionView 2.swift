#if false
import SwiftUI

struct NewExamSelectionView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var query: String = ""

    var filteredExams: [Exam] {
        let exams = appState.availableExams
        guard !query.isEmpty else { return exams }
        return exams.filter { $0.name.localizedCaseInsensitiveContains(query) || $0.category.localizedCaseInsensitiveContains(query) }
    }

    var body: some View {
        NavigationStack {
            List {
                VStack(alignment: .leading, spacing: 12) {
                    Text("Select Your Exam")
                        .font(.largeTitle)
                        .bold()
                    Text("Choose from the categories below to get started.")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                .listRowInsets(EdgeInsets(top: 16, leading: 16, bottom: 8, trailing: 16))

                // Categories placeholder
                Section("Categories") {
                    // Replace with actual categories when available
                    Text("Category 1")
                    Text("Category 2")
                    Text("Category 3")
                }

                if !query.isEmpty {
                    Section("Search Results") {
                        ForEach(filteredExams) { exam in
                            ExamRow(exam: exam) {
                                select(exam)
                            }
                        }
                    }
                } else {
                    if !appState.availableExams.isEmpty {
                        Section("Popular Exams") {
                            ForEach(appState.availableExams.prefix(3)) { exam in
                                ExamRow(exam: exam) {
                                    select(exam)
                                }
                            }
                        }
                    }

                    Section("All Exams") {
                        ForEach(appState.availableExams) { exam in
                            ExamRow(exam: exam) {
                                select(exam)
                            }
                        }
                    }
                }
            }
            .listStyle(.insetGrouped)
            .searchable(text: $query, placement: .navigationBarDrawer(displayMode: .always), prompt: "Search exams")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    func select(_ exam: Exam) {
        appState.selectedExam = exam
        dismiss()
    }
}

private struct ExamRow: View {
    let exam: Exam
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: exam.icon)
                    .frame(width: 32, height: 32)
                    .foregroundStyle(.blue)
                VStack(alignment: .leading, spacing: 4) {
                    Text(exam.name)
                        .font(.headline)
                    Text(exam.category)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                if exam.totalQuestions > 0 {
                    Text("\(exam.totalQuestions) Qs")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding(.vertical, 6)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    NewExamSelectionView()
        .environment(AppState())
}
#endif

