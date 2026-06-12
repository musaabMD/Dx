//
//  MainDashboardView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct MainDashboardView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedTab = 0
    
    var body: some View {
        TabView(selection: $selectedTab) {
            HomeView()
                .tabItem {
                    Label("Home", systemImage: "house.fill")
                }
                .tag(0)
            
            QBankView()
                .tabItem {
                    Label("QBank", systemImage: "book.fill")
                }
                .tag(1)
            
            MockExamsView()
                .tabItem {
                    Label("Mock Exams", systemImage: "doc.text.fill")
                }
                .tag(2)
            
            LeaderboardView()
                .tabItem {
                    Label("Leaderboard", systemImage: "trophy.fill")
                }
                .tag(3)
            
            ProfileView()
                .tabItem {
                    Label("Profile", systemImage: "person.fill")
                }
                .tag(4)
        }
    }
}

struct HomeView: View {
    @Environment(AppState.self) private var appState
    
    var user: User? {
        appState.currentUser
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Header
                        HStack {
                            VStack(alignment: .leading, spacing: 4) {
                                Text("Hello, \(user?.name ?? "Student")!")
                                    .font(.title.bold())
                                Text("Let's continue learning")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            
                            Spacer()
                            
                            // Streak badge
                            VStack(spacing: 4) {
                                Image(systemName: "flame.fill")
                                    .font(.title2)
                                    .foregroundStyle(.orange)
                                Text("\(user?.currentStreak ?? 0)")
                                    .font(.headline.bold())
                                Text("day streak")
                                    .font(.caption2)
                                    .foregroundStyle(.secondary)
                            }
                            .padding()
                            .background(Color.orange.opacity(0.15))
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .glassEffect(.regular.tint(.orange), in: .rect(cornerRadius: 16))
                        }
                        .padding()
                        
                        // Daily limit card (for free users)
                        if user?.isPremium == false {
                            DailyLimitCard(used: user?.dailyQuestionsUsed ?? 0, total: 30)
                        }
                        
                        // Quick actions
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Quick Start")
                                .font(.title2.bold())
                                .padding(.horizontal)
                            
                            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                                QuickActionCard(
                                    icon: "book.fill",
                                    title: "Study Mode",
                                    color: .blue,
                                    destination: AnyView(StudyModeView())
                                )
                                
                                QuickActionCard(
                                    icon: "timer",
                                    title: "Exam Mode",
                                    color: .red,
                                    destination: AnyView(ExamModeView())
                                )
                                
                                QuickActionCard(
                                    icon: "bolt.fill",
                                    title: "Last Min Review",
                                    color: .orange,
                                    destination: AnyView(LastMinReviewView())
                                )
                                
                                QuickActionCard(
                                    icon: "list.bullet.clipboard.fill",
                                    title: "Mock Exam",
                                    color: .purple,
                                    destination: AnyView(MockExamsView())
                                )
                            }
                            .padding(.horizontal)
                        }
                        
                        // Progress section
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Your Progress")
                                .font(.title2.bold())
                                .padding(.horizontal)
                            
                            ProgressCard()
                        }
                        
                        // Recent activity
                        VStack(alignment: .leading, spacing: 16) {
                            Text("Continue Learning")
                                .font(.title2.bold())
                                .padding(.horizontal)
                            
                            Text("Start your first study session!")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                                .padding()
                                .frame(maxWidth: .infinity)
                                .background(Color(.secondarySystemGroupedBackground))
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                                .padding(.horizontal)
                        }
                    }
                    .padding(.bottom, 30)
                }
            }
            .navigationTitle(appState.selectedExam?.name ?? "TestPrep")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct DailyLimitCard: View {
    let used: Int
    let total: Int
    @Environment(AppState.self) private var appState
    
    var progress: Double {
        Double(used) / Double(total)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Daily Questions")
                        .font(.headline)
                    Text("\(used) of \(total) used today")
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                
                Spacer()
                
                Button {
                    appState.showPaywall = true
                } label: {
                    Text("Upgrade")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(
                            LinearGradient(colors: [.purple, .blue], startPoint: .leading, endPoint: .trailing)
                        )
                        .clipShape(Capsule())
                }
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.2))
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(
                            LinearGradient(
                                colors: progress > 0.8 ? [.orange, .red] : [.blue, .purple],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * progress)
                }
            }
            .frame(height: 8)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .glassEffect(.regular, in: .rect(cornerRadius: 16))
        .padding(.horizontal)
    }
}

struct QuickActionCard: View {
    let icon: String
    let title: String
    let color: Color
    let destination: AnyView
    @State private var isNavigating = false
    
    var body: some View {
        Button {
            isNavigating = true
        } label: {
            VStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.system(size: 32))
                    .foregroundStyle(color)
                    .frame(width: 60, height: 60)
                    .background(color.opacity(0.15))
                    .clipShape(Circle())
                
                Text(title)
                    .font(.subheadline.bold())
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.center)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .glassEffect(.regular, in: .rect(cornerRadius: 16))
        }
        .sheet(isPresented: $isNavigating) {
            destination
        }
    }
}

struct ProgressCard: View {
    var body: some View {
        VStack(spacing: 16) {
            ProgressRow(label: "Questions Answered", value: 0, total: 100, color: .blue)
            ProgressRow(label: "Correct Answers", value: 0, total: 100, color: .green)
            ProgressRow(label: "Study Time", value: 0, total: 60, color: .purple, unit: "min")
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .glassEffect(.regular, in: .rect(cornerRadius: 16))
        .padding(.horizontal)
    }
}

struct ProgressRow: View {
    let label: String
    let value: Int
    let total: Int
    let color: Color
    var unit: String = ""
    
    var progress: Double {
        guard total > 0 else { return 0 }
        return Double(value) / Double(total)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(label)
                    .font(.subheadline)
                Spacer()
                Text("\(value)\(unit.isEmpty ? "" : " \(unit)")")
                    .font(.subheadline.bold())
                    .foregroundStyle(color)
            }
            
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.gray.opacity(0.2))
                    
                    RoundedRectangle(cornerRadius: 3)
                        .fill(color)
                        .frame(width: geometry.size.width * progress)
                }
            }
            .frame(height: 6)
        }
    }
}

#Preview {
    MainDashboardView()
        .environment(AppState())
}
