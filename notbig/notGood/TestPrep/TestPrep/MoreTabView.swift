import SwiftUI

struct MoreTabView: View {
    @Environment(AppState.self) private var appState
    @State private var showProfile = false

    var body: some View {
        NavigationStack {
            List {
                Section("Account") {
                    Button {
                        showProfile = true
                    } label: {
                        HStack {
                            Image(systemName: "person.crop.circle.fill").foregroundStyle(.blue)
                            Text(appState.currentUser?.name ?? "Sign In")
                            Spacer()
                            Image(systemName: "chevron.right").foregroundStyle(.secondary)
                        }
                    }
                }

                Section("Exam Settings") {
                    HStack {
                        Image(systemName: appState.selectedExam?.icon ?? "book.fill").foregroundStyle(.blue)
                        Text(appState.selectedExam?.name ?? "Select Exam")
                        Spacer()
                        NavigationLink("Change") { ExamSelectionView() }
                    }
                }

                Section("Preferences") {
                    Toggle(isOn: .constant(true)) { Text("Show images") }
                    Toggle(isOn: .constant(true)) { Text("One-line summaries") }
                }

                if appState.currentUser?.isPremium == false {
                    Section {
                        Button {
                            appState.showPaywall = true
                        } label: {
                            HStack {
                                Image(systemName: "star.circle.fill").foregroundStyle(.yellow)
                                Text("Upgrade to Premium")
                            }
                        }
                    }
                }
            }
            .navigationTitle("More")
            .sheet(isPresented: $showProfile) { NewProfileView() }
        }
    }
}

#Preview {
    MoreTabView().environment(AppState())
}
