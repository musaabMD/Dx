//
//  UpgradeView.swift
//  99Widgets
//

import SwiftUI

struct UpgradeView: View {
    @EnvironmentObject private var viewModel: MainAppViewModel
    @Environment(\.dismiss) private var dismiss

    var showDoneButton: Bool = false

    var body: some View {
        NavigationStack {
            List {
                Section {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("99 Widgets Premium")
                            .font(.title2.weight(.bold))
                        Text("Unlock every template and future drops.")
                            .foregroundStyle(.secondary)
                    }
                    .padding(.vertical, 4)
                }

                Section("Included") {
                    Label("Premium templates", systemImage: "paintpalette.fill")
                    Label("More sizes soon", systemImage: "rectangle.expand.vertical")
                    Label("Priority ideas channel", systemImage: "star.fill")
                }

                Section {
                    if viewModel.isPremiumUnlocked {
                        Label("Premium active", systemImage: "checkmark.seal.fill")
                            .foregroundStyle(.green)
                    } else {
                        Button {
                            viewModel.unlockPremiumForDemo()
                        } label: {
                            Label("Unlock (demo)", systemImage: "lock.open.fill")
                        }
                    }
                } footer: {
                    Text("Wire StoreKit here for production. Demo button toggles premium locally.")
                }
            }
            .navigationTitle("Upgrade")
            .toolbar {
                if showDoneButton {
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Done") { dismiss() }
                    }
                }
            }
        }
    }
}

#Preview {
    UpgradeView()
        .environmentObject(MainAppViewModel())
}
