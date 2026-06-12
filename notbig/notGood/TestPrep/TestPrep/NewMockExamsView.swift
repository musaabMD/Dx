#if false
//
//  NewMockExamsView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct NewMockExamsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    
    var body: some View {
        NavigationStack {
            List {
                if appState.mockExams.isEmpty {
                    Section {
                        VStack(spacing: 16) {
                            Image(systemName: "doc.text")
                                .font(.largeTitle)
                                .foregroundStyle(.secondary)
                            Text("No mock exams available")
                                .font(.headline)
                                .foregroundStyle(.secondary)
                            Button("Generate Sample Exams") {
                                generateMockExams()
                            }
                            .buttonStyle(.bordered)
                        }
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                    }
                } else {
                    Section("Available Exams") {
                        ForEach(appState.mockExams) { mockExam in
                            NavigationLink {
                                MockExamDetailView(mockExam: mockExam)
                            } label: {
                                HStack {
                                    Image(systemName: "doc.text.fill")
                                        .foregroundStyle(.green)
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(mockExam.name)
                                            .font(.headline)
                                        
                                        HStack {
                                            Text("\(mockExam.questionCount) questions")
                                            Text("•")
                                            Text("\(Int(mockExam.duration / 60)) min")
                                        }
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Mock Exams")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
    
    func generateMockExams() {
        guard let examID = appState.selectedExam?.id else { return }
        
        appState.mockExams = [
            MockExam(
                examID: examID,
                name: "Practice Test 1",
                duration: 3600,
                questionCount: 50,
                passingScore: 70,
                questions: appState.allQuestions.map { $0.id }
            ),
            MockExam(
                examID: examID,
                name: "Quick Test",
                duration: 1800,
                questionCount: 25,
                passingScore: 70,
                questions: Array(appState.allQuestions.prefix(25).map { $0.id })
            )
        ]
    }
}

struct MockExamDetailView: View {
    @Environment(\.dismiss) private var dismiss
    let mockExam: MockExam
    @State private var showExam = false
    
    var body: some View {
        List {
            Section {
                HStack {
                    Text("Questions")
                    Spacer()
                    Text("\(mockExam.questionCount)")
                        .foregroundStyle(.secondary)
                }
                
                HStack {
                    Text("Duration")
                    Spacer()
                    Text("\(Int(mockExam.duration / 60)) minutes")
                        .foregroundStyle(.secondary)
                }
                
                HStack {
                    Text("Passing Score")
                    Spacer()
                    Text("\(mockExam.passingScore)%")
                        .foregroundStyle(.secondary)
                }
            }
            
            Section {
                Button {
                    showExam = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Start Exam")
                            .font(.headline)
                        Spacer()
                    }
                }
            }
        }
        .navigationTitle(mockExam.name)
        .navigationBarTitleDisplayMode(.inline)
        .fullScreenCover(isPresented: $showExam) {
            ExamModeView()
        }
    }
}

#Preview {
    NewMockExamsView()
        .environment(AppState())
}
#endif

