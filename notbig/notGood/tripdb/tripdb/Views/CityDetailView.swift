//
//  CityDetailView.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import SwiftUI

struct CityDetailView: View {
    let city: CityData
    @Environment(\.dismiss) private var dismiss
    @State private var activeReviewCategory: ReviewCategory?
    
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.06, green: 0.12, blue: 0.26),
                    Color(red: 0.05, green: 0.09, blue: 0.18),
                    Color(red: 0.03, green: 0.06, blue: 0.13)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    // Hero header with image
                    heroHeader
                        .padding(.top, 42)
                    
                    // Main content
                    VStack(spacing: 16) {
                        // Quick stats
                        quickStatsSection
                        
                        // Weather & Climate
                        weatherSection

                        // Cost & Stay
                        staySection

                        // Lifestyle
                        lifestyleSection

                        // Safety & Environment
                        safetyEnvironmentSection

                        // Connectivity & Travel
                        connectivityTravelSection
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    .padding(.bottom, 40)
                }
            }
            
            // Header with back button
            VStack {
                HStack {
                    Button(action: {
                        dismiss()
                    }) {
                        ZStack {
                            Circle()
                                .fill(.ultraThinMaterial)
                                .frame(width: 36, height: 36)
                            
                            Image(systemName: "chevron.left")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    }
                    
                    Spacer()
                    
                    Button(action: {
                        // Share action
                    }) {
                        ZStack {
                            Circle()
                                .fill(.ultraThinMaterial)
                                .frame(width: 36, height: 36)
                            
                            Image(systemName: "square.and.arrow.up")
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(.white)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 8)
                
                Spacer()
            }
        }
        .toolbar(.hidden, for: .navigationBar)
        .sheet(item: $activeReviewCategory) { category in
            ReviewSheet(category: category)
        }
    }
    
    // MARK: - View Components
    
    private var heroHeader: some View {
        ZStack(alignment: .center) {
            if let imageURL = city.imageURL,
               let url = URL(string: imageURL) {
                CachedAsyncImage(url: url) { image in
                    image
                        .resizable()
                        .aspectRatio(contentMode: .fill)
                        .overlay(
                            LinearGradient(
                                colors: [Color.black.opacity(0.1), Color.black.opacity(0.65)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                } placeholder: {
                    LinearGradient(
                        colors: [
                            Color(red: 0.12, green: 0.20, blue: 0.36),
                            Color(red: 0.08, green: 0.12, blue: 0.22)
                        ],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                }
            } else {
                LinearGradient(
                    colors: [
                        Color(red: 0.12, green: 0.20, blue: 0.36),
                        Color(red: 0.08, green: 0.12, blue: 0.22)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }

            VStack(spacing: 10) {
                Text(city.country.uppercased())
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white.opacity(0.7))
                    .tracking(1.2)

                HStack(spacing: 8) {
                    Text(city.flagEmoji)
                        .font(.system(size: 24))

                    Text(city.cityName)
                        .font(.system(size: 30, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                }

                Text("\(city.weatherTemperature)°")
                    .font(.system(size: 64, weight: .thin, design: .rounded))
                    .foregroundColor(.white)

                Text(city.weatherNow)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white.opacity(0.85))

                Text("H:\(city.weatherTemperature + 3)°  L:\(city.weatherTemperature - 4)°")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.75))
            }
            .frame(maxWidth: .infinity)
        }
        .frame(height: 280)
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .padding(.horizontal, 16)
    }
    
    private var quickStatsSection: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                QuickStatCard(
                    icon: "star.fill",
                    iconColor: .yellow,
                    value: String(format: "%.1f", city.rating),
                    label: "Rating"
                )
                
                QuickStatCard(
                    icon: "dollarsign.circle.fill",
                    iconColor: .green,
                    value: "$\(Int(city.costPerDayPerPerson))",
                    label: "Per Day"
                )
                
                QuickStatCard(
                    icon: "airplane",
                    iconColor: .blue,
                    value: "\(city.flightTimeHours)h",
                    label: "Flight"
                )
            }
        }
    }
    
    private var staySection: some View {
        SectionCard(icon: "🧳", title: "Cost & Stay") {
            VStack(spacing: 12) {
                VisualInfoRow(emoji: "🍽️", label: "Budget meal", value: "$4-7", indicator: .low)
                VisualInfoRow(emoji: "🏨", label: "City center", value: "$578/mo", indicator: .medium)
                VisualInfoRow(emoji: "🏘️", label: "Outside center", value: "$372/mo", indicator: .low)
                VisualInfoRow(emoji: "✈️", label: "Flight time", value: "\(city.flightTimeHours)h", indicator: .medium)
                VisualInfoRow(emoji: "💺", label: "Flight cost", value: "$\(Int(city.flightCostPerPerson))", indicator: .medium)

                ReviewFooter(title: "See 2,334 user reviews") {
                    activeReviewCategory = .stay
                }
            }
        }
    }

    private var lifestyleSection: some View {
        SectionCard(icon: "🍕", title: "Lifestyle") {
            VStack(spacing: 12) {
                VisualInfoRow(emoji: "🥙", label: "Local food", value: "Very affordable", indicator: .low)
                VisualInfoRow(emoji: "☕", label: "Coffee", value: "$3", indicator: .low)
                VisualInfoRow(emoji: "💪", label: "Gym membership", value: "$62/mo", indicator: .medium)

                HStack {
                    Text("🗣️ Main language")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))

                    Spacer()

                    Text("Arabic")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }

                QualityBar(emoji: "🏥", label: "Healthcare", quality: .excellent, description: "Modern facilities")

                ReviewFooter(title: "See 2,334 user reviews") {
                    activeReviewCategory = .lifestyle
                }
            }
        }
    }
    
    private var weatherSection: some View {
        SectionCard(icon: "🌡️", title: "Weather & Climate") {
            VStack(spacing: 14) {
                // Temperature display
                VStack(alignment: .leading, spacing: 8) {
                    HStack {
                        Text("🔥 Current")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.7))
                        
                        Spacer()
                        
                        VStack(alignment: .trailing, spacing: 2) {
                            Text("31°C / 88°F")
                                .font(.system(size: 16, weight: .bold))
                                .foregroundColor(.white)
                            
                            Text("Feels like 38°C")
                                .font(.system(size: 12, weight: .medium))
                                .foregroundColor(.white.opacity(0.7))
                        }
                    }
                    
                    // Temperature bar
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 4)
                            .fill(Color.white.opacity(0.1))
                            .frame(height: 8)
                        
                        RoundedRectangle(cornerRadius: 4)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color(red: 0.40, green: 0.65, blue: 0.95),
                                        Color(red: 0.20, green: 0.45, blue: 0.85)
                                    ],
                                    startPoint: .leading,
                                    endPoint: .trailing
                                )
                            )
                            .frame(width: 200 * 0.75, height: 8)
                    }
                    .frame(maxWidth: .infinity)
                }
                
                Divider()
                    .background(Color.white.opacity(0.1))
                
                QualityBar(emoji: "❄️", label: "A/C coverage", quality: .excellent, description: "90% - Essential!")
                QualityBar(emoji: "☀️", label: "Summer", quality: .bad, description: "Extremely hot")
                QualityBar(emoji: "🌊", label: "Climate risk", quality: .good, description: "Moderate")
            }
        }
    }
    
    private var safetyEnvironmentSection: some View {
        SectionCard(icon: "🛡️", title: "Safety & Environment") {
            VStack(spacing: 12) {
                QualityBar(emoji: "👮", label: "Crime", quality: .good, description: "Low crime rate")
                QualityBar(emoji: "👩", label: "Women safety", quality: .good, description: "Generally safe")
                QualityBar(emoji: "💨", label: "Air quality", quality: .medium, description: "Moderate")
                QualityBar(emoji: "🚦", label: "Traffic safety", quality: .bad, description: "Use caution")

                ReviewFooter(title: "See 2,334 user reviews") {
                    activeReviewCategory = .safetyEnvironment
                }
            }
        }
    }

    private var connectivityTravelSection: some View {
        SectionCard(icon: "📶", title: "Connectivity & Travel") {
            VStack(spacing: 12) {
                VisualInfoRow(emoji: "📡", label: "Internet speed", value: "24 Mbps", indicator: .medium)
                VisualInfoRow(emoji: "📱", label: "Mobile plan", value: "$20/mo", indicator: .low)
                VisualInfoRow(emoji: "🚶", label: "Walkability", value: "High", indicator: .medium)
                QualityBar(emoji: "🛫", label: "Airlines", quality: .good, description: "Good service")

                ReviewFooter(title: "See 2,334 user reviews") {
                    activeReviewCategory = .connectivityTravel
                }
            }
        }
    }
    
    // MARK: - Helper Functions
    
}

