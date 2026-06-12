//
//  WeatherViewModel.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import Foundation
import SwiftUI
import Combine

class WeatherViewModel: ObservableObject {
    @Published var weatherData: [WeatherData] = []
    
    init() {
        loadSampleData()
    }
    
    @MainActor
    private func loadSampleData() {
        let formatter = DateFormatter()
        formatter.dateFormat = "h:mm a"
        let currentTime = formatter.string(from: Date())
        
        weatherData = [
            WeatherData(
                cityName: "Medina",
                isMyLocation: true,
                condition: .sunny,
                currentTemperature: 20,
                highTemperature: 26,
                lowTemperature: 12
            ),
            WeatherData(
                cityName: "Abha",
                time: currentTime,
                condition: .mostlySunny,
                currentTemperature: 15,
                highTemperature: 16,
                lowTemperature: 9
            ),
            WeatherData(
                cityName: "Riyadh",
                time: currentTime,
                condition: .mostlySunny,
                currentTemperature: 14,
                highTemperature: 18,
                lowTemperature: 8
            ),
            WeatherData(
                cityName: "Istanbul",
                time: currentTime,
                condition: .mostlyCloudy,
                currentTemperature: 4,
                highTemperature: 5,
                lowTemperature: 2
            ),
            WeatherData(
                cityName: "Trabzon",
                time: currentTime,
                condition: .cloudy,
                currentTemperature: 4,
                highTemperature: 5,
                lowTemperature: 2
            ),
            WeatherData(
                cityName: "Shaqraa",
                time: currentTime,
                condition: .sunny,
                currentTemperature: 13,
                highTemperature: 19,
                lowTemperature: 5
            ),
            WeatherData(
                cityName: "San Francisco",
                time: "11:52 PM",
                condition: .sunny,
                currentTemperature: 10,
                highTemperature: 20,
                lowTemperature: 9,
                isNight: true
            ),
            WeatherData(
                cityName: "Geneva",
                time: "8:52 AM",
                condition: .cloudy,
                currentTemperature: 5,
                highTemperature: 8,
                lowTemperature: 4
            ),
            WeatherData(
                cityName: "Dubai",
                time: "11:52 AM",
                condition: .sunny,
                currentTemperature: 21,
                highTemperature: 28,
                lowTemperature: 17
            )
        ]
    }
}
