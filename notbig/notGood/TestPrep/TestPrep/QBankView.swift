//
//  QBankView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct QBankView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedSubject: Subject?
    @State private var selectedTopic: Topic?
    @State private var selectedTags: Set<String> = []
    @State private var showingFilters = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Filters button
                        Button {
                            showingFilters = true
                        } label: {
                            HStack {
                                Image(systemName: "line.3.horizontal.decrease.circle.fill")
                                Text("Filters")
                                Spacer()
                                if selectedSubject != nil || selectedTopic != nil || !selectedTags.isEmpty {
                                    Text("\(filterCount) active")
                                        .font(.caption)
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 8)
                                        .padding(.vertical, 4)
                                        .background(Color.blue)
                                        .clipShape(Capsule())
                                }
                                Image(systemName: "chevron.right")
                            }
                            .padding()
                            .background(Color(.secondarySystemGroupedBackground))
                            .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .foregroundStyle(.primary)
                        .padding(.horizontal)
                        .padding(.top)
                        
                        // Study modes
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Study Modes")
                                .font(.title2.bold())
                                .padding(.horizontal)
                            
                            StudyModeCard(
                                icon: "book.fill",
                                title: "Study Mode",
                                description: "Learn at your own pace with detailed explanations",
                                color: .blue,
                                destination: AnyView(StudyModeView())
                            )
                            
                            StudyModeCard(
                                icon: "timer",
                                title: "Exam Mode",
                                description: "Simulate real exam conditions with time pressure",
                                color: .red,
                                destination: AnyView(ExamModeView())
                            )
                            
                            StudyModeCard(
                                icon: "bolt.fill",
                                title: "Last Minute Review",
                                description: "Quick one-line summaries for rapid revision",
                                color: .orange,
                                destination: AnyView(LastMinReviewView())
                            )
                        }
                        
                        // Browse by subject
                        if let exam = appState.selectedExam {
                            VStack(alignment: .leading, spacing: 16) {
                                Text("Browse by Subject")
                                    .font(.title2.bold())
                                    .padding(.horizontal)
                                
                                ForEach(exam.subjects) { subject in
                                    SubjectBrowseCard(subject: subject)
                                }
                            }
                        }
                    }
                    .padding(.bottom, 30)
                }
            }
            .navigationTitle("Question Bank")
            .sheet(isPresented: $showingFilters) {
                FiltersView(
                    selectedSubject: $selectedSubject,
                    selectedTopic: $selectedTopic,
                    selectedTags: $selectedTags
                )
            }
        }
    }
    
    var filterCount: Int {
        var count = 0
        if selectedSubject != nil { count += 1 }
        if selectedTopic != nil { count += 1 }
        count += selectedTags.count
        return count
    }
}

struct StudyModeCard: View {
    let icon: String
    let title: String
    let description: String
    let color: Color
    let destination: AnyView
    @State private var isNavigating = false
    
    var body: some View {
        Button {
            isNavigating = true
        } label: {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title)
                    .foregroundStyle(color)
                    .frame(width: 60, height: 60)
                    .background(color.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                
                VStack(alignment: .leading, spacing: 6) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    
                    Text(description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                        .lineLimit(2)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
            .padding()
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .glassEffect(.regular, in: .rect(cornerRadius: 16))
        }
        .padding(.horizontal)
        .sheet(isPresented: $isNavigating) {
            destination
        }
    }
}

struct SubjectBrowseCard: View {
    let subject: Subject
    @State private var isExpanded = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            Button {
                withAnimation {
                    isExpanded.toggle()
                }
            } label: {
                HStack {
                    Image(systemName: "folder.fill")
                        .foregroundStyle(.blue)
                    
                    VStack(alignment: .leading, spacing: 4) {
                        Text(subject.name)
                            .font(.headline)
                        Text("\(subject.questionCount) questions")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    
                    Spacer()
                    
                    Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                        .foregroundStyle(.secondary)
                }
                .padding()
                .background(Color(.secondarySystemGroupedBackground))
            }
            .foregroundStyle(.primary)
            
            if isExpanded && !subject.topics.isEmpty {
                VStack(spacing: 0) {
                    ForEach(subject.topics) { topic in
                        TopicRow(topic: topic)
                        if topic.id != subject.topics.last?.id {
                            Divider()
                                .padding(.leading, 16)
                        }
                    }
                }
                .background(Color(.tertiarySystemGroupedBackground))
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
    }
}

struct TopicRow: View {
    let topic: Topic
    @State private var showStudyView = false
    
    var body: some View {
        Button {
            showStudyView = true
        } label: {
            HStack {
                Image(systemName: "doc.text.fill")
                    .foregroundStyle(.purple)
                    .font(.caption)
                
                Text(topic.name)
                    .font(.subheadline)
                
                Spacer()
                
                Text("\(topic.questionIDs.count)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
        .foregroundStyle(.primary)
        .sheet(isPresented: $showStudyView) {
            // Topic-specific study view
            Text("Topic: \(topic.name)")
        }
    }
}

struct FiltersView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @Binding var selectedSubject: Subject?
    @Binding var selectedTopic: Topic?
    @Binding var selectedTags: Set<String>
    
    let availableTags = ["anatomy", "physiology", "pharmacology", "cardiovascular", "respiratory", "nervous system"]
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Subject") {
                    Picker("Select Subject", selection: $selectedSubject) {
                        Text("All Subjects").tag(nil as Subject?)
                        if let exam = appState.selectedExam {
                            ForEach(exam.subjects) { subject in
                                Text(subject.name).tag(subject as Subject?)
                            }
                        }
                    }
                }
                
                if let subject = selectedSubject {
                    Section("Topic") {
                        Picker("Select Topic", selection: $selectedTopic) {
                            Text("All Topics").tag(nil as Topic?)
                            ForEach(subject.topics) { topic in
                                Text(topic.name).tag(topic as Topic?)
                            }
                        }
                    }
                }
                
                Section("Tags") {
                    ForEach(availableTags, id: \.self) { tag in
                        Button {
                            if selectedTags.contains(tag) {
                                selectedTags.remove(tag)
                            } else {
                                selectedTags.insert(tag)
                            }
                        } label: {
                            HStack {
                                Text(tag)
                                    .foregroundStyle(.primary)
                                Spacer()
                                if selectedTags.contains(tag) {
                                    Image(systemName: "checkmark")
                                        .foregroundStyle(.blue)
                                }
                            }
                        }
                    }
                }
                
                Section {
                    Button("Clear All Filters") {
                        selectedSubject = nil
                        selectedTopic = nil
                        selectedTags.removeAll()
                    }
                    .foregroundStyle(.red)
                }
            }
            .navigationTitle("Filters")
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
}

#Preview {
    QBankView()
        .environment(AppState())
}
