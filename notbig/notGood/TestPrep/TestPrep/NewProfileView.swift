//
//  NewProfileView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct NewProfileView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var showPaywall = false
    
    var user: User? {
        appState.currentUser
    }
    
    var body: some View {
        NavigationStack {
            List {
                Section {
                    HStack(spacing: 16) {
                        // Avatar
                        Circle()
                            .fill(Color.blue)
                            .frame(width: 60, height: 60)
                            .overlay(
                                Text(user?.name.prefix(1).uppercased() ?? "U")
                                    .font(.title.bold())
                                    .foregroundStyle(.white)
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(user?.name ?? "User")
                                .font(.headline)
                            Text(user?.email ?? "")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 8)
                }
                
                if user?.isPremium == false {
                    Section {
                        Button {
                            showPaywall = true
                        } label: {
                            HStack {
                                Image(systemName: "star.circle.fill")
                                    .foregroundStyle(.blue)
                                Text("Upgrade to Premium")
                                    .foregroundStyle(.blue)
                                Spacer()
                                Image(systemName: "chevron.right")
                                    .foregroundStyle(.secondary)
                            }
                        }
                    }
                }
                
                Section("Stats") {
                    HStack {
                        Label("Streak", systemImage: "flame.fill")
                        Spacer()
                        Text("\(user?.currentStreak ?? 0) days")
                            .foregroundStyle(.secondary)
                    }
                    
                    HStack {
                        Label("Points", systemImage: "star.fill")
                        Spacer()
                        Text("\(user?.totalPoints ?? 0)")
                            .foregroundStyle(.secondary)
                    }
                    
                    HStack {
                        Label("Favorites", systemImage: "bookmark.fill")
                        Spacer()
                        Text("\(user?.favoriteExams.count ?? 0)")
                            .foregroundStyle(.secondary)
                    }
                }
                
                Section("Leaderboard") {
                    NavigationLink {
                        NewLeaderboardView()
                    } label: {
                        HStack {
                            Label("View Rankings", systemImage: "trophy.fill")
                        }
                    }
                }
                
                Section("Settings") {
                    NavigationLink {
                        SettingsView()
                    } label: {
                        Label("Preferences", systemImage: "gearshape.fill")
                    }
                    
                    NavigationLink {
                        Text("About")
                    } label: {
                        Label("About", systemImage: "info.circle.fill")
                    }
                    
                    NavigationLink {
                        Text("Help & Support")
                    } label: {
                        Label("Help & Support", systemImage: "questionmark.circle.fill")
                    }
                }
                
                Section {
                    Button(role: .destructive) {
                        // Sign out
                    } label: {
                        Text("Sign Out")
                            .frame(maxWidth: .infinity)
                    }
                }
            }
            .navigationTitle("Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showPaywall) {
                NewPaywallView()
            }
        }
    }
}

struct NewLeaderboardView: View {
    @Environment(AppState.self) private var appState
    
    var body: some View {
        List {
            Section("Top Users") {
                ForEach(appState.leaderboard) { entry in
                    HStack(spacing: 16) {
                        // Rank
                        Text("\(entry.rank)")
                            .font(.headline.bold())
                            .foregroundStyle(entry.rank <= 3 ? .blue : .secondary)
                            .frame(width: 30)
                        
                        // Avatar
                        Circle()
                            .fill(entry.userID == appState.currentUser?.id ? Color.blue : Color.gray)
                            .frame(width: 40, height: 40)
                            .overlay(
                                Text(entry.userName.prefix(1))
                                    .font(.headline)
                                    .foregroundStyle(.white)
                            )
                        
                        // Info
                        VStack(alignment: .leading, spacing: 4) {
                            HStack {
                                Text(entry.userName)
                                    .font(.headline)
                                if entry.userID == appState.currentUser?.id {
                                    Text("(You)")
                                        .font(.caption)
                                        .foregroundStyle(.blue)
                                }
                            }
                            
                            HStack(spacing: 12) {
                                Label("\(entry.totalPoints)", systemImage: "star.fill")
                                Label("\(entry.currentStreak)", systemImage: "flame.fill")
                            }
                            .font(.caption)
                            .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
            }
        }
        .navigationTitle("Leaderboard")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NewProfileView()
        .environment(AppState())
}
