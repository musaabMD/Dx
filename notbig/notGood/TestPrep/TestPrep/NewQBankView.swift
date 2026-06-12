//
//  NewQBankView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct NewQBankView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var selectedMode: StudyMode = .study
    
    var body: some View {
        NavigationStack {
            List {
                Section {
                    // Study mode selector
                    Picker("Study Mode", selection: $selectedMode) {
                        Text("Study").tag(StudyMode.study)
                        Text("Exam").tag(StudyMode.exam)
                    }
                    .pickerStyle(.segmented)
                    .listRowInsets(EdgeInsets())
                    .listRowBackground(Color.clear)
                }
                
                Section("Start Practice") {
                    Button {
                        startStudySession()
                    } label: {
                        HStack {
                            Image(systemName: selectedMode == .study ? "book.fill" : "timer")
                                .foregroundStyle(.blue)
                            Text(selectedMode == .study ? "Start Studying" : "Start Exam Mode")
                                .foregroundStyle(.primary)
                            Spacer()
                            Image(systemName: "play.circle.fill")
                                .font(.title2)
                                .foregroundStyle(.blue)
                        }
                    }
                }
                
                if let exam = appState.selectedExam {
                    Section("Browse by Subject") {
                        ForEach(exam.subjects) { subject in
                            NavigationLink {
                                SubjectDetailView(subject: subject)
                            } label: {
                                HStack {
                                    Image(systemName: "folder.fill")
                                        .foregroundStyle(.blue)
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(subject.name)
                                        Text("\(subject.questionCount) questions")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Question Bank")
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
    
    func startStudySession() {
        if appState.currentUser?.canAccessQuestion == false {
            appState.showPaywall = true
            return
        }
        
        if !appState.allQuestions.isEmpty {
            appState.startStudySession(
                mode: selectedMode,
                examID: appState.selectedExam?.id ?? UUID(),
                questions: appState.allQuestions
            )
            // Navigate to study view based on mode
        }
    }
}

struct SubjectDetailView: View {
    let subject: Subject
    
    var body: some View {
        List {
            Section("Topics") {
                ForEach(subject.topics) { topic in
                    NavigationLink {
                        Text("Topic: \(topic.name)")
                    } label: {
                        HStack {
                            Image(systemName: "doc.text.fill")
                                .foregroundStyle(.blue)
                            Text(topic.name)
                            Spacer()
                            Text("\(topic.questionIDs.count)")
                                .foregroundStyle(.secondary)
                        }
                    }
                }
            }
        }
        .navigationTitle(subject.name)
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NewQBankView()
        .environment(AppState())
}
