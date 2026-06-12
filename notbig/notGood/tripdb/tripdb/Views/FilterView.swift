//
//  FilterView.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import SwiftUI

struct FilterView: View {
    @Binding var isPresented: Bool
    @Binding var filters: CityFilters

    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Dimmed background - covers everything including tab bar
                Color.black.opacity(0.4)
                    .ignoresSafeArea()
                    .onTapGesture {
                        withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                            isPresented = false
                        }
                    }

                // Filter card - extends to bottom edge
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        Button(action: {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                                isPresented = false
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .fill(.ultraThinMaterial)
                                    .frame(width: 36, height: 36)
                                    .overlay(
                                        Circle()
                                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                    )

                                Image(systemName: "xmark")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }

                        Spacer()

                        VStack(spacing: 2) {
                            Text("Filters")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(.white)

                            if filters.activeCount > 0 {
                                Text("\(filters.activeCount) active")
                                    .font(.system(size: 12, weight: .medium))
                                    .foregroundColor(.white.opacity(0.6))
                            }
                        }

                        Spacer()

                        Button(action: {
                            withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                                isPresented = false
                            }
                        }) {
                            ZStack {
                                Circle()
                                    .fill(.ultraThinMaterial)
                                    .frame(width: 36, height: 36)
                                    .overlay(
                                        Circle()
                                            .stroke(Color.white.opacity(0.2), lineWidth: 1)
                                    )

                                Image(systemName: "checkmark")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                            }
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 20)

                    ScrollView(showsIndicators: false) {
                        VStack(spacing: 0) {
                            FilterToggleRow(
                                title: "Top Rated",
                                subtitle: "Rating 4.7 and above",
                                isOn: $filters.topRated
                            )

                            FilterDivider()

                            FilterToggleRow(
                                title: "Budget Friendly",
                                subtitle: "$50 per day or less",
                                isOn: $filters.budgetFriendly
                            )

                            FilterDivider()

                            FilterToggleRow(
                                title: "Short Flight",
                                subtitle: "4 hours or less",
                                isOn: $filters.shortFlight
                            )

                            FilterDivider()

                            FilterToggleRow(
                                title: "Warm Weather",
                                subtitle: "20°C and above",
                                isOn: $filters.warmWeather
                            )

                            VStack(spacing: 12) {
                                Button(action: {
                                    withAnimation(.spring(response: 0.35, dampingFraction: 0.85)) {
                                        filters = CityFilters()
                                    }
                                }) {
                                    Text("Reset Filters")
                                        .font(.system(size: 15, weight: .semibold))
                                        .foregroundColor(.white)
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(
                                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                                .fill(Color.white.opacity(0.08))
                                        )
                                }
                            }
                            .padding(.horizontal, 20)
                            .padding(.top, 24)

                            // Bottom padding to account for safe area
                            Spacer()
                                .frame(height: geometry.safeAreaInsets.bottom + 40)
                        }
                    }
                }
                .glassSurface(cornerRadius: 26, tintOpacity: 0.08, strokeOpacity: 0.25, shadowOpacity: 0.2)
                .padding(.horizontal, 12)
                .padding(.top, 60)
                .ignoresSafeArea(edges: .bottom)
            }
        }
        .ignoresSafeArea()
    }
}

// MARK: - Supporting Views

struct FilterDivider: View {
    var body: some View {
        Rectangle()
            .fill(Color.white.opacity(0.08))
            .frame(height: 1)
            .padding(.leading, 20)
    }
}

struct FilterToggleRow: View {
    let title: String
    let subtitle: String
    @Binding var isOn: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack {
                Text(title)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.white)

                Spacer()

                Toggle("", isOn: $isOn)
                    .labelsHidden()
                    .tint(GlassPalette.accent)
            }

            Text(subtitle)
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(.white.opacity(0.6))
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }
}

#Preview {
    FilterView(isPresented: .constant(true), filters: .constant(CityFilters()))
        .background(GlassBackground())
}
