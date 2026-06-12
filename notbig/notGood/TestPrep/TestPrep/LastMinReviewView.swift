//
//  LastMinReviewView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct LastMinReviewView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var currentIndex = 0
    @State private var showFullExplanation = false
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color.orange.opacity(0.3), Color.yellow.opacity(0.2)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                if appState.allQuestions.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "bolt.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.secondary)
                        Text("No questions available")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                    }
                } else {
                    VStack(spacing: 20) {
                        // Progress
                        HStack {
                            Text("\(currentIndex + 1) of \(appState.allQuestions.count)")
                                .font(.headline)
                            Spacer()
                            Button {
                                dismiss()
                            } label: {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.title2)
                                    .foregroundStyle(.secondary)
                            }
                        }
                        .padding()
                        
                        // Card stack
                        ZStack {
                            ForEach(appState.allQuestions.indices, id: \.self) { index in
                                if index >= currentIndex && index < currentIndex + 3 {
                                    ReviewCard(
                                        question: appState.allQuestions[index],
                                        showFullExplanation: $showFullExplanation,
                                        offset: CGFloat(index - currentIndex) * 10,
                                        scale: 1.0 - CGFloat(index - currentIndex) * 0.05
                                    )
                                    .zIndex(Double(appState.allQuestions.count - index))
                                }
                            }
                        }
                        .frame(maxHeight: .infinity)
                        
                        // Navigation buttons
                        HStack(spacing: 20) {
                            if currentIndex > 0 {
                                Button {
                                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                        currentIndex -= 1
                                        showFullExplanation = false
                                    }
                                } label: {
                                    Image(systemName: "arrow.left.circle.fill")
                                        .font(.system(size: 50))
                                        .foregroundStyle(.white)
                                        .background(
                                            Circle()
                                                .fill(Color.blue)
                                                .frame(width: 60, height: 60)
                                        )
                                }
                            }
                            
                            Spacer()
                            
                            // Show/Hide explanation toggle
                            Button {
                                withAnimation {
                                    showFullExplanation.toggle()
                                }
                            } label: {
                                VStack(spacing: 4) {
                                    Image(systemName: showFullExplanation ? "eye.slash.fill" : "eye.fill")
                                        .font(.title2)
                                    Text(showFullExplanation ? "Hide" : "Show")
                                        .font(.caption)
                                }
                                .foregroundStyle(.orange)
                                .frame(width: 80, height: 80)
                                .background(Color.orange.opacity(0.2))
                                .clipShape(Circle())
                                .glassEffect(.regular.tint(.orange), in: .circle)
                            }
                            
                            Spacer()
                            
                            if currentIndex < appState.allQuestions.count - 1 {
                                Button {
                                    withAnimation(.spring(response: 0.3, dampingFraction: 0.7)) {
                                        currentIndex += 1
                                        showFullExplanation = false
                                    }
                                } label: {
                                    Image(systemName: "arrow.right.circle.fill")
                                        .font(.system(size: 50))
                                        .foregroundStyle(.white)
                                        .background(
                                            Circle()
                                                .fill(Color.blue)
                                                .frame(width: 60, height: 60)
                                        )
                                }
                            } else {
                                Button {
                                    dismiss()
                                } label: {
                                    Image(systemName: "checkmark.circle.fill")
                                        .font(.system(size: 50))
                                        .foregroundStyle(.white)
                                        .background(
                                            Circle()
                                                .fill(Color.green)
                                                .frame(width: 60, height: 60)
                                        )
                                }
                            }
                        }
                        .padding(.horizontal, 30)
                        .padding(.bottom, 30)
                    }
                }
            }
            .navigationTitle("Last Minute Review")
            .navigationBarTitleDisplayMode(.inline)
            .navigationBarHidden(true)
        }
    }
}

struct ReviewCard: View {
    let question: Question
    @Binding var showFullExplanation: Bool
    let offset: CGFloat
    let scale: CGFloat
    
    var body: some View {
        VStack(spacing: 24) {
            // Question
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    DifficultyBadge(difficulty: question.difficulty)
                    Spacer()
                    Image(systemName: "bolt.fill")
                        .foregroundStyle(.orange)
                }
                
                Text(question.text)
                    .font(.title2.bold())
                    .fixedSize(horizontal: false, vertical: true)
            }
            
            Divider()
            
            // One-line summary (always visible)
            VStack(alignment: .leading, spacing: 12) {
                Label("Quick Summary", systemImage: "sparkles")
                    .font(.headline)
                    .foregroundStyle(.orange)
                
                Text(question.oneLineSummary)
                    .font(.body)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.orange.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            
            // Full explanation (toggleable)
            if showFullExplanation {
                VStack(alignment: .leading, spacing: 12) {
                    Label("Full Explanation", systemImage: "doc.text.fill")
                        .font(.headline)
                        .foregroundStyle(.blue)
                    
                    Text(question.explanation)
                        .font(.body)
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.blue.opacity(0.1))
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .transition(.opacity.combined(with: .scale))
            }
            
            // Correct answer
            VStack(alignment: .leading, spacing: 12) {
                Label("Correct Answer", systemImage: "checkmark.circle.fill")
                    .font(.headline)
                    .foregroundStyle(.green)
                
                Text(question.options[question.correctAnswerIndex])
                    .font(.body)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color.green.opacity(0.1))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
            }
            
            Spacer()
            
            // Tags
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(question.tags, id: \.self) { tag in
                        Text(tag)
                            .font(.caption)
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(Color.gray.opacity(0.2))
                            .clipShape(Capsule())
                    }
                }
            }
        }
        .padding(24)
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 24))
        .glassEffect(.regular, in: .rect(cornerRadius: 24))
        .shadow(color: .black.opacity(0.1), radius: 20, x: 0, y: 10)
        .scaleEffect(scale)
        .offset(y: offset)
        .padding(.horizontal, 20)
    }
}

#Preview {
    LastMinReviewView()
        .environment(AppState())
}