// MARK: - Component Views

struct QuickStatCard: View {
    let icon: String
    let iconColor: Color
    let value: String
    let label: String
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(iconColor)
            
            Text(value)
                .font(.system(size: 18, weight: .bold))
                .foregroundColor(.white)
            
            Text(label)
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(.white.opacity(0.6))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 16)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(Color.white.opacity(0.06))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
        )
    }
}

struct SectionCard<Content: View>: View {
    let icon: String
    let title: String
    @ViewBuilder let content: Content
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack(spacing: 8) {
                Text(icon)
                    .font(.system(size: 20))
                
                Text(title)
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(.white)
            }
            
            content
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(Color.white.opacity(0.06))
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(Color.white.opacity(0.12), lineWidth: 1)
                )
        )
    }
}

struct InfoRow: View {
    let emoji: String
    let label: String
    let value: String
    var highlight: Bool = false
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Text(emoji)
                .font(.system(size: 16))
            
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.7))
            
            Spacer()
            
            Text(value)
                .font(.system(size: 14, weight: highlight ? .semibold : .regular))
                .foregroundColor(highlight ? .green : .white)
                .multilineTextAlignment(.trailing)
        }
    }
}

struct VisualInfoRow: View {
    let emoji: String
    let label: String
    let value: String
    let indicator: PriceIndicator
    
