import SwiftUI

struct ProfileSheetView: View {
    @Environment(\.dismiss) private var dismiss
    @Binding var profile: UserProfile

    var body: some View {
        NavigationStack {
            Form {
                Section("Account") {
                    HStack {
                        Label("Name", systemImage: "person.fill")
                            .foregroundStyle(DesignTokens.ColorToken.brand)
                        Spacer()
                        TextField("Your name", text: $profile.name)
                            .multilineTextAlignment(.trailing)
                    }
                    HStack {
                        Label("Email", systemImage: "envelope.fill")
                            .foregroundStyle(DesignTokens.ColorToken.brand)
                        Spacer()
                        TextField("Email address", text: $profile.email)
                            .textInputAutocapitalization(.never)
                            .keyboardType(.emailAddress)
                            .multilineTextAlignment(.trailing)
                    }
                }

                Section("Stats") {
                    LabeledContent("Credits remaining", value: "\(profile.creditsRemaining)")
                    LabeledContent("Day streak", value: "\(profile.streakDays) days")
                    LabeledContent("Total XP", value: "\(profile.totalXP) XP")
                }

                Section("Subscription") {
                    LabeledContent("Plan", value: "Monthly · $25/mo")
                    Button("Restore Purchases") {}
                        .foregroundStyle(DesignTokens.ColorToken.brand)
                }
            }
            .navigationTitle("Edit Profile")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(DesignTokens.ColorToken.brand)
                }
            }
        }
    }
}
