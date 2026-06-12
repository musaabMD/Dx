//
//  ProfileView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct ProfileView: View {
    @Environment(AppState.self) private var appState
    @State private var showSettings = false
    @State private var showPaywall = false
    
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
                        // Profile header
                        VStack(spacing: 16) {
                            // Avatar
                            ZStack {
                                Circle()
                                    .fill(
                                        LinearGradient(colors: [.blue, .purple], startPoint: .topLeading, endPoint: .bottomTrailing)
                                    )
                                    .frame(width: 100, height: 100)
                                
                                Text(user?.name.prefix(1).uppercased() ?? "U")
                                    .font(.system(size: 40, weight: .bold))
                                    .foregroundStyle(.white)
                            }
                            .glassEffect(.regular.tint(.blue), in: .circle)
                            
                            VStack(spacing: 4) {
                                Text(user?.name ?? "User")
                                    .font(.title.bold())
                                
                                Text(user?.email ?? "")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                                
                                // Premium badge
                                if user?.isPremium == true {
                                    HStack(spacing: 6) {
                                        Image(systemName: "crown.fill")
                                        Text("Premium Member")
                                    }
                                    .font(.caption.bold())
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 6)
                                    .background(
                                        LinearGradient(colors: [.yellow, .orange], startPoint: .leading, endPoint: .trailing)
                                    )
                                    .clipShape(Capsule())
                                } else {
                                    Button {
                                        showPaywall = true
                                    } label: {
                                        HStack(spacing: 6) {
                                            Image(systemName: "crown.fill")
                                            Text("Upgrade to Premium")
                                        }
                                        .font(.caption.bold())
                                        .foregroundStyle(.white)
                                        .padding(.horizontal, 12)
                                        .padding(.vertical, 6)
                                        .background(
                                            LinearGradient(colors: [.purple, .blue], startPoint: .leading, endPoint: .trailing)
                                        )
                                        .clipShape(Capsule())
                                    }
                                }
                            }
                        }
                        .padding()
                        .frame(maxWidth: .infinity)
                        .background(Color(.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 20))
                        .glassEffect(.regular, in: .rect(cornerRadius: 20))
                        .padding(.horizontal)
                        .padding(.top)
                        
                        // Stats grid
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 16) {
                            ProfileStatCard(
                                icon: "flame.fill",
                                value: "\(user?.currentStreak ?? 0)",
                                label: "Day Streak",
                                color: .orange
                            )
                            
                            ProfileStatCard(
                                icon: "star.fill",
                                value: "\(user?.totalPoints ?? 0)",
                                label: "Total Points",
                                color: .yellow
                            )
                            
                            ProfileStatCard(
                                icon: "bookmark.fill",
                                value: "\(user?.favoriteExams.count ?? 0)",
                                label: "Favorite Exams",
                                color: .blue
                            )
                            
                            ProfileStatCard(
                                icon: "checkmark.circle.fill",
                                value: "0",
                                label: "Completed",
                                color: .green
                            )
                        }
                        .padding(.horizontal)
                        
                        // Daily usage (for free users)
                        if user?.isPremium == false {
                            VStack(alignment: .leading, spacing: 12) {
                                Text("Daily Usage")
                                    .font(.headline)
                                
                                HStack {
                                    Text("\(user?.dailyQuestionsUsed ?? 0) of 30 questions used today")
                                        .font(.subheadline)
                                        .foregroundStyle(.secondary)
                                    
                                    Spacer()
                                    
                                    Button {
                                        showPaywall = true
                                    } label: {
                                        Text("Upgrade")
                                            .font(.caption.bold())
                                            .foregroundStyle(.white)
                                            .padding(.horizontal, 12)
                                            .padding(.vertical, 6)
                                            .background(Color.blue)
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
                                                    colors: [.blue, .purple],
                                                    startPoint: .leading,
                                                    endPoint: .trailing
                                                )
                                            )
                                            .frame(width: geometry.size.width * (Double(user?.dailyQuestionsUsed ?? 0) / 30.0))
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
                        
                        // Menu items
                        VStack(spacing: 0) {
                            ProfileMenuItem(
                                icon: "graduationcap.fill",
                                title: "My Exams",
                                color: .blue
                            ) {
                                // Navigate to exams
                            }
                            
                            Divider()
                                .padding(.leading, 60)
                            
                            ProfileMenuItem(
                                icon: "chart.bar.fill",
                                title: "Statistics",
                                color: .green
                            ) {
                                // Navigate to stats
                            }
                            
                            Divider()
                                .padding(.leading, 60)
                            
                            ProfileMenuItem(
                                icon: "heart.fill",
                                title: "Favorites",
                                color: .red
                            ) {
                                // Navigate to favorites
                            }
                            
                            Divider()
                                .padding(.leading, 60)
                            
                            ProfileMenuItem(
                                icon: "gearshape.fill",
                                title: "Settings",
                                color: .gray
                            ) {
                                showSettings = true
                            }
                        }
                        .background(Color(.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .glassEffect(.regular, in: .rect(cornerRadius: 16))
                        .padding(.horizontal)
                        
                        // About section
                        VStack(spacing: 0) {
                            ProfileMenuItem(
                                icon: "info.circle.fill",
                                title: "About",
                                color: .blue
                            ) {
                                // Show about
                            }
                            
                            Divider()
                                .padding(.leading, 60)
                            
                            ProfileMenuItem(
                                icon: "envelope.fill",
                                title: "Contact Support",
                                color: .purple
                            ) {
                                // Contact support
                            }
                            
                            Divider()
                                .padding(.leading, 60)
                            
                            ProfileMenuItem(
                                icon: "star.fill",
                                title: "Rate App",
                                color: .yellow
                            ) {
                                // Rate app
                            }
                        }
                        .background(Color(.secondarySystemGroupedBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                        .glassEffect(.regular, in: .rect(cornerRadius: 16))
                        .padding(.horizontal)
                        
                        // Sign out button
                        Button {
                            // Sign out
                        } label: {
                            Text("Sign Out")
                                .font(.headline)
                                .foregroundStyle(.red)
                                .frame(maxWidth: .infinity)
                                .padding()
                                .background(Color(.secondarySystemGroupedBackground))
                                .clipShape(RoundedRectangle(cornerRadius: 12))
                        }
                        .padding(.horizontal)
                        .padding(.bottom, 30)
                    }
                }
            }
            .navigationTitle("Profile")
            .sheet(isPresented: $showSettings) {
                SettingsView()
            }
            .sheet(isPresented: $showPaywall) {
                PaywallView()
            }
        }
    }
}

