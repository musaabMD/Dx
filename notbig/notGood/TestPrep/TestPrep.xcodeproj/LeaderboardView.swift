import SwiftUI

struct LeaderboardView: View {
    @Environment(AppState.self) private var appState
    
    var body: some View {
        List {
            Section("Top 10") {
                ForEach(1..<11) { rank in
                    LeaderboardRow(
                        rank: rank,
                        name: "User \(rank)",
                        points: 1000 - (rank * 50),
                        isCurrentUser: rank == 5
                    )
                }
            }
            
            Section("Your Position") {
                LeaderboardRow(
                    rank: currentRank,
                    name: appState.currentUser?.name ?? "You",
                    points: appState.currentUser?.totalPoints ?? 0,
                    isCurrentUser: true
                )
            }
        }
        .navigationTitle("Leaderboard")
        .navigationBarTitleDisplayMode(.large)
    }
    
    private var currentRank: Int {
        max(1, 140 - (appState.currentUser?.totalPoints ?? 0) / 20)
    }
}

private struct LeaderboardRow: View {
    let rank: Int
    let name: String
    let points: Int
    let isCurrentUser: Bool
    
    var body: some View {
        HStack(spacing: 12) {
            Text("#\(rank)")
                .font(.headline.bold())
                .foregroundStyle(rankColor)
                .frame(width: 40, alignment: .leading)
            
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.body)
                    .bold(isCurrentUser)
                Text("\(points) points")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            
            Spacer()
            
            if rank <= 3 {
                Image(systemName: medalIcon)
                    .foregroundStyle(rankColor)
            }
        }
        .padding(.vertical, 4)
        .background(isCurrentUser ? Color.blue.opacity(0.1) : Color.clear)
        .listRowBackground(isCurrentUser ? Color.blue.opacity(0.1) : Color.clear)
    }
    
    private var rankColor: Color {
        switch rank {
        case 1: return .yellow
        case 2: return .gray
        case 3: return .orange
        default: return .primary
        }
    }
    
    private var medalIcon: String {
        switch rank {
        case 1: return "medal.fill"
        case 2: return "medal.fill"
        case 3: return "medal.fill"
        default: return "star.fill"
        }
    }
}

#Preview {
    NavigationStack {
        LeaderboardView()
            .environment(AppState())
    }
}
