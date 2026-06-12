//
//  CityCard.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import SwiftUI

struct CityCard: View {
    let city: CityData
    let onBookmarkToggle: () -> Void

    var body: some View {
        ZStack {
            cardBackground
                .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))

            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(Color.black.opacity(0.2))

            HStack(alignment: .top, spacing: 8) {
                // Left side - City info
                VStack(alignment: .leading, spacing: 4) {
                    // City name with flag
                    HStack(spacing: 6) {
                        Text(city.flagEmoji)
                            .font(.system(size: 20))

                        Text(city.cityName)
                            .font(.system(size: 22, weight: .bold, design: .rounded))
                            .foregroundColor(.white)
                    }

                    // Rating with star icon
                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .font(.system(size: 11))
                            .foregroundColor(.yellow)

                        Text(String(format: "%.1f", city.rating))
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(.white.opacity(0.9))

                        Text("(\(city.reviewCount))")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                    }

                    Spacer()

                    // Flight info with airplane icon
                    HStack(spacing: 4) {
                        Image(systemName: "airplane")
                            .font(.system(size: 11))
                            .foregroundColor(.white.opacity(0.9))

                        Text(city.formattedFlightDuration)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.white.opacity(0.9))
                    }
                }

                Spacer(minLength: 8)

                // Right side - Weather and bookmark
                VStack(alignment: .trailing, spacing: 8) {
                    // Bookmark button
                    Button(action: {
                        onBookmarkToggle()
                    }) {
                        Image(systemName: city.isBookmarked ? "bookmark.fill" : "bookmark")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundColor(.white)
                            .frame(width: 32, height: 32)
                            .background(
                                Circle()
                                    .fill(Color.black.opacity(0.35))
                            )
                    }
                    .buttonStyle(PlainButtonStyle())
                    .zIndex(1)

                    Spacer()

                    // Weather now
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(city.weatherNow)
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.white.opacity(0.9))

                        Text("\(city.weatherTemperature)°")
                            .font(.system(size: 24, weight: .light, design: .rounded))
                            .foregroundColor(.white)
                    }
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(height: 128)
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(
                    LinearGradient(
                        colors: [Color.white.opacity(0.35), Color.white.opacity(0.05)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ),
                    lineWidth: 1
                )
        )
        .shadow(color: Color.black.opacity(0.3), radius: 24, x: 0, y: 14)
    }

    @ViewBuilder
    private var cardBackground: some View {
        if let imageURL = city.imageURL,
           let url = URL(string: imageURL) {
            CachedAsyncImage(url: url) { image in
                image
                    .resizable()
                    .aspectRatio(contentMode: .fill)
                    .overlay(
                        LinearGradient(
                            colors: [Color.black.opacity(0.2), Color.black.opacity(0.7)],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            } placeholder: {
                backgroundGradient
            }
        } else {
            backgroundGradient
        }
    }

    private var backgroundGradient: LinearGradient {
        let colors = generateGradientColors(for: city.cityName)
        return LinearGradient(
            gradient: Gradient(colors: colors),
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
    }

    private func generateGradientColors(for cityName: String) -> [Color] {
        let hash = cityName.hashValue
        let hue = Double(abs(hash) % 360) / 360.0

        return [
            Color(hue: hue, saturation: 0.35, brightness: 0.35),
            Color(hue: hue, saturation: 0.4, brightness: 0.25)
        ]
    }
}

#Preview {
    VStack(spacing: 12) {
        CityCard(
            city: CityData(
                cityName: "Istanbul",
                country: "Turkey",
                countryCode: "TR",
                costPerDayPerPerson: 45,
                flightTimeHours: 3,
                flightCostPerPerson: 280,
                weatherNow: "Sunny",
                weatherTemperature: 18,
                rating: 4.7,
                reviewCount: 1250
            ),
            onBookmarkToggle: {}
        )
    }
    .padding(.horizontal, 20)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color(red: 0.07, green: 0.13, blue: 0.25))
}