    enum PriceIndicator {
        case low, medium, high
        
        var color: Color {
            switch self {
            case .low: return .green
            case .medium: return .orange
            case .high: return .red
            }
        }
        
        var text: String {
            switch self {
            case .low: return "💚"
            case .medium: return "🟡"
            case .high: return "🔴"
            }
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            Text(emoji)
                .font(.system(size: 16))
            
            Text(label)
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.7))
            
            Spacer()
            
            HStack(spacing: 6) {
                Text(value)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)
                
                Text(indicator.text)
                    .font(.system(size: 12))
            }
        }
    }
}

struct QualityBar: View {
    let emoji: String
    let label: String
    let quality: Quality
    let description: String
    
    enum Quality {
        case excellent, good, medium, bad
        
        var color: Color {
            switch self {
            case .excellent: return .green
            case .good: return Color(red: 0.5, green: 0.8, blue: 0.3)
            case .medium: return .orange
            case .bad: return .red
            }
        }
        
        var width: CGFloat {
            switch self {
            case .excellent: return 1.0
            case .good: return 0.75
            case .medium: return 0.5
            case .bad: return 0.3
            }
        }
        
        var icon: String {
            switch self {
            case .excellent: return "checkmark.circle.fill"
            case .good: return "checkmark.circle"
            case .medium: return "exclamationmark.circle"
            case .bad: return "xmark.circle.fill"
            }
        }
    }
    
    var body: some View {
        VStack(spacing: 8) {
            HStack {
                Text(emoji)
                    .font(.system(size: 16))
                
                Text(label)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                
                Spacer()
                
                HStack(spacing: 4) {
                    Image(systemName: quality.icon)
                        .font(.system(size: 12))
                        .foregroundColor(quality.color)
                    
                    Text(description)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(quality.color)
                }
            }
            
            // Progress bar
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 3)
                        .fill(Color.white.opacity(0.1))
                        .frame(height: 6)
                    
                    RoundedRectangle(cornerRadius: 3)
                        .fill(quality.color)
                        .frame(width: geo.size.width * quality.width, height: 6)
                }
            }
            .frame(height: 6)
        }
    }
}

