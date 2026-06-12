//
//  WeatherData.swift
//  tripdb
//
//  Created by Musaab-HQ on 17/01/2026.
//

import Foundation

struct WeatherData: Identifiable, Codable {
    let id: UUID
    let cityName: String
    let isMyLocation: Bool
    let time: String?
    let condition: WeatherCondition
    let currentTemperature: Int
    let highTemperature: Int
    let lowTemperature: Int
    let isNight: Bool
    
    init(
        id: UUID = UUID(),
        cityName: String,
        isMyLocation: Bool = false,
        time: String? = nil,
        condition: WeatherCondition,
        currentTemperature: Int,
        highTemperature: Int,
        lowTemperature: Int,
        isNight: Bool = false
    ) {
        self.id = id
        self.cityName = cityName
        self.isMyLocation = isMyLocation
        self.time = time
        self.condition = condition
        self.currentTemperature = currentTemperature
        self.highTemperature = highTemperature
        self.lowTemperature = lowTemperature
        self.isNight = isNight
    }
}

enum WeatherCondition: String, Codable {
    case sunny = "Sunny"
    case mostlySunny = "Mostly Sunny"
    case mostlyCloudy = "Mostly Cloudy"
    case cloudy = "Cloudy"
    case partlyCloudy = "Partly Cloudy"
    case rainy = "Rainy"
    case stormy = "Stormy"
}
