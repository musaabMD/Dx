import SwiftUI

struct AnalyticsTabView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Performance Overview
                GroupBox("Performance Overview") {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Predicted Score")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        HStack(alignment: .firstTextBaseline, spacing: 8) {
                            Text("7.5").font(.system(size: 40, weight: .bold))
                            Text("/ 9.0").font(.title3).foregroundStyle(.secondary)
                        }
                        ProgressView(value: 0.75)
                            .tint(.blue)
                    }
                }
                .padding(.horizontal)

                // Material Completed
                GroupBox("Material Completed") {
                    VStack(alignment: .leading, spacing: 8) {
                        let total = appState.selectedExam?.totalQuestions ?? appState.allQuestions.count
                        let completed = Int(Double(total) * 0.42)
                        Text("Overall: 42%")
                        ProgressView(value: 0.42)
                            .tint(.green)
                        Text("\(completed) / \(total) questions")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }
                .padding(.horizontal)

                // Streak & Activity
                GroupBox("Activity") {
                    HStack {
                        VStack(alignment: .leading) {
                            Label("Current Streak", systemImage: "flame.fill")
                            Text("\(appState.currentUser?.currentStreak ?? 0) days").font(.title3.bold())
                        }
                        Spacer()
                        VStack(alignment: .leading) {
                            Label("Total Points", systemImage: "star.fill")
                            Text("\(appState.currentUser?.totalPoints ?? 0)").font(.title3.bold())
                        }
                    }
                }
                .padding(.horizontal)

                Spacer(minLength: 20)
            }
            .padding(.vertical)
        }
        .navigationTitle("Analytics")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview {
    NavigationStack { AnalyticsTabView().environment(AppState()) }
}
