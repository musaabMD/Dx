//
//  WeatherCardView.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import SwiftUI

struct WeatherCardView: View {
    let weather: WeatherData
    
    var body: some View {
        ZStack {
            // Card background with different colors based on condition
            RoundedRectangle(cornerRadius: 18)
                .fill(cardBackground)
            
            // Sun glare effect for My Location card
            if weather.isMyLocation {
                Circle()
                    .fill(
                        RadialGradient(
                            gradient: Gradient(colors: [
                                Color.white.opacity(0.35),
                                Color.white.opacity(0.15),
                                Color.white.opacity(0.0)
                            ]),
                            center: .center,
                            startRadius: 5,
                            endRadius: 70
                        )
                    )
                    .frame(width: 140, height: 140)
                    .offset(x: 20, y: 10)
            }
            
            HStack(alignment: .top, spacing: 8) {
                // Left side - City info and condition
                VStack(alignment: .leading, spacing: 2) {
                    // City name
                    Text(weather.cityName)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(.white)
                    
                    // My Location or Time
                    if weather.isMyLocation {
                        Text("My Location")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                    } else if let time = weather.time {
                        Text(time)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                    }
                    
                    Spacer()
                    
                    // Weather condition at bottom left
                    Text(weather.condition.rawValue)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                }
                
                Spacer(minLength: 8)
                
                // Right side - Temperature
                VStack(alignment: .trailing, spacing: 0) {
                    // Current temperature - large
                    Text("\(weather.currentTemperature)°")
                        .font(.system(size: 52, weight: .light))
                        .foregroundColor(.white)
                        .lineLimit(1)
                        .minimumScaleFactor(0.7)
                        .fixedSize(horizontal: false, vertical: true)
                    
                    Spacer()
                    
                    // High/Low at bottom right
                    Text("H:\(weather.highTemperature)°  L:\(weather.lowTemperature)°")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                }
                .frame(maxWidth: .infinity, alignment: .trailing)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity, alignment: .leading)
        }
        .frame(height: 120)
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }
    
    private var cardBackground: LinearGradient {
        if weather.isNight {
            // Night mode - dark navy/black gradient
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.1, green: 0.12, blue: 0.25),
                    Color(red: 0.05, green: 0.06, blue: 0.15)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
        
        if weather.isMyLocation {
            // My Location - light blue gradient
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.38, green: 0.55, blue: 0.78),
                    Color(red: 0.45, green: 0.62, blue: 0.82)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
        
        // Different colors based on weather condition
        switch weather.condition {
        case .sunny:
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.35, green: 0.55, blue: 0.75),
                    Color(red: 0.42, green: 0.62, blue: 0.80)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .mostlySunny:
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.38, green: 0.58, blue: 0.78),
                    Color(red: 0.40, green: 0.60, blue: 0.80)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .mostlyCloudy:
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.45, green: 0.55, blue: 0.65),
                    Color(red: 0.48, green: 0.58, blue: 0.68)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .cloudy:
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.50, green: 0.58, blue: 0.65),
                    Color(red: 0.52, green: 0.60, blue: 0.67)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .rainy:
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.40, green: 0.50, blue: 0.60),
                    Color(red: 0.42, green: 0.52, blue: 0.62)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .stormy:
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.35, green: 0.45, blue: 0.55),
                    Color(red: 0.38, green: 0.48, blue: 0.58)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        case .partlyCloudy:
            return LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 0.42, green: 0.58, blue: 0.75),
                    Color(red: 0.44, green: 0.60, blue: 0.77)
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        }
    }
}

#Preview {
    VStack(spacing: 12) {
        WeatherCardView(
            weather: WeatherData(
                cityName: "Medina",
                isMyLocation: true,
                condition: .sunny,
                currentTemperature: 17,
                highTemperature: 26,
                lowTemperature: 12
            )
        )
        WeatherCardView(
            weather: WeatherData(
                cityName: "Abha",
                time: "9:56 AM",
                condition: .mostlySunny,
                currentTemperature: 13,
                highTemperature: 15,
                lowTemperature: 9
            )
        )
    }
    .padding(.horizontal, 20)
    .frame(maxWidth: .infinity, maxHeight: .infinity)
    .background(Color(red: 0.07, green: 0.13, blue: 0.25))
}