struct ProfileStatCard: View {
    let icon: String
    let value: String
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 12) {
            Image(systemName: icon)
                .font(.title)
                .foregroundStyle(color)
            
            Text(value)
                .font(.title.bold())
            
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .glassEffect(.regular, in: .rect(cornerRadius: 16))
    }
}

struct ProfileMenuItem: View {
    let icon: String
    let title: String
    let color: Color
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(color)
                    .frame(width: 30)
                
                Text(title)
                    .font(.body)
                    .foregroundStyle(.primary)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            .padding()
        }
    }
}

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @State private var notificationsEnabled = true
    @State private var soundEnabled = true
    @State private var darkMode = false
    
    var body: some View {
        NavigationStack {
            Form {
                Section("Preferences") {
                    Toggle("Push Notifications", isOn: $notificationsEnabled)
                    Toggle("Sound Effects", isOn: $soundEnabled)
                    Toggle("Dark Mode", isOn: $darkMode)
                }
                
                Section("Study Settings") {
                    Picker("Default Study Mode", selection: .constant(0)) {
                        Text("Study Mode").tag(0)
                        Text("Exam Mode").tag(1)
                    }
                    
                    Stepper("Questions per Session: \(25)", value: .constant(25), in: 10...100, step: 5)
                }
                
                Section("Privacy") {
                    NavigationLink("Privacy Policy") {
                        Text("Privacy Policy")
                    }
                    NavigationLink("Terms of Service") {
                        Text("Terms of Service")
                    }
                }
                
                Section {
                    Button("Reset Progress") {
                        // Reset
                    }
                    .foregroundStyle(.red)
                    
                    Button("Delete Account") {
                        // Delete
                    }
                    .foregroundStyle(.red)
                }
            }
            .navigationTitle("Settings")
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
    ProfileView()
        .environment(AppState())
}