struct AffordabilityBadge: View {
    let level: String
    
    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: "checkmark.seal.fill")
                .font(.system(size: 16))
                .foregroundColor(.green)
            
            Text(level)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.green)
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 20)
                .fill(Color.green.opacity(0.15))
        )
    }
}

// MARK: - Reviews

struct Review: Identifiable {
    let id = UUID()
    let author: String
    let title: String
    let body: String
    let rating: Int
}

enum ReviewCategory: String, Identifiable, CaseIterable {
    case stay
    case lifestyle
    case safetyEnvironment
    case connectivityTravel

    var id: String { rawValue }

    var title: String {
        switch self {
        case .stay: return "Cost & Stay"
        case .lifestyle: return "Lifestyle"
        case .safetyEnvironment: return "Safety & Environment"
        case .connectivityTravel: return "Connectivity & Travel"
        }
    }

    var reviews: [Review] {
        switch self {
        case .stay:
            return [
                Review(author: "Leila", title: "Affordable stay", body: "Daily costs stayed low without sacrificing comfort.", rating: 5),
                Review(author: "Omar", title: "Good long-stay value", body: "Outside-center rentals feel fair for the space.", rating: 4),
                Review(author: "Nora", title: "Flights are reasonable", body: "Prices were stable for regional routes.", rating: 4)
            ]
        case .lifestyle:
            return [
                Review(author: "Zoe", title: "Great local eats", body: "Affordable food options everywhere.", rating: 5),
                Review(author: "Samir", title: "Good daily rhythm", body: "Gyms and cafes fit a steady routine.", rating: 4),
                Review(author: "Evan", title: "Language manageable", body: "Basics are enough in most areas.", rating: 4)
            ]
        case .safetyEnvironment:
            return [
                Review(author: "Amal", title: "Felt safe", body: "Comfortable walking at night in most areas.", rating: 5),
                Review(author: "Iris", title: "Air quality varies", body: "Some days were hazy, but mostly fine.", rating: 3),
                Review(author: "Tom", title: "Calm overall", body: "Low petty crime in tourist zones.", rating: 4)
            ]
        case .connectivityTravel:
            return [
                Review(author: "Ben", title: "Mobile data is good", body: "SIM setup was quick and coverage solid.", rating: 4),
                Review(author: "Tara", title: "Walkable core", body: "Central areas are easy on foot.", rating: 5),
                Review(author: "Ria", title: "Airlines solid", body: "Service felt consistent for regional flights.", rating: 4)
            ]
        }
    }
}

struct ReviewFooter: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white.opacity(0.85))

                Spacer()

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(.white.opacity(0.6))
            }
            .padding(.vertical, 8)
        }
        .buttonStyle(PlainButtonStyle())
    }
}

struct ReviewSheet: View {
    let category: ReviewCategory
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color(red: 0.06, green: 0.08, blue: 0.12)
                .ignoresSafeArea()

            VStack(spacing: 16) {
                HStack {
                    Button(action: { dismiss() }) {
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

                    Text("\(category.title) Reviews")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)

                    Spacer()

                    Circle()
                        .fill(Color.clear)
                        .frame(width: 36, height: 36)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 12) {
                        ForEach(category.reviews) { review in
                            ReviewCard(review: review)
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.bottom, 24)
                }
            }
        }
    }
}

struct ReviewCard: View {
    let review: Review

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(review.author)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.white)

                Spacer()

                HStack(spacing: 2) {
                    ForEach(0..<5, id: \.self) { index in
                        Image(systemName: index < review.rating ? "star.fill" : "star")
                            .font(.system(size: 11))
                            .foregroundColor(index < review.rating ? .yellow : .white.opacity(0.3))
                    }
                }
            }

            Text(review.title)
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)

            Text(review.body)
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.7))
        }
        .padding(16)
        .glassSurface(cornerRadius: 16, tintOpacity: 0.06, strokeOpacity: 0.2, shadowOpacity: 0.15)
    }
}

#Preview {
    CityDetailView(
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
        )
    )
}
