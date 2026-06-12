//
//  LeaderboardView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct LeaderboardView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedPeriod: LeaderboardPeriod = .allTime
    
    enum LeaderboardPeriod: String, CaseIterable {
        case daily = "Today"
        case weekly = "This Week"
        case monthly = "This Month"
        case allTime = "All Time"
    }
    
    var currentUserRank: Int? {
        guard let user = appState.currentUser else { return nil }
        return appState.leaderboard.firstIndex { $0.userID == user.id }.map { $0 + 1 }
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Background gradient
                LinearGradient(
                    colors: [Color.yellow.opacity(0.3), Color.orange.opacity(0.2)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Period selector
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            ForEach(LeaderboardPeriod.allCases, id: \.self) { period in
                                Button {
                                    withAnimation {
                                        selectedPeriod = period
                                    }
                                } label: {
                                    Text(period.rawValue)
                                        .font(.subheadline.bold())
                                        .foregroundStyle(selectedPeriod == period ? .white : .primary)
                                        .padding(.horizontal, 20)
                                        .padding(.vertical, 10)
                                        .background(
                                            selectedPeriod == period ?
                                            LinearGradient(colors: [.orange, .yellow], startPoint: .leading, endPoint: .trailing) :
                                            LinearGradient(colors: [Color(.secondarySystemGroupedBackground)], startPoint: .leading, endPoint: .trailing)
                                        )
                                        .clipShape(Capsule())
                                }
                            }
                        }
                        .padding()
                    }
                    
                    // Top 3 podium
                    if appState.leaderboard.count >= 3 {
                        PodiumView(
                            first: appState.leaderboard[0],
                            second: appState.leaderboard[1],
                            third: appState.leaderboard[2]
                        )
                        .padding()
                    }
                    
                    // Leaderboard list
                    ScrollView {
                        LazyVStack(spacing: 12) {
                            ForEach(appState.leaderboard) { entry in
                                LeaderboardRow(
                                    entry: entry,
                                    isCurrentUser: entry.userID == appState.currentUser?.id
                                )
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Leaderboard")
            .navigationBarTitleDisplayMode(.inline)
        }
    }
}

struct PodiumView: View {
    let first: LeaderboardEntry
    let second: LeaderboardEntry
    let third: LeaderboardEntry
    
    var body: some View {
        HStack(alignment: .bottom, spacing: 12) {
            // Second place
            VStack(spacing: 12) {
                VStack(spacing: 8) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.white)
                        .frame(width: 70, height: 70)
                        .background(
                            LinearGradient(colors: [.gray, .gray.opacity(0.7)], startPoint: .top, endPoint: .bottom)
                        )
                        .clipShape(Circle())
                    
                    Text(second.userName)
                        .font(.caption.bold())
                        .lineLimit(1)
                    
                    Text("\(second.totalPoints) pts")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                
                ZStack(alignment: .top) {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.gray.opacity(0.3))
                        .frame(height: 100)
                    
                    Text("2")
                        .font(.title.bold())
                        .foregroundStyle(.white)
                        .padding(.top, 8)
                }
            }
            .frame(maxWidth: .infinity)
            
            // First place
            VStack(spacing: 12) {
                VStack(spacing: 8) {
                    ZStack {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 50))
                            .foregroundStyle(.white)
                            .frame(width: 90, height: 90)
                            .background(
                                LinearGradient(colors: [.yellow, .orange], startPoint: .top, endPoint: .bottom)
                            )
                            .clipShape(Circle())
                        
                        Image(systemName: "crown.fill")
                            .font(.title)
                            .foregroundStyle(.yellow)
                            .offset(y: -50)
                    }
                    
                    Text(first.userName)
                        .font(.subheadline.bold())
                        .lineLimit(1)
                    
                    Text("\(first.totalPoints) pts")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                
                ZStack(alignment: .top) {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(
                            LinearGradient(colors: [.yellow, .orange], startPoint: .top, endPoint: .bottom)
                        )
                        .frame(height: 140)
                    
                    Text("1")
                        .font(.title.bold())
                        .foregroundStyle(.white)
                        .padding(.top, 8)
                }
            }
            .frame(maxWidth: .infinity)
            
            // Third place
            VStack(spacing: 12) {
                VStack(spacing: 8) {
                    Image(systemName: "person.circle.fill")
                        .font(.system(size: 40))
                        .foregroundStyle(.white)
                        .frame(width: 70, height: 70)
                        .background(
                            LinearGradient(colors: [.orange, .orange.opacity(0.7)], startPoint: .top, endPoint: .bottom)
                        )
                        .clipShape(Circle())
                    
                    Text(third.userName)
                        .font(.caption.bold())
                        .lineLimit(1)
                    
                    Text("\(third.totalPoints) pts")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
                
                ZStack(alignment: .top) {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(Color.orange.opacity(0.3))
                        .frame(height: 80)
                    
                    Text("3")
                        .font(.title.bold())
                        .foregroundStyle(.white)
                        .padding(.top, 8)
                }
            }
            .frame(maxWidth: .infinity)
        }
        .padding()
        .background(Color(.secondarySystemGroupedBackground).opacity(0.5))
        .clipShape(RoundedRectangle(cornerRadius: 20))
        .glassEffect(.regular, in: .rect(cornerRadius: 20))
    }
}

struct LeaderboardRow: View {
    let entry: LeaderboardEntry
    let isCurrentUser: Bool
    
    var medalIcon: String? {
        switch entry.rank {
        case 1: return "medal.fill"
        case 2: return "medal.fill"
        case 3: return "medal.fill"
        default: return nil
        }
    }
    
    var medalColor: Color {
        switch entry.rank {
        case 1: return .yellow
        case 2: return .gray
        case 3: return .orange
        default: return .clear
        }
    }
    
    var body: some View {
        HStack(spacing: 16) {
            // Rank
            ZStack {
                if let icon = medalIcon {
                    Image(systemName: icon)
                        .font(.title2)
                        .foregroundStyle(medalColor)
                } else {
                    Text("\(entry.rank)")
                        .font(.headline.bold())
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 40)
            
            // Avatar
            Image(systemName: "person.circle.fill")
                .font(.system(size: 40))
                .foregroundStyle(isCurrentUser ? .blue : .gray)
            
            // Info
            VStack(alignment: .leading, spacing: 4) {
                HStack {
                    Text(entry.userName)
                        .font(.headline)
                    if isCurrentUser {
                        Text("(You)")
                            .font(.caption)
                            .foregroundStyle(.blue)
                    }
                }
                
                HStack(spacing: 16) {
                    Label("\(entry.totalPoints) pts", systemImage: "star.fill")
                        .font(.caption)
                        .foregroundStyle(.orange)
                    
                    Label("\(entry.currentStreak) day streak", systemImage: "flame.fill")
                        .font(.caption)
                        .foregroundStyle(.red)
                }
            }
            
            Spacer()
            
            // Arrow
            if !isCurrentUser {
                Image(systemName: "chevron.right")
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .background(
            isCurrentUser ?
            Color.blue.opacity(0.15) :
            Color(.secondarySystemGroupedBackground)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(isCurrentUser ? Color.blue : Color.clear, lineWidth: 2)
        )
        .glassEffect(.regular, in: .rect(cornerRadius: 12))
    }
}

#Preview {
    LeaderboardView()
        .environment(AppState())
}
