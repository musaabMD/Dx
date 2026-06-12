#if false
//
//  NewExamSelectionView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct NewExamSelectionView: View {
    @Environment(AppState.self) private var appState
    @State private var searchText = ""
    
    var filteredExams: [Exam] {
        if searchText.isEmpty {
            return appState.availableExams
        }
        return appState.availableExams.filter { exam in
            exam.name.localizedCaseInsensitiveContains(searchText) ||
            exam.description.localizedCaseInsensitiveContains(searchText)
        }
    }
    
    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                // Search bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(.secondary)
                    TextField("Search exams", text: $searchText)
                        .textFieldStyle(.plain)
                }
                .padding(12)
                .background(Color(.systemGray6))
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .padding()
                
                // Exam list
                List {
                    ForEach(filteredExams) { exam in
                        Button {
                            appState.selectedExam = exam
                        } label: {
                            HStack(spacing: 16) {
                                // Icon
                                Image(systemName: exam.icon)
                                    .font(.title2)
                                    .foregroundStyle(.blue)
                                    .frame(width: 40, height: 40)
                                    .background(Color.blue.opacity(0.1))
                                    .clipShape(Circle())
                                
                                // Info
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(exam.name)
                                        .font(.headline)
                                        .foregroundStyle(.primary)
                                    
                                    Text("\(exam.totalQuestions) questions")
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                }
                                
                                Spacer()
                                
                                // Bookmark
                                Button {
                                    appState.toggleFavoriteExam(exam.id)
                                } label: {
                                    Image(systemName: appState.isFavorite(exam.id) ? "bookmark.fill" : "bookmark")
                                        .foregroundStyle(appState.isFavorite(exam.id) ? .blue : .secondary)
                                }
                                .buttonStyle(.plain)
                            }
                            .padding(.vertical, 8)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .listStyle(.plain)
            }
            .navigationTitle("Select Exam")
            .navigationBarTitleDisplayMode(.large)
        }
    }
}

#Preview {
    NewExamSelectionView()
        .environment(AppState())
}
#endif
