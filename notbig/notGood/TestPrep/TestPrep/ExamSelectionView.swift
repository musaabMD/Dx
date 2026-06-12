import SwiftUI

struct ExamSelectionView: View {
    @Environment(AppState.self) private var appState
    @State private var searchText = ""

    private var filteredExams: [Exam] {
        if searchText.isEmpty {
            return appState.availableExams
        }
        return appState.availableExams.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.category.localizedCaseInsensitiveContains(searchText)
        }
    }

    private var orderedExams: [Exam] {
        let exams = filteredExams
        // Favorites first, then alphabetically by name
        return exams.sorted { a, b in
            let ap = appState.isFavorite(a.id)
            let bp = appState.isFavorite(b.id)
            if ap != bp { return ap && !bp }
            return a.name.localizedCaseInsensitiveCompare(b.name) == .orderedAscending
        }
    }

    var body: some View {
        NavigationStack {
            List {
                Section {
                    ForEach(orderedExams) { exam in
                        SimpleExamRow(exam: exam,
                                      isFavorite: appState.isFavorite(exam.id),
                                      onToggleFavorite: { toggledID in
                                          appState.toggleFavoriteExam(toggledID)
                                      },
                                      onSelect: {
                                          appState.selectedExam = exam
                                      })
                        .listRowSeparator(.hidden)
                        .listRowInsets(EdgeInsets(top: 6, leading: 16, bottom: 6, trailing: 16))
                    }
                }
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
            .background(AppTheme.bgTop)
            .searchable(text: $searchText, prompt: "Search exams")
            .navigationTitle("Select Exam")
        }
    }
}

private struct SimpleExamRow: View {
    let exam: Exam
    let isFavorite: Bool
    let onToggleFavorite: (UUID) -> Void
    let onSelect: () -> Void

    var body: some View {
        HStack(spacing: 12) {
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(tileColor)
                .frame(width: 42, height: 42)
                .overlay {
                    Text(initialLetter)
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                }

            Button(action: onSelect) {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text(exam.name)
                            .font(.headline.weight(.semibold))
                            .foregroundStyle(AppTheme.primaryText)
                            .lineLimit(1)
                        Text("\(exam.totalQuestions) questions • \(exam.category)")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.secondaryText)
                            .lineLimit(1)
                    }
                    Spacer()
                }
            }
            .buttonStyle(.plain)

            // Spotify-style favorite control
            Button(action: { onToggleFavorite(exam.id) }) {
                Image(systemName: isFavorite ? "heart.fill" : "heart")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(isFavorite ? AppTheme.accentRed : AppTheme.secondaryText)
            }
            .buttonStyle(.plain)
        }
        .padding(12)
        .background(AppTheme.surface.opacity(0.88))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(AppTheme.divider.opacity(0.9), lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.02), radius: 3, x: 0, y: 1)
        .listRowBackground(AppTheme.bgTop)
    }

    private var initialLetter: String {
        String(exam.name.trimmingCharacters(in: .whitespacesAndNewlines).prefix(1)).uppercased()
    }

    private var tileColor: Color {
        let palette: [Color] = [
            AppTheme.accentBlue,
            AppTheme.accentRed,
            AppTheme.flameOrange,
            AppTheme.accentGreen
        ]
        let index = abs(exam.id.hashValue) % palette.count
        return palette[index]
    }
}

#Preview { ExamSelectionView().environment(AppState()) }
