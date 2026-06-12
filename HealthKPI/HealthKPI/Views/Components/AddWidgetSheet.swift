import SwiftUI

// MARK: - Add Widget Sheet
//
// Presented from the Dashboard's "Add Widget" button. Shows every widget
// that is not currently pinned; tapping one adds it to the dashboard and
// dismisses the sheet.

struct AddWidgetSheet: View {
    @EnvironmentObject var vm: HealthViewModel
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        NavigationStack {
            ZStack {
                Theme.background.ignoresSafeArea()

                ScrollView {
                    VStack(spacing: 10) {
                        if vm.availableWidgets.isEmpty {
                            emptyState
                        } else {
                            ForEach(vm.availableWidgets) { kind in
                                widgetRow(kind)
                            }
                        }
                    }
                    .padding(.horizontal, 16)
                    .padding(.top, 8)
                    .padding(.bottom, 40)
                }
            }
            .navigationTitle("Add Widget")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
        }
    }

    // MARK: Row

    private func widgetRow(_ kind: HomeWidgetKind) -> some View {
        Button {
            withAnimation(.spring(response: 0.32, dampingFraction: 0.85)) {
                vm.addWidget(kind)
            }
            dismiss()
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(kind.tint.opacity(colorScheme == .dark ? 0.20 : 0.15))
                        .frame(width: 44, height: 44)
                    Image(systemName: kind.icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(kind.tint)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(kind.title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.textPrimary(colorScheme))
                    Text(kind.subtitle)
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.textSecondary(colorScheme))
                        .lineLimit(2)
                }

                Spacer(minLength: 0)

                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 22))
                    .foregroundStyle(kind.tint)
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
            .cardSurface(cornerRadius: 18)
        }
        .buttonStyle(.plain)
    }

    // MARK: Empty state

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 34))
                .foregroundStyle(Theme.excellent)
            Text("All widgets added")
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Theme.textPrimary(colorScheme))
            Text("Remove a widget from the dashboard to make room.")
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Theme.textSecondary(colorScheme))
                .multilineTextAlignment(.center)
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 56)
        .cardSurface(cornerRadius: Theme.Radius.lg)
    }
}

#Preview {
    AddWidgetSheet().environmentObject(HealthViewModel())
}
